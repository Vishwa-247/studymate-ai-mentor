import { supabase } from '@/integrations/supabase/client';
import { CourseType, ChapterType, FlashcardType, McqType, QnaType, MockInterviewType, InterviewQuestionType, InterviewAnalysisType } from '@/types';
import { 
  generateCourseWithFlask, 
  generateInterviewQuestionsWithFlask, 
  generateFlashcardsWithFlask, 
  summarizeTextWithFlask,
  explainCodeWithFlask
} from './flaskApi';
import {
  generateCourseWithGemini,
  generateInterviewQuestionsWithGemini,
  analyzeInterviewResponseWithGemini,
  generateFlashcardsWithGemini
} from './geminiService';

const fromTable = <T>(tableName: string) => {
  return (supabase as any).from(tableName);
};

export const createCourse = async (
  title: string,
  purpose: CourseType['purpose'],
  difficulty: CourseType['difficulty'],
  summary: string,
  userId: string
): Promise<CourseType> => {
  const { data, error } = await fromTable<CourseType>('courses')
    .insert({
      title,
      purpose,
      difficulty,
      summary,
      user_id: userId,
      content: { status: 'pending' } // Add a status to indicate it's newly created
    })
    .select()
    .single();

  if (error) throw error;
  return data as CourseType;
};

export const getCourseById = async (courseId: string): Promise<CourseType> => {
  const { data, error } = await fromTable<CourseType>('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) throw error;
  return data as CourseType;
};

export const getAllCourses = async (userId: string): Promise<CourseType[]> => {
  const { data, error } = await fromTable<CourseType>('courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
  return data as CourseType[] || [];
};

export const getUserCourses = async (): Promise<CourseType[]> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];
  
  return getAllCourses(userData.user.id);
};

export const checkCourseGenerationStatus = async (courseId: string): Promise<{
  isComplete: boolean;
  status: string;
  error?: string;
}> => {
  const { data, error } = await fromTable<CourseType>('courses')
    .select('content')
    .eq('id', courseId)
    .single();
    
  if (error) throw error;
  
  if (!data?.content || typeof data.content !== 'object') {
    return { isComplete: false, status: 'unknown' };
  }
  
  const content = data.content as any;
  return { 
    isComplete: content.status === 'complete',
    status: content.status || 'unknown',
    error: content.message
  };
};

export const updateCourseContent = async (
  courseId: string,
  content: any,
  summary?: string
): Promise<void> => {
  const updates: any = { content };
  if (summary) {
    updates.summary = summary;
  }
  
  const { error } = await fromTable<CourseType>('courses')
    .update(updates)
    .eq('id', courseId);
    
  if (error) throw error;
};

export const createChapters = async (
  courseId: string,
  chapters: { title: string; content: string; order_number: number }[]
): Promise<ChapterType[]> => {
  const chaptersWithCourseId = chapters.map(chapter => ({
    ...chapter,
    course_id: courseId
  }));

  const { data, error } = await fromTable<ChapterType>('chapters')
    .insert(chaptersWithCourseId)
    .select();

  if (error) throw error;
  return data as ChapterType[];
};

export const getChaptersByCourseId = async (courseId: string): Promise<ChapterType[]> => {
  const { data, error } = await fromTable<ChapterType>('chapters')
    .select('*')
    .eq('course_id', courseId)
    .order('order_number', { ascending: true });

  if (error) throw error;
  return data as ChapterType[];
};

export const createFlashcards = async (
  courseId: string,
  flashcards: { question: string; answer: string }[]
): Promise<FlashcardType[]> => {
  const flashcardsWithCourseId = flashcards.map(flashcard => ({
    ...flashcard,
    course_id: courseId
  }));

  const { data, error } = await fromTable<FlashcardType>('flashcards')
    .insert(flashcardsWithCourseId)
    .select();

  if (error) throw error;
  return data as FlashcardType[];
};

export const getFlashcardsByCourseId = async (courseId: string): Promise<FlashcardType[]> => {
  const { data, error } = await fromTable<FlashcardType>('flashcards')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  return data as FlashcardType[];
};

export const createMcqs = async (
  courseId: string,
  mcqs: { question: string; options: string[]; correct_answer: string }[]
): Promise<McqType[]> => {
  const mcqsWithCourseId = mcqs.map(mcq => ({
    course_id: courseId,
    question: mcq.question,
    options: mcq.options,
    correct_answer: mcq.correct_answer
  }));

  const { data, error } = await fromTable<McqType>('mcqs')
    .insert(mcqsWithCourseId)
    .select();

  if (error) throw error;
  return data as McqType[];
};

export const getMcqsByCourseId = async (courseId: string): Promise<McqType[]> => {
  const { data, error } = await fromTable<McqType>('mcqs')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  
  return data as McqType[];
};

export const createQnas = async (
  courseId: string,
  qnas: { question: string; answer: string }[]
): Promise<QnaType[]> => {
  const qnasWithCourseId = qnas.map(qna => ({
    ...qna,
    course_id: courseId
  }));

  const { data, error } = await fromTable<QnaType>('qna')
    .insert(qnasWithCourseId)
    .select();

  if (error) throw error;
  return data as QnaType[];
};

export const getQnasByCourseId = async (courseId: string): Promise<QnaType[]> => {
  const { data, error } = await fromTable<QnaType>('qna')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  return data as QnaType[];
};

export const createMockInterview = async (
  jobRole: string,
  techStack: string,
  experience: string
): Promise<MockInterviewType> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("User not authenticated");

  const { data, error } = await fromTable<MockInterviewType>('mock_interviews')
    .insert({
      job_role: jobRole,
      tech_stack: techStack,
      experience: experience,
      user_id: userData.user.id,
      completed: false
    })
    .select()
    .single();

  if (error) throw error;
  return data as MockInterviewType;
};

export const getUserMockInterviews = async (): Promise<MockInterviewType[]> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];
  
  const { data, error } = await fromTable<MockInterviewType>('mock_interviews')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching interviews:", error);
    return [];
  }
  return data as MockInterviewType[] || [];
};

export const getMockInterviewById = async (interviewId: string): Promise<MockInterviewType> => {
  const { data, error } = await fromTable<MockInterviewType>('mock_interviews')
    .select('*')
    .eq('id', interviewId)
    .single();

  if (error) throw error;
  return data as MockInterviewType;
};

export const updateMockInterviewCompleted = async (interviewId: string): Promise<void> => {
  const { error } = await fromTable<MockInterviewType>('mock_interviews')
    .update({
      completed: true
    })
    .eq('id', interviewId);

  if (error) throw error;
};

export const createInterviewQuestions = async (
  interviewId: string,
  questions: {
    question: string;
    order_number: number;
  }[]
): Promise<InterviewQuestionType[]> => {
  const questionsWithInterviewId = questions.map(q => ({
    interview_id: interviewId,
    order_number: q.order_number,
    question: q.question,
    user_answer: null
  }));

  const { data, error } = await fromTable<InterviewQuestionType>('interview_questions')
    .insert(questionsWithInterviewId)
    .select();

  if (error) throw error;
  return data as InterviewQuestionType[];
};

export const getInterviewQuestionsByInterviewId = async (interviewId: string): Promise<InterviewQuestionType[]> => {
  const { data, error } = await fromTable<InterviewQuestionType>('interview_questions')
    .select('*')
    .eq('interview_id', interviewId)
    .order('order_number', { ascending: true });

  if (error) throw error;
  return data as InterviewQuestionType[];
};

export const updateInterviewQuestionAnswer = async (questionId: string, answer: string): Promise<void> => {
  const { error } = await fromTable<InterviewQuestionType>('interview_questions')
    .update({
      user_answer: answer
    })
    .eq('id', questionId);

  if (error) throw error;
};

export const createInterviewAnalysis = async (
  interviewId: string,
  facialExpressionData: {
    confident: number;
    stressed: number;
    hesitant: number;
    nervous: number;
    excited: number;
  },
  pronunciationFeedback: string,
  technicalFeedback: string,
  languageFeedback: string,
  courseRecommendations: {
    title: string;
    description: string;
    link?: string;
  }[]
): Promise<InterviewAnalysisType> => {
  const { data, error } = await fromTable<InterviewAnalysisType>('interview_analysis')
    .insert({
      interview_id: interviewId,
      facial_data: facialExpressionData,
      pronunciation_feedback: pronunciationFeedback,
      technical_feedback: technicalFeedback,
      language_feedback: languageFeedback,
      recommendations: courseRecommendations
    })
    .select()
    .single();

  if (error) throw error;
  return data as InterviewAnalysisType;
};

export const getInterviewAnalysisByInterviewId = async (interviewId: string): Promise<InterviewAnalysisType> => {
  const { data, error } = await fromTable<InterviewAnalysisType>('interview_analysis')
    .select('*')
    .eq('interview_id', interviewId)
    .single();

  if (error) throw error;
  return data as InterviewAnalysisType;
};

export const analyzeSpeech = async (
  audioBlob: Blob,
  jobRole: string
): Promise<{
  clarity: number;
  confidence: number;
  fluency: number;
  accent: number;
  grammar: number;
  feedback: string;
}> => {
  return {
    clarity: Math.random() * 60 + 40,
    confidence: Math.random() * 60 + 40,
    fluency: Math.random() * 60 + 40,
    accent: Math.random() * 60 + 40,
    grammar: Math.random() * 60 + 40,
    feedback: "Your speech was clear, but try to slow down for technical explanations. Work on eliminating filler words like 'um' and 'ah'."
  };
};

export const analyzeFacialExpression = async (
  imageBlob: Blob
): Promise<{
  confident: number;
  stressed: number;
  hesitant: number;
  nervous: number;
  excited: number;
}> => {
  return {
    confident: Math.random() * 0.7 + 0.3,
    stressed: Math.random() * 0.5,
    hesitant: Math.random() * 0.6,
    nervous: Math.random() * 0.4,
    excited: Math.random() * 0.5 + 0.2
  };
};

/**
 * Generate a course using the Gemini API
 */
export const generateCourseContent = async (
  courseId: string,
  topic: string, 
  purpose: CourseType['purpose'], 
  difficulty: CourseType['difficulty']
) => {
  try {
    return await generateCourseWithGemini(courseId, topic, purpose, difficulty);
  } catch (error) {
    console.error("Error generating course with Gemini:", error);
    // Fallback to Flask API if Gemini fails
    return generateCourseWithFlask(topic, purpose, difficulty);
  }
};

/**
 * Generate interview questions using the Gemini API
 */
export const generateInterviewQuestions = async (
  jobRole: string,
  techStack: string,
  experience: string,
  questionCount: number = 5
) => {
  try {
    return await generateInterviewQuestionsWithGemini(jobRole, techStack, experience, questionCount);
  } catch (error) {
    console.error("Error generating interview questions with Gemini:", error);
    // Fallback to Flask API if Gemini fails
    return generateInterviewQuestionsWithFlask(jobRole, techStack, experience, questionCount);
  }
};

/**
 * Analyze an interview response using the Gemini API
 */
export const analyzeInterviewResponse = async (
  jobRole: string,
  question: string,
  answer: string
) => {
  try {
    return await analyzeInterviewResponseWithGemini(jobRole, question, answer);
  } catch (error) {
    console.error("Error analyzing interview response with Gemini:", error);
    
    // Fallback to a simple response if Gemini fails
    return {
      data: {
        text: "An error occurred while analyzing the response. Please try again later."
      }
    };
  }
};

/**
 * Start course generation process using Supabase edge function
 */
export const startCourseGeneration = async (
  courseId: string,
  topic: string, 
  purpose: CourseType['purpose'], 
  difficulty: CourseType['difficulty']
): Promise<void> => {
  try {
    // Call the Gemini API to generate course content
    await generateCourseWithGemini(courseId, topic, purpose, difficulty);
    console.log("Course generation started for:", {courseId, topic, purpose, difficulty});
    return;
  } catch (error) {
    console.error("Error in startCourseGeneration:", error);
    throw error;
  }
};

export interface StudyMaterial {
  id?: number;
  course_id: string;
  course_type: string;
  topic: string;
  difficulty_level?: string;
  course_layout?: any;
  created_by: string;
  status?: string;
  created_at?: string;
}

export const createStudyMaterial = async (studyMaterial: Omit<StudyMaterial, 'id' | 'created_at'>): Promise<StudyMaterial> => {
  const { data, error } = await fromTable<StudyMaterial>('study_material')
    .insert(studyMaterial)
    .select()
    .single();

  if (error) throw error;
  return data as StudyMaterial;
};

export const getAllStudyMaterials = async (): Promise<StudyMaterial[]> => {
  const { data, error } = await fromTable<StudyMaterial>('study_material')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching study materials:", error);
    return [];
  }
  return data as StudyMaterial[] || [];
};

export const getStudyMaterialById = async (id: number): Promise<StudyMaterial | null> => {
  const { data, error } = await fromTable<StudyMaterial>('study_material')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching study material:", error);
    return null;
  }
  return data as StudyMaterial | null;
};

export const updateStudyMaterialStatus = async (id: number, status: string): Promise<void> => {
  const { error } = await fromTable<StudyMaterial>('study_material')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
};

export const updateStudyMaterialLayout = async (id: number, courseLayout: any): Promise<void> => {
  const { error } = await fromTable<StudyMaterial>('study_material')
    .update({ course_layout: courseLayout })
    .eq('id', id);

  if (error) throw error;
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  is_member: boolean;
  created_at?: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await fromTable<UserProfile>('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  return data as UserProfile | null;
};

export const updateUserProfile = async (
  userId: string, 
  updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
): Promise<void> => {
  const { error } = await fromTable<UserProfile>('users')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
};

export const updateMembershipStatus = async (userId: string, isMember: boolean): Promise<void> => {
  const { error } = await fromTable<UserProfile>('users')
    .update({ is_member: isMember })
    .eq('id', userId);

  if (error) throw error;
};
