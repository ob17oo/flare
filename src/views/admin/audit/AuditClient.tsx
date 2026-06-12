'use client';

import { useAdminAuditLogs } from '@/entities/admin/hooks/useAdminAuditLogs';

export function AuditClient({ initialData }: { initialData: any[] }) {
  const { data: logs } = useAdminAuditLogs(initialData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Логи аудита</h1>
      </div>

      <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#A1A1AA] uppercase bg-[#1F1F1F]/50 border-b border-[#1F1F1F]">
              <tr>
                <th className="px-6 py-4 font-medium">ID Лога</th>
                <th className="px-6 py-4 font-medium">ID Пользователя</th>
                <th className="px-6 py-4 font-medium">Действие</th>
                <th className="px-6 py-4 font-medium">Сущность</th>
                <th className="px-6 py-4 font-medium">Детали</th>
                <th className="px-6 py-4 font-medium">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {logs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-[#A1A1AA]">{log.id.slice(-8)}</td>
                  <td className="px-6 py-4 text-xs font-mono text-[#A1A1AA]">{log.userId}</td>
                  <td className="px-6 py-4 text-white font-medium">{log.action}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{log.entity} (ID: {log.entityId})</td>
                  <td className="px-6 py-4 text-[#A1A1AA] max-w-[200px] truncate">{log.details || '-'}</td>
                  <td className="px-6 py-4 text-[#A1A1AA] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('ru-RU')}
                  </td>
                </tr>
              ))}
              {logs?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#A1A1AA]">
                    Логов не найдено.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
