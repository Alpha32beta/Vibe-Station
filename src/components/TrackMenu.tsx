'use client'

import { useState, useRef, useEffect } from 'react';
import { useMusic } from '@/context/MusicContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface TrackMenuProps {
  track: {
    trackId: number;
    trackName: string;
    artistName: string;
    artworkUrl100: string;
    previewUrl: string;
    trackTimeMillis: number;
    collectionName: string;
  };
}

const TrackMenu = ({ track }: TrackMenuProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { isTrackLiked, toggleLike, playlists, addTrackToPlaylist, createPlaylist } = useMusic();
  const { user } = useAuth();
  const router = useRouter();

  const isLiked = isTrackLiked(track.trackId.toString());

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleLikeToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    await toggleLike(track);
    setShowMenu(false);
  };

  const handleAddToPlaylist = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowPlaylistModal(true);
    setShowMenu(false);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-2 text-gray-400 hover:text-white transition opacity-0 group-hover:opacity-100"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-spotify-light-gray rounded-lg shadow-2xl overflow-hidden z-50">
            <button
              onClick={handleLikeToggle}
              className="w-full text-left px-4 py-3 text-white hover:bg-spotify-gray transition flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}</span>
            </button>
            
            <button
              onClick={handleAddToPlaylist}
              className="w-full text-left px-4 py-3 text-white hover:bg-spotify-gray transition flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
              </svg>
              <span>Add to Playlist</span>
            </button>
          </div>
        )}
      </div>

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <AddToPlaylistModal
          track={track}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </>
  );
};

// Add to Playlist Modal Component
interface AddToPlaylistModalProps {
  track: {
    trackId: number;
    trackName: string;
    artistName: string;
    artworkUrl100: string;
    previewUrl: string;
    trackTimeMillis: number;
    collectionName: string;
  };
  onClose: () => void;
}

const AddToPlaylistModal = ({ track, onClose }: AddToPlaylistModalProps) => {
  const { playlists, addTrackToPlaylist, createPlaylist } = useMusic();
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    setCreating(true);
    const result = await createPlaylist(newPlaylistName);
    
    if (result.data) {
      // Add track to newly created playlist
      await addTrackToPlaylist(result.data.id, track);
      setSuccess(newPlaylistName);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
    setCreating(false);
  };

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    setAdding(playlistId);
    await addTrackToPlaylist(playlistId, track);
    setSuccess(playlistName);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-spotify-light-gray rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Track Info */}
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <img src={track.artworkUrl100} alt={track.trackName} className="w-12 h-12 rounded" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{track.trackName}</p>
            <p className="text-sm text-gray-400 truncate">{track.artistName}</p>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            <p className="text-white font-semibold mb-2">Added to playlist!</p>
            <p className="text-gray-400 text-sm">{success}</p>
          </div>
        ) : (
          <>
            {/* Create New Playlist */}
            <div className="p-4 border-b border-gray-700">
              {!showCreateNew ? (
                <button
                  onClick={() => setShowCreateNew(true)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-spotify-gray rounded transition"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                    </svg>
                  </div>
                  <span className="text-white font-semibold">Create New Playlist</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Playlist name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="w-full bg-spotify-gray text-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreatePlaylist}
                      disabled={!newPlaylistName.trim() || creating}
                      className="flex-1 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-2 rounded transition"
                    >
                      {creating ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateNew(false);
                        setNewPlaylistName('');
                      }}
                      className="px-4 py-2 text-gray-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Existing Playlists */}
            <div className="max-h-64 overflow-y-auto">
              {playlists.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p>No playlists yet</p>
                  <p className="text-sm mt-2">Create your first playlist above</p>
                </div>
              ) : (
                <div className="p-2">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id, playlist.name)}
                      disabled={adding === playlist.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-spotify-gray rounded transition disabled:opacity-50"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-700 to-blue-500 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13z"/>
                        </svg>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-white font-semibold truncate">{playlist.name}</p>
                        {playlist.description && (
                          <p className="text-sm text-gray-400 truncate">{playlist.description}</p>
                        )}
                      </div>
                      {adding === playlist.id && (
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default TrackMenu;
