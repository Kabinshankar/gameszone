'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Users, Sparkles, Loader2, Link2, ArrowRight, Wifi } from 'lucide-react';
import { MultiplayerRoom, MultiplayerMessage } from '@/lib/multiplayer';
import { getCurrentProfile, SHOP_AVATARS } from '@/lib/profile';

interface MultiplayerModalProps {
  isOpen: boolean;
  gameSlug: string;
  gameName: string;
  onClose: () => void;
  onConnected: (room: MultiplayerRoom) => void;
}

export default function MultiplayerModal({
  isOpen,
  gameSlug,
  gameName,
  onClose,
  onConnected,
}: MultiplayerModalProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'creating' | 'waiting' | 'joining' | 'connected' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [activeRoom, setActiveRoom] = useState<MultiplayerRoom | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (activeRoom && status !== 'connected') {
        activeRoom.destroy();
        setActiveRoom(null);
      }
      setStatus('idle');
      setStatusMsg('');
    }
  }, [isOpen, activeRoom, status]);

  if (!isOpen) return null;

  const profile = getCurrentProfile();
  const currentAvatar = SHOP_AVATARS.find((a) => a.id === profile.avatar) || SHOP_AVATARS[0];

  const handleCreateRoom = async () => {
    setStatus('creating');
    setStatusMsg('Initializing online game room...');

    try {
      const room = new MultiplayerRoom(
        profile,
        (msg: MultiplayerMessage) => {
          // Pass messages to active listener
        },
        (roomStatus, details) => {
          if (roomStatus === 'waiting') {
            setStatus('waiting');
            setStatusMsg('Waiting for friend to join with code...');
          } else if (roomStatus === 'connected') {
            setStatus('connected');
            setStatusMsg(details || 'Opponent connected! Starting game...');
            setTimeout(() => {
              onConnected(room);
              onClose();
            }, 1000);
          } else if (roomStatus === 'error') {
            setStatus('error');
            setStatusMsg(details || 'Connection failed.');
          }
        }
      );

      setActiveRoom(room);
      await room.hostRoom(gameSlug);
    } catch (err: any) {
      setStatus('error');
      setStatusMsg(err?.message || 'Could not create room.');
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim()) {
      setStatus('error');
      setStatusMsg('Please enter a valid room code.');
      return;
    }

    setStatus('joining');
    setStatusMsg(`Connecting to room ${roomCodeInput.toUpperCase()}...`);

    try {
      const room = new MultiplayerRoom(
        profile,
        () => {},
        (roomStatus, details) => {
          if (roomStatus === 'connected') {
            setStatus('connected');
            setStatusMsg(details || 'Connected to Host! Starting game...');
            setTimeout(() => {
              onConnected(room);
              onClose();
            }, 1000);
          } else if (roomStatus === 'error') {
            setStatus('error');
            setStatusMsg(details || 'Room not found or disconnected.');
          }
        }
      );

      setActiveRoom(room);
      await room.joinRoom(roomCodeInput.trim());
    } catch (err: any) {
      setStatus('error');
      setStatusMsg(err?.message || 'Failed to connect.');
    }
  };

  const copyInviteLink = () => {
    if (!activeRoom?.roomCode) return;
    const url = `${window.location.origin}/games/${gameSlug}?room=${activeRoom.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#121218] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-600/20 rounded-full blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 mb-2">
            <Wifi className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Play {gameName} Online
          </h3>
          <p className="text-xs text-zinc-400">
            Real-time cross-device multiplayer across mobile, tablet, and PC.
          </p>
        </div>

        {/* Active Player Card */}
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl">
              {currentAvatar.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">{profile.username}</span>
              <span className="text-[10px] text-indigo-400 font-semibold">Level {profile.level} Player</span>
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            🪙 {profile.coins}
          </span>
        </div>

        {/* Mode Tabs */}
        {status === 'idle' && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/5 mb-6">
            <button
              onClick={() => { setTab('create'); setStatus('idle'); }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                tab === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Room (Host)
            </button>
            <button
              onClick={() => { setTab('join'); setStatus('idle'); }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                tab === 'join' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Join Room Code
            </button>
          </div>
        )}

        {/* CREATE ROOM FLOW */}
        {tab === 'create' && (
          <div>
            {status === 'idle' && (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-zinc-300 leading-relaxed">
                  Click below to generate a unique room code. Share the code or invite link with your friend on any device to play together instantly!
                </div>
                <button
                  onClick={handleCreateRoom}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                >
                  <Sparkles className="w-4 h-4" /> Create Room Code
                </button>
              </div>
            )}

            {(status === 'creating' || status === 'waiting') && activeRoom && (
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                  Your Room Code:
                </div>

                {/* Big Code Pill */}
                <div className="px-6 py-3 rounded-2xl bg-indigo-500/15 border-2 border-indigo-500/40 text-2xl font-mono font-black text-indigo-300 tracking-widest shadow-lg">
                  {activeRoom.roomCode.toUpperCase()}
                </div>

                {/* Waiting Spinner */}
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  {statusMsg}
                </div>

                {/* Copy Buttons */}
                <div className="grid grid-cols-2 gap-2 w-full pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeRoom.roomCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Code
                  </button>
                  <button
                    onClick={copyInviteLink}
                    className="h-10 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-bold text-indigo-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Copy Invite Link
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* JOIN ROOM FLOW */}
        {tab === 'join' && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Enter Room Code
              </label>
              <input
                type="text"
                placeholder="e.g. gz-tic-4921"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-center text-lg font-bold uppercase tracking-wider focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={status === 'joining'}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 disabled:opacity-50"
            >
              {status === 'joining' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
                </>
              ) : (
                <>
                  Join Match <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Connected Success Message */}
        {status === 'connected' && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> {statusMsg}
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}
