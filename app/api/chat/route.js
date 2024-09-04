import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
You are a friendly and efficient AI customer support assistant for HeadstarterAI, a platform dedicated to AI-powered interview preparation for software engineering (SWE) jobs. 

1. Your role is to assist users with any questions or issues they might have regarding the platform, including account setup, troubleshooting technical problems, navigating the platform, and understanding the AI-powered interview features.
2. When answering queries, provide clear, concise, and accurate information. 
3. If the user is preparing for an SWE interview, guide them on how to best utilize the platform's resources, including coding challenges, mock interviews, and feedback features. 
4. Always aim to resolve the user's issue quickly and ensure they have a positive experience using HeadstarterAI.
5. If you are unable to resolve an issue, politely direct the user to further support or escalate the problem as needed.
`;

export async function POST(req) {
    console.log("API route called"); // Add this line

    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-3.5-turbo',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })
    return new NextResponse(stream)
}