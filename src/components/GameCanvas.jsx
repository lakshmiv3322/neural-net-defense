import React, { useEffect, useRef, useState } from 'react';

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [networkStability, setNetworkStability] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // --- Core Architecture coordinates ---
    let coreX = canvas.width / 2;
    let coreY = canvas.height / 2;
    let coreRadius = 40;
    let pulseRadius = 40;
    let pulseDirection = 1;

    // --- Threat System Data Structures ---
    let enemies = [];
    let spawnTimer = 0;
    const spawnInterval = 60; // Spawn a new threat roughly every 1 second (60 frames)

    // Helper function to spawn a threat along the outer perimeter
    const spawnThreat = () => {
      const types = [
        { name: 'Hallucination', color: '#c084fc', speed: 2.2, health: 1, radius: 6 },
        { name: 'Data Bias', color: '#f87171', speed: 1.0, health: 3, radius: 12 }
      ];
      
      // Randomly choose type (70% Hallucinations, 30% Data Bias)
      const type = Math.random() < 0.7 ? types[0] : types[1];

      // Select a random side of the screen boundary to enter from
      let x, y;
      const angle = Math.random() * Math.PI * 2;
      
      // Spawn just outside the visual boundaries
      x = coreX + Math.cos(angle) * (Math.max(canvas.width, canvas.height) * 0.6);
      y = coreY + Math.sin(angle) * (Math.max(canvas.width, canvas.height) * 0.6);

      enemies.push({
        x,
        y,
        ...type,
        id: Math.random().toString(36).substr(2, 9)
      });
    };

    // --- MAIN CORE GAME RENDER FRAME ---
    const renderLoop = () => {
      // Recalculate center coordinates dynamic resize security
      coreX = canvas.width / 2;
      coreY = canvas.height / 2;

      // 1. Clear Viewport with sleek vector background trailing
      ctx.fillStyle = 'rgba(10, 15, 30, 0.25)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Render Cybersecurity Network Grid Infrastructure
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // 3. Process Automatic Spawning Intervals
      spawnTimer++;
      if (spawnTimer >= spawnInterval) {
        spawnThreat();
        spawnTimer = 0;
      }

      // 4. Update and Render Active Threat Vectors
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        // Linear vector angle pathfinding calculating center Core target
        const dx = coreX - enemy.x;
        const dy = coreY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move closer to Core
        if (distance > 0) {
          enemy.x += (dx / distance) * enemy.speed;
          enemy.y += (dy / distance) * enemy.speed;
        }

        // Draw threat entity with specific configuration colors
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();

        // Neon outer core stroke glow for threat intensity
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 5. Containment Breach Detection: Core Impact Collision Math
        if (distance < coreRadius + enemy.radius) {
          // Explode threat, remove entity from data stream
          enemies.splice(i, 1);
          
          // Deduct integrity damage based on threat mass size
          setNetworkStability(prev => {
            const damage = enemy.name === 'Data Bias' ? 10 : 4;
            const updated = prev - damage;
            return updated < 0 ? 0 : updated;
          });
        }
      }

      // 6. Draw AI Neural Core Node (Dynamic Pulsing Effects)
      pulseRadius += 0.25 * pulseDirection;
      if (pulseRadius > 44 || pulseRadius < 36) pulseDirection *= -1;

      // Establish premium neon cyan drop shadowing filters
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#06b6d4';

      ctx.beginPath();
      ctx.arc(coreX, coreY, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0891b2';
      ctx.fill();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Core interior circuit label node decoration
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("AI_CORE", coreX, coreY + 3);

      // Instantly restore canvas drop shadow parameters to default to secure frame rates
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="relative w-full h-[70vh] bg-slate-900/40 border border-cyan-500/25 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.1)]">
      {/* Real-time Telemetry Dashboard overlays */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none font-mono text-xs z-10 select-none">
        <div className="bg-slate-950/90 border border-cyan-500/30 px-3 py-2 rounded shadow-md backdrop-blur-sm">
          CORE STABILITY: <span className={`${networkStability > 40 ? 'text-emerald-400' : 'text-rose-500 animate-pulse'} font-bold`}>{networkStability}%</span>
        </div>
        <div className="bg-slate-950/90 border border-cyan-500/30 px-3 py-2 rounded shadow-md backdrop-blur-sm">
          TELEMETRY SYNCHRONIZED: <span className="text-amber-400 font-bold">{score} MB</span>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
    </div>
  );
}