'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Coins,
  Trophy,
  Lock,
  Search,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Crown,
} from 'lucide-react';
import Container from '@/components/Container';
import {
  getCurrentProfile,
  loginAccount,
  getAllUsersDecrypted,
  adminGrantCoins,
  adminDeleteUser,
  UserProfile,
  SHOP_AVATARS,
} from '@/lib/profile';
import { sound } from '@/lib/audio';

export default function AdminPage() {
  const [profile, setProfile] = useState<UserProfile>(getCurrentProfile());
  const [adminAuth, setAdminAuth] = useState(profile.role === 'admin');
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [grantAmount, setGrantAmount] = useState(500);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (profile.role === 'admin') {
      setAdminAuth(true);
      loadUsers();
    }
  }, [profile.role]);

  const loadUsers = async () => {
    const list = await getAllUsersDecrypted();
    setUsers(list);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const res = await loginAccount(adminUser, adminPass);
    if (res.success && res.profile?.role === 'admin') {
      sound.playWin();
      setProfile(res.profile);
      setAdminAuth(true);
      loadUsers();
    } else {
      sound.playLose();
      setLoginError(res.success ? 'Account is not an administrator.' : res.message);
    }
  };

  const handleGrant = async (username: string) => {
    const ok = await adminGrantCoins(username, grantAmount);
    if (ok) {
      sound.playScore();
      setFeedback(`Granted +${grantAmount} 🪙 to ${username}!`);
      loadUsers();
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const handleDelete = (username: string) => {
    if (confirm(`Are you sure you want to delete user "${username}" from the database?`)) {
      const ok = adminDeleteUser(username);
      if (ok) {
        sound.playPop();
        setFeedback(`Deleted user ${username}.`);
        loadUsers();
        setTimeout(() => setFeedback(null), 2500);
      }
    }
  };

  // Filtered user list
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCoins = users.reduce((acc, u) => acc + u.coins, 0);
  const totalMatches = users.reduce((acc, u) => acc + u.totalGames, 0);
  const totalWins = users.reduce((acc, u) => acc + u.wins, 0);

  // ── ADMIN LOGIN GATE ─────────────────────────────────────────────
  if (!adminAuth) {
    return (
      <Container className="py-20 flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#121218] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-xs text-zinc-400 mt-1 mb-6">
            Enter master administrator credentials to access the encrypted user database and platform controls.
          </p>

          {loginError && (
            <div className="w-full mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="w-full flex flex-col gap-4 text-left">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Admin Username
              </label>
              <input
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Admin Password
              </label>
              <input
                type="password"
                placeholder="Default: admin123"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Authenticate as Admin
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-xs text-zinc-500">
            Default credentials: <strong className="text-zinc-300">admin</strong> / <strong className="text-zinc-300">admin123</strong>
          </div>
        </div>
      </Container>
    );
  }

  // ── ADMIN DASHBOARD ──────────────────────────────────────────────
  return (
    <Container className="py-12 sm:py-16 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121218] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-500/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Nexvara Administrator</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider">
                Root Admin
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Securely managing encrypted user accounts, coin distribution, and matchmaking economy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={loadUsers}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
          <Link
            href="/shop"
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2"
          >
            <Coins className="w-4 h-4" /> Shop (🪙 {profile.coins})
          </Link>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#14141c] border border-white/10 flex flex-col gap-1 shadow-md">
          <span className="text-xs text-zinc-400 font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" /> Registered Users
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono">
            {users.length}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#14141c] border border-white/10 flex flex-col gap-1 shadow-md">
          <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" /> Coin Circulation
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
            {totalCoins.toLocaleString()} 🪙
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#14141c] border border-white/10 flex flex-col gap-1 shadow-md">
          <span className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-cyan-400" /> Total Matches
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalMatches}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#14141c] border border-white/10 flex flex-col gap-1 shadow-md">
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Database Security
          </span>
          <span className="text-sm font-black text-emerald-300">
            AES-GCM / SHA-256
          </span>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
          <Check className="w-4 h-4" /> {feedback}
        </div>
      )}

      {/* Encrypted Users Table Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121218] border border-white/10 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> User Database & Coin Manager
            </h2>
            <p className="text-xs text-zinc-400">
              Personal information and profiles are encrypted using AES-256 standard encryption.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex items-center flex-1 sm:w-64">
              <Search className="absolute left-3 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Grant Amount Selector */}
            <select
              value={grantAmount}
              onChange={(e) => setGrantAmount(Number(e.target.value))}
              className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
            >
              <option value={100}>+100 🪙</option>
              <option value={500}>+500 🪙</option>
              <option value={1000}>+1,000 🪙</option>
              <option value={5000}>+5,000 🪙</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300 border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Player</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Level</th>
                <th className="py-3 px-3">Coins Balance</th>
                <th className="py-3 px-3">Wins / Games</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => {
                const avatarIcon = SHOP_AVATARS.find((a) => a.id === u.avatar)?.icon || '🎮';
                const isMasterAdmin = u.username.toLowerCase() === 'admin';

                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1 bg-white/5 rounded-lg border border-white/5">{avatarIcon}</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            {u.username}
                            {isMasterAdmin && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">{u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-zinc-800 text-zinc-300 border border-white/10'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-indigo-400">
                      Lvl {u.level}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                      {u.coins.toLocaleString()} 🪙
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-emerald-400 font-bold">{u.wins}</span> / <span className="text-zinc-400">{u.totalGames}</span>
                    </td>

                    <td className="py-3.5 px-3 text-zinc-500 text-[10px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGrant(u.username)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title={`Add ${grantAmount} coins`}
                        >
                          <Plus className="w-3 h-3" /> {grantAmount} 🪙
                        </button>

                        {!isMasterAdmin && (
                          <button
                            onClick={() => handleDelete(u.username)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-pointer transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
