import Player from '@/components/Player';
import RecentlyPlayedPage from '@/components/RecentlyPlayedPage';
import Sidebar from '@/components/Sidebar';

export default function RecentlyPlayed() {
  return (
     <main className="h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <RecentlyPlayedPage />
      </div>
      <Player />
    </main>
  );
}