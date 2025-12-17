'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const RecentlyPlayedPage = () => {
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchRecentlyPlayed();
  }, [user]);

  async function fetchRecentlyPlayed() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('play_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('played_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRecentTracks(data || []);
    } catch (error) {
      console.error('Error fetching recently played:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePlayTrack = (track: any, index: number) => {
    const formattedTrack = {
      trackId: track.track_id,
      trackName: track.track_name,
      artistName: track.artist_name,
      artworkUrl100: track.artwork_url,
      previewUrl: track.preview_url,
      trackTimeMillis: 30000,
      collectionName: 'Recently Played',
    };
    playTrack(formattedTrack, [formattedTrack], 0);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-purple-900/40 to-spotify-black p-8">
        <Navbar />
        <div className="mt-8">
          <div className="h-8 bg-gray-700 rounded w-64 mb-8 animate-pulse"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 mb-2 animate-pulse">
              <div className="w-12 h-12 bg-gray-700 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
        <h1 className="text-4xl font-bold text-white mb-8">Recently Played</h1>
        {recentTracks.length === 0 ? (
          <p className="text-gray-400">No recently played songs yet. Start listening to build your history!</p>
        ) : (
          <div className="space-y-2">
            {recentTracks.map((track, index) => (
              <div
                key={`${track.id}-${index}`}
                onClick={() => handlePlayTrack(track, index)}
                className="flex items-center gap-4 p-4 rounded hover:bg-spotify-light-gray cursor-pointer group"
              >
                <img
                  src={track.artwork_url}
                  alt={track.track_name}
                  className="w-12 h-12 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${
                    currentTrack?.trackId === track.track_id ? 'text-green-500' : 'text-white'
                  }`}>
                    {track.track_name}
                  </p>
                  <p className="text-sm text-gray-400 truncate">{track.artist_name}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyPlayedPage;