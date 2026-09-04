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

export class MultiplayerRoom {
  private peer: any = null;
  private conn: any = null;
  public roomCode: string = '';
  public isHost: boolean = false;
  public isConnected: boolean = false;
  public opponent: MultiplayerPeerInfo | null = null;
  private localProfile: UserProfile;
  private onMessageCallback: (msg: MultiplayerMessage) => void;
  private onStatusChangeCallback: (status: 'waiting' | 'connected' | 'disconnected' | 'error', details?: string) => void;

  constructor(
    localProfile: UserProfile,
    onMessage: (msg: MultiplayerMessage) => void,
    onStatusChange: (status: 'waiting' | 'connected' | 'disconnected' | 'error', details?: string) => void
  ) {
    this.localProfile = localProfile;
    this.onMessageCallback = onMessage;
    this.onStatusChangeCallback = onStatusChange;
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
      // Send self profile handshake
      this.sendMessage('CONNECT', {
        id: this.localProfile.id,
        name: this.localProfile.username,
        avatar: this.localProfile.avatar,
        level: this.localProfile.level,
        title: this.localProfile.title,
      });

      this.onStatusChangeCallback('connected');
    });

    conn.on('data', (data: MultiplayerMessage) => {
      if (!data || !data.type) return;

      if (data.type === 'CONNECT') {
        this.opponent = data.payload as MultiplayerPeerInfo;
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
