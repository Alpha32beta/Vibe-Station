'use client'

import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import AlbumPage from "@/components/AlbumPage";
import { use } from "react";

export default function Album({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <main className="h-screen bg-black flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <AlbumPage albumId={id} />
      </div>
      <Player />
    </main>
  );
}
