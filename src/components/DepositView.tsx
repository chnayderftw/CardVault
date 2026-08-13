import React, { useState } from 'react';
import {
  Wallet,
  Zap,
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { Deposit, SiteSettings, User } from '../types';
import { api } from '../lib/api';

interface DepositViewProps {
  user: User | null;
  deposits: Deposit[];
  settings: SiteSettings;
  onRefreshDeposits: () => void;
  onOpenAuth: () => void;
}

export const DepositView: React.FC<DepositViewProps> = ({
  user,
  deposits,
  settings,
  onRefreshDeposits,
  onOpenAuth
}) => {
  const [amount, setAmount] = useState('100');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const num = parseFloat(amount);
      if (isNaN(num) || num < settings.minDeposit) {
        setError(`Minimum deposit amount is $${settings.minDeposit.toFixed(2)} USDT.`);
        setLoading(false);
        return;
      }

      await api.createDeposit(num, txHash);
      setMessage('Deposit request submitted successfully! Pending TRON blockchain & admin verification.');
      setTxHash('');
      onRefreshDeposits();
    } catch (err: any) {
      setError(err.message || 'Failed to submit deposit.');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(settings.trc20WalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#0a0a0a] p-4 border border-[#1f1f1f] gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase text-white tracking-wider flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-yellow-500" />
            <span>USDT TRC20 ACCOUNT BALANCE TOP-UP</span>
          </h2>
          <p className="text-[10px] text-[#777777] mt-0.5">
            Deposit USDT over the TRON (TRC20) network to credit your marketplace wallet balance instantly.
          </p>
        </div>

        {user && (
          <div className="bg-[#121212] border border-[#222222] p-2.5 flex items-center space-x-4">
            <div>
              <span className="text-[8px] uppercase text-[#777777] block">CURRENT BALANCE</span>
              <span className="text-base font-bold text-yellow-500">
                ${user.balance.toFixed(2)} <span className="text-blue-400 text-xs">USDT</span>
              </span>
            </div>
            <div className="text-[9px] text-[#666666] border-l border-[#222222] pl-3">
              1 USDT = $1.00 USD
            </div>
          </div>
        )}
      </div>

      {!user ? (
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-8 text-center space-y-3">
          <p className="text-[#888888]">Please sign in or register an account to access the TRC20 deposit terminal.</p>
          <button
            onClick={onOpenAuth}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase py-2 px-6 text-xs"
          >
            SIGN IN TO DEPOSIT
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deposit Form & Wallet Info */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1f1f1f] p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase border-b border-[#1f1f1f] pb-2 flex items-center justify-between">
              <span>STEP 1: TRON (TRC20) MERCHANT WALLET</span>
              <span className="text-blue-400 text-[10px]">MIN DEPOSIT: ${settings.minDeposit} USDT</span>
            </h3>

            {error && (
              <div className="bg-red-950/40 border border-red-800/60 p-2.5 text-red-400 text-[11px]">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-2.5 text-emerald-300 text-[11px]">
                {message}
              </div>
            )}

            {/* Wallet Address & QR Display */}
            <div className="bg-[#121212] border border-[#222222] p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="w-28 h-28 bg-white p-1 flex items-center justify-center text-black flex-shrink-0">
                <QrCode className="w-24 h-24 text-black" />
              </div>

              <div className="space-y-3 flex-1 w-full">
                <div>
                  <span className="text-[9px] text-[#777777] block uppercase">NETWORK PROTOCOL</span>
                  <span className="text-white font-bold text-xs">TRON Blockchain (TRC20)</span>
                </div>

                <div>
                  <span className="text-[9px] text-[#777777] block uppercase">DEPOSIT WALLET ADDRESS</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={settings.trc20WalletAddress}
                      className="bg-[#050505] border border-[#2a2a2a] p-2 text-xs text-yellow-400 font-mono w-full"
                    />
                    <button
                      onClick={copyAddress}
                      className="bg-[#202020] border border-[#303030] p-2 text-white hover:bg-blue-600 transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copied && <span className="text-[9px] text-emerald-400">Copied to clipboard!</span>}
                </div>
              </div>
            </div>

            {/* Deposit Submission Form */}
            <form onSubmit={handleSubmitDeposit} className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-white uppercase border-b border-[#1f1f1f] pb-2">
                STEP 2: SUBMIT TRANSACTION DETAILS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-[#888888]">DEPOSIT AMOUNT (USDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={settings.minDeposit}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2a2a2a] p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-[#888888]">TRON TXHASH / TRANSACTION ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3a12b34c56d78e90..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2a2a2a] p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-bold uppercase py-2.5 text-xs tracking-wider transition"
              >
                {loading ? 'SUBMITTING DEPOSIT...' : 'SUBMIT DEPOSIT FOR VERIFICATION'}
              </button>
            </form>
          </div>

          {/* Quick Notice Panel */}
          <div className="space-y-4">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-4 space-y-3">
              <h4 className="text-xs font-bold text-yellow-500 uppercase flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>DEPOSIT PROTOCOL RULES</span>
              </h4>

              <ul className="space-y-2 text-[10px] text-[#888888] leading-relaxed">
                <li className="flex items-start space-x-1.5">
                  <span className="text-blue-400">•</span>
                  <span>Send ONLY USDT via TRC20 (TRON). Sending other tokens will result in permanent loss.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-blue-400">•</span>
                  <span>Deposits require 19 TRON network block confirmations before auto-crediting.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-blue-400">•</span>
                  <span>Ensure your transaction hash is submitted accurately for automated tracking.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Deposit History Table */}
      {user && (
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] overflow-hidden">
          <div className="p-3 bg-[#111111] border-b border-[#1f1f1f] font-bold text-white uppercase text-xs">
            CLIENT DEPOSIT HISTORY LOGS
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#cbd5e1]">
              <thead>
                <tr className="bg-[#151515] text-[#777777] border-b border-[#1f1f1f] uppercase font-bold text-[9px]">
                  <th className="py-2.5 px-3">DEPOSIT ID</th>
                  <th className="py-2.5 px-3">DATE</th>
                  <th className="py-2.5 px-3">AMOUNT</th>
                  <th className="py-2.5 px-3">NETWORK</th>
                  <th className="py-2.5 px-3">TXHASH</th>
                  <th className="py-2.5 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#666666]">
                      No deposit records submitted yet.
                    </td>
                  </tr>
                ) : (
                  deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-[#111111] transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{d.id}</td>
                      <td className="py-2.5 px-3 text-[#777777]">{new Date(d.createdAt).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-bold text-yellow-500">${d.amount.toFixed(2)} USDT</td>
                      <td className="py-2.5 px-3 text-[#aaa]">TRC20</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-[#777777] truncate max-w-[120px]">
                        {d.txHash}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                            d.status === 'approved'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                              : d.status === 'pending'
                              ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                              : 'bg-red-950/40 text-red-400 border-red-800/40'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
