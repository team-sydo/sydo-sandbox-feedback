
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { formatTimecode } from '@/lib/format-utils';

interface VideoPlayerProps {
  url: string;
  onTimeUpdate: (time: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onTimeUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Event handler for external play/pause toggling
  useEffect(() => {
    const handleTogglePlayback = (event: CustomEvent) => {
      const video = videoRef.current;
      if (!video) return;
      
      // Important change: Directly use the isPlaying value from the event
      // rather than inverting the current value
      if (event.detail.isPlaying) {
        video.play();
      } else {
        video.pause();
      }
    };
    
    document.addEventListener('toggle-video-playback', handleTogglePlayback as EventListener);
    
    return () => {
      document.removeEventListener('toggle-video-playback', handleTogglePlayback as EventListener);
    };
  }, []);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(video.currentTime));
      onTimeUpdate(Math.floor(video.currentTime));
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onTimeUpdate]);
  
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    // Dispatch the event with the new state (opposite of current state)
    const newPlayState = !isPlaying;
    const event = new CustomEvent('toggle-video-playback', {
      detail: { isPlaying: newPlayState }
    });
    document.dispatchEvent(event);
    
    // The state will be updated by the play/pause handlers
  };
  
  const handlePlay = () => {
    setIsPlaying(true);
    
    // Dispatch custom event to notify FeedbackForm of state change
    const event = new CustomEvent('video-play-state-changed', {
      detail: { isPlaying: true }
    });
    document.dispatchEvent(event);
  };
  
  const handlePause = () => {
    setIsPlaying(false);
    
    // Dispatch custom event to notify FeedbackForm of state change
    const event = new CustomEvent('video-play-state-changed', {
      detail: { isPlaying: false }
    });
    document.dispatchEvent(event);
  };

  return (
    <div className="relative flex flex-col w-full h-full">
      <div className="bg-black text-white p-2 flex items-center">
        <button 
          onClick={togglePlayPause}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <span className="ml-2 text-sm font-mono">{formatTimecode(currentTime)}</span>
      </div>
      <video 
        ref={videoRef}
        src={url} 
        className="w-full h-full bg-black"
        onPlay={handlePlay}
        onPause={handlePause}
      />
    </div>
  );
};


