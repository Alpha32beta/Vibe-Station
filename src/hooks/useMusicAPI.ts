'use client'

import { useState, useEffect } from 'react';

const albumsCache: { [key: string]: { data: any, timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000;

export function useFetchPopularAlbums(limit = 10) {
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
      // Reduced from 6 artists to 4 for faster loading
      const artists = ['Drake', 'Taylor Swift', 'The Weeknd', 'Ed Sheeran'];
      
      const promises = artists.map(artist =>
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=album&limit=3`)
          .then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      const allAlbums = results.flatMap(data => data.results || []);
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

export function useFetchNigerianMusic(limit = 10) {
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
      // Reduced from 8 artists to 5 for faster loading
      const artists = ['Burna Boy', 'Wizkid', 'Davido', 'Rema', 'Asake'];
      
      const promises = artists.map(artist =>
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=album&limit=2`)
          .then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      const allAlbums = results.flatMap(data => data.results || []);
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

export function useFetchTrendingAlbums(limit = 10) {
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
      const response = await fetch(`https://itunes.apple.com/search?term=pop&entity=album&limit=${limit}`);
      const data = await response.json();
      
      albumsCache[cacheKey] = { data: data.results || [], timestamp: Date.now() };
      setAlbums(data.results || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { albums, loading, error };
}

export function useFetchEditorialPlaylists(limit = 10) {
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
      const response = await fetch(`https://itunes.apple.com/search?term=hits&entity=album&limit=${limit}`);
      const data = await response.json();
      
      albumsCache[cacheKey] = { data: data.results || [], timestamp: Date.now() };
      setAlbums(data.results || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
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
      
      const response = await fetch(`https://itunes.apple.com/lookup?id=${albumId}&entity=song`);
      const data = await response.json();
      
      if (data && data.results && data.results.length > 0) {
        const albumData = data.results[0];
        const tracksData = data.results.slice(1);
        
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
  return useFetchAlbumDetails(playlistId);
}

export function useSearchTracks() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(query: string, limit = 15) {
    if (!query.trim()) {
      setTracks([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`
      );
      const data = await response.json();
      setTracks(data.results || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { tracks, loading, error, search };
}