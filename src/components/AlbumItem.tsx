'use client'

import Link from 'next/link';
import { useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';

const AlbumItem = ({ album }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const { playAlbumPreview } = usePlayer();

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playAlbumPreview(album.collectionId);
  };

  return (
    <Link href={`/album/${album.collectionId}`}>
      <div
        className="min-w-[180px] p-4 bg-spotify-gray rounded-lg hover:bg-spotify-light-gray transition-all cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative mb-4">
          <img
            src={album.artworkUrl100?.replace('100x100', '300x300') || '/placeholder.png'}
            alt={album.collectionName}
            className="w-full aspect-square object-cover rounded-md shadow-lg"
          />
          <button
            onClick={handlePlay}
            className={`absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 hover:bg-green-400 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
            </svg>
          </button>
        </div>
        <h3 className="font-bold text-white truncate mb-2 group-hover:underline">
          {album.collectionName}
        </h3>
        <p className="text-sm text-gray-400 truncate">
          {album.artistName}
        </p>
      </div>
    </Link>
  );
};

export default AlbumItem;
