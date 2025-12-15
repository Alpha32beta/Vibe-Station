'use client'

import { useState, useEffect } from 'react';

const ITUNES_BASE = 'https://itunes.apple.com';
const LASTFM_KEY = '8a6086c59588f38c51e3209494f2fb17';
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0';

const albumsCache: { [key: string]: { data: any[], timestamp: number } } = {};
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
        fetch(`${ITUNES_BASE}/search?term=${encodeURIComponent(artist)}&entity=album&limit=4`)
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
        fetch(`${ITUNES_BASE}/search?term=${encodeURIComponent(artist)}&entity=album&limit=3`)
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
      const response = await fetch(
        `${ITUNES_BASE}/search?term=2024&entity=album&limit=${limit}`
      );
      const data = await response.json();
      const albumData = data.results || [];
      
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
      setAlbum(cached.data[0]);
      setTracks(cached.data.slice(1));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(
        `${ITUNES_BASE}/lookup?id=${albumId}&entity=song`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        albumsCache[cacheKey] = { data: data.results, timestamp: Date.now() };
        setAlbum(data.results[0]);
        setTracks(data.results.slice(1));
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
        `${ITUNES_BASE}/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`
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