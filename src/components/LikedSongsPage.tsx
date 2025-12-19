'use client'

import { useEffect, useState } from 'react';
import { useMusic } from '@/context/MusicContext';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';

const LikedSongsPage = () => {
  const { likedSongs, toggleLike } = useMusic();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const tracks = likedSongs.map(song => ({
    trackId: parseInt(song.track_id),
    trackName: song.track_name,
    artistName: song.artist_name,
    artworkUrl100: song.artwork_url,
    previewUrl: song.preview_url,
    trackTimeMillis: song.track_time_millis,
    collectionName: song.collection_name,
  }));

  const isLikedPlaying = tracks.some((t: any) => t.trackId === currentTrack?.trackId) && isPlaying;

  const handlePlayAll = async () => {
    if (isLikedPlaying) {
      togglePlay();
    } else if (tracks.length > 0) {
      // Fetch fresh iTunes URL for first track
      try {
        const firstTrack = tracks[0];
        const searchQuery = `${firstTrack.trackName} ${firstTrack.artistName}`.replace(/\s+/g, '+');
        const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=song&limit=1`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const freshTrack = {
            ...firstTrack,
            previewUrl: data.results[0].previewUrl,
          };
          playTrack(freshTrack, tracks, 0);
        } else {
          // Fallback to stored URL
          playTrack(firstTrack, tracks, 0);
        }
      } catch (error) {
        console.error('Error fetching fresh track:', error);
        playTrack(tracks[0], tracks, 0);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-purple-900/40 to-spotify-black">
      <Navbar />
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-400 hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
        </button>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-end mb-6 sm:mb-8">
          <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-gradient-to-br from-purple-700 to-blue-300 rounded shadow-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="flex-1 pb-0 sm:pb-4">
            <p className="text-xs sm:text-sm font-bold mb-1 sm:mb-2">PLAYLIST</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 line-clamp-2">Liked Songs</h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-bold truncate">{user.user_metadata?.full_name || user.email}</span>
              <span>•</span>
              <span>{likedSongs.length} songs</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 mb-6">
          <button
            onClick={handlePlayAll}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition shadow-2xl"
          >
            {isLikedPlaying ? (
              <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
              </svg>
            ) : (
              <svg className="w-7 h-7 text-black ml-1" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
              </svg>
            )}
          </button>
          <button className="text-gray-400 hover:text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {likedSongs.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">No liked songs yet</h2>
            <p className="text-gray-400 mb-6">Songs you like will appear here</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition"
            >
              Find Songs
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {tracks.map((track: any, index: number) => (
              <TrackRow
                key={track.trackId}
                track={track}
                index={index}
                isPlaying={currentTrack?.trackId === track.trackId && isPlaying}
                onClick={async () => {
                  // Fetch fresh iTunes URL before playing
                  try {
                    const searchQuery = `${track.trackName} ${track.artistName}`.replace(/\s+/g, '+');
                    const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=song&limit=1`);
                    const data = await response.json();
                    
                    if (data.results && data.results.length > 0) {
                      const freshTrack = {
                        ...track,
                        previewUrl: data.results[0].previewUrl,
                      };
                      playTrack(freshTrack, tracks, index);
                    } else {
                      // Fallback to stored URL
                      playTrack(track, tracks, index);
                    }
                  } catch (error) {
                    console.error('Error fetching fresh track:', error);
                    playTrack(track, tracks, index);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TrackRow = ({ track, index, isPlaying, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`grid grid-cols-[40px_1fr_1fr] gap-4 px-4 py-3 rounded hover:bg-spotify-light-gray cursor-pointer group ${
        isPlaying ? 'bg-spotify-light-gray' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-center justify-center">
        {isPlaying ? (
          <div className="flex gap-[2px] items-end h-4">
            <div className="w-[3px] bg-green-500 playing-bar"></div>
            <div className="w-[3px] bg-green-500 playing-bar"></div>
            <div className="w-[3px] bg-green-500 playing-bar"></div>
          </div>
        ) : isHovered ? (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
          </svg>
        ) : (
          <span className="text-gray-400 text-sm">{index + 1}</span>
        )}
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <img src={track.artworkUrl100} alt={track.trackName} className="w-10 h-10 rounded" />
        <div className="min-w-0">
          <p className={`font-semibold truncate ${isPlaying ? 'text-green-500' : 'text-white'}`}>
            {track.trackName}
          </p>
          <p className="text-sm text-gray-400 truncate">{track.artistName}</p>
        </div>
      </div>

      <div className="flex items-center justify-end text-gray-400 text-sm">
        {Math.floor(track.trackTimeMillis / 60000)}:{String(Math.floor((track.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}
      </div>
    </div>
  );
};

export default LikedSongsPage;
