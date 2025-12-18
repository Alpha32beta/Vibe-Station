import { AuthProvider } from '@/context/AuthContext';
import { MusicProvider } from '@/context/MusicContext';
import { PlayerProvider } from '@/context/PlayerContext';
import './globals.css'; // or whatever your CSS import is

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
              {children}
            </PlayerProvider>
          </MusicProvider>
        </AuthProvider>
      </body>
    </html>
  );
}