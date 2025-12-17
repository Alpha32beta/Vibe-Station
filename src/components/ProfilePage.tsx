'use client'

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const ProfilePage = () => {
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const router = useRouter();
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchRecentlyPlayed();
    setProfileImage(user.user_metadata?.avatar_url || null);
    setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
  }, [user]);

  async function fetchRecentlyPlayed() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('play_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('played_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentTracks(data || []);
    } catch (error) {
      console.error('Error fetching recently played:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePlayTrack = (track: any) => {
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

  const openEditModal = () => {
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setUploading(true);

      const updates: any = {
        full_name: displayName,
      };

      if (profileImage && profileImage.startsWith('data:')) {
        updates.avatar_url = profileImage;
      }

      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      alert('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-700 to-black rounded-2xl">
      <Navbar />
      
      <div className="p-4 sm:p-6 md:p-8 lg:p-12">
        <button
          onClick={() => router.back()}
          className="mb-4 sm:mb-6 text-gray-400 hover:text-white transition"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
        </button>

        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16 relative">
          <div 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-60 lg:h-60 rounded-full overflow-hidden shadow-2xl cursor-pointer group relative flex-shrink-0"
            onClick={openEditModal}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white">
                {displayName[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white mb-2 sm:mb-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/>
              </svg>
              <span className="text-white font-bold text-sm sm:text-base md:text-lg">Choose photo</span>
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3 font-semibold">PROFILE</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight break-words">
              {displayName}
            </h1>
            <p className="text-sm sm:text-base text-gray-300">
              {recentTracks.length} Recently Played Songs
            </p>
          </div>

          <div className="absolute top-0 right-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-gray-700 flex items-center justify-center transition"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-300" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-spotify-light-gray rounded-lg shadow-2xl overflow-hidden z-50">
                <button
                  onClick={openEditModal}
                  className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 text-white hover:bg-spotify-gray transition text-left text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                  </svg>
                  <span className="font-medium">Edit profile</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <section className="mt-8 sm:mt-12 md:mt-16">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Recently Played</h2>
              <p className="text-xs sm:text-sm text-gray-400">Only visible to you</p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="min-w-[150px] sm:min-w-[180px] md:min-w-[200px] bg-spotify-gray rounded-lg p-4 sm:p-5 animate-pulse">
                  <div className="w-full aspect-square bg-gray-700 rounded mb-4 sm:mb-5"></div>
                  <div className="h-4 sm:h-5 bg-gray-700 rounded mb-2 sm:mb-3"></div>
                  <div className="h-3 sm:h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : recentTracks.length === 0 ? (
            <p className="text-gray-400 text-base sm:text-lg">No recently played songs yet. Start listening to see your history!</p>
          ) : (
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {recentTracks.map((track, index) => (
                <div
                  key={`${track.id}-${index}`}
                  onClick={() => handlePlayTrack(track)}
                  className="min-w-[150px] sm:min-w-[180px] md:min-w-[200px] bg-spotify-gray rounded-lg p-4 sm:p-5 hover:bg-spotify-light-gray cursor-pointer transition group"
                >
                  <div className="relative mb-4 sm:mb-5">
                    <img
                      src={track.artwork_url}
                      alt={track.track_name}
                      className="w-full aspect-square rounded shadow-lg"
                    />
                    <div className="absolute bottom-2 right-2 w-12 h-12 sm:w-14 sm:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-xl transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-black ml-0.5" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-bold text-white truncate mb-2 text-sm sm:text-base">{track.track_name}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">{track.artist_name}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-spotify-gray rounded-xl p-6 sm:p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Profile details</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center gap-5 sm:gap-6 mb-6 sm:mb-8">
              <div className="relative">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-2xl">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl sm:text-7xl font-bold text-white">
                      {displayName[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition"
                >
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-black" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                    <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/>
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="w-full">
                <label className="block text-white font-semibold mb-2 sm:mb-3 text-sm">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-spotify-light-gray text-white rounded-lg border-2 border-gray-700 focus:border-white focus:outline-none text-base sm:text-lg"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 sm:gap-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 sm:px-8 py-2 sm:py-3 text-white hover:scale-105 transition font-semibold text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={uploading}
                className="px-8 sm:px-10 py-2 sm:py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {uploading ? 'Saving...' : 'Save'}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-5 sm:mt-6">
              By proceeding, you agree to give Vibe Station access to the image you choose to upload.
            </p>
          </div>
        </div>
      )}

      {showMenu && <div className="fixed inset-0 z-[-1]" onClick={() => setShowMenu(false)} />}
    </div>
  );
};

export default ProfilePage;
