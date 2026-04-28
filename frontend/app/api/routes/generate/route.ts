import { spawn } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { originLat, originLng, destLat, destLng } = await request.json();

    // Validate inputs
    if (
      typeof originLat !== 'number' ||
      typeof originLng !== 'number' ||
      typeof destLat !== 'number' ||
      typeof destLng !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid coordinates', waypoints: [] },
        { status: 400 }
      );
    }

    // Call Python route generator script
    const scriptPath = path.join(process.cwd(), 'scripts', 'route_generator.py');
    
    const result = await new Promise((resolve, reject) => {
      const python = spawn('python3', [
        scriptPath,
        originLat.toString(),
        originLng.toString(),
        destLat.toString(),
        destLng.toString(),
      ]);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('[Route API] Python error:', stderr);
          // Return fallback direct route
          resolve({
            success: false,
            waypoints: [
              { lat: originLat, lng: originLng },
              { lat: destLat, lng: destLng },
            ],
            distance: 0,
            error: stderr || 'Route generation failed',
          });
        } else {
          try {
            resolve(JSON.parse(stdout));
          } catch (e) {
            console.error('[Route API] JSON parse error:', e);
            resolve({
              success: false,
              waypoints: [
                { lat: originLat, lng: originLng },
                { lat: destLat, lng: destLng },
              ],
              distance: 0,
              error: 'Failed to parse route',
            });
          }
        }
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Route API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        waypoints: [],
        success: false,
      },
      { status: 500 }
    );
  }
}
