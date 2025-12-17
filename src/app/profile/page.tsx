import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import ProfilePage from '@/components/ProfilePage';

export default function Profile() {
  return (
    <main className="h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ProfilePage />
      </div>
      <Player />
    </main>
  );
}