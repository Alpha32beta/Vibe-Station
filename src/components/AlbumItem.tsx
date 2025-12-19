'use client'

import Link from 'next/link';
import { useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';

interface Track {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl: string;
  artworkUrl100: string;
  collectionName: string;
  trackTimeMillis: number;
}

const AlbumItem = ({ album }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { playTrack } = usePlayer();

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log('Fetching album tracks for ID:', album.collectionId);
      
      // Use iTunes API
      const response = await fetch(`https://itunes.apple.com/lookup?id=${album.collectionId}&entity=song`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Album data received:', data);
      
      if (data && data.results && data.results.length > 1) {
        // First result is the album, rest are tracks
        const tracks = data.results
          .slice(1) // Skip first item (album info)
          .map((track: any) => ({
            trackId: track.trackId,
            trackName: track.trackName,
            artistName: track.artistName,
            artworkUrl100: track.artworkUrl100,
            previewUrl: track.previewUrl || '',
            trackTimeMillis: track.trackTimeMillis,
            collectionName: track.collectionName,
          }))
          .filter((track: Track) => track.previewUrl !== ''); 
        
        console.log('Processed tracks:', tracks);
        
        if (tracks.length > 0) {
          console.log('Playing track:', tracks[0].trackName);
          playTrack(tracks[0], tracks, 0);
        } else {
          console.warn('No tracks with preview URLs found in this album');
          alert('No preview available for this album');
        }
      } else {
        console.warn('No tracks found in album data:', data);
        alert('Could not load tracks for this album');
      }
    } catch (error) {
      console.error('Error fetching album tracks:', error);
      alert('Error loading album tracks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/album/${album.collectionId}`}>
      <div
        className="min-w-[180px] p-4 bg-spotify-gray rounded-lg hover:bg-spotify-light-gray transition-all cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative mb-4">
          <img
            src={album.artworkUrl100?.replace('100x100', '600x600') || '/placeholder.png'}
            alt={album.collectionName}
            className="w-full aspect-square object-cover rounded-md shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.png';
            }}
          />
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className={`absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            title={isLoading ? 'Loading...' : 'Play'}
          >
            {isLoading ? (
              <svg className="w-6 h-6 text-black animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
              </svg>
            )}
          </button>
        </div>
        <h3 className="font-bold text-white truncate mb-2 group-hover:underline">
          {album.collectionName}
        </h3>
        <p className="text-sm text-gray-400 truncate">
          {album.artistName}
        </p>
      </div>
    </Link>
  );
};

export default AlbumItem;