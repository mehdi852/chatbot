import { NextResponse } from 'next/server';
import { db } from '@/configs/db.server';
import { AiAgentData, Websites } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const websiteId = searchParams.get('websiteId');

        if (!websiteId) {
            return NextResponse.json({
                success: false,
                message: 'Website ID is required'
            }, { status: 400 });
        }

        // Get AI agent data for the specified website
        const agentData = await db
            .select()
            .from(AiAgentData)
            .where(eq(AiAgentData.website_id, parseInt(websiteId)))
            .limit(1);

        if (agentData.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    business_name: '',
                    business_type: '',
                    business_description: '',
                    products_services: '',
                    target_audience: '',
                    business_hours: '',
                    contact_information: '',
                    special_offers: '',
                    policies: '',
                    inventory_info: ''
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: agentData[0]
        });

    } catch (error) {
        console.error('Error fetching AI agent data:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch AI agent data'
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            websiteId,
            business_name,
            business_type,
            business_description,
            products_services,
            target_audience,
            business_hours,
            contact_information,
            special_offers,
            policies,
            inventory_info
        } = body;

        if (!websiteId) {
            return NextResponse.json({
                success: false,
                message: 'Website ID is required'
            }, { status: 400 });
        }

        // Verify that the website exists
        const website = await db
            .select()
            .from(Websites)
            .where(eq(Websites.id, parseInt(websiteId)))
            .limit(1);

        if (website.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Website not found'
            }, { status: 404 });
        }

        // Check if agent data already exists for this website
        const existingData = await db
            .select()
            .from(AiAgentData)
            .where(eq(AiAgentData.website_id, parseInt(websiteId)))
            .limit(1);

        const agentDataPayload = {
            website_id: parseInt(websiteId),
            business_name: business_name || '',
            business_type: business_type || '',
            business_description: business_description || '',
            products_services: products_services || '',
            target_audience: target_audience || '',
            business_hours: business_hours || '',
            contact_information: contact_information || '',
            special_offers: special_offers || '',
            policies: policies || '',
            inventory_info: inventory_info || '',
            updated_at: new Date()
        };

        if (existingData.length > 0) {
            // Update existing record
            await db
                .update(AiAgentData)
                .set(agentDataPayload)
                .where(eq(AiAgentData.website_id, parseInt(websiteId)));
        } else {
            // Create new record
            await db
                .insert(AiAgentData)
                .values({
                    ...agentDataPayload,
                    created_at: new Date()
                });
        }

        return NextResponse.json({
            success: true,
            message: 'AI agent data saved successfully'
        });

    } catch (error) {
        console.error('Error saving AI agent data:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to save AI agent data'
        }, { status: 500 });
    }
}
