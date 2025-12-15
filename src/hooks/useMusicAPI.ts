'use client'

import { useState, useEffect } from 'react';

const albumsCache: { [key: string]: { data: any, timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000;

export function useFetchPopularAlbums(limit = 20) {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, [limit]);

  async function fetchAlbums() {
    const cacheKey = 'popular-albums';
    const cached = albumsCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAlbums(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const artists = ['Drake', 'Taylor Swift', 'The Weeknd', 'Ed Sheeran', 'Ariana Grande', 'Post Malone'];
      
      const promises = artists.map(artist =>
        fetch(`/api/music?type=search-album&query=${encodeURIComponent(artist)}&limit=4`)
          .then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      const allAlbums = results.flatMap(data => 
        (data.data || []).map((album: any) => ({
          collectionId: album.id,
          collectionName: album.title,
          artistName: album.artist.name,
          artworkUrl100: album.cover_medium,
          releaseDate: album.release_date,
        }))
      );
      const slicedAlbums = allAlbums.slice(0, limit);
      
      albumsCache[cacheKey] = { data: slicedAlbums, timestamp: Date.now() };
      setAlbums(slicedAlbums);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { albums, loading, error };
}

export function useFetchNigerianMusic(limit = 20) {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, [limit]);

  async function fetchAlbums() {
    const cacheKey = 'nigerian-albums';
    const cached = albumsCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAlbums(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const artists = ['Burna Boy', 'Wizkid', 'Davido', 'Rema', 'Ayra Starr', 'Asake', 'Tems', 'Omah Lay'];
      
      const promises = artists.map(artist =>
        fetch(`/api/music?type=search-album&query=${encodeURIComponent(artist)}&limit=3`)
          .then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      const allAlbums = results.flatMap(data => 
        (data.data || []).map((album: any) => ({
          collectionId: album.id,
          collectionName: album.title,
          artistName: album.artist.name,
          artworkUrl100: album.cover_medium,
          releaseDate: album.release_date,
        }))
      );
      const slicedAlbums = allAlbums.slice(0, limit);
      
      albumsCache[cacheKey] = { data: slicedAlbums, timestamp: Date.now() };
      setAlbums(slicedAlbums);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { albums, loading, error };
}

export function useFetchTrendingAlbums(limit = 20) {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, [limit]);

  async function fetchAlbums() {
    const cacheKey = 'trending-albums';
    const cached = albumsCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAlbums(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/music?type=chart&limit=${limit}`);
      const data = await response.json();
      const albumData = (data.data || []).map((album: any) => ({
        collectionId: album.id,
        collectionName: album.title,
        artistName: album.artist.name,
        artworkUrl100: album.cover_medium,
        releaseDate: album.release_date,
      }));
      
      albumsCache[cacheKey] = { data: albumData, timestamp: Date.now() };
      setAlbums(albumData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { albums, loading, error };
}

export function useFetchEditorialPlaylists(limit = 20) {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaylists();
  }, [limit]);

  async function fetchPlaylists() {
    const cacheKey = 'editorial-playlists';
    const cached = albumsCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAlbums(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`/api/music?type=editorial-playlists&limit=${limit}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Failed to fetch playlists');
      
      const data = await response.json();
      const playlistData = (data.data || []).map((playlist: any) => ({
        collectionId: playlist.id,
        collectionName: playlist.title,
        artistName: `${playlist.nb_tracks} tracks`,
        artworkUrl100: playlist.picture_medium,
        releaseDate: playlist.creation_date,
      }));
      
      albumsCache[cacheKey] = { data: playlistData, timestamp: Date.now() };
      setAlbums(playlistData);
      setError(null);
    } catch (err: any) {
      console.error('Playlist fetch error:', err);
      setError(err.message);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }

  return { albums, loading, error };
}

export function useFetchAlbumDetails(albumId: string) {
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (albumId) {
      fetchAlbumDetails();
    }
  }, [albumId]);

  async function fetchAlbumDetails() {
    const cacheKey = `album-${albumId}`;
    const cached = albumsCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAlbum(cached.data.album);
      setTracks(cached.data.tracks);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/music?type=album&query=${albumId}`);
      const data = await response.json();
      
      if (data && data.tracks) {
        const albumData = {
          collectionId: data.id,
          collectionName: data.title,
          artistName: data.artist.name,
          artworkUrl100: data.cover_medium,
          releaseDate: data.release_date,
        };
        
        const tracksData = data.tracks.data.map((track: any) => ({
          trackId: track.id,
          trackName: track.title,
          artistName: track.artist.name,
          artworkUrl100: data.cover_medium,
          trackTimeMillis: track.duration * 1000,
          previewUrl: track.preview,
        }));
        
        albumsCache[cacheKey] = { 
          data: { album: albumData, tracks: tracksData }, 
          timestamp: Date.now() 
        };
        setAlbum(albumData);
        setTracks(tracksData);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { album, tracks, loading, error };
}

export function useFetchPlaylistDetails(playlistId: string) {
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistDetails();
    }
  }, [playlistId]);

  async function fetchPlaylistDetails() {
    const cacheKey = `playlist-${playlistId}`;
    const cached = albumsCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAlbum(cached.data.album);
      setTracks(cached.data.tracks);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/music?type=playlist&query=${playlistId}`);
      const data = await response.json();
      
      if (data && data.tracks) {
        const playlistData = {
          collectionId: data.id,
          collectionName: data.title,
          artistName: `${data.nb_tracks} tracks`,
          artworkUrl100: data.picture_medium,
          releaseDate: data.creation_date,
        };
        
        const tracksData = data.tracks.data.map((track: any) => ({
          trackId: track.id,
          trackName: track.title,
          artistName: track.artist.name,
          artworkUrl100: track.album.cover_medium,
          trackTimeMillis: track.duration * 1000,
          previewUrl: track.preview,
        }));
        
        albumsCache[cacheKey] = { 
          data: { album: playlistData, tracks: tracksData }, 
          timestamp: Date.now() 
        };
        setAlbum(playlistData);
        setTracks(tracksData);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { album, tracks, loading, error };
}

export function useSearchTracks() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(query: string, limit = 20) {
    if (!query.trim()) {
      setTracks([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/music?type=search-track&query=${encodeURIComponent(query)}&limit=${limit}`
      );
      const data = await response.json();
      const tracksData = (data.data || []).map((track: any) => ({
        trackId: track.id,
        trackName: track.title,
        artistName: track.artist.name,
        artworkUrl100: track.album.cover_medium,
        trackTimeMillis: track.duration * 1000,
        previewUrl: track.preview,
      }));
      setTracks(tracksData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { tracks, loading, error, search };
}