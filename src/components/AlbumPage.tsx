'use client'

import { useState } from 'react';
import { useFetchAlbumDetails } from '@/hooks/useMusicAPI';
import { usePlayer } from '@/context/PlayerContext';
import { useRouter } from 'next/navigation';

const AlbumPage = ({ albumId }: { albumId: string }) => {
  const { album, tracks, loading, error } = useFetchAlbumDetails(albumId);
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-purple-900/40 to-spotify-black p-8">
        <button onClick={() => router.back()} className="mb-6 text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
        </button>
        <div className="flex gap-8 items-end mb-8">
          <div className="w-60 h-60 bg-gray-700 rounded shadow-2xl animate-pulse"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
            <div className="h-16 bg-gray-700 rounded w-2/3 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
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
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-400 hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
        </button>

        <div className="flex gap-8 items-end mb-8">
          <img
            src={album.artworkUrl100?.replace('100x100', '600x600')}
            alt={album.collectionName}
            className="w-60 h-60 rounded shadow-2xl"
          />
          <div className="flex-1 pb-4">
            <p className="text-sm font-bold mb-2">ALBUM</p>
            <h1 className="text-6xl font-bold mb-6 line-clamp-2">{album.collectionName}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold">{album.artistName}</span>
              <span>•</span>
              <span>{new Date(album.releaseDate).getFullYear()}</span>
              <span>•</span>
              <span>{tracks.length} songs</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 mb-6">
          <button
            onClick={handlePlayAlbum}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition shadow-2xl"
          >
            {isAlbumPlaying ? (
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

export default AlbumPage;
