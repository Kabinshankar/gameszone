'use client';

import { UserProfile } from './profile';

export type MultiplayerMessageType = 'CONNECT' | 'MOVE' | 'EMOTE' | 'REMATCH_REQ' | 'REMATCH_ACCEPT' | 'CHAT' | 'SYNC_STATE';

export interface MultiplayerMessage<T = any> {
  type: MultiplayerMessageType;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  payload: T;
  timestamp: number;
}

export interface MultiplayerPeerInfo {
  id: string;
  name: string;
  avatar: string;
  level: number;
  title: string;
}

export interface GameModePreset {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export interface GameMultiplayerSettings {
  modeId: string;
  modeName: string;
  timerSeconds: number; // 0 = unlimited, 10, 15, 30
  rounds: number; // 1, 3, 5
  stake: number; // 0, 50, 100
}

export const GAME_MULTIPLAYER_MODES: Record<string, GameModePreset[]> = {
  'ludo': [
    { id: 'classic', name: 'Classic 4-Tokens', desc: 'First to get all 4 tokens to Home wins the match.', icon: '👑' },
    { id: 'quick', name: 'Quick Rush (1-Token)', desc: 'Fast-paced action: First to get 1 token to Home wins immediately!', icon: '⚡' },
    { id: 'master', name: 'Master Showdown', desc: 'Must capture at least 1 opponent token before entering home lane.', icon: '⚔️' },
  ],
  'tic-tac-toe': [
    { id: '3x3', name: 'Classic 3x3', desc: 'Traditional 3 in a row to win.', icon: '⭕' },
    { id: '4x4', name: 'Grid 4x4 (4 in a row)', desc: 'Expanded 4x4 grid: Connect 4 in a row to win.', icon: '📐' },
    { id: '5x5', name: 'Mega 5x5 (4 in a row)', desc: 'Strategic open arena: 4 in a row victory.', icon: '🌟' },
  ],
  'connect-four': [
    { id: 'classic', name: 'Classic Connect 4', desc: 'Drop discs to connect 4 in a line.', icon: '🔴' },
    { id: 'speed', name: 'Rapid Drop (10s)', desc: 'Fast Blitz mode with 10-second turn limit.', icon: '⚡' },
  ],
  'memory': [
    { id: '12cards', name: '12 Cards (6 Pairs)', desc: 'Quick memory duel.', icon: '🃏' },
    { id: '16cards', name: '16 Cards (8 Pairs)', desc: 'Standard memory arena.', icon: '🧠' },
    { id: '24cards', name: '24 Cards (12 Pairs)', desc: 'Grandmaster challenge for memory masters.', icon: '💎' },
  ],
  'pong': [
    { id: 'first_5', name: 'First to 5 Points', desc: 'Short sprint match.', icon: '🏓' },
    { id: 'first_10', name: 'First to 10 Points', desc: 'Full championship duel.', icon: '🏆' },
    { id: 'hyper', name: 'Hyper Speed Ball', desc: 'Ball accelerates faster with every rally!', icon: '🔥' },
  ],
};

export const DEFAULT_MULTIPLAYER_MODES: GameModePreset[] = [
  { id: 'standard', name: 'Standard Match', desc: 'Standard rules & regular pace.', icon: '🎮' },
  { id: 'blitz', name: 'Blitz Rapid Mode', desc: 'Fast timer & high stakes intensity.', icon: '⚡' },
  { id: 'championship', name: 'Championship Duel', desc: 'Extended rounds for true mastery.', icon: '🏆' },
];

export class MultiplayerRoom {
  private peer: any = null;
  private conn: any = null;
  public roomCode: string = '';
  public isHost: boolean = false;
  public isConnected: boolean = false;
  public opponent: MultiplayerPeerInfo | null = null;
  public settings: GameMultiplayerSettings = {
    modeId: 'standard',
    modeName: 'Standard Match',
    timerSeconds: 30,
    rounds: 3,
    stake: 0,
  };
  private localProfile: UserProfile;
  private onMessageCallback: (msg: MultiplayerMessage) => void;
  private onStatusChangeCallback: (status: 'waiting' | 'connected' | 'disconnected' | 'error', details?: string) => void;

  constructor(
    localProfile: UserProfile,
    onMessage: (msg: MultiplayerMessage) => void,
    onStatusChange: (status: 'waiting' | 'connected' | 'disconnected' | 'error', details?: string) => void,
    initialSettings?: GameMultiplayerSettings
  ) {
    this.localProfile = localProfile;
    this.onMessageCallback = onMessage;
    this.onStatusChangeCallback = onStatusChange;
    if (initialSettings) {
      this.settings = initialSettings;
    }
  }

  // Load PeerJS dynamically on demand
  private async loadPeerJS(): Promise<any> {
    if (typeof window === 'undefined') return null;
    if ((window as any).Peer) return (window as any).Peer;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
      script.async = true;
      script.onload = () => resolve((window as any).Peer);
      script.onerror = () => reject(new Error('Failed to load PeerJS networking library'));
      document.head.appendChild(script);
    });
  }

  // Host: Create a new room with a clean 6-digit room code
  public async hostRoom(gameSlug: string): Promise<string> {
    const PeerClass = await this.loadPeerJS();
    if (!PeerClass) throw new Error('WebRTC not supported');

    // Generate readable code: e.g. "GZ-8274"
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const code = `gz-${gameSlug.slice(0, 3)}-${randomDigits}`;
    this.roomCode = code;
    this.isHost = true;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new PeerClass(code, {
          debug: 1,
        });

        this.peer.on('open', (id: string) => {
          this.roomCode = id;
          this.onStatusChangeCallback('waiting');
          resolve(id);
        });

        this.peer.on('connection', (conn: any) => {
          this.setupConnection(conn);
        });

        this.peer.on('error', (err: any) => {
          console.error('PeerJS Host Error:', err);
          this.onStatusChangeCallback('error', err?.type || 'Connection error');
          reject(err);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  // Guest: Join an existing room using Room Code
  public async joinRoom(roomCode: string): Promise<void> {
    const PeerClass = await this.loadPeerJS();
    if (!PeerClass) throw new Error('WebRTC not supported');

    this.roomCode = roomCode.trim().toLowerCase();
    this.isHost = false;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new PeerClass({
          debug: 1,
        });

        this.peer.on('open', () => {
          const conn = this.peer.connect(this.roomCode, {
            reliable: true,
          });

          this.setupConnection(conn);
          resolve();
        });

        this.peer.on('error', (err: any) => {
          console.error('PeerJS Join Error:', err);
          this.onStatusChangeCallback('error', 'Room not found or host disconnected.');
          reject(err);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private setupConnection(conn: any) {
    this.conn = conn;

    conn.on('open', () => {
      this.isConnected = true;
      // Send self profile handshake + room settings if host
      this.sendMessage('CONNECT', {
        id: this.localProfile.id,
        name: this.localProfile.username,
        avatar: this.localProfile.avatar,
        level: this.localProfile.level,
        title: this.localProfile.title,
        settings: this.isHost ? this.settings : undefined,
      });

      this.onStatusChangeCallback('connected');
    });

    conn.on('data', (data: MultiplayerMessage) => {
      if (!data || !data.type) return;

      if (data.type === 'CONNECT') {
        const payload = data.payload;
        this.opponent = {
          id: payload.id,
          name: payload.name,
          avatar: payload.avatar,
          level: payload.level,
          title: payload.title,
        };
        if (payload.settings) {
          this.settings = payload.settings;
        }
        this.onStatusChangeCallback('connected', `Playing with ${this.opponent.name}`);
      }

      this.onMessageCallback(data);
    });

    conn.on('close', () => {
      this.isConnected = false;
      this.opponent = null;
      this.onStatusChangeCallback('disconnected', 'Opponent disconnected.');
    });

    conn.on('error', (err: any) => {
      console.error('Connection error:', err);
      this.onStatusChangeCallback('error', 'Connection interrupted.');
    });
  }

  // Send move payload to opponent
  public sendMove(payload: any) {
    this.sendMessage('MOVE', payload);
  }

  // Send emote
  public sendEmote(emoji: string) {
    this.sendMessage('EMOTE', { emoji });
  }

  // Send rematch
  public sendRematchRequest() {
    this.sendMessage('REMATCH_REQ', {});
  }

  public sendRematchAccept() {
    this.sendMessage('REMATCH_ACCEPT', {});
  }

  // Generic message dispatcher
  private sendMessage(type: MultiplayerMessageType, payload: any) {
    if (!this.conn || !this.isConnected) return;
    const msg: MultiplayerMessage = {
      type,
      senderId: this.localProfile.id,
      senderName: this.localProfile.username,
      senderAvatar: this.localProfile.avatar,
      payload,
      timestamp: Date.now(),
    };
    try {
      this.conn.send(msg);
    } catch (e) {
      console.error('Failed to send WebRTC message:', e);
    }
  }

  // Close & Clean Up
  public destroy() {
    if (this.conn) {
      try { this.conn.close(); } catch {}
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch {}
    }
    this.isConnected = false;
    this.opponent = null;
  }
}
