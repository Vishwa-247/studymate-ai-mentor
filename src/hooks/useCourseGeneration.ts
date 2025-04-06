
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { CourseType } from "@/types";
import { 
  generateCourseWithGemini, 
  generateCourseFallback 
} from "@/services/geminiService";

// Define an interface for the content structure
interface CourseContent {
  status?: string;
  message?: string;
  lastUpdated?: string;
  parsedContent?: {
    summary?: string;
    chapters?: any[];
    flashcards?: any[];
    mcqs?: any[];
    qnas?: any[];
  };
  [key: string]: any;
}

export const useCourseGeneration = () => {
  const navigate = useNavigate();
  const [generationInBackground, setGenerationInBackground] = useState(false);
  const [courseGenerationId, setCourseGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    let intervalId: number | null = null;
    
    if (generationInBackground && courseGenerationId) {
      console.log("Setting up interval to check course generation status for ID:", courseGenerationId);
      
      intervalId = window.setInterval(async () => {
        try {
          console.log("Checking course generation status for ID:", courseGenerationId);
          const { data: course, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseGenerationId)
            .single();
          
          if (error) {
            console.error("Error checking course status:", error);
            throw error;
          }
          
          console.log("Course status check result:", course?.content);
          
          // Type guard to ensure content is an object
          if (course && course.content && typeof course.content === 'object') {
            const content = course.content as CourseContent;
            
            // Check if course is fully complete
            if (content.status === 'complete') {
              console.log("Course generation completed!");
              if (intervalId) clearInterval(intervalId);
              setGenerationInBackground(false);
              setCourseGenerationId(null);
              setProgress(100);
              
              sonnerToast.success('Course Generation Complete', {
                description: `Your course "${course.title}" has been generated successfully.`,
                action: {
                  label: 'View Course',
                  onClick: () => navigate(`/course/${course.id}`),
                },
              });
            } 
            // Check if we're generating additional resources like flashcards
            else if (content.status === 'generating_flashcards') {
              console.log("Generating additional flashcards for the course");
              setProgress(80); // Set progress to 80% when generating flashcards
              
              // Show a toast notification about the ongoing flashcards generation
              if (content.message) {
                sonnerToast.info('Enhancing Your Course', {
                  description: content.message,
                });
              }
            }
            else if (content.status === 'generating') {
              // Simulate progress while in the generating state
              setProgress(prev => Math.min(prev + 5, 70)); // Increment progress up to 70%
            }
            // Check if there was an error in generation
            else if (content.status === 'error') {
              console.error("Course generation failed:", content.message);
              if (intervalId) clearInterval(intervalId);
              setGenerationInBackground(false);
              setCourseGenerationId(null);
              setProgress(0);
              
              sonnerToast.error('Course Generation Failed', {
                description: content.message || "An unknown error occurred",
              });
            }
          }
        } catch (error) {
          console.error("Error checking course generation status:", error);
          if (intervalId) clearInterval(intervalId);
          setGenerationInBackground(false);
          setCourseGenerationId(null);
          setProgress(0);
          setError("Failed to check course generation status. Please try again.");
        }
      }, 3000);
    }
    
    return () => {
      if (intervalId) {
        console.log("Clearing interval for course generation check");
        clearInterval(intervalId);
      }
    };
  }, [generationInBackground, courseGenerationId, navigate]);

  // Create a function to start course generation
  const startCourseGeneration = async (
    courseName: string, 
    purpose: CourseType['purpose'], 
    difficulty: CourseType['difficulty'],
    userId: string
  ) => {
    try {
      console.log("Starting course generation for:", courseName);
      
      // Reset progress
      setProgress(10);
      setRetryCount(0);
      setUseFallback(false);
      
      // Step 1: Create an empty course entry
      const { data: emptyCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseName,
          purpose,
          difficulty,
          user_id: userId,
          summary: "Course generation in progress...",
          content: { status: 'generating', lastUpdated: new Date().toISOString() }
        })
        .select()
        .single();
      
      if (courseError) {
        console.error("Error creating empty course:", courseError);
        throw new Error(courseError.message || "Failed to create course");
      }
      
      console.log("Created empty course:", emptyCourse);
      
      // Set generation as started so the UI shows progress
      setCourseGenerationId(emptyCourse.id);
      setGenerationInBackground(true);
      setError(null);
      setProgress(20);

      // Start the background process using Flask API for Gemini
      processBackgroundCourseGeneration(
        courseName,
        purpose,
        difficulty,
        emptyCourse.id
      );
      
      return emptyCourse.id;
    } catch (error: any) {
      console.error("Error in startCourseGeneration:", error);
      setProgress(0);
      throw error;
    }
  };

  // Background processing function to handle course generation with Flask API for Gemini
  const processBackgroundCourseGeneration = async (
    topic: string,
    purpose: CourseType['purpose'],
    difficulty: CourseType['difficulty'],
    courseId: string
  ) => {
    try {
      // Update course status to generating
      await supabase
        .from('courses')
        .update({ 
          content: { status: 'generating', lastUpdated: new Date().toISOString() } 
        })
        .eq('id', courseId);
        
      console.log(`Updated course ${courseId} status to generating`);
      setProgress(30);

      // Call Flask API for Gemini
      console.log(`Calling Flask API for course ${courseId}`);
      
      try {
        const response = useFallback 
          ? await generateCourseFallback(topic, purpose, difficulty)
          : await generateCourseWithGemini(courseId, topic, purpose, difficulty);
        
        if (!response.success) {
          // If API call failed but retries are available, try again after a short delay
          if (retryCount < 2 && !useFallback) {
            setRetryCount(prev => prev + 1);
            console.log(`API call failed, retrying (${retryCount + 1}/3)...`);
            
            // Update progress to indicate retry
            setProgress(35);
            
            // Wait 3 seconds before retry
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Try again recursively
            return processBackgroundCourseGeneration(topic, purpose, difficulty, courseId);
          }
          
          // If we've exhausted retries, switch to fallback mode
          if (!useFallback) {
            console.log("Switching to fallback generation mode");
            setUseFallback(true);
            
            // Update progress to indicate fallback
            setProgress(40);
            
            // Try again with fallback
            return processBackgroundCourseGeneration(topic, purpose, difficulty, courseId);
          }
          
          throw new Error(response.error || 'Unknown error from Gemini API');
        }
        
        console.log(`Background generation completed successfully for course ${courseId}`);
        setProgress(70);
        
        // Extract text content from response
        const text = response.text || '';
        
        if (!text) {
          throw new Error('Empty response from Gemini API');
        }
        
        // Extract summary
        let summary = `An AI-generated course on ${topic}`;
        const summaryMatch = text.match(/# SUMMARY[:\n]+([^#]+)/i);
        if (summaryMatch && summaryMatch[1]) {
          summary = summaryMatch[1].trim().substring(0, 500);
        }
        
        // Parse the content into structured format
        const parsedContent = parseGeneratedContent(text);
        setProgress(90);
        
        // Update course with complete content
        await supabase
          .from('courses')
          .update({ 
            summary,
            content: {
              status: 'complete',
              fullText: text,
              generatedAt: new Date().toISOString(),
              parsedContent
            } 
          })
          .eq('id', courseId);
          
        console.log(`Course ${courseId} updated with generated content`);
        setProgress(100);
      } catch (error: any) {
        console.error(`Error calling Flask API for Gemini: ${error.message}`);
        throw error;
      }
      
    } catch (error: any) {
      console.error(`Error in background processing for course ${courseId}:`, error);
      setProgress(0);
      
      // Try to update the course with error status
      try {
        await supabase
          .from('courses')
          .update({ 
            content: { 
              status: 'error', 
              message: error.message || 'Unknown error during background processing',
              lastUpdated: new Date().toISOString()
            } 
          })
          .eq('id', courseId);
          
        console.log(`Updated course ${courseId} status to error due to background processing error`);
      } catch (updateError: any) {
        console.error(`Failed to update error status for course ${courseId}:`, updateError);
      }
    }
  };

  // Function to generate additional flashcards for an existing course
  const generateAdditionalFlashcards = async (
    courseId: string, 
    topic: string,
    purpose: CourseType['purpose'], 
    difficulty: CourseType['difficulty']
  ) => {
    try {
      console.log(`Generating additional flashcards for course ${courseId}`);
      
      // Update course status to indicate flashcard generation
      await supabase
        .from('courses')
        .update({ 
          content: { 
            status: 'generating_flashcards', 
            message: "Generating additional flashcards",
            lastUpdated: new Date().toISOString() 
          } 
        })
        .eq('id', courseId);
      
      // We can implement flashcard generation here if needed later
      
      sonnerToast.info('Enhancing Your Course', {
        description: 'Generating additional flashcards for your course. This will happen in the background.',
      });
      
      return true;
    } catch (error: any) {
      console.error("Error in generateAdditionalFlashcards:", error);
      sonnerToast.error('Error', {
        description: error.message || "Failed to generate additional flashcards",
      });
      return false;
    }
  };

  // Helper function to parse the generated content
  const parseGeneratedContent = (text: string) => {
    const parsedContent = {
      summary: "",
      chapters: [],
      flashcards: [],
      mcqs: [],
      qnas: []
    };

    // Extract summary
    const summaryMatch = text.match(/# SUMMARY\s*\n([\s\S]*?)(?=\n# |\n## |$)/i);
    if (summaryMatch && summaryMatch[1]) {
      parsedContent.summary = summaryMatch[1].trim();
    }

    // Extract chapters
    const chaptersSection = text.match(/# CHAPTERS\s*\n([\s\S]*?)(?=\n# |$)/i);
    if (chaptersSection && chaptersSection[1]) {
      const chaptersText = chaptersSection[1];
      const chapterBlocks = chaptersText.split(/\n(?=## )/g);
      
      parsedContent.chapters = chapterBlocks.map((block, index) => {
        const titleMatch = block.match(/## (.*)/);
        const title = titleMatch ? titleMatch[1].trim() : `Chapter ${index + 1}`;
        const content = block.replace(/## .*\n/, '').trim();
        
        return {
          title,
          content,
          order_number: index + 1
        };
      });
    }

    // Extract flashcards
    const flashcardsSection = text.match(/# FLASHCARDS\s*\n([\s\S]*?)(?=\n# |$)/i);
    if (flashcardsSection && flashcardsSection[1]) {
      const flashcardsText = flashcardsSection[1];
      const flashcardMatches = [...flashcardsText.matchAll(/- Question: ([\s\S]*?)- Answer: ([\s\S]*?)(?=\n- Question: |\n# |\n$)/g)];
      
      parsedContent.flashcards = flashcardMatches.map((match) => ({
        question: match[1].trim(),
        answer: match[2].trim()
      }));
    }

    // Extract MCQs
    const mcqsSection = text.match(/# MCQs[\s\S]*?(?:Multiple Choice Questions\)?)?\s*\n([\s\S]*?)(?=\n# |$)/i);
    if (mcqsSection && mcqsSection[1]) {
      const mcqsText = mcqsSection[1];
      const mcqBlocks = mcqsText.split(/\n(?=- Question: )/g);
      
      parsedContent.mcqs = mcqBlocks.filter(block => block.includes('- Question:')).map(block => {
        const questionMatch = block.match(/- Question: ([\s\S]*?)(?=\n- Options:|\n|$)/);
        const optionsText = block.match(/- Options:\s*\n([\s\S]*?)(?=\n- Correct Answer:|\n|$)/);
        const correctAnswerMatch = block.match(/- Correct Answer: ([a-d])/i);
        
        const question = questionMatch ? questionMatch[1].trim() : '';
        
        let options = [];
        if (optionsText && optionsText[1]) {
          options = optionsText[1]
            .split(/\n\s*/)
            .filter(line => /^[a-d]\)/.test(line))
            .map(line => line.replace(/^[a-d]\)\s*/, '').trim());
        }
        
        const correctAnswer = correctAnswerMatch ? 
          options[correctAnswerMatch[1].charCodeAt(0) - 'a'.charCodeAt(0)] : 
          '';
        
        return {
          question,
          options,
          correct_answer: correctAnswer
        };
      });
    }

    // Extract Q&As
    const qnasSection = text.match(/# Q&A PAIRS\s*\n([\s\S]*?)(?=\n# |$)/i);
    if (qnasSection && qnasSection[1]) {
      const qnasText = qnasSection[1];
      const qnaMatches = [...qnasText.matchAll(/- Question: ([\s\S]*?)- Answer: ([\s\S]*?)(?=\n- Question: |\n# |\n$)/g)];
      
      parsedContent.qnas = qnaMatches.map((match) => ({
        question: match[1].trim(),
        answer: match[2].trim()
      }));
    }

    return parsedContent;
  };

  return {
    generationInBackground,
    courseGenerationId,
    error,
    progress,
    setError,
    startCourseGeneration,
    generateAdditionalFlashcards
  };
};
