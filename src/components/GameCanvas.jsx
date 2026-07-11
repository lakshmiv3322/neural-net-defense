import React, { useEffect, useRef, useState } from 'react';

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [networkStability, setNetworkStability] = useState(100);
  const [trainingXp, setTrainingXp] = useState(0);
  const [generationLevel, setGenerationLevel] = useState(1);
  const [showUpgradeMenu, setShowUpgradeMenu] = useState(false);
  
  // Real-time Contextual AI Commander Message
  const [commanderAlert, setCommanderAlert] = useState(
    "SYSTEM READY: Trace metrics running normal. Watch out for abrupt Data Bias packets."
  );

  // Use refs for real-time game modifiers to avoid state re-render collision delays
  const isPausedRef = useRef(false);
  const fireRateModRef = useRef(25); // Lower means faster firing
  const shieldActiveRef = useRef(false);
  const multiShotActiveRef = useRef(false);

  // Interactive upgrade router triggered by the user
  const applyUpgrade = (type) => {
    if (type === 'FIRE_RATE') {
      fireRateModRef.current = Math.max(8, fireRateModRef.current - 6);
      setCommanderAlert("COMMANDER: Core overclock successfully synchronized. Core firing frequency boosted by 25%.");
    } else if (type === 'GRADIENT_SHIELD') {
      shieldActiveRef.current = true;
      setCommanderAlert("COMMANDER: Orbital Gradient Shield online. Kinetic impact defense active around core node.");
    } else if (type === 'ATTENTION_BEAM') {
      multiShotActiveRef.current = true;
      setCommanderAlert("COMMANDER: Attention Vector array integrated. Split-token data pipelines deployed.");
    }

    // Reset loop constraints
    setTrainingXp(0);
    setGenerationLevel(prev => prev + 1);
    isPausedRef.current = false;
    setShowUpgradeMenu(false);
  };

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

    // --- Core Spatial Math Coordinates ---
    let coreX = canvas.width / 2;
    let coreY = canvas.height / 2;
    let coreRadius = 40;
    let pulseRadius = 40;
    let pulseDirection = 1;
    let shieldRotation = 0;

    // --- Active Data Stream Entities ---
    let enemies = [];
    let spawnTimer = 0;
    let spawnInterval = 50;

    let lasers = [];
    let fireTimer = 0;

    const spawnThreat = () => {
      // Scale difficulty dynamically with generations
      const speedMultiplier = 1 + (generationLevel * 0.1);
      
      const types = [
        { name: 'Hallucination', color: '#c084fc', speed: 2.2 * speedMultiplier, health: 1, radius: 6, points: 5, xpYield: 25 },
        { name: 'Data Bias', color: '#f87171', speed: 1.0 * speedMultiplier, health: 3, radius: 12, points: 15, xpYield: 45 }
      ];
      const type = Math.random() < 0.75 ? types[0] : types[1];

      let x, y;
      const angle = Math.random() * Math.PI * 2;
      x = coreX + Math.cos(angle) * (Math.max(canvas.width, canvas.height) * 0.6);
      y = coreY + Math.sin(angle) * (Math.max(canvas.width, canvas.height) * 0.6);

      enemies.push({
        x, y, ...type, id: Math.random().toString(36).substr(2, 9)
      });
    };

    // --- HIGH FREQUENCY RENDERING CORE ---
    const renderLoop = () => {
      coreX = canvas.width / 2;
      coreY = canvas.height / 2;

      // Handle system baseline break interrupt when optimization modal triggers
      if (isPausedRef.current) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // 1. Wipe Viewport with dark neon trails
      ctx.fillStyle = 'rgba(10, 15, 30, 0.25)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Render Virtual Network Grids
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // 3. Enemy Generation Tick
      spawnTimer++;
      if (spawnTimer >= Math.max(15, spawnInterval - (generationLevel * 3))) {
        spawnThreat();
        spawnTimer = 0;
      }

      // 4. Track Nearest Targets
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

      // 5. Fire Weapon Mechanisms
      fireTimer++;
      if (fireTimer >= fireRateModRef.current && closestEnemy) {
        const targetDx = closestEnemy.x - coreX;
        const targetDy = closestEnemy.y - coreY;
        const angleToTarget = Math.atan2(targetDy, targetDx);

        const addLaser = (angleOffset) => {
          const finalAngle = angleToTarget + angleOffset;
          lasers.push({
            x: coreX + Math.cos(finalAngle) * coreRadius,
            y: coreY + Math.sin(finalAngle) * coreRadius,
            vx: Math.cos(finalAngle) * 7,
            vy: Math.sin(finalAngle) * 7,
            radius: 3,
            color: '#22d3ee'
          });
        };

        // Primary Cannon Fire
        addLaser(0);

        // Multi-shot Upgrade Split Engine Trigger
        if (multiShotActiveRef.current) {
          addLaser(0.25);  // Left angle pipeline
          addLaser(-0.25); // Right angle pipeline
        }

        fireTimer = 0;
      }

      // 6. Laser Logic and Damage Metrics
      for (let l = lasers.length - 1; l >= 0; l--) {
        const laser = lasers[l];
        laser.x += laser.vx;
        laser.y += laser.vy;

        ctx.beginPath();
        ctx.arc(laser.x, laser.y, laser.radius, 0, Math.PI * 2);
        ctx.fillStyle = laser.color;
        ctx.fill();

        if (laser.x < 0 || laser.x > canvas.width || laser.y < 0 || laser.y > canvas.height) {
          lasers.splice(l, 1);
          continue;
        }

        for (let e = enemies.length - 1; e >= 0; e--) {
          const enemy = enemies[e];
          const ldx = enemy.x - laser.x;
          const ldy = enemy.y - laser.y;
          const lDist = Math.sqrt(ldx * ldx + ldy * ldy);

          if (lDist < enemy.radius + laser.radius) {
            enemy.health -= 1;
            lasers.splice(l, 1);

            if (enemy.health <= 0) {
              setScore(prev => prev + enemy.points);
              
              // Increment Experience States and evaluate leveling thresholds
              setTrainingXp(prev => {
                const updatedXp = prev + enemy.xpYield;
                if (updatedXp >= 100) {
                  isPausedRef.current = true;
                  setShowUpgradeMenu(true);
                  return 100;
                }
                return updatedXp;
              });

              enemies.splice(e, 1);
            }
            break;
          }
        }
      }

      // 7. Render & Process Active Threats
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

        // Gradient Shield Collision Array Check
        if (shieldActiveRef.current) {
          const shieldRadius = 75;
          if (distance < shieldRadius + enemy.radius && distance > shieldRadius - 10) {
            // Deflect vector and neutralize instantly
            enemies.splice(i, 1);
            setScore(prev => prev + Math.floor(enemy.points / 2));
            continue;
          }
        }

        // Core containment breach check
        if (distance < coreRadius + enemy.radius) {
          enemies.splice(i, 1);
          setNetworkStability(prev => {
            const damage = enemy.name === 'Data Bias' ? 10 : 4;
            const updated = prev - damage;
            return updated < 0 ? 0 : updated;
          });
        }
      }

      // 8. Draw Orbital Gradient Firewall Ring Shield
      if (shieldActiveRef.current) {
        shieldRotation += 0.02;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 3;
        ctx.setLineDash([30, 20]); // Create an ultra clean dashed circling shield
        ctx.beginPath();
        ctx.arc(coreX, coreY, 75, shieldRotation, shieldRotation + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash patterns instantly
      }

      // 9. Draw Pulsing Core Node
      pulseRadius += 0.25 * pulseDirection;
      if (pulseRadius > 44 || pulseRadius < 36) pulseDirection *= -1;

      if (closestEnemy && !isPausedRef.current) {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(coreX, coreY); ctx.lineTo(closestEnemy.x, closestEnemy.y); ctx.stroke();
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
      ctx.fillText(`GEN_0${generationLevel}`, coreX, coreY + 3);

      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [generationLevel]);

  return (
    <div className="relative w-full h-[70vh] bg-slate-900/40 border border-cyan-500/25 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.1)]">
      
      {/* Real-time Diagnostic Telemetry Overlay panels */}
      <div className="absolute top-4 left-4 right-4 flex flex-col md:flex-row justify-between gap-2 pointer-events-none font-mono text-xs z-10 select-none">
        <div className="flex gap-2">
          <div className="bg-slate-950/90 border border-cyan-500/30 px-3 py-2 rounded shadow-md backdrop-blur-sm text-cyan-400">
            INTEGRITY: <span className={`${networkStability > 40 ? 'text-emerald-400' : 'text-rose-500 animate-pulse'} font-bold`}>{networkStability}%</span>
          </div>
          <div className="bg-slate-950/90 border border-cyan-500/30 px-3 py-2 rounded shadow-md backdrop-blur-sm text-cyan-400">
            MODEL: <span className="text-cyan-400 font-bold">GENERATION_0{generationLevel}</span>
          </div>
        </div>
        <div className="bg-slate-950/90 border border-cyan-500/30 px-3 py-2 rounded shadow-md backdrop-blur-sm text-cyan-400">
          PROCESSED VECTORS: <span className="text-amber-400 font-bold">{score} MB</span>
        </div>
      </div>

      {/* Training Optimization Metrics Progress Bar (XP Bar) */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 border border-slate-800 p-2 rounded backdrop-blur-sm select-none z-10">
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
          <span>// TRAINING OPTIMIZATION WEIGHTS MATRIX PROGRESS</span>
          <span className="text-cyan-400 font-bold">{trainingXp}%</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-sm overflow-hidden border border-slate-800/60">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            style={{ width: `${trainingXp}%` }}
          />
        </div>
      </div>

      {/* Dynamic AI Commander Advisory HUD */}
      <div className="absolute bottom-16 left-4 right-4 bg-slate-950/90 border border-emerald-500/30 px-4 py-2.5 rounded-md backdrop-blur-sm font-mono text-[11px] text-emerald-400 flex items-start gap-2 shadow-lg z-10 select-none animate-fade-in">
        <div className="text-emerald-400 animate-pulse">🤖</div>
        <div className="flex-1 leading-relaxed"><span className="font-bold tracking-wider text-emerald-300">ADVISORY //</span> {commanderAlert}</div>
      </div>

      {/* High Performance HTML5 Layer Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* PREMIUM CHORAL TERMINAL UPGRADE MODAL OVERLAY */}
      {showUpgradeMenu && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col justify-center items-center p-6 z-50 font-mono animate-fade-in">
          <div className="max-w-md w-full border border-cyan-400/40 bg-slate-900/90 rounded-xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col gap-4">
            <div className="border-b border-slate-800 pb-3">
              <div className="text-xs text-cyan-400 font-bold tracking-widest">// ARCHITECT OVERLAY INTERRUPT ACTIVE</div>
              <h2 className="text-lg font-black text-white mt-1">MODEL RE-TRAINING INSTANTIATED</h2>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Loss function minimized successfully. Select an optimization layer expansion to redeploy network architectures:
            </p>

            <div className="flex flex-col gap-2.5 mt-2">
              <button 
                onClick={() => applyUpgrade('FIRE_RATE')}
                className="w-full text-left bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-lg group transition-all"
              >
                <div className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300">▲ OVERCLOCK LEARNING RATE</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Decreases weapon cooldown latency parameters by 25%. Fires much faster.</div>
              </button>

              <button 
                onClick={() => applyUpgrade('GRADIENT_SHIELD')}
                className="w-full text-left bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 p-3 rounded-lg group transition-all"
              >
                <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">🛡️ INITIALIZE GRADIENT SHIELD</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Deploys an orbital perimeter barrier ring that instantly vaporizes colliding threat vectors.</div>
              </button>

              <button 
                onClick={() => applyUpgrade('ATTENTION_BEAM')}
                className="w-full text-left bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 p-3 rounded-lg group transition-all"
              >
                <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300">❖ INTEGRATE ATTENTION MECHANISM</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Splits standard data arrays into multiple laser pipelines to intercept dense vector waves.</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}