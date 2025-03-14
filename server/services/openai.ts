import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIAnalysis {
  sentiment: string;
  nextActions: string[];
  keywords: string[];
}

export async function analyzeTranscript(transcript: string): Promise<AIAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the following call transcript and provide sentiment analysis, next actions, and key topics discussed. Return JSON in the format: { sentiment: string, nextActions: string[], keywords: string[] }"
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      sentiment: result.sentiment,
      nextActions: result.nextActions,
      keywords: result.keywords
    };
  } catch (error) {
    throw new Error(`Failed to analyze transcript: ${error.message}`);
  }
}

export async function generateResponse(context: string, userInput: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI sales assistant. Use the following context for the conversation: ${context}`
        },
        {
          role: "user",
          content: userInput
        }
      ]
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}
