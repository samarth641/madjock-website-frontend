import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint'); // 'search' or 'trending'
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '12';

    // Priority: Env Var > Default Public Beta Key
    const API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'dc6zaTOxFJmzC';

    // Construct Giphy URL based on endpoint
    let giphyUrl = '';
    if (endpoint === 'trending') {
        giphyUrl = `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=${limit}`;
    } else {
        // Default to search
        const q = query || '';
        giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(q)}&limit=${limit}`;
    }

    try {
        const res = await fetch(giphyUrl);
        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.message || 'Error fetching from Giphy' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Giphy Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
