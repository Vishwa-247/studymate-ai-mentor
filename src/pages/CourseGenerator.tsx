
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Container from "@/components/ui/Container";
import CourseForm from "@/components/course/CourseForm";
import HowItWorks from "@/components/course/HowItWorks";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useAuth } from "@/context/AuthContext";
import { toast as sonnerToast } from "sonner";
import { useCourseGeneration } from "@/hooks/useCourseGeneration";
import { CourseType } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [generationStartTime, setGenerationStartTime] = useState<Date | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(60); // Default 60 seconds
  
  const { 
    generationInBackground, 
    error, 
    progress,
    setError, 
    startCourseGeneration 
  } = useCourseGeneration();

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!generationStartTime) return 0;
    
    const elapsed = Math.floor((Date.now() - generationStartTime.getTime()) / 1000);
    const remaining = Math.max(0, estimatedTime - elapsed);
    return remaining;
  };

  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Use React Query for mutations to manage loading and error states automatically
  const generateCourseMutation = useMutation({
    mutationFn: async ({
      courseName, 
      purpose, 
      difficulty
    }: {
      courseName: string;
      purpose: CourseType['purpose'];
      difficulty: CourseType['difficulty'];
    }) => {
      if (!user) {
        throw new Error("Authentication required");
      }
      
      // Start the timer when generation begins
      setGenerationStartTime(new Date());
      
      // Set estimated time based on complexity
      if (difficulty === 'advanced') {
        setEstimatedTime(120); // 2 minutes for advanced courses
      } else if (difficulty === 'intermediate') {
        setEstimatedTime(90); // 1.5 minutes for intermediate courses
      } else {
        setEstimatedTime(60); // 1 minute for beginner courses
      }
      
      return startCourseGeneration(courseName, purpose, difficulty, user.id);
    },
    onSuccess: () => {
      sonnerToast.info('Course Generation Started', {
        description: 'Your course is being generated in the background with advanced flashcards and interactive elements. You can continue browsing the site.',
        duration: 6000,
      });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      console.error("Error starting course generation:", error);
      setError(error.message || "Failed to start course generation. Please try again later.");
      toast({
        title: "Error",
        description: error.message || "Failed to start course generation. Please try again later.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const handleSubmit = async (
    courseName: string, 
    purpose: CourseType['purpose'], 
    difficulty: CourseType['difficulty']
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate courses.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    toast({
      title: "Starting Course Generation",
      description: "This process will continue in the background. You can navigate to other pages.",
    });
    
    // Use the mutation to handle the API call
    generateCourseMutation.mutate({ courseName, purpose, difficulty });
  };

  const remainingTime = getRemainingTime();

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Course Generator</h1>
        <p className="text-muted-foreground max-w-2xl">
          Create customized courses on any topic with our AI-powered course generator.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generationInBackground && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating your course...
            </CardTitle>
            <CardDescription>
              This process takes approximately {formatTime(estimatedTime)} to complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span>{progress}% complete</span>
                {remainingTime > 0 && (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>Estimated {formatTime(remainingTime)} remaining</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CourseForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        
        <div>
          <HowItWorks generationInBackground={generationInBackground} />
        </div>
      </div>

      <LoadingOverlay 
        isLoading={isLoading}
        message="Starting Course Generation"
        subMessage="We're preparing your course. Once started, you can navigate away and we'll notify you when it's ready."
      />
    </Container>
  );
};

export default CourseGenerator;
