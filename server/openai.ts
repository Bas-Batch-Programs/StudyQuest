import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GeneratedFlashcard {
  front: string;
  back: string;
  explanation: string;
}

interface GeneratedQuizQuestion {
  type: "multiple_choice" | "true_false" | "fill_blank";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export async function generateFlashcards(content: string, count: number = 10): Promise<GeneratedFlashcard[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are an expert educational content creator. Generate flashcards from the provided study material.
Each flashcard should have:
- A clear, specific question or term on the front
- A comprehensive but concise answer on the back
- A brief explanation to help with understanding

Focus on the most important concepts, key terms, definitions, and facts.
Return a JSON array of flashcards.`
      },
      {
        role: "user",
        content: `Generate ${count} flashcards from this study material. Return only valid JSON in this exact format:
{
  "flashcards": [
    {
      "front": "Question or term here",
      "back": "Answer or definition here",
      "explanation": "Additional context or memory tip"
    }
  ]
}

Study material:
${content.slice(0, 8000)}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result.flashcards || [];
}

export async function generateQuiz(content: string, questionCount: number = 10): Promise<GeneratedQuizQuestion[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are an expert educational assessment creator. Generate quiz questions from the provided study material.
Create a mix of question types:
- Multiple choice (4 options, one correct)
- True/False questions
- Fill in the blank questions

Each question should test understanding of key concepts.
Questions should range from basic recall to application.`
      },
      {
        role: "user",
        content: `Generate ${questionCount} quiz questions from this study material. Return only valid JSON in this exact format:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "The question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct"
    },
    {
      "type": "true_false",
      "question": "A statement to evaluate as true or false",
      "correctAnswer": "True",
      "explanation": "Why this is true/false"
    },
    {
      "type": "fill_blank",
      "question": "Complete this: The _____ is responsible for...",
      "correctAnswer": "answer word",
      "explanation": "Context about the answer"
    }
  ]
}

Study material:
${content.slice(0, 8000)}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result.questions || [];
}

export async function extractDocumentTitle(content: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: "Extract or generate a concise, descriptive title for this document content. Return only the title, no quotes or extra text."
      },
      {
        role: "user",
        content: `Generate a title for this document (max 50 characters):
${content.slice(0, 1000)}`
      }
    ],
    max_completion_tokens: 50,
  });

  return response.choices[0].message.content?.trim() || "Untitled Document";
}
