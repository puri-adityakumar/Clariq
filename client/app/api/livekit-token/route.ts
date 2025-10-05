/**
 * LiveKit Token Generation API Route
 * 
 * This API route generates LiveKit access tokens server-side
 * to keep the API secret secure.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.NEXT_PUBLIC_LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return NextResponse.json(
        { error: 'LiveKit credentials not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { roomName, participantName } = body;

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: 'roomName and participantName are required' },
        { status: 400 }
      );
    }

    // Create access token
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName,
      name: participantName,
    });

    // Grant permissions
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // Generate JWT
    const jwt = await token.toJwt();

    return NextResponse.json({ token: jwt });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
