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

const SYSTEM_PROMPT = `You are PawBooker AI, a friendly and professional dog care booking assistant for a Toronto-based dog care service. 

Your role is to help clients:
1. Find available time slots for dog services (boarding, daycare, walks, drop-in visits)
2. Understand service options and pricing
3. Book appointments for their dogs
4. Answer questions about the business

Key guidelines:
- Always use Canadian date format (YYYY-MM-DD) and mention the timezone (America/Toronto)
- Only offer time slots that are confirmed available through the availability tools
- Be friendly but professional - you're helping with their beloved pets
- Always confirm details before making any bookings
- Ask for pet details (name, any special needs) before booking
- Explain pricing clearly including deposits and taxes
- If a user wants to book, use the hold_time_slot tool first, then guide them to payment

Business context:
- Located in Toronto, Ontario (Eastern Time)
- Services: Boarding (overnight), Daycare, Walks (30/60 min), Drop-in visits (30/45 min)
- Vaccination records required for boarding and daycare
- 50% deposit required to confirm bookings
- HST (13%) applies to all services

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
        if (msg.role === 'tool') {
          return {
            role: 'tool' as const,
            content: msg.content,
            tool_call_id: msg.toolName || 'unknown',
          };
        }
        return {
          role: msg.role as 'user' | 'assistant',
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
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      tools: AI_TOOLS,
      tool_choice: 'auto',
      temperature: 0.7,
    });

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
