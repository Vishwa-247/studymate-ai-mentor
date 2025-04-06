
import { FLASK_API_URL, GEMINI_API_KEY } from "@/configs/environment";

/**
 * Service for communicating with the Flask API for generation tasks
 */

/**
 * Wrapper for API calls to handle errors consistently
 */
const callFlaskApi = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await fetch(`${FLASK_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Flask API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    return responseData.data as T;
  } catch (error: any) {
    console.error(`Error calling Flask API (${endpoint}):`, error);
    throw error;
  }
};

// Type for API responses containing text content
export interface TextResponse {
  text: string;
}

/**
 * Generate a complete course using the Flask API
 */
export const generateCourseWithFlask = async (
  topic: string,
  purpose: string,
  difficulty: string
): Promise<TextResponse> => {
  return callFlaskApi<TextResponse>('/generate', {
    action: 'generate_course',
    topic,
    purpose,
    difficulty
  });
};

/**
 * Generate interview questions using the Flask API
 */
export const generateInterviewQuestionsWithFlask = async (
  jobRole: string,
  techStack: string,
  experience: string,
  questionCount: number = 5
): Promise<TextResponse> => {
  return callFlaskApi<TextResponse>('/generate', {
    action: 'generate_interview_questions',
    jobRole,
    techStack,
    experience,
    questionCount
  });
};

/**
 * Generate flashcards using the Flask API
 */
export const generateFlashcardsWithFlask = async (
  topic: string,
  purpose: string,
  difficulty: string
): Promise<TextResponse> => {
  // Use custom_content action for flashcard generation
  const prompt = `Generate 20 detailed flashcards on the topic: ${topic} for ${purpose} at ${difficulty} level.
                  
                  Create flashcards in this exact format:
                  
                  # FLASHCARDS
                  - Question: [Specific, clear question text]
                  - Answer: [Comprehensive, accurate answer text]
                  
                  Make sure the flashcards cover key concepts, terms, principles, and applications related to the topic.
                  Each answer should be detailed enough to provide complete understanding.
                  Ensure varying difficulty levels across the flashcards to test different aspects of knowledge.`;

  return callFlaskApi<TextResponse>('/generate', {
    action: 'custom_content',
    prompt
  });
};

/**
 * Summarize text using the Flask API
 */
export const summarizeTextWithFlask = async (text: string): Promise<TextResponse> => {
  return callFlaskApi<TextResponse>('/generate', {
    action: 'summarize_text',
    text
  });
};

/**
 * Explain code using the Flask API
 */
export const explainCodeWithFlask = async (code: string): Promise<TextResponse> => {
  return callFlaskApi<TextResponse>('/generate', {
    action: 'explain_code',
    code
  });
};
