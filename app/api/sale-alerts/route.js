import { db } from '@/configs/db.server';
import { SaleAlerts, Websites } from '@/configs/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET - Fetch sale alerts for a user
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const websiteId = searchParams.get('websiteId');
        const status = searchParams.get('status'); // pending, contacted, converted, dismissed
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (!userId) {
            return Response.json({ 
                success: false, 
                message: 'User ID is required' 
            }, { status: 400 });
        }

        let query = db
            .select({
                id: SaleAlerts.id,
                website_id: SaleAlerts.website_id,
                conversation_id: SaleAlerts.conversation_id,
                visitor_id: SaleAlerts.visitor_id,
                alert_type: SaleAlerts.alert_type,
                confidence_score: SaleAlerts.confidence_score,
                product_mentioned: SaleAlerts.product_mentioned,
                conversation_context: SaleAlerts.conversation_context,
                visitor_message: SaleAlerts.visitor_message,
                ai_response: SaleAlerts.ai_response,
                estimated_value: SaleAlerts.estimated_value,
                priority: SaleAlerts.priority,
                status: SaleAlerts.status,
                read: SaleAlerts.read,
                created_at: SaleAlerts.created_at,
                updated_at: SaleAlerts.updated_at,
                website_domain: Websites.domain,
                website_name: Websites.name,
            })
            .from(SaleAlerts)
            .leftJoin(Websites, eq(SaleAlerts.website_id, Websites.id))
            .where(eq(SaleAlerts.user_id, userId))
            .orderBy(desc(SaleAlerts.created_at))
            .limit(limit)
            .offset(offset);

        // Add website filter if specified
        if (websiteId) {
            query = query.where(and(
                eq(SaleAlerts.user_id, userId),
                eq(SaleAlerts.website_id, websiteId)
            ));
        }

        // Add status filter if specified
        if (status) {
            query = query.where(and(
                eq(SaleAlerts.user_id, userId),
                eq(SaleAlerts.status, status)
            ));
        }

        const alerts = await query;

        // Get total count for pagination
        const totalCount = await db
            .select({ count: sql`count(*)` })
            .from(SaleAlerts)
            .where(eq(SaleAlerts.user_id, userId));

        return Response.json({
            success: true,
            data: alerts,
            pagination: {
                total: parseInt(totalCount[0]?.count || '0'),
                limit,
                offset,
                hasMore: alerts.length === limit
            }
        });
    } catch (error) {
        console.error('Error fetching sale alerts:', error);
        return Response.json({ 
            success: false, 
            message: 'Failed to fetch sale alerts',
            error: error.message 
        }, { status: 500 });
    }
}

// POST - Create a new sale alert
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            websiteId,
            userId,
            conversationId,
            visitorId,
            alertType,
            confidenceScore,
            productMentioned,
            conversationContext,
            visitorMessage,
            aiResponse,
            estimatedValue,
            priority
        } = body;

        // Validate required fields
        if (!websiteId || !userId || !conversationId || !visitorId || 
            !visitorMessage || !aiResponse || !conversationContext) {
            return Response.json({ 
                success: false, 
                message: 'Missing required fields' 
            }, { status: 400 });
        }

        // Insert the sale alert
        const [newAlert] = await db.insert(SaleAlerts).values({
            website_id: websiteId,
            user_id: userId,
            conversation_id: conversationId,
            visitor_id: visitorId,
            alert_type: alertType || 'potential_sale',
            confidence_score: confidenceScore || 0.0,
            product_mentioned: productMentioned || '',
            conversation_context: conversationContext,
            visitor_message: visitorMessage,
            ai_response: aiResponse,
            estimated_value: estimatedValue || 0.0,
            priority: priority || 'medium',
            status: 'pending',
            read: false
        }).returning();

        return Response.json({
            success: true,
            message: 'Sale alert created successfully',
            data: newAlert
        });
    } catch (error) {
        console.error('Error creating sale alert:', error);
        return Response.json({ 
            success: false, 
            message: 'Failed to create sale alert',
            error: error.message 
        }, { status: 500 });
    }
}

// PUT - Update sale alert status
export async function PUT(request) {
    try {
        const body = await request.json();
        const { alertId, status, read } = body;

        if (!alertId) {
            return Response.json({ 
                success: false, 
                message: 'Alert ID is required' 
            }, { status: 400 });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (typeof read === 'boolean') updateData.read = read;
        updateData.updated_at = new Date();

        const [updatedAlert] = await db
            .update(SaleAlerts)
            .set(updateData)
            .where(eq(SaleAlerts.id, alertId))
            .returning();

        return Response.json({
            success: true,
            message: 'Sale alert updated successfully',
            data: updatedAlert
        });
    } catch (error) {
        console.error('Error updating sale alert:', error);
        return Response.json({ 
            success: false, 
            message: 'Failed to update sale alert',
            error: error.message 
        }, { status: 500 });
    }
}
