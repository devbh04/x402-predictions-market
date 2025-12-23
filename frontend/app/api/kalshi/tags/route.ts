import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://api.elections.kalshi.com/trade-api/v2';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BASE_URL}/search/tags_by_categories`, {
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch tags' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
