
import { useState, useRef, useEffect } from "react";
import { Camera, Mic, MicOff, Video, VideoOff, RotateCw } from "lucide-react";
import GlassMorphism from "../ui/GlassMorphism";

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
}

const VideoRecorder = ({
  onRecordingComplete,
  isRecording,
  startRecording,
  stopRecording,
}: VideoRecorderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [error, setError] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);
  
  useEffect(() => {
    const initCamera = async () => {
      try {
        // Stop any existing stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled,
          audio: audioEnabled,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        streamRef.current = stream;
        
        // Create a new MediaRecorder
        mediaRecorderRef.current = new MediaRecorder(stream);
        chunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };
        
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          onRecordingComplete(blob);
          chunksRef.current = []; // Clear chunks after completion
        };
        
        setError("");
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setError("Could not access camera or microphone. Please check permissions.");
      }
    };
    
    initCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoEnabled, audioEnabled, onRecordingComplete]);
  
  // Watch for isRecording state changes
  useEffect(() => {
    if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state !== "recording") {
      try {
        mediaRecorderRef.current.start();
        console.log("Recording started");
      } catch (err) {
        console.error("Error starting recording:", err);
        setError("Could not start recording. Please refresh and try again.");
      }
    } else if (!isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
        console.log("Recording stopped");
      } catch (err) {
        console.error("Error stopping recording:", err);
      }
    }
  }, [isRecording]);
  
  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };
  
  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };
  
  const handleStartRecording = () => {
    setCountdown(3);
    
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownTimer);
          startRecording();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };
  
  const handleStopRecording = () => {
    stopRecording();
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="relative rounded-lg overflow-hidden aspect-video bg-black/20">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <p>{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!videoEnabled ? "hidden" : ""}`}
          />
        )}
        
        {!videoEnabled && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <Camera size={48} className="text-muted-foreground" />
          </div>
        )}
        
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-white">Recording</span>
          </div>
        )}
        
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-6xl font-bold text-white animate-pulse">
              {countdown}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <GlassMorphism
            className="p-2 cursor-pointer"
            intensity="light"
            rounded="full"
          >
            <button
              onClick={toggleVideo}
              className="w-10 h-10 flex items-center justify-center"
            >
              {videoEnabled ? (
                <Video size={20} className="text-foreground" />
              ) : (
                <VideoOff size={20} className="text-foreground" />
              )}
            </button>
          </GlassMorphism>
          
          <GlassMorphism
            className="p-2 cursor-pointer"
            intensity="light"
            rounded="full"
          >
            <button
              onClick={toggleAudio}
              className="w-10 h-10 flex items-center justify-center"
            >
              {audioEnabled ? (
                <Mic size={20} className="text-foreground" />
              ) : (
                <MicOff size={20} className="text-foreground" />
              )}
            </button>
          </GlassMorphism>
        </div>
        
        <div>
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="px-4 py-2 bg-primary text-white rounded-full flex items-center space-x-2 hover:bg-primary/90 transition-colors"
            >
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="px-4 py-2 bg-destructive text-white rounded-full flex items-center space-x-2 hover:bg-destructive/90 transition-colors"
            >
              <RotateCw size={16} />
              <span>Stop Recording</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder;
