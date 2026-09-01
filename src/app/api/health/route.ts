import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'ok',
          latency: `${dbLatency}ms`,
        },
        memory: {
          status: 'ok',
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        },
      },
      version: process.env.npm_package_version || '1.0.0',
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'error',
          message: error instanceof Error ? error.message : 'Database connection failed',
        },
      },
    }, { status: 503 });
  }
}
