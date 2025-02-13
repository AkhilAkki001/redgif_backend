import { NextResponse } from 'next/server';
import axios from 'axios';

interface RedgifsAuthResponse {
  token: string;
}

interface RedgifsResponse {
  gif: {
    urls: {
      hd: string;
      sd: string;
      poster: string;
    };
    tags: string[];
    createDate: number;
    duration: number;
    views: number;
    hasAudio: boolean;
  };
}

let authToken: string | null = null;
let tokenExpiration: number | null = null;

async function getAuthToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && authToken && tokenExpiration && Date.now() < tokenExpiration) {
    return authToken;
  }

  try {
    const response = await axios.get<RedgifsAuthResponse>('https://api.redgifs.com/v2/auth/temporary');
    authToken = response.data.token;
    tokenExpiration = Date.now() + (50 * 60 * 1000); // 50 minutes
    return authToken;
  } catch (error) {
    console.error('Error getting RedGifs auth token:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redgifsId = searchParams.get('id');

  if (!redgifsId) {
    return NextResponse.json({ error: 'Missing redgifsId parameter' }, { status: 400 });
  }

  try {
    const token = await getAuthToken();
    const response = await axios.get<RedgifsResponse>(`https://api.redgifs.com/v2/gifs/${redgifsId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching RedGifs data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch RedGifs data' },
      { status: error.response?.status || 500 }
    );
  }
}
