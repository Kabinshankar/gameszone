import Link from 'next/link';
import { FileText, ShieldAlert, CheckCircle, Scale } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service — Nexvara',
  description: 'Terms of service and usage guidelines for Nexvara free web gaming platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8 text-gray-300">
      
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
          <Scale className="w-4 h-4" /> Legal Terms
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">Terms of Service</h1>
        <p className="text-xs text-gray-500">Last updated: September 3, 2026</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-purple-400" /> 1. Agreement to Terms
        </h2>
        <p className="text-sm leading-relaxed">
          By accessing or using Nexvara, you agree to be bound by these Terms of Service. If you do not agree to all terms, please discontinue using the website.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" /> 2. Website & Game Usage
        </h2>
        <p className="text-sm leading-relaxed">
          Nexvara provides browser-based games for personal, non-commercial entertainment. You agree not to attempt to modify, decompile, reverse engineer, or exploit any game code or website assets without explicit authorization.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" /> 3. Intellectual Property
        </h2>
        <p className="text-sm leading-relaxed">
          All original game graphics, brand identities, code, logos, and website layouts are owned by Nexvara. All third-party game concepts are implemented as independent original works or open-source adaptations under appropriate permissions.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-rose-400" /> 4. Disclaimer & Limitation of Liability
        </h2>
        <p className="text-sm leading-relaxed">
          Nexvara and its games are provided "as is" without warranty of any kind. We do not guarantee uninterrupted access or error-free gameplay. Under no circumstances shall Nexvara be liable for any damages arising from your use of the website.
        </p>
      </section>

    </div>
  );
}
