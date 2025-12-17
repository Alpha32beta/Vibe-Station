'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface Track {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl: string;
  artworkUrl100: string;
  collectionName: string;
  trackTimeMillis: number;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  cover_image: string;
  created_at: string;
  tracks?: any[];
}

interface MusicContextType {
  likedSongs: any[];
  playlists: Playlist[];
  playHistory: any[];
  likedSongsCount: number;
  recentlyPlayedCount: number;
  isTrackLiked: (trackId: string) => boolean;
  toggleLike: (track: Track) => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<{ data: any; error: any }>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  getPlaylistTracks: (playlistId: string) => Promise<any[]>;
  addToPlayHistory: (track: Track) => Promise<void>;
  refreshData: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playHistory, setPlayHistory] = useState<any[]>([]);

  const fetchLikedSongs = async () => {
    if (!user) {
      setLikedSongs([]);
      return;
    }

    const { data, error } = await supabase
      .from('liked_songs')
      .select('*')
      .eq('user_id', user.id)
      .order('liked_at', { ascending: false });

    if (!error && data) {
      setLikedSongs(data);
    }
  };

  const fetchPlaylists = async () => {
    if (!user) {
      setPlaylists([]);
      return;
    }

    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPlaylists(data);
    }
  };

  const fetchPlayHistory = async () => {
    if (!user) {
      setPlayHistory([]);
      return;
    }

    const { data, error } = await supabase
      .from('play_history')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setPlayHistory(data);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLikedSongs();
      fetchPlaylists();
      fetchPlayHistory();
    } else {
      setLikedSongs([]);
      setPlaylists([]);
      setPlayHistory([]);
    }
  }, [user]);

  const isTrackLiked = (trackId: string) => {
    return likedSongs.some(song => song.track_id === trackId);
  };

  const toggleLike = async (track: Track) => {
    if (!user) return;

    const trackId = track.trackId.toString();
    const isLiked = isTrackLiked(trackId);

    if (isLiked) {
      const { error } = await supabase
        .from('liked_songs')
        .delete()
        .eq('user_id', user.id)
        .eq('track_id', trackId);

      if (!error) {
        setLikedSongs(prev => prev.filter(s => s.track_id !== trackId));
      }
    } else {
      const { error } = await supabase
        .from('liked_songs')
        .insert({
          user_id: user.id,
          track_id: trackId,
          track_name: track.trackName,
          artist_name: track.artistName,
          artwork_url: track.artworkUrl100,
          preview_url: track.previewUrl,
          track_time_millis: track.trackTimeMillis,
          collection_name: track.collectionName,
        });

      if (!error) {
        await fetchLikedSongs();
      }
    }
  };

  const createPlaylist = async (name: string, description?: string) => {
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: user.id,
        name,
        description: description || '',
        cover_image: 'https://via.placeholder.com/300?text=Playlist',
      })
      .select()
      .single();

    if (!error) {
      await fetchPlaylists();
    }

    return { data, error };
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchPlaylists();
    }
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    if (!user) return;

    const { error } = await supabase
      .from('playlist_tracks')
      .insert({
        playlist_id: playlistId,
        track_id: track.trackId.toString(),
        track_name: track.trackName,
        artist_name: track.artistName,
        artwork_url: track.artworkUrl100,
        preview_url: track.previewUrl,
        track_time_millis: track.trackTimeMillis,
      });

    if (error) {
      console.error('Error adding track to playlist:', error);
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('track_id', trackId);

    if (error) {
      console.error('Error removing track from playlist:', error);
    }
  };

  const getPlaylistTracks = async (playlistId: string) => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('playlist_tracks')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching playlist tracks:', error);
      return [];
    }

    return data || [];
  };

  const addToPlayHistory = async (track: Track) => {
    if (!user) return;

    const { error } = await supabase
      .from('play_history')
      .insert({
        user_id: user.id,
        track_id: track.trackId.toString(),
        track_name: track.trackName,
        artist_name: track.artistName,
        artwork_url: track.artworkUrl100,
        preview_url: track.previewUrl,
      });

    if (!error) {
      await fetchPlayHistory();
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchLikedSongs(), fetchPlaylists(), fetchPlayHistory()]);
  };

  return (
    <MusicContext.Provider
      value={{
        likedSongs,
        playlists,
        playHistory,
        likedSongsCount: likedSongs.length,
        recentlyPlayedCount: playHistory.length,
        isTrackLiked,
        toggleLike,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        getPlaylistTracks,
        addToPlayHistory,
        refreshData,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
}