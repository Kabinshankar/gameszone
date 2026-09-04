'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Users, Sparkles, Loader2, Link2, ArrowRight, Wifi, Trophy, Clock, Flame, Coins, Shield } from 'lucide-react';
import { MultiplayerRoom, MultiplayerMessage, GAME_MULTIPLAYER_MODES, DEFAULT_MULTIPLAYER_MODES, GameMultiplayerSettings } from '@/lib/multiplayer';
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

  // Game Mode Options for this specific game
  const availableModes = GAME_MULTIPLAYER_MODES[gameSlug] || DEFAULT_MULTIPLAYER_MODES;
  const [selectedModeId, setSelectedModeId] = useState<string>(availableModes[0]?.id || 'standard');
  const [selectedTimer, setSelectedTimer] = useState<number>(30); // 15s, 30s, 0 (unlimited)
  const [selectedRounds, setSelectedRounds] = useState<number>(3); // 1, 3, 5
  const [selectedStake, setSelectedStake] = useState<number>(0); // 0, 50, 100

  useEffect(() => {
    if (availableModes[0]?.id) {
      setSelectedModeId(availableModes[0].id);
    }
  }, [gameSlug]);

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
  const activeModeObj = availableModes.find((m) => m.id === selectedModeId) || availableModes[0];

  const handleCreateRoom = async () => {
    setStatus('creating');
    setStatusMsg('Initializing online game room with custom rules...');

    const settings: GameMultiplayerSettings = {
      modeId: selectedModeId,
      modeName: activeModeObj.name,
      timerSeconds: selectedTimer,
      rounds: selectedRounds,
      stake: selectedStake,
    };

    try {
      const room = new MultiplayerRoom(
        profile,
        (msg: MultiplayerMessage) => {},
        (roomStatus, details) => {
          if (roomStatus === 'waiting') {
            setStatus('waiting');
            setStatusMsg('Waiting for friend to join with code...');
          } else if (roomStatus === 'connected') {
            setStatus('connected');
            setStatusMsg(details || 'Opponent connected! Starting match...');
            setTimeout(() => {
              onConnected(room);
              onClose();
            }, 1000);
          } else if (roomStatus === 'error') {
            setStatus('error');
            setStatusMsg(details || 'Connection failed.');
          }
        },
        settings
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
            setStatusMsg(details || 'Connected to Host! Starting match...');
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#121218] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
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
        <div className="flex flex-col items-center text-center gap-1 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 mb-1">
            <Wifi className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Play {gameName} Online
          </h3>
          <p className="text-xs text-zinc-400">
            Real-time cross-device multiplayer across mobile, tablet, and PC.
          </p>
        </div>

        {/* Active Player Card */}
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">
              {currentAvatar.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">{profile.username}</span>
              <span className="text-[10px] text-indigo-400 font-semibold">Level {profile.level} Player</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            🪙 {profile.coins} Coins
          </span>
        </div>

        {/* Mode Tabs */}
        {status === 'idle' && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/5 mb-5">
            <button
              onClick={() => { setTab('create'); setStatus('idle'); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Room (Host)
            </button>
            <button
              onClick={() => { setTab('join'); setStatus('idle'); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                
                {/* 1. Game Specific Modes */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-indigo-400" /> Game Mode & Rules:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {availableModes.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModeId(m.id)}
                        className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          selectedModeId === m.id
                            ? 'bg-indigo-600/25 border-indigo-400 shadow-md ring-1 ring-indigo-400'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-base">
                          <span>{m.icon}</span>
                          <span className="text-xs font-bold text-white truncate">{m.name}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {m.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Match Length (Rounds) & Turn Timer */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Rounds */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" /> Match Format
                    </label>
                    <div className="grid grid-cols-3 p-1 rounded-xl bg-white/5 border border-white/10">
                      {[1, 3, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSelectedRounds(r)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedRounds === r
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Bo{r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Turn Timer */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> Turn Timer
                    </label>
                    <div className="grid grid-cols-3 p-1 rounded-xl bg-white/5 border border-white/10">
                      {[
                        { sec: 15, label: '15s' },
                        { sec: 30, label: '30s' },
                        { sec: 0, label: '∞' },
                      ].map((t) => (
                        <button
                          key={t.sec}
                          type="button"
                          onClick={() => setSelectedTimer(t.sec)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedTimer === t.sec
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Coin Stakes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" /> Coin Wager (Winner Takes Pot):
                  </label>
                  <div className="grid grid-cols-3 p-1 rounded-2xl bg-white/5 border border-white/10">
                    {[
                      { stake: 0, label: 'Casual (0 🪙)' },
                      { stake: 50, label: '50 🪙 Pot' },
                      { stake: 100, label: '100 🪙 Pot' },
                    ].map((s) => (
                      <button
                        key={s.stake}
                        type="button"
                        onClick={() => setSelectedStake(s.stake)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedStake === s.stake
                            ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateRoom}
                  className="w-full h-12 mt-1 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                >
                  <Sparkles className="w-4 h-4" /> Create Custom Room & Get Code
                </button>
              </div>
            )}

            {(status === 'creating' || status === 'waiting') && activeRoom && (
              <div className="flex flex-col items-center gap-5 text-center">
                {/* Active Match Rules Card */}
                <div className="w-full p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-around text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Game Mode</span>
                    <span className="font-bold text-white">{activeModeObj.name}</span>
                  </div>
                  <div className="w-[1px] h-6 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Format</span>
                    <span className="font-bold text-indigo-300">Best of {selectedRounds}</span>
                  </div>
                  <div className="w-[1px] h-6 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Prize Pool</span>
                    <span className="font-bold text-amber-300">{selectedStake > 0 ? `${selectedStake * 2} 🪙` : 'Free +50 🪙'}</span>
                  </div>
                </div>

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
                <div className="grid grid-cols-2 gap-2 w-full pt-1">
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
                placeholder="e.g. gz-lud-4921"
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Connecting to Room...
                </>
              ) : (
                <>
                  Join Room & Sync Rules <ArrowRight className="w-4 h-4" />
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
