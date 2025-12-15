'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface Track {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl: string;
  artworkUrl100: string;
  collectionName: string;
  trackTimeMillis: number;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playlist: Track[];
  currentIndex: number;
  isShuffle: boolean;
  isRepeat: boolean;
  
  playTrack: (track: Track, playlist?: Track[], index?: number) => void;
  playAlbumPreview: (albumId: string) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else if (playlist.length > 0) {
        handleNextTrack();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat, playlist, currentIndex, isShuffle]);

  const handleNextTrack = () => {
    if (playlist.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
    const nextTrack = playlist[nextIndex];
    setCurrentTrack(nextTrack);
    setCurrentIndex(nextIndex);
    
    if (audioRef.current && nextTrack.previewUrl) {
      audioRef.current.src = nextTrack.previewUrl;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Play error:', err));
    }
  };

  const playAlbumPreview = async (albumId: string) => {
    try {
      const response = await fetch(`https://itunes.apple.com/lookup?id=${albumId}&entity=song`);
      const data = await response.json();
      
      if (data.results && data.results.length > 1) {
        const tracks = data.results.slice(1);
        const validTracks = tracks.filter((t: any) => t.previewUrl);
        
        if (validTracks.length > 0) {
          playTrack(validTracks[0], validTracks, 0);
        }
      }
    } catch (error) {
      console.error('Error fetching album:', error);
    }
  };

  const playTrack = (track: Track, newPlaylist?: Track[], index?: number) => {
    if (!audioRef.current) return;

    setCurrentTrack(track);
    
    if (newPlaylist) {
      setPlaylist(newPlaylist);
      setCurrentIndex(index ?? 0);
    }

    if (track.previewUrl) {
      audioRef.current.src = track.previewUrl;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Play error:', err));
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Play error:', err));
    }
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    handleNextTrack();
  };

  const previousTrack = () => {
    if (playlist.length === 0) return;
    
    if (currentTime > 3) {
      seekTo(0);
    } else {
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
      playTrack(playlist[prevIndex], playlist, prevIndex);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const setVolume = (vol: number) => {
    const clampedVol = Math.max(0, Math.min(1, vol));
    setVolumeState(clampedVol);
    if (audioRef.current) {
      audioRef.current.volume = clampedVol;
    }
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        duration,
        playlist,
        currentIndex,
        isShuffle,
        isRepeat,
        playTrack,
        playAlbumPreview,
        togglePlay,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
