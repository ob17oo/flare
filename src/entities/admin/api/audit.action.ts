'use server';

import { prisma } from "@/shared/lib/prisma";

export async function getAllAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  return logs;
}
