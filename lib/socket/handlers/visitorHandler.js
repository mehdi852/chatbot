import { getOrCreateConversation, saveMessage, isAnyAdminOnline } from '../db';
import { generateAIResponse } from '../ai';
import { analyzePotentialSale, createConversationContext, extractEmail } from '@/lib/utils/saleDetection';

// Track processing messages to prevent duplicates
const processingMessages = new Map();

async function checkAILimits(websiteId) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/public/check-ai-limits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ websiteId }),
        });

        if (!response.ok) {
            console.warn('AI limits check failed:', response.status);
            // If the check fails, we'll assume the user is eligible (graceful degradation)
            return { eligible: true, error: 'Limits check unavailable' };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking AI limits:', error);
        // Graceful degradation - allow AI to work if limits check fails
        return { eligible: true, error: 'Limits check unavailable' };
    }
}

async function incrementAIResponseCount(websiteId) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        console.log(`🔢 Incrementing AI response count for websiteId: ${websiteId}`);
        
        // Get website's user ID first
        const websiteResponse = await fetch(`${baseUrl}/api/websites/get-website?websiteId=${websiteId}`);
        if (!websiteResponse.ok) {
            throw new Error('Failed to get website info');
        }
        const websiteData = await websiteResponse.json();
        console.log(`👤 Found userId: ${websiteData.user_id} for websiteId: ${websiteId}`);

        // Increment AI response count
        const response = await fetch(`${baseUrl}/api/user/increment-stats?userId=${websiteData.user_id}&stat=ai_responses`);
        if (!response.ok) {
            throw new Error('Failed to increment AI response count');
        }
        const result = await response.json();
        console.log(`✅ Successfully incremented AI response count. New value: ${result.newValue}`);
        return true;
    } catch (error) {
        console.error('❌ Error incrementing AI response count:', error);
        return false;
    }
}

async function handleAIResponse(io, socket, data, conversation) {
    // Create unique key for this message to prevent duplicate processing
    const messageKey = `${data.websiteId}_${data.visitorId}_${data.message.substring(0, 50)}_${Date.now()}`;
    
    // Check if we're already processing this or a similar message
    if (processingMessages.has(messageKey)) {
        console.log('Duplicate AI response request detected, ignoring');
        return;
    }
    
    // Mark as processing
    processingMessages.set(messageKey, true);
    
    try {
        console.log(`Processing AI response for websiteId: ${data.websiteId}, visitorId: ${data.visitorId}`);
        
        // Check AI limits before generating response
        const limitsCheck = await checkAILimits(data.websiteId);

        if (!limitsCheck.eligible) {
            console.log(`AI limits exceeded for websiteId: ${data.websiteId}. Silently skipping AI response - user will get human agent response instead.`);
            
            // Silently skip AI response - don't send any message to user
            // Just emit the limits-exceeded event for internal tracking (optional)
            const visitorRoom = `website_${data.websiteId}`;
            io.to(visitorRoom).emit('limits-exceeded', {
                websiteId: data.websiteId,
                visitorId: data.visitorId,
                limits: limitsCheck.limits || {},
                timestamp: new Date(),
                silent: true // Flag to indicate this should be handled silently
            });
            
            // Return without sending any message - this makes it appear as if AI just didn't respond
            // Human agents can respond through the admin panel instead
            return;
        }

        // Generate AI response with website context
        const aiResponse = await generateAIResponse(data.message, data.messages, data.websiteId);

        // Save the message first
        await saveMessage(conversation.id, aiResponse, 'ai');
        
        // Increment AI response count ONLY after successful AI generation and saving
        const incrementSuccess = await incrementAIResponseCount(data.websiteId);
        if (!incrementSuccess) {
            console.warn('Failed to increment AI response count, but message was already saved');
            // Don't throw error here to avoid affecting the user experience
        }

        // Analyze conversation for potential sales
        try {
            const saleAnalysis = await analyzePotentialSale(data.message, aiResponse, data.messages);
            
            if (saleAnalysis.hasPotentialSale && saleAnalysis.confidenceScore > 0.3) {
                console.log('🎯 Potential sale detected:', saleAnalysis);
                
                // Get website info to find the user ID
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                const websiteResponse = await fetch(`${baseUrl}/api/websites/get-website?websiteId=${data.websiteId}`);
                
                if (websiteResponse.ok) {
                    const websiteData = await websiteResponse.json();
                    const conversationContext = createConversationContext(data.messages);
                    
                    // Check if visitor provided email and create lead
                    const extractedEmail = extractEmail(data.message);
                    if (extractedEmail) {
                        console.log('📧 Email detected in message:', extractedEmail);
                        
                        // Create lead with extracted email
                        const leadResponse = await fetch(`${baseUrl}/api/leads`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                websiteId: data.websiteId,
                                userId: websiteData.user_id,
                                conversationId: conversation.id,
                                saleAlertId: null, // No sale alert needed
                                visitorId: data.visitorId,
                                email: extractedEmail,
                                productInterest: saleAnalysis.productMentioned,
                                estimatedValue: saleAnalysis.estimatedValue,
                                notes: `Lead captured from chat. Confidence: ${Math.round(saleAnalysis.confidenceScore * 100)}%`
                            }),
                        });
                        
                        if (leadResponse.ok) {
                            const leadData = await leadResponse.json();
                            console.log('✅ Lead created successfully:', leadData.data.id);
                            
                            // Emit lead notification to admin dashboard
                            const adminRoom = `admin_${data.websiteId}`;
                            io.to(adminRoom).emit('new-lead', {
                                lead: leadData.data,
                                website_domain: websiteData.domain,
                                website_name: websiteData.name,
                                analysis: saleAnalysis
                            });
                            
                            // Create a high-priority notification about the lead capture
                            const notificationResponse = await fetch(`${baseUrl}/api/notifications`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    userId: websiteData.user_id,
                                    title: '🎯 New Lead Captured!',
                                    description: `${extractedEmail} provided contact info and showed purchase intent for ${saleAnalysis.productMentioned || 'your products'}. Confidence: ${Math.round(saleAnalysis.confidenceScore * 100)}%`,
                                    type: 'alert',
                                    priority: 'high',
                                    action_url: '/dashboard/leads',
                                    sender_name: 'Lead Capture System',
                                    sender_avatar: null
                                }),
                            });
                            
                            if (notificationResponse.ok) {
                                const notificationData = await notificationResponse.json();
                                console.log('✅ Notification created successfully:', notificationData.notification.id);
                                console.log('🔔 Notification will be visible after page refresh');
                            } else {
                                console.error('❌ Failed to create notification:', await notificationResponse.text());
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error analyzing potential sale:', error);
            // Don't let sale analysis errors affect the chat flow
        }

        const aiResponseData = {
            message: aiResponse,
            websiteId: data.websiteId,
            visitorId: data.visitorId,
            timestamp: new Date(),
            type: 'ai',
        };

        // Broadcast to website room (includes both visitors and admins)
        const visitorRoom = `website_${data.websiteId}`;
        io.to(visitorRoom).emit('visitor-receive-message', aiResponseData);
    } catch (error) {
        console.error('Error handling AI response:', error);
        // Send error message to chat
        const errorMessage = 'Sorry, there was an error generating the AI response. Please try again later.';
        await saveMessage(conversation.id, errorMessage, 'ai');

        const errorResponseData = {
            message: errorMessage,
            websiteId: data.websiteId,
            visitorId: data.visitorId,
            timestamp: new Date(),
            type: 'ai',
        };

        const visitorRoom = `website_${data.websiteId}`;
        io.to(visitorRoom).emit('visitor-receive-message', errorResponseData);
    } finally {
        // Clean up processing flag
        processingMessages.delete(messageKey);
        
        // Clean up old entries to prevent memory leaks (keep only last 50)
        if (processingMessages.size > 50) {
            const entries = Array.from(processingMessages.entries());
            const toDelete = entries.slice(0, entries.length - 25);
            toDelete.forEach(([key]) => processingMessages.delete(key));
            console.log(`Cleaned up ${toDelete.length} old processing message entries`);
        }
    }
}

export async function handleVisitorMessage(io, socket, data) {
    if (data.websiteId !== socket.websiteId) {
        console.error('Website ID mismatch:', {
            messageWebsiteId: data.websiteId,
            socketWebsiteId: socket.websiteId,
        });
        return;
    }

    try {
        // Use visitor IP from socket (passed from client)
        const visitorIP = socket.visitorIP || '8.8.8.8';
        
        console.log(`🌍 Processing message from visitor IP: ${visitorIP} (from client-side widget)`);
        
        let conversation, isNew;
        try {
            const result = await getOrCreateConversation(socket.websiteId, data.visitorId, visitorIP);
            conversation = result.conversation;
            isNew = result.isNew;
        } catch (error) {
            // If conversation limit is exceeded, send a message to the visitor
            if (error.message.includes('Conversation limit reached')) {
                console.log(`❌ Conversation limit exceeded for websiteId: ${socket.websiteId}`);
                
                // Send a message to the visitor explaining the limit
                const limitMessage = {
                    message: "I'm sorry, but the chat service has reached its conversation limit. Please try again later or contact us through other means.",
                    websiteId: data.websiteId,
                    visitorId: data.visitorId,
                    timestamp: new Date(),
                    type: 'system',
                };
                
                // Send the message directly to the visitor
                const visitorRoom = `website_${data.websiteId}`;
                io.to(visitorRoom).emit('visitor-receive-message', limitMessage);
                
                return; // Exit early - don't process the message further
            }
            throw error; // Re-throw if it's a different error
        }
        
        // Check if any admin is online for this website
        const isAdminOnline = isAnyAdminOnline(io, socket.websiteId);
        console.log(`💻 Admin online status for website ${socket.websiteId}: ${isAdminOnline}`);
        
        await saveMessage(conversation.id, data.message, 'visitor', isAdminOnline);

        // Debug logging for geolocation data
        console.log('🔍 Conversation geolocation data:', {
            visitor_ip: conversation.visitor_ip,
            country: conversation.country,
            country_code: conversation.country_code,
            asn: conversation.asn,
            as_name: conversation.as_name,
            continent: conversation.continent,
            isNew: isNew,
            conversationId: conversation.id
        });

        const visitorMessageData = {
            message: data.message,
            websiteId: data.websiteId,
            visitorId: data.visitorId,
            timestamp: new Date(),
            type: 'visitor',
            isNewConversation: isNew,
            // Include geolocation data from the conversation
            visitor_ip: conversation.visitor_ip,
            country: conversation.country,
            country_code: conversation.country_code,
            asn: conversation.asn,
            as_name: conversation.as_name,
            as_domain: conversation.as_domain,
            continent: conversation.continent,
            continent_code: conversation.continent_code,
        };

        console.log('📤 Sending visitor message data to admin:', visitorMessageData);

        // Broadcast to admin room for this website
        const adminRoom = `admin_${socket.websiteId}`;
        io.to(adminRoom).emit('admin-receive-message', visitorMessageData);

        if (socket.websiteData.isAiEnabled) {
            await handleAIResponse(io, socket, data, conversation);
        }
    } catch (error) {
        console.error('Error handling visitor message:', error);
    }
}
