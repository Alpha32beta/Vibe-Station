'use client'

import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import IndividualPlaylistPage from "@/components/IndividualPlaylistPage";
import { use } from "react";

export default function Playlist({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <main className="h-screen bg-black flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <IndividualPlaylistPage playlistId={id} />
      </div>
      <Player />
    </main>
  );
}