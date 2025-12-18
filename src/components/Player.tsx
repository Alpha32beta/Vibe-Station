'use client'

import { usePlayer } from '@/context/PlayerContext';
import { useMusic } from '@/context/MusicContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isShuffle,
    isRepeat,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const { isTrackLiked, toggleLike } = useMusic();
  const { user } = useAuth();
  const router = useRouter();

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / duration) * 100 || 0;

  const handleLikeClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (currentTrack) {
      toggleLike(currentTrack);
    }
  };

  const trackLiked = currentTrack ? isTrackLiked(currentTrack.trackId.toString()) : false;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 md:h-24 bg-black border-t border-gray-800 px-2 md:px-4 flex items-center justify-between gap-2 z-50">
      <div className="flex items-center gap-2 md:gap-4 w-[25%] sm:w-[30%] min-w-0">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.artworkUrl100}
              alt={currentTrack.trackName}
              className="w-10 h-10 md:w-14 md:h-14 rounded flex-shrink-0"
            />
            <div className="min-w-0 flex-1 hidden sm:block">
              <p className="text-xs md:text-sm font-semibold truncate text-white">
                {currentTrack.trackName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {currentTrack.artistName}
              </p>
            </div>
            <button 
              onClick={handleLikeClick}
              className={`${trackLiked ? 'text-green-500' : 'text-gray-400'} hover:text-white transition hidden md:block`}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill={trackLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </>
        ) : (
          <div className="text-gray-500 text-xs md:text-sm">No track</div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 md:gap-2 flex-1 max-w-[722px]">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-1 md:p-2 ${isShuffle ? 'text-green-500' : 'text-gray-400'} hover:text-white transition hidden md:block`}
            title="Shuffle"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z"/>
              <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/>
            </svg>
          </button>

          <button
            onClick={previousTrack}
            disabled={!currentTrack}
            className="text-gray-400 hover:text-white transition disabled:opacity-50"
            title="Previous"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 4a.5.5 0 0 1 1 0v3.248l6.267-3.636c.52-.302 1.233.043 1.233.696v7.384c0 .653-.713.998-1.233.696L5 8.752V12a.5.5 0 0 1-1 0V4z"/>
            </svg>
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition disabled:opacity-50"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-3 h-3 md:w-4 md:h-4 text-black" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
              </svg>
            ) : (
              <svg className="w-3 h-3 md:w-4 md:h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
              </svg>
            )}
          </button>

          <button
            onClick={nextTrack}
            disabled={!currentTrack}
            className="text-gray-400 hover:text-white transition disabled:opacity-50"
            title="Next"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12 4a.5.5 0 0 0-1 0v3.248L4.733 3.612C4.213 3.31 3.5 3.655 3.5 4.308v7.384c0 .653.713.998 1.233.696L11 8.752V12a.5.5 0 0 0 1 0V4z"/>
            </svg>
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-1 md:p-2 ${isRepeat ? 'text-green-500' : 'text-gray-400'} hover:text-white transition hidden md:block`}
            title="Repeat"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 4v1.466a.25.25 0 0 0 .41.192l2.36-1.966a.25.25 0 0 0 0-.384l-2.36-1.966a.25.25 0 0 0-.41.192V3H5a5 5 0 0 0-4.48 7.223.5.5 0 0 0 .896-.446A4 4 0 0 1 5 4h6zm4.48 1.777a.5.5 0 0 0-.896.446A4 4 0 0 1 11 12H5.001v-1.466a.25.25 0 0 0-.41-.192l-2.36 1.966a.25.25 0 0 0 0 .384l2.36 1.966a.25.25 0 0 0 .41-.192V13h6a5 5 0 0 0 4.48-7.223z"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1 md:gap-2 w-full">
          <span className="text-[10px] md:text-xs text-gray-400 w-8 md:w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 group">
            <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-white"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              disabled={!currentTrack}
            />
          </div>
          <span className="text-[10px] md:text-xs text-gray-400 w-8 md:w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2 w-[15%] sm:w-[20%] md:w-[25%] justify-end">
        <button className="text-gray-400 hover:text-white hidden lg:block">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </button>
        <button className="text-gray-400 hover:text-white hidden md:block">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
            <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
            <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707z"/>
          </svg>
        </button>
        <div className="items-center gap-2 w-16 md:w-24 hidden md:flex">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white 0%, white ${volume * 100}%, rgb(75, 85, 99) ${volume * 100}%, rgb(75, 85, 99) 100%)`
            }}
          />
        </div>
      </div>
    </footer>
  );
};

export default Player;