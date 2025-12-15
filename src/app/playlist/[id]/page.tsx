'use client'

import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import PlaylistsPage from "@/components/PlaylistsPage";


export default function Playlists() {
  return (
    <main className="h-screen bg-black flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <PlaylistsPage/>
      </div>
      <Player />
    </main>
  );
}
