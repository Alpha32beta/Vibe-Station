import { NextResponse } from 'next/server';

const DEEZER_BASE = 'https://api.deezer.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || '20';

  try {
    let url = '';
    
    if (type === 'search-album') {
      url = `${DEEZER_BASE}/search/album?q=${query}&limit=${limit}`;
    } else if (type === 'album') {
      url = `${DEEZER_BASE}/album/${query}`;
    } else if (type === 'chart') {
      url = `${DEEZER_BASE}/chart/0/albums?limit=${limit}`;
    } else if (type === 'search-track') {
      url = `${DEEZER_BASE}/search/track?q=${query}&limit=${limit}`;
    } else if (type === 'playlist') {
      url = `${DEEZER_BASE}/playlist/${query}`;
    } else if (type === 'editorial-playlists') {
      url = `${DEEZER_BASE}/chart/0/playlists?limit=${limit}`;
    }
    
    console.log('Fetching from:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Data:', data);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch', details: error?.message || 'Unknown error' }, { status: 500 });
  }
}