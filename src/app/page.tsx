'use client'

import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import HomePage from "@/components/HomePage";

export default function Home() {
  return (
    <main className="h-screen bg-black flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <HomePage />
      </div>
      <Player />
    </main>
  );
}
