import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  ShieldCheck,
  Send,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Ticket, User } from '../types';
import { api } from '../lib/api';

interface SupportViewProps {
  user: User | null;
  tickets: Ticket[];
  onRefreshTickets: () => void;
  onOpenAuth: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({
  user,
  tickets,
  onRefreshTickets,
  onOpenAuth
}) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!subject.trim() || !message.trim()) return;

    setError('');
    setLoading(true);

    try {
      const res = await api.createTicket(subject, message);
      setSubject('');
      setMessage('');
      setCreating(false);
      onRefreshTickets();
      setSelectedTicket(res);
    } catch (err: any) {
      setError(err.message || 'Failed to open ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setError('');
    setLoading(true);

    try {
      const updated = await api.sendMessageToTicket(selectedTicket.id, replyText);
      setReplyText('');
      onRefreshTickets();
      setSelectedTicket(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to send reply.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#0a0a0a] p-4 border border-[#1f1f1f] gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase text-white tracking-wider flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>ENTERPRISE CLIENT SUPPORT & DISPUTE DESK</span>
          </h2>
          <p className="text-[10px] text-[#777777] mt-0.5">
            24/7 encrypted messaging for order inquiries, balance verifications, and compliance disputes.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setCreating(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase py-2 px-4 text-xs flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>OPEN NEW TICKET</span>
          </button>
        )}
      </div>

      {!user ? (
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-8 text-center space-y-3">
          <p className="text-[#888888]">Please sign in to view or open confidential support tickets.</p>
          <button
            onClick={onOpenAuth}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase py-2 px-6 text-xs"
          >
            SIGN IN FOR SUPPORT
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] overflow-hidden flex flex-col">
            <div className="p-3 bg-[#111111] border-b border-[#1f1f1f] font-bold text-white uppercase text-xs">
              ACTIVE TICKETS ({tickets.length})
            </div>

            <div className="divide-y divide-[#1f1f1f] overflow-y-auto max-h-[500px]">
              {tickets.length === 0 ? (
                <div className="p-6 text-center text-[#666666]">
                  No active support tickets found.
                </div>
              ) : (
                tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full p-3 text-left transition flex items-center justify-between ${
                      selectedTicket?.id === t.id
                        ? 'bg-blue-600/10 border-l-2 border-blue-500'
                        : 'hover:bg-[#111111]'
                    }`}
                  >
                    <div>
                      <div className="text-white font-bold truncate max-w-[180px]">{t.subject}</div>
                      <div className="text-[9px] text-[#777777]">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                        t.status === 'open'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                          : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                      }`}
                    >
                      {t.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Ticket Messages Detail or New Ticket Modal */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1f1f1f] p-5 flex flex-col min-h-[400px]">
            {creating ? (
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-2">
                  <h3 className="text-xs font-bold text-white uppercase">OPEN NEW SUPPORT TICKET</h3>
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="text-[#888888] hover:text-white"
                  >
                    CANCEL [X]
                  </button>
                </div>

                {error && (
                  <div className="bg-red-950/40 border border-red-800/60 p-2 text-red-400 text-[11px]">
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-[#888888]">SUBJECT / INQUIRY TOPIC</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Order #1002 Balance Dispute"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-[#888888]">DETAILED MESSAGE</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Describe your issue in detail. Full card CVV credentials are automatically redacted for security."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase py-2 text-xs transition"
                >
                  {loading ? 'SUBMITTING TICKET...' : 'SUBMIT SUPPORT TICKET'}
                </button>
              </form>
            ) : selectedTicket ? (
              <div className="flex flex-col h-full space-y-4">
                <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase">{selectedTicket.subject}</h3>
                    <span className="text-[9px] text-[#777777]">Ticket ID: {selectedTicket.id}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                      selectedTicket.status === 'open'
                        ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                        : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-1">
                  {selectedTicket.messages.map((m) => {
                    const isClient = m.senderRole === 'user';
                    return (
                      <div
                        key={m.id}
                        className={`p-3 border space-y-1 ${
                          isClient
                            ? 'bg-[#121212] border-[#222222] ml-4'
                            : 'bg-blue-950/20 border-blue-800/40 mr-4'
                        }`}
                      >
                        <div className="flex justify-between text-[9px] text-[#777777]">
                          <span className={isClient ? 'text-white font-bold' : 'text-blue-400 font-bold'}>
                            {m.senderName} ({m.senderRole.toUpperCase()})
                          </span>
                          <span>{new Date(m.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-[#cbd5e1] whitespace-pre-wrap">{m.content}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="pt-3 border-t border-[#1f1f1f] flex space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="Type your message reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase px-4 py-2 text-xs flex items-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-[#666666] space-y-2">
                <MessageSquare className="w-10 h-10 opacity-30" />
                <p>Select a support ticket from the left column to view message logs, or create a new inquiry.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
