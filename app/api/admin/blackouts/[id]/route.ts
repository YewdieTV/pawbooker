import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const blackoutId = params.id;
    
    // Check if blackout exists
    const blackout = await prisma.blackout.findUnique({
      where: { id: blackoutId },
    });

    if (!blackout) {
      return NextResponse.json(
        { error: 'Blackout not found' },
        { status: 404 }
      );
    }

    // Delete the blackout
    await prisma.blackout.delete({
      where: { id: blackoutId },
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Delete blackout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
