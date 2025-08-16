export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { WidgetQuestions, Websites } from '@/configs/schema';
import { eq, and, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// GET - Load widget questions for a website
export async function GET(request) {
    revalidatePath('/dashboard/widget-template');
    
    try {
        const { searchParams } = new URL(request.url);
        const websiteId = searchParams.get('websiteId');

        if (!websiteId) {
            return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
        }

        // Query database for existing widget questions ordered by order_index
        const questions = await db
            .select()
            .from(WidgetQuestions)
            .where(and(
                eq(WidgetQuestions.website_id, parseInt(websiteId)),
                eq(WidgetQuestions.is_active, true)
            ))
            .orderBy(asc(WidgetQuestions.order_index));

        return NextResponse.json({
            success: true,
            questions: questions
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache'
            }
        });

    } catch (error) {
        console.error('Error loading widget questions:', error);
        return NextResponse.json(
            { error: 'Failed to load widget questions' },
            { status: 500 }
        );
    }
}

// POST - Create a new widget question
export async function POST(request) {
    revalidatePath('/dashboard/widget-template');
    
    try {
        const { websiteId, question } = await request.json();

        if (!websiteId) {
            return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
        }

        if (!question || question.trim() === '') {
            return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
        }

        // Get the current max order_index for this website
        const existingQuestions = await db
            .select()
            .from(WidgetQuestions)
            .where(eq(WidgetQuestions.website_id, parseInt(websiteId)));

        const maxOrder = existingQuestions.length > 0 
            ? Math.max(...existingQuestions.map(q => q.order_index))
            : -1;

        // Create new question
        const newQuestion = await db
            .insert(WidgetQuestions)
            .values({
                website_id: parseInt(websiteId),
                question: question.trim(),
                order_index: maxOrder + 1,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning();

        // Clear cache for public API
        revalidatePath('/api/fa');
        
        return NextResponse.json({
            success: true,
            message: 'Widget question created successfully',
            question: newQuestion[0]
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache'
            }
        });

    } catch (error) {
        console.error('Error creating widget question:', error);
        return NextResponse.json(
            { error: 'Failed to create widget question' },
            { status: 500 }
        );
    }
}

// PUT - Update widget questions order
export async function PUT(request) {
    revalidatePath('/dashboard/widget-template');
    
    try {
        const { websiteId, questions } = await request.json();

        if (!websiteId) {
            return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
        }

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: 'Questions array is required' }, { status: 400 });
        }

        // Update order_index for each question
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            await db
                .update(WidgetQuestions)
                .set({
                    order_index: i,
                    updated_at: new Date()
                })
                .where(and(
                    eq(WidgetQuestions.id, question.id),
                    eq(WidgetQuestions.website_id, parseInt(websiteId))
                ));
        }

        // Clear cache for public API
        revalidatePath('/api/fa');
        
        return NextResponse.json({
            success: true,
            message: 'Widget questions order updated successfully'
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache'
            }
        });

    } catch (error) {
        console.error('Error updating widget questions order:', error);
        return NextResponse.json(
            { error: 'Failed to update widget questions order' },
            { status: 500 }
        );
    }
}

// DELETE - Remove a widget question
export async function DELETE(request) {
    revalidatePath('/dashboard/widget-template');
    
    try {
        const { searchParams } = new URL(request.url);
        const questionId = searchParams.get('questionId');
        const websiteId = searchParams.get('websiteId');

        if (!questionId) {
            return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
        }

        if (!websiteId) {
            return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
        }

        // Delete the question
        await db
            .delete(WidgetQuestions)
            .where(and(
                eq(WidgetQuestions.id, parseInt(questionId)),
                eq(WidgetQuestions.website_id, parseInt(websiteId))
            ));

        // Reorder remaining questions
        const remainingQuestions = await db
            .select()
            .from(WidgetQuestions)
            .where(eq(WidgetQuestions.website_id, parseInt(websiteId)))
            .orderBy(asc(WidgetQuestions.order_index));

        for (let i = 0; i < remainingQuestions.length; i++) {
            await db
                .update(WidgetQuestions)
                .set({
                    order_index: i,
                    updated_at: new Date()
                })
                .where(eq(WidgetQuestions.id, remainingQuestions[i].id));
        }

        // Clear cache for public API
        revalidatePath('/api/fa');
        
        return NextResponse.json({
            success: true,
            message: 'Widget question deleted successfully'
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache'
            }
        });

    } catch (error) {
        console.error('Error deleting widget question:', error);
        return NextResponse.json(
            { error: 'Failed to delete widget question' },
            { status: 500 }
        );
    }
}
