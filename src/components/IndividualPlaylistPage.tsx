'use client'

import { useEffect, useState } from 'react';
import { useMusic } from '@/context/MusicContext';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const IndividualPlaylistPage = ({ playlistId }: { playlistId: string }) => {
  const { playlists, getPlaylistTracks, deletePlaylist, removeTrackFromPlaylist } = useMusic();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const { user } = useAuth();
  const router = useRouter();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const playlist = playlists.find(p => p.id === playlistId);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchTracks = async () => {
      setLoading(true);
      const playlistTracks = await getPlaylistTracks(playlistId);
      setTracks(playlistTracks);
      setLoading(false);
    };

    fetchTracks();
  }, [user, playlistId]);

  if (!user) {
    return null;
  }

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

  if (!playlist) {
    return (
      <div className="flex-1 bg-spotify-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Playlist not found</h2>
          <button
            onClick={() => router.push('/playlists')}
            className="px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition"
          >
            Go to Playlists
          </button>
        </div>
      </div>
    );
  }

  const playlistTracks = tracks.map(track => ({
    trackId: parseInt(track.track_id),
    trackName: track.track_name,
    artistName: track.artist_name,
    artworkUrl100: track.artwork_url,
    previewUrl: track.preview_url,
    trackTimeMillis: track.track_time_millis,
    collectionName: '',
  }));

  // DEBUG LOGGING
  console.log('=== PLAYLIST TRACKS DEBUG ===');
  console.log('Raw tracks from DB:', tracks);
  console.log('Transformed tracks:', playlistTracks);
  console.log('First track preview URL:', playlistTracks[0]?.previewUrl);
  console.log('============================');

  const isPlaylistPlaying = playlistTracks.some((t: any) => t.trackId === currentTrack?.trackId) && isPlaying;

  const handlePlayPlaylist = async () => {
    if (isPlaylistPlaying) {
      togglePlay();
    } else if (playlistTracks.length > 0) {
      // Fetch fresh track data to get valid preview URLs
      try {
        const firstTrack = playlistTracks[0];
        
        // Always search iTunes by song name + artist for reliable results
        const searchQuery = `${firstTrack.trackName} ${firstTrack.artistName}`.replace(/\s+/g, '+');
        const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=song&limit=1`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const freshTrack = {
            ...firstTrack,
            previewUrl: data.results[0].previewUrl,
          };
          playTrack(freshTrack, playlistTracks, 0);
        } else {
          // Fallback to stored URL if search fails
          playTrack(firstTrack, playlistTracks, 0);
        }
      } catch (error) {
        console.error('Error fetching fresh track data:', error);
        // Fallback to stored URL
        playTrack(playlistTracks[0], playlistTracks, 0);
      }
    }
  };

  const handleDeletePlaylist = async () => {
    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      await deletePlaylist(playlistId);
      router.push('/playlists');
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    await removeTrackFromPlaylist(playlistId, trackId);
    const updatedTracks = await getPlaylistTracks(playlistId);
    setTracks(updatedTracks);
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
          <div className="w-60 h-60 bg-gradient-to-br from-purple-700 to-blue-500 rounded shadow-2xl flex items-center justify-center">
            <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13z"/>
            </svg>
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-bold mb-2">PLAYLIST</p>
            <h1 className="text-6xl font-bold mb-6 line-clamp-2">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-gray-400 mb-4">{playlist.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold">{user.user_metadata?.full_name || user.email}</span>
              <span>•</span>
              <span>{tracks.length} songs</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 mb-6">
          <button
            onClick={handlePlayPlaylist}
            disabled={tracks.length === 0}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaylistPlaying ? (
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
          <button
            onClick={handleDeletePlaylist}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
          </button>
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13z"/>
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">No songs in this playlist</h2>
            <p className="text-gray-400 mb-6">Add songs to get started</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition"
            >
              Find Songs
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {playlistTracks.map((track: any, index: number) => (
              <TrackRow
                key={`${track.trackId}-${index}`}
                track={track}
                index={index}
                isPlaying={currentTrack?.trackId === track.trackId && isPlaying}
                onClick={async () => {
                  // Fetch fresh track data for valid preview URL
                  try {
                    // Always search iTunes by song name + artist for reliable results
                    const searchQuery = `${track.trackName} ${track.artistName}`.replace(/\s+/g, '+');
                    const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=song&limit=1`);
                    const data = await response.json();
                    
                    if (data.results && data.results.length > 0) {
                      const freshTrack = {
                        ...track,
                        previewUrl: data.results[0].previewUrl,
                      };
                      playTrack(freshTrack, playlistTracks, index);
                    } else {
                      // Fallback to stored URL if search fails
                      playTrack(track, playlistTracks, index);
                    }
                  } catch (error) {
                    console.error('Error fetching fresh track:', error);
                    playTrack(track, playlistTracks, index);
                  }
                }}
                onRemove={() => handleRemoveTrack(track.trackId.toString())}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TrackRow = ({ track, index, isPlaying, onClick, onRemove }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`grid grid-cols-[40px_1fr_1fr_40px] gap-4 px-4 py-3 rounded hover:bg-spotify-light-gray cursor-pointer group ${
        isPlaying ? 'bg-spotify-light-gray' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center" onClick={onClick}>
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

      <div className="flex items-center gap-3 min-w-0" onClick={onClick}>
        <img src={track.artworkUrl100} alt={track.trackName} className="w-10 h-10 rounded" />
        <div className="min-w-0">
          <p className={`font-semibold truncate ${isPlaying ? 'text-green-500' : 'text-white'}`}>
            {track.trackName}
          </p>
          <p className="text-sm text-gray-400 truncate">{track.artistName}</p>
        </div>
      </div>

      <div className="flex items-center justify-end text-gray-400 text-sm" onClick={onClick}>
        {Math.floor(track.trackTimeMillis / 60000)}:{String(Math.floor((track.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}
      </div>

      <div className="flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default IndividualPlaylistPage;
