import React from 'react';
import GameCanvas from './components/GameCanvas';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
          <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            NEURAL NETWORK DEFENSE // v1.0.0
          </h1>
        </div>
        <div className="text-xs text-slate-500 bg-slate-950 px-3 py-1 rounded border border-slate-800">
          SECURE SECTOR 01 // PROMPT_ACTIVE
        </div>
      </header>

      {/* Main Framework Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Top Operational Alert bar */}
        <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-4 flex gap-4 items-center">
          <div className="text-2xl text-cyan-400">⚠️</div>
          <div>
            <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest">System Warning Status</div>
            <div className="text-slate-400 text-sm">Threat signatures imminent. Deploy defensive subroutines immediately to secure the data core matrix.</div>
          </div>
        </div>

        {/* The Live Engine Window */}
        <GameCanvas />

        {/* Lower Diagnostic Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-lg">
            <span className="text-cyan-400 font-bold block mb-1">■ SYSTEM SPECS</span>
            Vector Engine: HTML5 Canvas Context 2D<br />
            State Management: React Hooks Framework<br />
            Styling Engine: Tailwind CSS v4 Architecture
          </div>
          <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-lg">
            <span className="text-emerald-400 font-bold block mb-1">■ AI COM_LINK DATA</span>
            Status: Synchronized with Director Agent<br />
            Traces: Active logging enabled inside /ai_workspace_logs<br />
            Strategy: High-frequency operational commits active.
          </div>
        </div>
      </main>
    </div>
  );
}