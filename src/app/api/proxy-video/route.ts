import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json({ error: 'Missing video URL' }, { status: 400 });
  }

  // Validate the URL is from RedGifs media server
  if (!videoUrl.startsWith('https://media.redgifs.com/')) {
    return NextResponse.json({ error: 'Invalid video URL' }, { status: 400 });
  }

  try {
    // Forward important headers from the original request
    const headers = new Headers();
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      headers.set('range', rangeHeader);
    }

    // Fetch the video from RedGifs
    const response = await fetch(videoUrl, {
      headers,
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
    }

    // Create response with appropriate headers
    const newResponse = new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
        'Content-Length': response.headers.get('Content-Length') || '',
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
      },
    });

    if (response.headers.has('Content-Range')) {
      newResponse.headers.set('Content-Range', response.headers.get('Content-Range')!);
    }

    return newResponse;
  } catch (error) {
    console.error('Proxy video error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}
