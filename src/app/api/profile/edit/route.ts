import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import bcrypt from 'bcrypt';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Неавторизованный доступ' }, { status: 401 });
    }

    const body = await req.json();
    const { login, email, password } = body;

    const updateData: { login?: string; email?: string; password?: string } = {};
    if (login) updateData.login = login;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: { login: updatedUser.login, email: updatedUser.email } });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
