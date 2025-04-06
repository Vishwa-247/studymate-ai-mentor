
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CourseGenerator from "./pages/CourseGenerator";
import MockInterview from "./pages/MockInterview";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import InterviewResult from "./pages/InterviewResult";
import FutureIntegrations from "./pages/FutureIntegrations";
import Auth from "./pages/Auth";
import { AuthProvider, useAuth } from "./context/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <Layout><div className="flex items-center justify-center h-[70vh]">Loading...</div></Layout>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/future-integrations" element={<Layout><FutureIntegrations /></Layout>} />
            <Route path="/course-generator" element={
              <Layout>
                <ProtectedRoute>
                  <CourseGenerator />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/course/:id" element={
              <Layout>
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/mock-interview" element={
              <Layout>
                <ProtectedRoute>
                  <MockInterview />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/interview-result/:id" element={
              <Layout>
                <ProtectedRoute>
                  <InterviewResult />
                </ProtectedRoute>
              </Layout>
            } />
            <Route 
              path="/dashboard" 
              element={
                <Layout>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </Layout>
              } 
            />
            {/* API proxy route for future Flask integration */}
            <Route path="/api/*" element={<div>API Proxy</div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
