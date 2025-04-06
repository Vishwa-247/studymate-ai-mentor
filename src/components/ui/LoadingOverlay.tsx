
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
}

const LoadingOverlay = ({ 
  isLoading, 
  message = "Processing", 
  subMessage = "Please wait while we process your request." 
}: LoadingOverlayProps) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto" />
        <h3 className="text-xl font-semibold">{message}</h3>
        <p className="text-muted-foreground">
          {subMessage}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
