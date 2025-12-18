import { AuthProvider } from '@/context/AuthContext';
import { MusicProvider } from '@/context/MusicContext';
import { PlayerProvider } from '@/context/PlayerContext';
import AutoRefresh from '@/components/AutoRefresh';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MusicProvider>
            <PlayerProvider>
              <AutoRefresh />
              {children}
            </PlayerProvider>
          </MusicProvider>
        </AuthProvider>
      </body>
    </html>
  );
}