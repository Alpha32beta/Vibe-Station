'use client'

import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import { use } from "react";
import LikedSongsPage from "@/components/LikedSongsPage";

export default function LikedSongs() {
  
  
  return (
    <main className="h-screen bg-black flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <LikedSongsPage/>
      </div>
      <Player />
    </main>
  );
}
