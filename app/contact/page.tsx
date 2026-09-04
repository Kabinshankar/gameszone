'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, User } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2 text-center items-center">
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Mail className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Touch</span>
        </h1>
        <p className="text-sm text-gray-400 max-w-md">
          Have game suggestions, bug reports, or partnership inquiries? Send us a message!
        </p>
      </div>

      {/* Form Card */}
      <div className="p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
        {submitted ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Message Received!</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Thank you for contacting GamesZone. We appreciate your feedback and will review your message soon.
            </p>
            <button
              onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', message: '' }); }}
              className="px-6 py-2.5 rounded-xl font-bold bg-white/10 text-white text-xs hover:bg-white/20 mt-2"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-purple-400" /> Your Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-cyan-400" /> Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-400" /> Message
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your feedback, bug report, or game request here..."
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-base"
            >
              <Send className="w-5 h-5" /> Send Message
            </button>

          </form>
        )}
      </div>

    </div>
  );
}
