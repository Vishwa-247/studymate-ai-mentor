
import { useState, useEffect, useRef } from 'react';
import { analyzeFacialExpression } from '../services/api';

// Enhanced facial expression analysis that will connect to Flask API in the future
const useFacialAnalysis = (
  isActive: boolean = false,
  interval: number = 3000
) => {
  const [facialData, setFacialData] = useState<{
    confident: number;
    stressed: number;
    hesitant: number;
    nervous: number;
    excited: number;
  }>({
    confident: 0,
    stressed: 0,
    hesitant: 0,
    nervous: 0,
    excited: 0
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisTimerRef = useRef<number | null>(null);
  const allAnalysisData = useRef<typeof facialData[]>([]);

  const captureImage = async (): Promise<Blob | null> => {
    if (!videoRef.current) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.95);
    });
  };

  const analyzeFrame = async () => {
    try {
      const imageBlob = await captureImage();
      
      if (!imageBlob) {
        console.error('Failed to capture image from video');
        return;
      }
      
      // In the future, this will send the image to the Flask API
      // For now, use the mock function from api.ts
      const analysis = await analyzeFacialExpression(imageBlob);
      
      setFacialData(analysis);
      allAnalysisData.current.push(analysis);
    } catch (error) {
      console.error('Error analyzing facial expression:', error);
    }
  };

  const startAnalysis = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Browser does not support getUserMedia');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsAnalyzing(true);
        
        // Start analyzing at intervals
        analysisTimerRef.current = window.setInterval(analyzeFrame, interval);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const stopAnalysis = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (analysisTimerRef.current) {
      clearInterval(analysisTimerRef.current);
      analysisTimerRef.current = null;
    }
    
    setIsAnalyzing(false);
  };

  const getAggregatedAnalysis = () => {
    if (allAnalysisData.current.length === 0) {
      return facialData;
    }
    
    // Calculate average values
    const sum = allAnalysisData.current.reduce(
      (acc, data) => ({
        confident: acc.confident + data.confident,
        stressed: acc.stressed + data.stressed,
        hesitant: acc.hesitant + data.hesitant,
        nervous: acc.nervous + data.nervous,
        excited: acc.excited + data.excited
      }),
      { confident: 0, stressed: 0, hesitant: 0, nervous: 0, excited: 0 }
    );
    
    const count = allAnalysisData.current.length;
    
    return {
      confident: sum.confident / count,
      stressed: sum.stressed / count,
      hesitant: sum.hesitant / count,
      nervous: sum.nervous / count,
      excited: sum.excited / count
    };
  };

  useEffect(() => {
    if (isActive && !isAnalyzing) {
      startAnalysis();
    } else if (!isActive && isAnalyzing) {
      stopAnalysis();
    }
    
    return () => {
      stopAnalysis();
    };
  }, [isActive]);

  return {
    videoRef,
    facialData,
    isAnalyzing,
    startAnalysis,
    stopAnalysis,
    getAggregatedAnalysis,
  };
};

export default useFacialAnalysis;
