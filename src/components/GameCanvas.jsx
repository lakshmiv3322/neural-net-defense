import React, { useEffect, useRef, useState } from 'react';

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [networkStability, setNetworkStability] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas resolution to match its displayed size
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Core Game State Variables
    const coreX = canvas.width / 2;
    const coreY = canvas.height / 2;
    let pulseRadius = 40;
    let pulseDirection = 1;

    // --- MAIN GAME LOOP ---
    const renderLoop = () => {
      // 1. Clear Screen with dark synthwave background trail
      ctx.fillStyle = 'rgba(10, 15, 30, 0.3)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Render Grid Background for high-tech aesthetic
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // 3. Update & Draw Central AI Core (Pulsing Effect)
      pulseRadius += 0.2 * pulseDirection;
      if (pulseRadius > 45 || pulseRadius < 35) pulseDirection *= -1;

      // Glow effect for Core
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#06b6d4';

      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0891b2';
      ctx.fill();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Reset shadow blur so it doesn't slow down rendering other items
      ctx.shadowBlur = 0;

      // Request next frame animation
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // Cleanup loop on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="relative w-full h-[70vh] bg-slate-900/50 border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)]">
      {/* UI Stat Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none font-mono text-sm z-10">
        <div className="bg-slate-950/80 border border-cyan-500/20 px-3 py-1.5 rounded text-cyan-400">
          CORE STABILITY: <span className="text-emerald-400 font-bold">{networkStability}%</span>
        </div>
        <div className="bg-slate-950/80 border border-cyan-500/20 px-3 py-1.5 rounded text-cyan-400">
          DATA SYNCED: <span className="text-amber-400 font-bold">{score} KB</span>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}