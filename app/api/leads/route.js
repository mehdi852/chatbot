import { db } from '@/configs/db.server';
import { Leads, Websites, SaleAlerts } from '@/configs/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';

// GET - Fetch leads for a user
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const websiteId = searchParams.get('websiteId');
        const status = searchParams.get('status'); // new, contacted, qualified, converted, lost
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (!userId) {
            return Response.json({ 
                success: false, 
                message: 'User ID is required' 
            }, { status: 400 });
        }

        // Build the base query
        let query = db
            .select({
                id: Leads.id,
                website_id: Leads.website_id,
                conversation_id: Leads.conversation_id,
                sale_alert_id: Leads.sale_alert_id,
                visitor_id: Leads.visitor_id,
                email: Leads.email,
                name: Leads.name,
                phone: Leads.phone,
                company: Leads.company,
                lead_source: Leads.lead_source,
                lead_status: Leads.lead_status,
                product_interest: Leads.product_interest,
                estimated_value: Leads.estimated_value,
                notes: Leads.notes,
                last_contact_at: Leads.last_contact_at,
                converted_at: Leads.converted_at,
                created_at: Leads.created_at,
                updated_at: Leads.updated_at,
                website_domain: Websites.domain,
                website_name: Websites.name,
                // Sale alert analysis data
                sale_confidence_score: SaleAlerts.confidence_score,
                sale_alert_type: SaleAlerts.alert_type,
                sale_product_mentioned: SaleAlerts.product_mentioned,
                sale_priority: SaleAlerts.priority,
                sale_conversation_context: SaleAlerts.conversation_context,
                sale_visitor_message: SaleAlerts.visitor_message,
                sale_ai_response: SaleAlerts.ai_response
            })
            .from(Leads)
            .leftJoin(Websites, eq(Leads.website_id, Websites.id))
            .leftJoin(SaleAlerts, eq(Leads.sale_alert_id, SaleAlerts.id))
            .orderBy(desc(Leads.created_at))
            .limit(limit)
            .offset(offset);

        // Build where conditions
        const conditions = [eq(Leads.user_id, userId)];
        
        if (websiteId) {
            conditions.push(eq(Leads.website_id, websiteId));
        }
        
        if (status) {
            conditions.push(eq(Leads.lead_status, status));
        }
        
        if (startDate && endDate) {
            conditions.push(gte(Leads.created_at, new Date(startDate)));
            conditions.push(lte(Leads.created_at, new Date(endDate)));
        }
        
        query = query.where(and(...conditions));

        const leads = await query;

        // Get total count for pagination using the same conditions
        const countConditions = [eq(Leads.user_id, userId)];
        
        if (websiteId) {
            countConditions.push(eq(Leads.website_id, websiteId));
        }
        
        if (status) {
            countConditions.push(eq(Leads.lead_status, status));
        }
        
        if (startDate && endDate) {
            countConditions.push(gte(Leads.created_at, new Date(startDate)));
            countConditions.push(lte(Leads.created_at, new Date(endDate)));
        }
        
        const totalCount = await db
            .select({ count: sql`count(*)` })
            .from(Leads)
            .where(and(...countConditions));

        return Response.json({
            success: true,
            data: leads,
            pagination: {
                total: parseInt(totalCount[0]?.count || '0'),
                limit,
                offset,
                hasMore: leads.length === limit
            }
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        return Response.json({ 
            success: false, 
            message: 'Failed to fetch leads',
            error: error.message 
        }, { status: 500 });
    }
}

// POST - Create a new lead
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            websiteId,
            userId,
            conversationId,
            saleAlertId,
            visitorId,
            email,
            name,
            phone,
            company,
            productInterest,
            estimatedValue,
            notes
        } = body;

        // Validate required fields
        if (!websiteId || !userId || !conversationId || !visitorId || !email) {
            return Response.json({ 
                success: false, 
                message: 'Missing required fields' 
            }, { status: 400 });
        }

        // Check if lead already exists for this conversation and email
        const existingLead = await db
            .select()
            .from(Leads)
            .where(and(
                eq(Leads.conversation_id, conversationId),
                eq(Leads.email, email)
            ))
            .limit(1);

        if (existingLead.length > 0) {
            return Response.json({
                success: true,
                message: 'Lead already exists',
                data: existingLead[0]
            });
        }

        // Insert the new lead
        const [newLead] = await db.insert(Leads).values({
            website_id: websiteId,
            user_id: userId,
            conversation_id: conversationId,
            sale_alert_id: saleAlertId || null,
            visitor_id: visitorId,
            email: email,
            name: name || '',
            phone: phone || '',
            company: company || '',
            lead_source: 'chat',
            lead_status: 'new',
            product_interest: productInterest || '',
            estimated_value: estimatedValue || 0.0,
            notes: notes || ''
        }).returning();

        return Response.json({
            success: true,
            message: 'Lead created successfully',
            data: newLead
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        return Response.json({ 
            success: false, 
            message: 'Failed to create lead',
            error: error.message 
        }, { status: 500 });
    }
}

// PUT - Update lead status
export async function PUT(request) {
    try {
        const body = await request.json();
        const { leadId, leadStatus, notes, lastContactAt, convertedAt } = body;

        if (!leadId) {
            return Response.json({ 
                success: false, 
                message: 'Lead ID is required' 
            }, { status: 400 });
        }

        const updateData = {};
        if (leadStatus) updateData.lead_status = leadStatus;
        if (notes !== undefined) updateData.notes = notes;
        if (lastContactAt) updateData.last_contact_at = new Date(lastContactAt);
        if (convertedAt) updateData.converted_at = new Date(convertedAt);
        updateData.updated_at = new Date();

        const [updatedLead] = await db
            .update(Leads)
            .set(updateData)
            .where(eq(Leads.id, leadId))
            .returning();

        return Response.json({
            success: true,
            message: 'Lead updated successfully',
            data: updatedLead
        });
    } catch (error) {
        console.error('Error updating lead:', error);
        return Response.json({ 
            success: false, 
            message: 'Failed to update lead',
            error: error.message 
        }, { status: 500 });
    }
}

// DELETE - Delete a lead
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const leadId = searchParams.get('leadId');
        const userId = searchParams.get('userId');

        if (!leadId || !userId) {
            return Response.json({ 
                success: false, 
                message: 'Lead ID and User ID are required' 
            }, { status: 400 });
        }

        // Verify the lead belongs to the user before deleting
        const existingLead = await db
            .select()
            .from(Leads)
            .where(and(
                eq(Leads.id, leadId),
                eq(Leads.user_id, userId)
            ))
            .limit(1);

        if (existingLead.length === 0) {
            return Response.json({
                success: false,
                message: 'Lead not found or access denied'
            }, { status: 404 });
        }

        // Delete the lead
        await db
            .delete(Leads)
            .where(and(
                eq(Leads.id, leadId),
                eq(Leads.user_id, userId)
            ));

        return Response.json({
            success: true,
            message: 'Lead deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting lead:', error);
        return Response.json({ 
            success: false, 
            message: 'Failed to delete lead',
            error: error.message 
        }, { status: 500 });
    }
}
