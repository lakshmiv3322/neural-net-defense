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

    // --- Core Architecture Coordinates ---
    let coreX = canvas.width / 2;
    let coreY = canvas.height / 2;
    let coreRadius = 40;
    let pulseRadius = 40;
    let pulseDirection = 1;

    // --- Threat System Arrays ---
    let enemies = [];
    let spawnTimer = 0;
    const spawnInterval = 50; // Slightly faster spawning for action balance

    // --- Defensive Laser Arrays ---
    let lasers = [];
    let fireTimer = 0;
    const fireCooldown = 25; // Fires roughly every 0.4 seconds

    const spawnThreat = () => {
      const types = [
        { name: 'Hallucination', color: '#c084fc', speed: 2.2, health: 1, radius: 6, points: 5 },
        { name: 'Data Bias', color: '#f87171', speed: 1.0, health: 3, radius: 12, points: 15 }
      ];
      const type = Math.random() < 0.7 ? types[0] : types[1];

      let x, y;
      const angle = Math.random() * Math.PI * 2;
      x = coreX + Math.cos(angle) * (Math.max(canvas.width, canvas.height) * 0.6);
      y = coreY + Math.sin(angle) * (Math.max(canvas.width, canvas.height) * 0.6);

      enemies.push({
        x, y, ...type, id: Math.random().toString(36).substr(2, 9)
      });
    };

    // --- MAIN ENGINE LOOP ---
    const renderLoop = () => {
      coreX = canvas.width / 2;
      coreY = canvas.height / 2;

      // 1. Clear Viewport with high-fidelity background trail
      ctx.fillStyle = 'rgba(10, 15, 30, 0.25)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Render Security Grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // 3. Enemy Spawning Logic
      spawnTimer++;
      if (spawnTimer >= spawnInterval) {
        spawnThreat();
        spawnTimer = 0;
      }

      // 4. AUTOMATED TARGET ACQUISITION (Find closest threat)
      let closestEnemy = null;
      let closestDistance = Infinity;

      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const dx = enemy.x - coreX;
        const dy = enemy.y - coreY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < closestDistance) {
          closestDistance = dist;
          closestEnemy = enemy;
        }
      }

      // 5. AUTO-FIRE MECHANICS
      fireTimer++;
      if (fireTimer >= fireCooldown && closestEnemy) {
        // Calculate directional angle toward closest enemy
        const targetDx = closestEnemy.x - coreX;
        const targetDy = closestEnemy.y - coreY;
        const angleToTarget = Math.atan2(targetDy, targetDx);

        // Inject brand new laser projectile into tracking stream
        lasers.push({
          x: coreX + Math.cos(angleToTarget) * coreRadius,
          y: coreY + Math.sin(angleToTarget) * coreRadius,
          vx: Math.cos(angleToTarget) * 7, // Velocity X scalar
          vy: Math.sin(angleToTarget) * 7, // Velocity Y scalar
          radius: 3,
          color: '#22d3ee'
        });
        fireTimer = 0;
      }

      // 6. UPDATE & RENDER PROJECTILES (LASERS)
      for (let l = lasers.length - 1; l >= 0; l--) {
        const laser = lasers[l];
        laser.x += laser.vx;
        laser.y += laser.vy;

        // Draw laser as a burning bright energy bolt
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, laser.radius, 0, Math.PI * 2);
        ctx.fillStyle = laser.color;
        ctx.fill();

        // Remove laser if it streaks completely out of bounds
        if (
          laser.x < 0 || laser.x > canvas.width ||
          laser.y < 0 || laser.y > canvas.height
        ) {
          lasers.splice(l, 1);
          continue;
        }

        // Check for intersection collisions between laser and all enemies
        for (let e = enemies.length - 1; e >= 0; e--) {
          const enemy = enemies[e];
          const ldx = enemy.x - laser.x;
          const ldy = enemy.y - laser.y;
          const lDist = Math.sqrt(ldx * ldx + ldy * ldy);

          if (lDist < enemy.radius + laser.radius) {
            // Hit detected! Inflict core data patch damage, drop laser
            enemy.health -= 1;
            lasers.splice(l, 1);

            // Check if threat signature is fully neutralized
            if (enemy.health <= 0) {
              setScore(prev => prev + enemy.points); // Update UI score stream
              enemies.splice(e, 1);
            }
            break; // Exit early since laser is expended
          }
        }
      }

      // 7. MOVE & RENDER ACTIVE THREAT VECTORS
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = coreX - enemy.x;
        const dy = coreY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          enemy.x += (dx / distance) * enemy.speed;
          enemy.y += (dy / distance) * enemy.speed;
        }

        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Core Impact Breach Check
        if (distance < coreRadius + enemy.radius) {
          enemies.splice(i, 1);
          setNetworkStability(prev => {
            const damage = enemy.name === 'Data Bias' ? 10 : 4;
            const updated = prev - damage;
            return updated < 0 ? 0 : updated;
          });
        }
      }

      // 8. Draw Central Core Architecture
      pulseRadius += 0.25 * pulseDirection;
      if (pulseRadius > 44 || pulseRadius < 36) pulseDirection *= -1;

      // Draw premium searchglow tracking aura to target nearest enemy
      if (closestEnemy) {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(coreX, coreY);
        ctx.lineTo(closestEnemy.x, closestEnemy.y);
        ctx.stroke();
      }

      ctx.shadowBlur = 24;
      ctx.shadowColor = '#06b6d4';

      ctx.beginPath();
      ctx.arc(coreX, coreY, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0891b2';
      ctx.fill();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("AI_CORE", coreX, coreY + 3);

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