
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { formatTimecode } from '@/lib/format-utils';

interface VideoPlayerProps {
  url: string;
  onTimeUpdate: (time: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onTimeUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
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
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handlePlay = () => {
    setIsPlaying(true);
  };
  
  const handlePause = () => {
    setIsPlaying(false);
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

export default VideoPlayer;
