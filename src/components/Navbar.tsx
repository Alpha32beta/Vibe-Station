'use client'

import { useState, useEffect } from 'react';
import { useSearchTracks } from '@/hooks/useMusicAPI';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { tracks, loading, search } = useSearchTracks();
  const { playTrack } = usePlayer();
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        search(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-spotify-dark sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 bg-black/70 rounded-full flex items-center justify-center hover:bg-black transition">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
        </button>
        <button className="w-8 h-8 bg-black/70 rounded-full flex items-center justify-center hover:bg-black transition">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 max-w-md mx-6 relative">
        <div className="relative">
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            className="w-full bg-spotify-light-gray text-white placeholder-gray-400 rounded-full pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        {showResults && searchQuery && (
          <div className="absolute top-full mt-2 w-full bg-spotify-light-gray rounded-lg shadow-2xl max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              </div>
            ) : tracks.length > 0 ? (
              <div className="p-2">
                {tracks.slice(0, 8).map((track: any) => (
                  <div
                    key={track.trackId}
                    onClick={() => {
                      playTrack(track, tracks);
                      setShowResults(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-spotify-gray rounded cursor-pointer group"
                  >
                    <img src={track.artworkUrl100} alt={track.trackName} className="w-12 h-12 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate group-hover:text-green-500">{track.trackName}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artistName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                No results for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer hover:scale-110 transition"
            >
              {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-spotify-light-gray rounded-lg shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-gray-700">
                  <p className="text-white font-semibold truncate">{user.user_metadata?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="py-2">
                  <Link
                    href="/liked-songs"
                    className="block px-4 py-2 text-white hover:bg-spotify-gray transition"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Liked Songs
                  </Link>
                  <Link
                    href="/playlists"
                    className="block px-4 py-2 text-white hover:bg-spotify-gray transition"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Playlists
                  </Link>
                  <Link
                    href="/history"
                    className="block px-4 py-2 text-white hover:bg-spotify-gray transition"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Play History
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-white hover:bg-spotify-gray transition"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:scale-105 transition">
              Explore Premium
            </button>
            <Link
              href="/login"
              className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:scale-105 transition"
            >
              Log in
            </Link>
          </>
        )}
      </div>

      {showResults && <div className="fixed inset-0 z-[-1]" onClick={() => setShowResults(false)} />}
      {showUserMenu && <div className="fixed inset-0 z-[-1]" onClick={() => setShowUserMenu(false)} />}
    </nav>
  );
};

export default Navbar;
