'use client'

import { useFetchPopularAlbums, useFetchNigerianMusic, useFetchTrendingAlbums } from '@/hooks/useMusicAPI';
import Navbar from '@/components/Navbar';
import AlbumItem from '@/components/AlbumItem';
import { useMusic } from '@/context/MusicContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const { albums: popular, loading: loading1 } = useFetchPopularAlbums(20);
  const { albums: nigerian, loading: loading2 } = useFetchNigerianMusic(20);
  const { albums: trending, loading: loading3 } = useFetchTrendingAlbums(20);
  const { likedSongsCount } = useMusic();
  const { user } = useAuth();
  const router = useRouter();

  const quickAccess = [
    { 
      name: "Liked Songs", 
      gradient: "from-purple-700 to-blue-300", 
      icon: "♥",
      count: likedSongsCount,
      onClick: () => user ? router.push('/liked-songs') : router.push('/login')
    },
    { name: "Your Episodes", gradient: "from-green-700 to-green-300", icon: "🎙" },
    { name: "Chill Mix", gradient: "from-blue-600 to-cyan-300", icon: "🎵" },
    { name: "Workout", gradient: "from-red-600 to-orange-400", icon: "💪" },
    { name: "Discover Weekly", gradient: "from-purple-900 to-blue-500", icon: "🔍" },
    { name: "Release Radar", gradient: "from-pink-600 to-rose-400", icon: "📡" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-gray to-spotify-black">
      <Navbar />
      
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
            Good {getGreeting()}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
            {quickAccess.map((item, i) => (
              <div
                key={i}
                onClick={item.onClick}
                className="bg-spotify-light-gray hover:bg-gray-600 rounded transition cursor-pointer flex items-center overflow-hidden h-16 md:h-20 group"
              >
                <div className={`w-16 md:w-20 h-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl md:text-3xl flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 px-4">
                  <span className="font-bold text-white text-sm md:text-base block">{item.name}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-xs text-gray-300">{item.count} songs</span>
                  )}
                </div>
                <div className="ml-auto mr-4 opacity-0 group-hover:opacity-100 transition">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105">
                    <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <AlbumSection title="Top 50 Global" albums={popular} loading={loading1} />
        <AlbumSection title="Top 50 Nigeria 🇳🇬" albums={nigerian} loading={loading2} />
        <AlbumSection title="Trending Now" albums={trending} loading={loading3} />
      </div>
    </div>
  );
};

const AlbumSection = ({ title, albums, loading }: any) => {
  if (loading) {
    return (
      <section>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-spotify-gray rounded-lg p-3 md:p-4 animate-pulse">
              <div className="w-full aspect-square bg-gray-700 rounded-md mb-3 md:mb-4"></div>
              <div className="h-3 md:h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-2 md:h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const uniqueAlbums = albums.filter((album: any, index: number, self: any[]) => 
    index === self.findIndex((a) => a.collectionId === album.collectionId)
  );

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {uniqueAlbums.map((album: any, index: number) => (
          <AlbumItem key={`${album.collectionId}-${index}`} album={album} />
        ))}
      </div>
    </section>
  );
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export default HomePage;
