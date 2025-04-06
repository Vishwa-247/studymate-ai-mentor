import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import InterviewSetup from "@/components/interview/InterviewSetup";
import VideoRecorder from "@/components/interview/VideoRecorder";
import { useAuth } from "@/context/AuthContext";
import { InterviewQuestionType, MockInterviewType, CourseType } from "@/types";
import Container from "@/components/ui/Container";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CourseForm from "@/components/course/CourseForm";
import { supabase } from "@/integrations/supabase/client";
import { generateInterviewQuestionsWithFlask, TextResponse } from "@/services/flaskApi";
import { useCourseGeneration } from "@/hooks/useCourseGeneration";

enum InterviewStage {
  Setup = "setup",
  Questions = "questions",
  Recording = "recording",
  Review = "review",
  Complete = "complete",
}

const MockInterview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<InterviewStage>(InterviewStage.Setup);
  const [interviewData, setInterviewData] = useState<MockInterviewType | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCourseTabActive, setIsCourseTabActive] = useState(false);
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recentInterviews, setRecentInterviews] = useState<MockInterviewType[]>([]);
  const [recentCourses, setRecentCourses] = useState<CourseType[]>([]);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const isMounted = useRef(true);
  
  const { startCourseGeneration } = useCourseGeneration();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadUserInterviews();
      loadUserCourses();
    }
  }, [user]);

  const loadUserInterviews = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('mock_interviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (isMounted.current) {
        setRecentInterviews(data || []);
      }
    } catch (error) {
      console.error("Error loading interview history:", error);
    }
  };

  const loadUserCourses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (isMounted.current) {
        setRecentCourses(data as CourseType[] || []);
      }
    } catch (error) {
      console.error("Error loading course history:", error);
    }
  };

  const handleInterviewSetup = async (role: string, techStack: string, experience: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start an interview",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: interview, error: interviewError } = await supabase
        .from('mock_interviews')
        .insert({
          job_role: role,
          tech_stack: techStack,
          experience,
          user_id: user.id,
          completed: false
        })
        .select()
        .single();
      
      if (interviewError) throw interviewError;
      
      if (!isMounted.current) return;
      
      setInterviewData(interview);
      console.log("Interview created:", interview);

      const generatedData = await generateInterviewQuestionsWithFlask(
        role,
        techStack,
        experience,
        5
      );

      if (!isMounted.current) return;
      
      console.log("Generated questions data:", generatedData);
      
      let questionList: string[] = [];
      try {
        const text = generatedData.text;
        questionList = text
          .split(/\d+\./)
          .map(q => q.trim())
          .filter(q => q.length > 0);
          
        if (questionList.length === 0) {
          questionList = [
            "Explain your experience with " + techStack,
            "How do you handle tight deadlines?",
            "Describe a challenging project you worked on",
            "How do you stay updated with industry trends?",
            "What are your strengths and weaknesses as a " + role + "?"
          ];
        }
      } catch (error) {
        console.error("Error parsing questions:", error);
        questionList = [
          "Explain your experience with " + techStack,
          "How do you handle tight deadlines?",
          "Describe a challenging project you worked on",
          "How do you stay updated with industry trends?",
          "What are your strengths and weaknesses as a " + role + "?"
        ];
      }
      
      if (!isMounted.current) return;
      
      const questionsToInsert = questionList.map((question, index) => ({
        interview_id: interview.id,
        question,
        order_number: index + 1
      }));
      
      const { data: savedQuestions, error: questionsError } = await supabase
        .from('interview_questions')
        .insert(questionsToInsert)
        .select();
        
      if (questionsError) throw questionsError;
      
      if (!isMounted.current) return;
      
      console.log("Questions saved:", savedQuestions);
      setQuestions(savedQuestions);
      setCurrentQuestionIndex(0);
      
      setRecentInterviews(prev => [interview, ...prev]);
      
      setStage(InterviewStage.Questions);
      toast({
        title: "Interview Created",
        description: "Your mock interview has been set up successfully.",
      });
    } catch (error) {
      console.error("Error setting up interview:", error);
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to set up the interview. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const fetchInterviewQuestions = async (interviewId: string) => {
    try {
      const { data, error } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('interview_id', interviewId)
        .order('order_number', { ascending: true });
        
      if (error) throw error;
      
      if (isMounted.current) {
        setQuestions(data || []);
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to load interview questions.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAnswerSubmitted = async (blob: Blob) => {
    if (!interviewData || !questions[currentQuestionIndex]) return;
    
    try {
      const { error } = await supabase
        .from('interview_questions')
        .update({ user_answer: "Recorded answer" })
        .eq('id', questions[currentQuestionIndex].id);
        
      if (error) throw error;
      
      if (isMounted.current) {
        toast({
          title: "Answer Recorded",
          description: "Your answer has been recorded successfully.",
        });
        setRecordingComplete(true);
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to save your answer. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleNextQuestion = async () => {
    setRecordingComplete(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setStage(InterviewStage.Questions);
    } else {
      setStage(InterviewStage.Complete);
      
      if (interviewData) {
        try {
          const { error } = await supabase
            .from('mock_interviews')
            .update({ completed: true })
            .eq('id', interviewData.id);
            
          if (error) throw error;
          
          if (isMounted.current) {
            toast({
              title: "Interview Completed",
              description: "Your interview has been completed. Preparing your results...",
            });
            
            const timeoutId = setTimeout(() => {
              if (isMounted.current) {
                navigate(`/interview-result/${interviewData.id}`);
              }
            }, 2000);
            
            return () => clearTimeout(timeoutId);
          }
        } catch (error) {
          console.error("Error updating interview status:", error);
          if (isMounted.current) {
            toast({
              title: "Error",
              description: "Failed to update interview status.",
              variant: "destructive",
            });
          }
        }
      }
    }
  };

  const handleSubmitCourse = async (courseName: string, purpose: CourseType['purpose'], difficulty: CourseType['difficulty']) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate courses.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingCourse(true);
    
    try {
      toast({
        title: "Generating Course",
        description: "Please wait while we create your course. This may take a minute.",
      });

      const courseId = await startCourseGeneration(courseName, purpose, difficulty, user.id);
      
      const timeoutId = setTimeout(() => {
        if (isMounted.current) {
          toast({
            title: "Course Generation Started",
            description: "Your course is being generated in the background. You can navigate away and check back later.",
          });
        }
      }, 3000);
      
      const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      clearTimeout(timeoutId);
      
      if (error) {
        throw error;
      }
      
      if (isMounted.current) {
        setRecentCourses(prev => [course as CourseType, ...prev]);
        toast({
          title: "Course Generation Started",
          description: "Your course is now being generated in the background!",
        });
        navigate(`/dashboard`);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to create course. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsGeneratingCourse(false);
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingComplete(false);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
  };
  
  const handleCancel = () => {
    setStage(InterviewStage.Questions);
    setRecordingComplete(false);
  };

  const handleDownloadInterview = () => {
    if (isMounted.current) {
      toast({
        title: "Interview Downloaded",
        description: "Your interview has been downloaded successfully.",
      });
    }
  };

  const renderStage = () => {
    switch (stage) {
      case InterviewStage.Questions:
        if (questions.length === 0) {
          return (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading questions...</p>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="mb-6 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStage(InterviewStage.Setup)}
                  className="text-muted-foreground"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Cancel Interview
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                  <CardDescription>
                    Take a moment to think about your answer before recording.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-md text-lg">
                    {questions[currentQuestionIndex]?.question}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center mt-4">
                <Button 
                  size="lg"
                  onClick={() => setStage(InterviewStage.Recording)}
                >
                  Ready to Answer
                </Button>
              </div>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Interview Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Speak clearly and at a moderate pace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Maintain eye contact with the camera</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Structure your answers using the STAR method</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Take a brief pause before answering to collect your thoughts</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Camera Preview</CardTitle>
                  <CardDescription>
                    Check your camera and microphone before starting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoRecorder 
                    onRecordingComplete={() => {}}
                    isRecording={false}
                    startRecording={() => {}}
                    stopRecording={() => {}}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Save Your Interview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Download your interview session for future reference or to share with mentors.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleDownloadInterview}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Interview
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case InterviewStage.Recording:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Question {currentQuestionIndex + 1}:
                </h2>
                <div className="p-4 bg-muted rounded-md text-lg mb-4">
                  {questions[currentQuestionIndex]?.question}
                </div>
                <p className="text-muted-foreground">
                  When you're ready, click "Start Recording" and begin your answer. We'll analyze both your verbal response and facial expressions.
                </p>
              </div>
              
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Answering Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Use specific examples from your experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Avoid filler words like "um" and "uh"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Speak confidently and maintain good posture</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <VideoRecorder 
                onRecordingComplete={handleAnswerSubmitted}
                isRecording={isRecording}
                startRecording={startRecording}
                stopRecording={stopRecording}
              />
              
              <div className="mt-6 flex justify-center space-x-4">
                {recordingComplete ? (
                  <Button 
                    onClick={handleNextQuestion}
                    className="px-6 py-3 bg-primary text-white rounded-lg flex items-center space-x-2"
                  >
                    <span>Next Question</span>
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      
      case InterviewStage.Complete:
        return (
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="mb-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Processing Your Interview</h2>
              <p className="text-muted-foreground">
                We're analyzing your responses and preparing your personalized feedback. You'll be redirected automatically when it's ready.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderRecentInterviews = () => {
    if (recentInterviews.length === 0) {
      return (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Recent Mock Interviews</h2>
          <p className="text-muted-foreground">You haven't completed any mock interviews yet.</p>
        </div>
      );
    }
    
    return (
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Recent Mock Interviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentInterviews.map((interview) => (
            <Card key={interview.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{interview.job_role}</CardTitle>
                    <CardDescription>{new Date(interview.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    interview.completed ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {interview.completed ? "Completed" : "In Progress"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  {interview.tech_stack.split(',').map((tech, i) => (
                    <div key={i} className="px-2 py-1 text-xs font-medium rounded-full bg-secondary">
                      {tech.trim()}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      if (interview.completed) {
                        navigate(`/interview-result/${interview.id}`);
                      } else {
                        setInterviewData(interview);
                        fetchInterviewQuestions(interview.id);
                        setStage(InterviewStage.Questions);
                      }
                    }}
                  >
                    {interview.completed ? "View Results" : "Resume Interview"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Container className="py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isCourseTabActive ? "Course Generator" : "Mock Interview"}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {isCourseTabActive 
              ? "Create customized courses on any topic with our AI-powered course generator."
              : "Practice your interview skills with our AI-powered mock interview simulator."}
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant={isCourseTabActive ? "outline" : "default"} 
            onClick={() => setIsCourseTabActive(false)}
          >
            Mock Interview
          </Button>
          <Button 
            variant={isCourseTabActive ? "default" : "outline"} 
            onClick={() => setIsCourseTabActive(true)}
          >
            Course Generator
          </Button>
        </div>
      </div>

      {isCourseTabActive ? (
        <div className="space-y-8">
          <CourseForm onSubmit={handleSubmitCourse} isLoading={isGeneratingCourse} />
          
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Recent Course Generations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCourses.length > 0 ? (
                recentCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>{new Date(course.created_at).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                          {course.purpose.replace('_', ' ')}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{course.difficulty}</span>
                        <span className="text-sm text-muted-foreground">Generated</span>
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate(`/course/${course.id}`)}
                        >
                          View Course
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground col-span-3">No courses generated yet. Try creating your first course above!</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {stage === InterviewStage.Setup && (
            <div className="space-y-8">
              <InterviewSetup onSubmit={handleInterviewSetup} isLoading={isLoading} />
              {renderRecentInterviews()}
            </div>
          )}
          
          {stage !== InterviewStage.Setup && renderStage()}
        </>
      )}
    </Container>
  );
};

export default MockInterview;
