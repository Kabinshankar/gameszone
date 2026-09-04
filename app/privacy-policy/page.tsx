import Link from 'next/link';
import { Shield, Lock, Eye, Cookie, FileText } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — GamesZone',
  description: 'Privacy policy for GamesZone, covering data usage, cookies, local storage, and Google AdSense advertising.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8 text-gray-300">
      
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
          <Shield className="w-4 h-4" /> Legal & Transparency
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-gray-500">Last updated: September 3, 2026</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-400" /> 1. Overview
        </h2>
        <p className="text-sm leading-relaxed">
          Welcome to GamesZone ("we", "our", "us"). We are committed to protecting your privacy while you enjoy our free web browser games. This Privacy Policy explains how information is collected, used, and safeguarded when you visit our website.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-cyan-400" /> 2. Data Collection & Local Storage
        </h2>
        <p className="text-sm leading-relaxed">
          GamesZone does not require user registration, accounts, or personal data submission (such as name or email) to play any of our games.
        </p>
        <p className="text-sm leading-relaxed">
          We use browser <code className="bg-white/10 px-2 py-0.5 rounded text-purple-300">localStorage</code> exclusively on your device to store game state information, such as:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 pl-4">
          <li>Game high scores and stats</li>
          <li>Your list of favorited games</li>
          <li>Recently played games</li>
          <li>Your preferred site theme (dark/light)</li>
        </ul>
        <p className="text-sm leading-relaxed">
          This data remains stored locally in your own web browser and is never transmitted to or stored on external servers.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cookie className="w-5 h-5 text-amber-400" /> 3. Advertising & Google AdSense
        </h2>
        <p className="text-sm leading-relaxed">
          GamesZone serves advertisements provided by third-party vendor networks, including Google AdSense, to support our free gaming platform.
        </p>
        <ul className="list-disc list-inside text-sm space-y-2 pl-4">
          <li>
            Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites.
          </li>
          <li>
            Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to our site and/or other sites on the Internet.
          </li>
          <li>
            Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Google Ad Settings</a> or <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">www.aboutads.info</a>.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" /> 4. Analytics & Cookies
        </h2>
        <p className="text-sm leading-relaxed">
          We may use basic non-identifiable web analytics to measure general audience metrics (such as page views and popular game titles). These analytics do not track personal identifying information.
        </p>
      </section>

      <section className="flex flex-col gap-4 pt-6 border-t border-white/10">
        <h2 className="text-xl font-bold text-white">5. Contact Information</h2>
        <p className="text-sm leading-relaxed">
          If you have any questions or feedback regarding this Privacy Policy, please visit our <Link href="/contact" className="text-purple-400 underline">Contact Page</Link>.
        </p>
      </section>

    </div>
  );
}
