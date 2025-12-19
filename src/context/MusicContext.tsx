'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
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
      console.log('fetchLikedSongs: No user, clearing');
      setLikedSongs([]);
      return;
    }

    console.log('fetchLikedSongs: Fetching for user:', user.id);

    const { data, error } = await supabase
      .from('liked_songs')
      .select('*')
      .eq('user_id', user.id)
      .order('liked_at', { ascending: false });

    console.log('fetchLikedSongs result:', { data, error, count: data?.length });

    if (!error && data) {
      setLikedSongs(data);
      console.log('fetchLikedSongs: Set', data.length, 'songs');
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
    console.log('MusicContext: User changed:', user?.email || 'No user');
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
    const liked = likedSongs.some(song => song.track_id === trackId);
    return liked;
  };

  const toggleLike = async (track: Track) => {
    console.log('\n=== TOGGLE LIKE START ===');
    
    if (!user) {
      console.error('ERROR: No user logged in');
      alert('Please log in first');
      return;
    }

    console.log('User ID:', user.id);
    console.log('User email:', user.email);

    const trackId = track.trackId.toString();
    const isLiked = isTrackLiked(trackId);

    console.log('Track ID:', trackId);
    console.log('Track Name:', track.trackName);
    console.log('Is currently liked:', isLiked);

    if (isLiked) {
      console.log('>>> UNLIKE PATH <<<');
      const { error } = await supabase
        .from('liked_songs')
        .delete()
        .eq('user_id', user.id)
        .eq('track_id', trackId);

      console.log('Delete error:', error);

      if (!error) {
        setLikedSongs(prev => prev.filter(s => s.track_id !== trackId));
        console.log('Successfully deleted from state');
      }
    } else {
      console.log('>>> LIKE PATH - USING DIRECT FETCH <<<');
      
      const payload = {
        user_id: user.id,
        track_id: trackId,
        track_name: track.trackName,
        artist_name: track.artistName,
        artwork_url: track.artworkUrl100,
        preview_url: track.previewUrl,
        track_time_millis: track.trackTimeMillis,
        collection_name: track.collectionName || '',
      };
      
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      try {
        // Get session token
        console.log('Getting session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session exists:', !!session);
        console.log('Access token exists:', !!session?.access_token);
        
        if (!session?.access_token) {
          throw new Error('No access token found');
        }
        
        // Direct fetch to Supabase
        console.log('Making direct fetch request...');
        const response = await fetch(
          'https://iugwinfzximffnztmdpg.supabase.co/rest/v1/liked_songs',
          {
            method: 'POST',
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(payload),
          }
        );
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('>>> INSERT SUCCESS <<<');
          console.log('Returned data:', data);
          console.log('Calling fetchLikedSongs...');
          await fetchLikedSongs();
          alert('Song liked successfully!');
        } else {
          const error = await response.json();
          console.error('>>> INSERT FAILED <<<');
          console.error('Error response:', error);
          alert('Failed to like song: ' + JSON.stringify(error));
        }
      } catch (err: any) {
        console.error('>>> EXCEPTION <<<');
        console.error('Error:', err);
        console.error('Error message:', err.message);
        alert('Exception: ' + err.message);
      }
    }
    
    console.log('=== TOGGLE LIKE END ===\n');
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