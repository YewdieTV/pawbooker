import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ChatRequestSchema } from '@/lib/validations';
import { AI_TOOLS, executeAITool } from '@/lib/ai/tools';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const SYSTEM_PROMPT = `You are Melissa, the Beautiful Souls Boarding booking assistant, a friendly and professional dog care booking assistant for a GTA-based dog care service. 

Your role is to help clients:
1. Find available time slots for dog services (boarding and daycare)
2. Understand service options and pricing
3. Book appointments for their dogs
4. Answer questions about the business

CRITICAL: When users mention "book", "booking", "daycare", "boarding", or want to schedule services:
1. IMMEDIATELY use the check_availability tool with serviceType "DAYCARE" or "BOARDING"
2. Use today's date as startDate in YYYY-MM-DD format
3. ALWAYS show them actual available dates and times
4. Do NOT give generic responses about "checking availability" - actually check it!

Key guidelines:
- Always use Canadian date format (YYYY-MM-DD) and mention the timezone (America/Toronto for GTA)
- When users ask about services or prices, ALWAYS offer to check availability and help them book
- Use the get_service_info tool to provide detailed service information
- Use the check_availability tool when users want to book or ask about available dates
- Only offer time slots that are confirmed available through the availability tools
- Be friendly but professional - you're helping with their beloved pets
- Always confirm details before making any bookings
- Ask for pet details (name, any special needs) before booking
- Explain pricing clearly including deposits and taxes
- If a user wants to book, use the hold_time_slot tool first, then guide them to payment
- Proactively offer to check availability when users show interest in booking

Business context:
- Located in the GTA (Greater Toronto Area), Ontario (Eastern Time)
- Services: Boarding (overnight stay - $62/night), Daycare (daytime care - $45/day)
- Additional pricing: Holiday rates, multi-dog discounts, puppy rates, extended stay discounts available
- Vaccination records required for boarding and daycare
- 50% deposit required to confirm bookings
- HST (13%) applies to all services
- Open 24/7 for your pet's needs

EXAMPLE: When user says "book daycare", immediately respond:
"I'd be happy to help you book daycare! Let me check our available dates for you right now..." then use check_availability tool with serviceType: "DAYCARE" and startDate: "2025-08-19".

Never promise availability without checking through the tools first. Always be honest about capacity and availability constraints.`;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const body = await request.json();
    const validatedData = ChatRequestSchema.parse(body);
    
    // Get or create conversation
    let conversationId = validatedData.conversationId;
    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          userId: session?.user?.id || null,
        },
      });
      conversationId = conversation.id;
    }

    // Get conversation history
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20, // Limit to last 20 messages
    });

    // Convert to OpenAI format
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => {
        if (msg.role === 'TOOL') {
          return {
            role: 'tool' as const,
            content: msg.content,
            tool_call_id: msg.toolName || 'unknown',
          };
        }
        return {
          role: msg.role.toLowerCase() as 'user' | 'assistant',
          content: msg.content,
        };
      }),
      { role: 'user', content: validatedData.message },
    ];

    // Save user message
    await prisma.message.create({
      data: {
        conversationId,
        role: 'USER',
        content: validatedData.message,
      },
    });

    // Get AI response
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        tools: AI_TOOLS as any,
        tool_choice: 'auto',
        temperature: 0.7,
      });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      // Only fallback for actual OpenAI API errors, not tool execution errors
      const isBookingRequest = validatedData.message.toLowerCase().includes('book') || 
                              validatedData.message.toLowerCase().includes('availability') ||
                              validatedData.message.toLowerCase().includes('daycare') ||
                              validatedData.message.toLowerCase().includes('boarding');
      
      const fallbackResponse = isBookingRequest
        ? "I'm experiencing a connection issue right now. Let me try to help you another way - you can check our availability and book directly through the 'Availability' page on our website, or call us at (647) 986-4106. Our daycare is $45/day and boarding is $62/night."
        : "I'm currently experiencing a connection issue. Please try your question again in a moment, or contact us at (647) 986-4106. I'm here to help with Beautiful Souls Boarding services!";
      
      await prisma.message.create({
        data: {
          conversationId,
          role: 'ASSISTANT',
          content: fallbackResponse,
        },
      });

      return NextResponse.json({
        success: true,
        conversationId,
        message: fallbackResponse,
      });
    }

    const assistantMessage = completion.choices[0].message;
    let responseContent = assistantMessage.content || '';
    
    // Handle tool calls
    if (assistantMessage.tool_calls) {
      const toolResults = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolParams = JSON.parse(toolCall.function.arguments);
        
        // Execute tool
        const result = await executeAITool(toolName, toolParams, session?.user?.id);
        
        // Save tool call message
        await prisma.message.create({
          data: {
            conversationId,
            role: 'TOOL',
            content: JSON.stringify(result),
            toolName,
            toolPayload: toolParams,
          },
        });
        
        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool' as const,
          content: JSON.stringify(result),
        });
      }
      
      // Get follow-up response with tool results
      const followUpMessages = [
        ...chatMessages,
        {
          role: 'assistant' as const,
          content: assistantMessage.content,
          tool_calls: assistantMessage.tool_calls,
        },
        ...toolResults,
      ];
      
      const followUpCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: followUpMessages,
        temperature: 0.7,
      });
      
      responseContent = followUpCompletion.choices[0].message.content || '';
    }

    // Save assistant response
    await prisma.message.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: responseContent,
      },
    });

    return NextResponse.json({
      success: true,
      conversationId,
      message: responseContent,
      requiresAuth: !session?.user?.id && responseContent.includes('hold') || responseContent.includes('book'),
    });
    
  } catch (error) {
    console.error('AI Scheduler error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
