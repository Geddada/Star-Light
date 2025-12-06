import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, StopCircle, Check, RefreshCw, Loader2 } from 'lucide-react';

interface VideoRecorderProps {
  onRecordingComplete: (videoFile: File) => void;
  onCancel: () => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onRecordingComplete, onCancel }) => {
  const [status, setStatus] = useState<'initializing' | 'idle' | 'recording' | 'preview'>('initializing');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const startTimer = () => {
    setTimer(0);
    timerIntervalRef.current = window.setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };
  
  const setupStream = useCallback(async () => {
    setStatus('initializing');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // This will be caught by the catch block below.
        throw new Error('Media Devices API not supported by this browser.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus('idle');
    } catch (err) {
      console.error("Error accessing camera/mic:", err);
      let errorMessage = "Could not access the camera and microphone. Please check your browser permissions and try again.";
      if (err instanceof Error) {
        switch(err.name) {
            case 'NotFoundError':
                errorMessage = "No camera or microphone found. Please ensure your devices are connected and enabled, then try again.";
                break;
            case 'NotAllowedError': // This covers PermissionDeniedError as well
                errorMessage = "Permission to access the camera and microphone was denied. Please enable permissions for this site in your browser settings.";
                break;
            case 'NotReadableError':
                errorMessage = "The camera or microphone is currently in use by another application or is experiencing a hardware error.";
                break;
            case 'AbortError':
                 errorMessage = "The request to use the camera/microphone was aborted, possibly due to a hardware or driver issue.";
                 break;
            default:
                errorMessage = `An unexpected error occurred: ${err.message}`;
        }
      }
      alert(errorMessage);
      onCancel();
    }
  }, [onCancel]);
  
  const cleanupStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }, [stream]);

  useEffect(() => {
    setupStream();
    return () => {
      cleanupStream();
      stopTimer();
    };
  }, [setupStream, cleanupStream]);

  const handleStartRecording = () => {
    if (!stream) return;
    setStatus('recording');
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm; codecs=vp9' };
    const recorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = recorder;
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };
    
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setStatus('preview');
      cleanupStream();
      stopTimer();
    };
    
    recorder.start();
    startTimer();
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleRetake = () => {
    setRecordedUrl(null);
    setupStream();
  };

  const handleUseVideo = async () => {
    if (!recordedUrl) return;
    const response = await fetch(recordedUrl);
    const blob = await response.blob();
    const videoFile = new File([blob], `starlight-recording-${Date.now()}.webm`, { type: 'video/webm' });
    onRecordingComplete(videoFile);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-between p-6 bg-[var(--background-primary)] rounded-b-xl h-full">
      <div className="relative w-full max-w-sm aspect-[9/16] max-h-[60vh] bg-black rounded-lg overflow-hidden border border-[var(--border-primary)] shadow-lg">
        <video ref={videoRef} autoPlay playsInline muted={status !== 'preview'} className="w-full h-full object-cover transform scale-x-[-1]" />
        
        {status === 'initializing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
        
        {status === 'recording' && (
           <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
              <span>REC</span>
              <span>{formatTime(timer)}</span>
           </div>
        )}

        {status === 'preview' && recordedUrl && (
            <video src={recordedUrl} autoPlay controls playsInline className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      
      <div className="w-full mt-6 flex items-center justify-around">
        {status === 'idle' && (
          <button onClick={handleStartRecording} className="flex flex-col items-center gap-2 text-[var(--text-primary)]">
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center ring-4 ring-red-600/30 hover:scale-105 transition-transform">
              <Camera className="w-9 h-9 text-white" />
            </div>
            <span className="text-sm font-semibold">Start Recording</span>
          </button>
        )}

        {status === 'recording' && (
          <button onClick={handleStopRecording} className="flex flex-col items-center gap-2 text-[var(--text-primary)]">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-white/30 hover:scale-105 transition-transform animate-pulse">
              <StopCircle className="w-12 h-12 text-red-600" />
            </div>
            <span className="text-sm font-semibold">Stop Recording</span>
          </button>
        )}

        {status === 'preview' && (
          <>
            <button onClick={handleRetake} className="flex flex-col items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <div className="w-16 h-16 rounded-full bg-[var(--background-secondary)] border-2 border-[var(--border-primary)] flex items-center justify-center">
                <RefreshCw className="w-7 h-7" />
              </div>
              <span className="text-sm font-semibold">Retake</span>
            </button>
            <button onClick={handleUseVideo} className="flex flex-col items-center gap-2 text-green-500 hover:text-green-600 transition-colors">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center ring-4 ring-green-500/30 hover:scale-105 transition-transform">
                <Check className="w-9 h-9 text-white" />
              </div>
              <span className="text-sm font-semibold">Use Video</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
