
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Video, MessageSquare, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Container from "@/components/ui/Container";
import { useAuth } from "@/context/AuthContext";
import Chatbot from "@/components/Chatbot";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showChatbot, setShowChatbot] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Use React Query for data fetching with caching
  const fetchUserCourses = useCallback(async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) throw error;
    return data || [];
  }, [user]);

  const fetchUserInterviews = useCallback(async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('mock_interviews')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) throw error;
    return data || [];
  }, [user]);

  const { 
    data: courses = [], 
    isLoading: isLoadingCourses,
    error: coursesError
  } = useQuery({
    queryKey: ['dashboard-courses', user?.id],
    queryFn: fetchUserCourses,
    enabled: !!user,
    staleTime: 60000 // Cache data for 1 minute
  });

  const { 
    data: interviews = [], 
    isLoading: isLoadingInterviews,
    error: interviewsError
  } = useQuery({
    queryKey: ['dashboard-interviews', user?.id],
    queryFn: fetchUserInterviews,
    enabled: !!user,
    staleTime: 60000 // Cache data for 1 minute
  });

  // Show toast on errors
  useEffect(() => {
    if (coursesError || interviewsError) {
      toast({
        title: "Error loading dashboard data",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    }
  }, [coursesError, interviewsError, toast]);

  const isLoading = isLoadingCourses || isLoadingInterviews;
  const error = coursesError || interviewsError;

  const WelcomeCard = () => (
    <Card className="col-span-full p-6 text-center">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Welcome to StudyMate, {user?.user_metadata?.full_name || 'Student'}!</CardTitle>
        <CardDescription className="text-base">
          Your personalized learning and interview practice platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="max-w-md mx-auto">
          <p className="mb-4">Get started by creating your first learning course or practice interview</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/course-generator">
                Create Course <Book className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/mock-interview">
                Start Interview <Video className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ErrorDisplay = () => (
    <Card className="p-6 text-center border-red-300">
      <CardHeader>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
        <CardTitle className="text-xl text-red-500">Unable to Load Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{error instanceof Error ? error.message : "There was a problem loading your data. Please try again later."}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Container>
      <div className="py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">StudyMate Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your learning progress and interview performance
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/course-generator">Create Course</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/mock-interview">Start Interview</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowChatbot(!showChatbot)}
              className="flex items-center gap-1"
            >
              <MessageSquare size={16} />
              <span>Help</span>
            </Button>
          </div>
        </div>

        {showChatbot && (
          <div className="mb-8">
            <Chatbot />
          </div>
        )}

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorDisplay />
          ) : (
            <>
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Book className="mr-2 h-4 w-4 text-primary" />
                        <div className="text-2xl font-bold">{courses.length}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Interviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Video className="mr-2 h-4 w-4 text-primary" />
                        <div className="text-2xl font-bold">{interviews.length}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Ready to Start
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to="/course-generator">
                          Get Started
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {courses.length === 0 && interviews.length === 0 && <WelcomeCard />}
              </TabsContent>

              <TabsContent value="courses">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.length > 0 ? (
                    courses.map(course => (
                      <Card key={course.id} className="flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>
                            {course.summary}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {course.difficulty}
                            </span>
                            <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                              {course.purpose}
                            </span>
                          </div>
                        </CardContent>
                        <div className="p-4 pt-0 mt-auto">
                          <Button variant="outline" className="w-full" asChild>
                            <Link to={`/course/${course.id}`}>
                              View Course <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 col-span-full">
                      <Book className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Generate New Course</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Create a custom course based on your learning goals
                      </p>
                      <Button asChild>
                        <Link to="/course-generator">
                          Start Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </Card>
                  )}
                  
                  <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6">
                    <Book className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Generate New Course</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Create a custom course based on your learning goals
                    </p>
                    <Button asChild>
                      <Link to="/course-generator">
                        Start Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="interviews">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {interviews.length > 0 ? (
                    interviews.map(interview => (
                      <Card key={interview.id} className="flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-lg">{interview.job_role}</CardTitle>
                          <CardDescription>
                            {interview.tech_stack}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {interview.experience}
                            </span>
                            <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                              {interview.completed ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                        </CardContent>
                        <div className="p-4 pt-0 mt-auto">
                          <Button variant="outline" className="w-full" asChild>
                            <Link to={interview.completed ? `/interview-result/${interview.id}` : `/mock-interview?id=${interview.id}`}>
                              {interview.completed ? 'View Results' : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 col-span-full">
                      <Video className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Start New Interview</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Practice with our AI-powered interview simulator
                      </p>
                      <Button asChild>
                        <Link to="/mock-interview">
                          Begin Practice <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </Card>
                  )}
                  
                  {interviews.length > 0 && (
                    <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6">
                      <Video className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Start New Interview</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Practice with our AI-powered interview simulator
                      </p>
                      <Button asChild>
                        <Link to="/mock-interview">
                          Begin Practice <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Container>
  );
};

export default Dashboard;
