'use client'

import { useEffect, useState } from 'react';
import { useMusic } from '@/context/MusicContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PlaylistsPage = () => {
  const { playlists, createPlaylist, deletePlaylist, refreshData } = useMusic();
  const { user } = useAuth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      console.log('User logged in, fetching playlists...');
      refreshData();
    }
  }, [user]);

  useEffect(() => {
    console.log('Playlists:', playlists);
  }, [playlists]);

  if (!user) {
    return null;
  }

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    setCreating(true);
    console.log('Creating playlist:', playlistName);
    const result = await createPlaylist(playlistName, playlistDescription);
    console.log('Create result:', result);
    setCreating(false);
    setPlaylistName('');
    setPlaylistDescription('');
    setShowCreateModal(false);
    
    await refreshData();
  };

  const handleDeletePlaylist = async (playlistId: string, playlistName: string) => {
    if (confirm(`Are you sure you want to delete "${playlistName}"?`)) {
      await deletePlaylist(playlistId);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-gray to-spotify-black">
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Your Playlists</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-500 text-black rounded-full font-bold hover:scale-105 transition"
          >
            Create Playlist
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13z"/>
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">No playlists yet</h2>
            <p className="text-gray-400 mb-6">Create your first playlist to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition"
            >
              Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => {
                  console.log('Playlist clicked:', playlist.id, playlist.name);
                  router.push(`/playlist/${playlist.id}`);
                }}
                className="bg-spotify-gray rounded-lg p-4 hover:bg-spotify-light-gray transition cursor-pointer group relative"
              >
                <div className="relative mb-4">
                  <div className="w-full aspect-square bg-gradient-to-br from-purple-700 to-blue-500 rounded-md shadow-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-white truncate mb-2 group-hover:underline">
                  {playlist.name}
                </h3>
                {playlist.description && (
                  <p className="text-sm text-gray-400 truncate mb-2">
                    {playlist.description}
                  </p>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeletePlaylist(playlist.id, playlist.name);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500 z-10"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-spotify-gray rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Create Playlist</h2>
            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Playlist Name</label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="My Playlist"
                  required
                  className="w-full px-4 py-3 bg-spotify-light-gray text-white rounded border border-gray-700 focus:border-white focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Description (Optional)</label>
                <textarea
                  value={playlistDescription}
                  onChange={(e) => setPlaylistDescription(e.target.value)}
                  placeholder="Add a description"
                  rows={3}
                  className="w-full px-4 py-3 bg-spotify-light-gray text-white rounded border border-gray-700 focus:border-white focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setPlaylistName('');
                    setPlaylistDescription('');
                  }}
                  className="flex-1 px-6 py-3 bg-spotify-light-gray text-white rounded-full font-bold hover:scale-105 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !playlistName.trim()}
                  className="flex-1 px-6 py-3 bg-green-500 text-black rounded-full font-bold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
