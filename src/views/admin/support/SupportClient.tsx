'use client';

import { useState } from 'react';
import { useAdminTickets, useAdminTicketDetails, useUpdateTicketStatus, useReplyToTicket } from '@/entities/admin/hooks/useAdminSupport';
import { X, MessageSquare, ArrowRight, Send } from 'lucide-react';
import Image from 'next/image';
import { getAllTickets, getTicketDetails } from '@/entities/admin/api/support.action';
import { TicketStatus } from '@prisma/client';

type TicketType = Awaited<ReturnType<typeof getAllTickets>>[number];
type MessageType = NonNullable<Awaited<ReturnType<typeof getTicketDetails>>>['messages'][number];

function TicketDetailsModal({ ticketId, onClose }: { ticketId: string, onClose: () => void }) {
  const { data: ticket, isLoading } = useAdminTicketDetails(ticketId);
  const updateStatus = useUpdateTicketStatus();
  const replyToTicket = useReplyToTicket();
  const [replyText, setReplyText] = useState('');

  if (isLoading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl w-full max-w-3xl p-8 text-center text-[#A1A1AA]">Загрузка тикета...</div>
    </div>
  );

  if (!ticket) return null;

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyToTicket.mutate({ ticketId, content: replyText }, {
      onSuccess: () => setReplyText('')
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateStatus.mutate({ id: ticketId, status: e.target.value as TicketStatus });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 overflow-hidden">
      <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl w-full max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col my-auto sm:my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 border-b border-[#1F1F1F] bg-[#0A0A0A] shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white truncate max-w-full">{ticket.subject}</h2>
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 break-all">От: {ticket.user.login} ({ticket.user.email})</p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            <select 
              value={ticket.status} 
              onChange={handleStatusChange}
              disabled={updateStatus.isPending}
              className="bg-[#1F1F1F] border border-[#333] rounded-lg px-3.5 h-11 text-sm text-white flex-1 sm:flex-none"
            >
              <option value="OPEN">Открыт</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="AWAITING_USER">Ожидание ответа</option>
              <option value="CLOSED">Закрыт</option>
            </select>
            <button onClick={onClose} className="text-[#A1A1AA] hover:text-white w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/5" aria-label="Закрыть">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0A0A0A]/50">
          {/* Original message */}
          <div className="flex gap-3 sm:gap-4 max-w-3xl">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#1F1F1F]">
              <Image src={ticket.user.image_url || '/static/default/default-user.svg'} alt={ticket.user.login} width={32} height={32} />
            </div>
            <div className="bg-[#1F1F1F] rounded-2xl rounded-tl-none px-4 py-2.5 sm:px-5 sm:py-3 border border-[#333]">
              <p className="text-xs sm:text-sm font-medium text-white mb-1">{ticket.user.login}</p>
              <p className="text-white text-xs sm:text-sm whitespace-pre-wrap">{ticket.messages[0]?.text || ''}</p>
              <p className="text-[10px] sm:text-xs text-[#A1A1AA] mt-2">{new Date(ticket.createdAt).toLocaleString('ru-RU')}</p>
            </div>
          </div>

          {/* Replies */}
          {ticket.messages.slice(1).map((msg: MessageType) => {
            const isMe = msg.isAdmin;
            return (
              <div key={msg.id} className={`flex gap-3 sm:gap-4 max-w-3xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#1F1F1F]">
                  <Image src={isMe ? '/static/default/default-user.svg' : (ticket.user.image_url || '/static/default/default-user.svg')} alt="User" width={32} height={32} />
                </div>
                <div className={`rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 border ${
                  isMe 
                    ? 'bg-blue-600 border-blue-500 rounded-tr-none text-white' 
                    : 'bg-[#1F1F1F] border-[#333] rounded-tl-none'
                }`}>
                  <p className="text-xs sm:text-sm font-medium mb-1 opacity-80">{isMe ? 'Служба Поддержки' : ticket.user.login}</p>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-[10px] sm:text-xs opacity-60 mt-2">{new Date(msg.createdAt).toLocaleString('ru-RU')}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Reply Box */}
        <div className="p-4 border-t border-[#1F1F1F] bg-[#0A0A0A] shrink-0">
          <form onSubmit={handleReply} className="flex gap-3">
            <input 
              type="text" 
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Написать ответ..." 
              className="flex-1 bg-[#1F1F1F] border border-[#333] rounded-lg px-3.5 h-11 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={!replyText.trim() || replyToTicket.isPending}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 h-11 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shrink-0 text-sm"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Отправить</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function SupportClient({ initialData }: { initialData: TicketType[] }) {
  const { data: tickets } = useAdminTickets(initialData);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Тикеты Поддержки</h1>
      </div>

      <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#A1A1AA] uppercase bg-[#1F1F1F]/50 border-b border-[#1F1F1F]">
              <tr>
                <th className="px-6 py-4 font-medium hidden md:table-cell">ID</th>
                <th className="px-6 py-4 font-medium">Пользователь</th>
                <th className="px-6 py-4 font-medium">Тема</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Категория</th>
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell text-center">Сообщений</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {tickets?.map((ticket: TicketType) => (
                <tr key={ticket.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedTicketId(ticket.id)}>
                  <td className="px-6 py-4 text-xs font-mono text-[#A1A1AA] hidden md:table-cell">{ticket.id.slice(-8)}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">{ticket.user.login}</p>
                      <p className="text-xs text-[#A1A1AA]">{ticket.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate">{ticket.subject}</td>
                  <td className="px-6 py-4 text-[#A1A1AA] hidden sm:table-cell">{ticket.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ticket.status === 'OPEN' ? 'bg-red-500/10 text-red-500' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                      ticket.status === 'AWAITING_USER' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1.5 text-[#A1A1AA]">
                      <MessageSquare className="w-4 h-4" />
                      <span>{ticket._count.messages}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center">
                      <button className="text-blue-500 hover:text-blue-400 font-medium text-xs flex items-center gap-1 w-11 h-11 justify-end" aria-label="Открыть тикет">
                        <span className="hidden sm:inline">Открыть</span> <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tickets?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#A1A1AA]">
                    Нет тикетов.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicketId && (
        <TicketDetailsModal ticketId={selectedTicketId} onClose={() => setSelectedTicketId(null)} />
      )}
    </div>
  );
}
