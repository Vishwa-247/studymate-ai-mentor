
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Container from "@/components/ui/Container";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Video, MessageSquare, BarChart, CheckCircle, XCircle, AlertCircle, ArrowRight, BookOpen } from "lucide-react";

const InterviewResult = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("feedback");

  // Mock data - would come from API in a real app
  const interviewData = {
    id,
    title: "Software Engineer Interview (React)",
    date: "2023-05-15",
    duration: "32 minutes",
    overallScore: 78,
    jobRole: "Frontend Developer",
    techStack: ["React", "TypeScript", "Node.js"],
    experience: "3-5 years",
    feedback: {
      technical: {
        score: 82,
        strengths: [
          "Strong understanding of React component lifecycle",
          "Good knowledge of state management patterns",
          "Clear explanation of frontend performance optimization"
        ],
        weaknesses: [
          "Some gaps in TypeScript advanced types knowledge",
          "Limited understanding of modern build tools",
          "Could improve on system design explanations"
        ],
        summary: "Your technical knowledge is solid, especially in React fundamentals and state management. Focus on improving your TypeScript skills and expanding your knowledge of modern build tools and system design principles."
      },
      communication: {
        score: 75,
        strengths: [
          "Clear articulation of complex concepts",
          "Good pacing and tone throughout the interview",
          "Effective use of examples to illustrate points"
        ],
        weaknesses: [
          "Occasionally used vague terminology",
          "Some responses could be more concise",
          "A few instances of filler words that reduced clarity"
        ],
        summary: "Your communication is generally strong, with good articulation and pacing. Work on being more precise with technical terminology and reducing filler words to increase the impact of your responses."
      },
      nonVerbal: {
        score: 70,
        strengths: [
          "Maintained good eye contact",
          "Appropriate facial expressions",
          "Professional demeanor throughout"
        ],
        weaknesses: [
          "Occasional fidgeting indicated nervousness",
          "Body posture could be more confident",
          "Hand gestures sometimes distracting"
        ],
        summary: "Your non-verbal communication was professional, with good eye contact. Focus on reducing nervous fidgeting and adopting a more confident posture to enhance your presence."
      }
    },
    questions: [
      {
        question: "Explain the virtual DOM and how it improves performance in React.",
        answer: "The virtual DOM is a lightweight copy of the actual DOM. When state changes in a React application, React first updates the virtual DOM, compares it with the previous version (diffing), and then only updates the actual DOM with the necessary changes. This approach is more efficient than directly manipulating the DOM for every state change because DOM operations are expensive. By batching and optimizing these updates, React significantly improves performance, especially in complex applications with frequent state changes.",
        feedback: "Good explanation of the virtual DOM concept and its performance benefits. You could strengthen the answer by mentioning specific examples of when this optimization matters most, such as in components that re-render frequently.",
        score: 85
      },
      {
        question: "How would you handle state management in a large React application?",
        answer: "For large React applications, I would implement a state management solution that scales well. Context API is good for simpler applications or for state that doesn't change frequently. For more complex applications, I'd use Redux or Zustand. I prefer Redux when we need strong guarantees about state updates, middleware support, and a well-established ecosystem. I'd structure the store using the ducks pattern or feature-based organization. For server state, I'd integrate React Query to handle caching, background updates, and synchronization.",
        feedback: "Strong answer showing awareness of different state management approaches and their trade-offs. Good mention of React Query for server state management. Consider discussing how you would determine which state belongs in global store versus component-local state.",
        score: 90
      },
      {
        question: "Describe TypeScript's type system and how it helps prevent bugs.",
        answer: "TypeScript adds static typing to JavaScript, allowing developers to define types for variables, function parameters, return values, and more. It helps prevent bugs by catching type-related errors during development rather than at runtime. Features like interfaces, generics, and union types provide powerful ways to describe complex data structures. The type system also enhances developer experience through better autocomplete and documentation.",
        feedback: "Your explanation covers the basics well, but lacks depth on advanced TypeScript features. Consider expanding your knowledge of conditional types, mapped types, and the utility types that TypeScript provides. Also, specific examples of bugs that TypeScript prevents would strengthen this answer.",
        score: 65
      }
    ],
    recommendations: [
      {
        title: "Advanced TypeScript Patterns",
        type: "course",
        reason: "To address gaps in TypeScript knowledge identified during the interview",
        link: "/course/ts-advanced"
      },
      {
        title: "System Design for Frontend Engineers",
        type: "course",
        reason: "To improve understanding of frontend architecture and system design principles",
        link: "/course/fe-system-design"
      },
      {
        title: "Technical Communication Skills",
        type: "practice",
        reason: "To work on more precise and concise communication of technical concepts",
        link: "/mock-interview?focus=communication"
      }
    ],
    videoAnalysis: {
      confidenceScore: 72,
      engagementScore: 85,
      stressIndicators: 40,
      timeline: [
        { time: "00:02:15", note: "Increased confidence when discussing familiar topics", score: 80 },
        { time: "00:08:40", note: "Signs of stress when addressing TypeScript questions", score: 55 },
        { time: "00:15:20", note: "Strong engagement and eye contact during system design explanation", score: 90 },
        { time: "00:22:10", note: "Fidgeting observed during challenging questions", score: 60 },
        { time: "00:28:35", note: "Confident closing statements and questions", score: 85 }
      ]
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Strong</Badge>;
    if (score >= 60) return <Badge className="bg-amber-500">Average</Badge>;
    return <Badge className="bg-red-500">Needs Improvement</Badge>;
  };

  return (
    <Container>
      <div className="py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Video className="h-4 w-4" />
            <span>Interview #{id}</span>
            <span>•</span>
            <span>{interviewData.date}</span>
            <span>•</span>
            <span>{interviewData.duration}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">{interviewData.title}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="outline" className="px-3 py-1">
              {interviewData.jobRole}
            </Badge>
            {interviewData.techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="px-3 py-1">
                {tech}
              </Badge>
            ))}
            <Badge variant="outline" className="px-3 py-1">
              {interviewData.experience}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`text-3xl font-bold ${getScoreColor(interviewData.overallScore)}`}>
                    {interviewData.overallScore}%
                  </div>
                  {getScoreBadge(interviewData.overallScore)}
                </div>
                <Progress 
                  value={interviewData.overallScore} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Technical Knowledge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`text-3xl font-bold ${getScoreColor(interviewData.feedback.technical.score)}`}>
                    {interviewData.feedback.technical.score}%
                  </div>
                  {getScoreBadge(interviewData.feedback.technical.score)}
                </div>
                <Progress 
                  value={interviewData.feedback.technical.score} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`text-3xl font-bold ${getScoreColor(interviewData.feedback.communication.score)}`}>
                    {interviewData.feedback.communication.score}%
                  </div>
                  {getScoreBadge(interviewData.feedback.communication.score)}
                </div>
                <Progress 
                  value={interviewData.feedback.communication.score} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs
          defaultValue="feedback"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="questions">
              <AlertCircle className="h-4 w-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="video">
              <BarChart className="h-4 w-4 mr-2" />
              Video Analysis
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <BookOpen className="h-4 w-4 mr-2" />
              Next Steps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Technical Knowledge</CardTitle>
                <CardDescription>
                  Assessment of your technical expertise and domain knowledge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Strengths
                  </h3>
                  <ul className="ml-6 space-y-1 list-disc">
                    {interviewData.feedback.technical.strengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="ml-6 space-y-1 list-disc">
                    {interviewData.feedback.technical.weaknesses.map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p>{interviewData.feedback.technical.summary}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Skills</CardTitle>
                <CardDescription>
                  Evaluation of how effectively you communicated your ideas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Strengths
                  </h3>
                  <ul className="ml-6 space-y-1 list-disc">
                    {interviewData.feedback.communication.strengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="ml-6 space-y-1 list-disc">
                    {interviewData.feedback.communication.weaknesses.map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p>{interviewData.feedback.communication.summary}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Non-Verbal Communication</CardTitle>
                <CardDescription>
                  Analysis of your body language, facial expressions, and engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Strengths
                  </h3>
                  <ul className="ml-6 space-y-1 list-disc">
                    {interviewData.feedback.nonVerbal.strengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="ml-6 space-y-1 list-disc">
                    {interviewData.feedback.nonVerbal.weaknesses.map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p>{interviewData.feedback.nonVerbal.summary}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-8">
            {interviewData.questions.map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{question.question}</CardTitle>
                    <Badge 
                      className={
                        question.score >= 80 ? "bg-green-500" : 
                        question.score >= 60 ? "bg-amber-500" : "bg-red-500"
                      }
                    >
                      {question.score}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Your Answer</h3>
                    <div className="bg-muted/30 p-4 rounded-md border text-foreground/90">
                      {question.answer}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Feedback</h3>
                    <div className="bg-primary/5 p-4 rounded-md border border-primary/20 text-foreground/90">
                      {question.feedback}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Confidence Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className={`text-3xl font-bold ${getScoreColor(interviewData.videoAnalysis.confidenceScore)}`}>
                      {interviewData.videoAnalysis.confidenceScore}%
                    </div>
                  </div>
                  <Progress 
                    value={interviewData.videoAnalysis.confidenceScore} 
                    className="h-2 mt-2" 
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Engagement Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className={`text-3xl font-bold ${getScoreColor(interviewData.videoAnalysis.engagementScore)}`}>
                      {interviewData.videoAnalysis.engagementScore}%
                    </div>
                  </div>
                  <Progress 
                    value={interviewData.videoAnalysis.engagementScore} 
                    className="h-2 mt-2" 
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Stress Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className={`text-3xl font-bold ${
                      interviewData.videoAnalysis.stressIndicators <= 30 ? "text-green-500" :
                      interviewData.videoAnalysis.stressIndicators <= 60 ? "text-amber-500" : "text-red-500"
                    }`}>
                      {interviewData.videoAnalysis.stressIndicators}%
                    </div>
                  </div>
                  <Progress 
                    value={interviewData.videoAnalysis.stressIndicators} 
                    className="h-2 mt-2" 
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Timeline Analysis</CardTitle>
                <CardDescription>
                  Key moments from your interview with behavior analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interviewData.videoAnalysis.timeline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-3 rounded-md border">
                      <div className="font-mono text-muted-foreground">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        {item.note}
                      </div>
                      <Badge 
                        className={
                          item.score >= 80 ? "bg-green-500" : 
                          item.score >= 60 ? "bg-amber-500" : "bg-red-500"
                        }
                      >
                        {item.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-6">
              <Button disabled>
                View Full Video Recording
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {interviewData.recommendations.map((recommendation, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-center gap-2">
                      {recommendation.type === "course" ? (
                        <BookOpen className="h-5 w-5 text-primary" />
                      ) : (
                        <Video className="h-5 w-5 text-primary" />
                      )}
                      <Badge variant="outline" className="capitalize">
                        {recommendation.type}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2">{recommendation.title}</CardTitle>
                    <CardDescription>
                      {recommendation.reason}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Button variant="ghost" className="w-full justify-between" asChild>
                      <Link to={recommendation.link}>
                        {recommendation.type === "course" ? "Start Learning" : "Start Practice"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Practice Again</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Apply the feedback from this session in another mock interview
                </p>
                <Button asChild>
                  <Link to="/mock-interview">
                    Start New Interview <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default InterviewResult;
