'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '@/lib/audio';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(sound.isEnabled());
  }, []);

  const handleToggle = () => {
    const next = sound.toggle();
    setEnabled(next);
    if (next) {
      sound.playPop();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 flex items-center justify-center transition-all cursor-pointer"
      title={enabled ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Unmute)'}
      aria-label="Toggle Sound Effects"
    >
      {enabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
    </button>
  );
}
