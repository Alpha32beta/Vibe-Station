'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  const audioInitializedRef = useRef(false);

  // Initialize audio element on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioInitializedRef.current) {
      // Create or get existing audio element
      let audioEl = document.getElementById('global-audio-player') as HTMLAudioElement;
      
      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.id = 'global-audio-player';
        audioEl.style.display = 'none';
        document.body.appendChild(audioEl);
      }
      
      audioRef.current = audioEl;
      audioEl.volume = volume;
      audioInitializedRef.current = true;
      
      // Set up event listeners
      const handleTimeUpdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
      
      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
      
      const handleEnded = () => {
        if (isRepeat && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        } else if (playlist.length > 0) {
          handleNextTrack();
        } else {
          setIsPlaying(false);
        }
      };
      
      audioEl.addEventListener('timeupdate', handleTimeUpdate);
      audioEl.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioEl.addEventListener('ended', handleEnded);
      
      return () => {
        audioEl.removeEventListener('timeupdate', handleTimeUpdate);
        audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioEl.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  // Update event listeners when dependencies change
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
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
    
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat, playlist, currentIndex, isShuffle]);

  const saveToPlayHistory = async (track: Track) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase.from('play_history').insert({
        user_id: user.id,
        track_id: track.trackId.toString(),
        track_name: track.trackName,
        artist_name: track.artistName,
        artwork_url: track.artworkUrl100,
        preview_url: track.previewUrl,
      });
    } catch (error) {
      console.error('Error saving to play history:', error);
    }
  };

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
      audioRef.current.load(); // Important for Safari
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            saveToPlayHistory(nextTrack);
          })
          .catch(err => {
            console.error('Play error in next track:', err);
            setIsPlaying(false);
          });
      }
    }
  };

  const playAlbumPreview = async (albumId: string) => {
    try {
      const response = await fetch(`/api/music?type=album&query=${albumId}`);
      const data = await response.json();
      
      if (data && data.tracks && data.tracks.data.length > 0) {
        const tracks = data.tracks.data.map((track: any) => ({
          trackId: track.id,
          trackName: track.title,
          artistName: track.artist.name,
          artworkUrl100: track.album?.cover_medium || data.cover_medium,
          previewUrl: track.preview,
          trackTimeMillis: track.duration * 1000,
          collectionName: data.title,
        }));
        
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
    if (!audioRef.current) {
      console.error('Audio element not initialized');
      return;
    }

    console.log('Playing track:', track.trackName);
    console.log('Preview URL:', track.previewUrl);
    
    if (!track.previewUrl) {
      console.error('No preview URL for track:', track.trackName);
      return;
    }

    setCurrentTrack(track);
    
    if (newPlaylist) {
      setPlaylist(newPlaylist);
      setCurrentIndex(index ?? 0);
    }

    // Pause current audio
    audioRef.current.pause();
    
    // Set new source
    audioRef.current.src = track.previewUrl;
    audioRef.current.load(); // Important for Safari
    
    // Play with user interaction
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          saveToPlayHistory(track);
        })
        .catch(err => {
          console.error('Autoplay prevented:', err);
          // Set playing state to false to show play button
          setIsPlaying(false);
          
          // For debugging: log the specific error
          if (err.name === 'NotAllowedError') {
            console.log('Browser requires user interaction first');
          }
        });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) {
      console.error('No audio element or current track');
      return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error('Play error in toggle:', err);
            // If autoplay is blocked, try loading and playing again
            if (err.name === 'NotAllowedError') {
              audioRef.current?.load();
              audioRef.current?.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.error('Second play attempt failed:', e));
            }
          });
      }
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
      setCurrentTime(time);
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