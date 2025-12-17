'use client'

import { useState } from 'react';
import { useFetchAlbumDetails } from '@/hooks/useMusicAPI';
import { usePlayer } from '@/context/PlayerContext';
import { useRouter } from 'next/navigation';
import TrackMenu from '@/components/TrackMenu';

const AlbumPage = ({ albumId }: { albumId: string }) => {
  const { album, tracks, loading, error } = useFetchAlbumDetails(albumId);
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-purple-900/40 to-spotify-black p-4 sm:p-6 md:p-8">
        <button onClick={() => router.back()} className="mb-4 sm:mb-6 text-gray-400 hover:text-white">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
        </button>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-end mb-6 sm:mb-8">
          <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-gray-700 rounded shadow-2xl animate-pulse flex-shrink-0"></div>
          <div className="flex-1 w-full">
            <div className="h-6 sm:h-8 bg-gray-700 rounded w-24 sm:w-32 mb-3 sm:mb-4 animate-pulse"></div>
            <div className="h-12 sm:h-16 bg-gray-700 rounded w-full sm:w-2/3 mb-3 sm:mb-4 animate-pulse"></div>
            <div className="h-3 sm:h-4 bg-gray-700 rounded w-3/4 sm:w-1/2 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="flex-1 bg-spotify-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Album not found</h2>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isAlbumPlaying = tracks.some((t: any) => t.trackId === currentTrack?.trackId) && isPlaying;

  const handlePlayAlbum = () => {
    if (isAlbumPlaying) {
      togglePlay();
    } else if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-purple-900/40 to-spotify-black">
      <div className="p-4 sm:p-6 md:p-8">
        <button
          onClick={() => router.back()}
          className="mb-4 sm:mb-6 text-gray-400 hover:text-white transition"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
        </button>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 items-start sm:items-end mb-6 sm:mb-8">
          <img
            src={album.artworkUrl100?.replace('100x100', '600x600')}
            alt={album.collectionName}
            className="w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 rounded shadow-2xl flex-shrink-0"
          />
          <div className="flex-1 pb-0 sm:pb-4 w-full">
            <p className="text-xs sm:text-sm font-bold mb-1 sm:mb-2">ALBUM</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 line-clamp-2 break-words">{album.collectionName}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="font-bold">{album.artistName}</span>
              <span>•</span>
              <span>{new Date(album.releaseDate).getFullYear()}</span>
              <span>•</span>
              <span>{tracks.length} songs</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 mb-6">
          <button
            onClick={handlePlayAlbum}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition shadow-2xl"
          >
            {isAlbumPlaying ? (
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-black" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-black ml-1" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
              </svg>
            )}
          </button>
          <button className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <div className="space-y-1">
          {tracks.map((track: any, index: number) => (
            <TrackRow
              key={track.trackId}
              track={track}
              index={index}
              isPlaying={currentTrack?.trackId === track.trackId && isPlaying}
              onClick={() => playTrack(track, tracks, index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const TrackRow = ({ track, index, isPlaying, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const trackWithCollection = {
    ...track,
    collectionName: track.collectionName || '',
  };

  return (
    <div
      className={`grid grid-cols-[32px_1fr_60px_32px] sm:grid-cols-[40px_1fr_80px_40px] gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 rounded hover:bg-spotify-light-gray group ${
        isPlaying ? 'bg-spotify-light-gray' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center cursor-pointer" onClick={onClick}>
        {isPlaying ? (
          <div className="flex gap-[2px] items-end h-3 sm:h-4">
            <div className="w-[3px] bg-green-500 playing-bar"></div>
            <div className="w-[3px] bg-green-500 playing-bar"></div>
            <div className="w-[3px] bg-green-500 playing-bar"></div>
          </div>
        ) : isHovered ? (
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
          </svg>
        ) : (
          <span className="text-gray-400 text-xs sm:text-sm">{index + 1}</span>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer" onClick={onClick}>
        <img src={track.artworkUrl100} alt={track.trackName} className="w-8 h-8 sm:w-10 sm:h-10 rounded flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className={`text-xs sm:text-sm font-semibold truncate ${isPlaying ? 'text-green-500' : 'text-white'}`}>
            {track.trackName}
          </p>
          <p className="text-xs text-gray-400 truncate hidden sm:block">{track.artistName}</p>
        </div>
      </div>

      <div className="flex items-center justify-end text-gray-400 text-xs sm:text-sm cursor-pointer" onClick={onClick}>
        {Math.floor(track.trackTimeMillis / 60000)}:{String(Math.floor((track.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}
      </div>

      <div className="flex items-center justify-center">
        <TrackMenu track={trackWithCollection} />
      </div>
    </div>
  );
};

export default AlbumPage;
