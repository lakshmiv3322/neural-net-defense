import React, { useEffect, useRef, useState } from 'react';

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [integrity, setIntegrity] = useState(100);
  const [phase, setPhase] = useState(1); 
  const [runState, setRunState] = useState('BOOT'); 
  
  const [upgradeState, setUpgradeState] = useState({
    hasCleaver: false,
    hasFirewall: false
  });

  const engineRef = useRef({
    isPaused: false,
    fireTimer: 0,
    phaseTimer: 0,
    phaseDuration: 1000, 
    enemies: [],
    lasers: [],
    particles: [],
    mouse: { x: 0, y: 0, isDown: false },
    screenShake: 0,
    bossSpawned: false,
    
    heat: 0,
    isOverheated: false,
    bossRealityRipTriggered: false,
    systemShockActive: false,
    systemShockTimer: 0,
    firewallRadius: 70,
    firewallTargetRadius: 70,

    audioCtx: null,
    hitStopFrames: 0,
    recoilX: 0,
    recoilY: 0,
    bossWarningTimer: 0,
    purgeTimer: 0,

    // --- TRAINING METRICS (loss curve + network viz) ---
    frameCount: 0,
    successfulDefends: 0,
    breaches: 0,
    lossHistory: [],
    lossSampleTimer: 0,
    networkFlare: 0,
    networkNodes: null
  });

  // --- PROCEDURAL AUDIO OVER USER INTERACTION GATES ---
  const playSound = (type) => {
    try {
      const state = engineRef.current;
      if (!state.audioCtx) {
        state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = state.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'boot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
      } else if (type === 'laser') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
        osc.start(now); osc.stop(now + 0.06);
      } else if (type === 'cleaver') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'pulse') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.25);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
      } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(90, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.03);
        osc.start(now); osc.stop(now + 0.03);
      } else if (type === 'explosion') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'shock') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.linearRampToValueAtTime(20, now + 0.6);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
        osc.start(now); osc.stop(now + 0.6);
      }
    } catch (e) {}
  };

  const triggerCommanderTerminal = () => {
    engineRef.current.isPaused = true;
    engineRef.current.mouse.isDown = false;
    setRunState('COMMANDER_TERMINAL');
  };

  const selectUpgrade = (useCleaver) => {
    const state = engineRef.current;
    if (useCleaver) {
      setUpgradeState({ hasCleaver: true, hasFirewall: false });
    } else {
      setUpgradeState({ hasCleaver: false, hasFirewall: true });
      setIntegrity(100); 
    }
    setPhase(2);
    state.phaseTimer = 0;
    state.isPaused = false;
    setRunState('PLAYING');
    playSound('boot');
  };

  const rebootCore = () => {
    setScore(0);
    setIntegrity(100);
    setPhase(1);
    setUpgradeState({ hasCleaver: false, hasFirewall: false });
    
    const state = engineRef.current;
    state.isPaused = false;
    state.enemies = [];
    state.lasers = [];
    state.particles = [];
    state.phaseTimer = 0;
    state.heat = 0;
    state.isOverheated = false;
    state.bossSpawned = false;
    state.bossRealityRipTriggered = false;
    state.systemShockActive = false;
    state.systemShockTimer = 0;
    state.firewallRadius = 70;
    state.firewallTargetRadius = 70;
    state.bossWarningTimer = 0;
    state.purgeTimer = 0;
    state.hitStopFrames = 0;
    state.recoilX = 0;
    state.recoilY = 0;
    state.fireTimer = 0;
    state.mouse.isDown = false;

    // reset training metrics
    state.frameCount = 0;
    state.successfulDefends = 0;
    state.breaches = 0;
    state.lossHistory = [];
    state.lossSampleTimer = 0;
    state.networkFlare = 0;

    setRunState('PLAYING');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const generateNetwork = () => {
      const nodes = [];
      const count = 16;
      for (let i = 0; i < count; i++) {
        nodes.push({
          nx: Math.random(),
          ny: Math.random(),
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
      engineRef.current.networkNodes = nodes;
    };

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    if (!engineRef.current.networkNodes) generateNetwork();
    window.addEventListener('resize', resize);

    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      engineRef.current.mouse.x = e.clientX - r.left;
      engineRef.current.mouse.y = e.clientY - r.top;
    };
    
    const down = () => { 
      const state = engineRef.current;
      if (runState === 'BOOT') {
        setRunState('PLAYING');
        playSound('boot');
        return;
      }
      if (runState !== 'PLAYING') return;
      state.mouse.isDown = true; 

      if (upgradeState.hasFirewall) {
        state.firewallTargetRadius = 240; 
        state.screenShake = 12;
        playSound('pulse');
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          state.particles.push({
            x: canvas.width / 2, y: canvas.height / 2,
            vx: Math.cos(a) * 8, vy: Math.sin(a) * 8,
            alpha: 1, decay: 0.04, color: '#10b981', size: 3
          });
        }
      }
    };
    
    const up = () => { engineRef.current.mouse.isDown = false; };

    // touch support: mirror mouse behavior so this is playable on phones/tablets
    const touchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        const r = canvas.getBoundingClientRect();
        engineRef.current.mouse.x = e.touches[0].clientX - r.left;
        engineRef.current.mouse.y = e.touches[0].clientY - r.top;
      }
      e.preventDefault();
    };
    const touchStart = (e) => {
      touchMove(e);
      down();
    };
    const touchEnd = (e) => {
      up();
      e.preventDefault();
    };

    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    canvas.addEventListener('touchstart', touchStart, { passive: false });
    canvas.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('touchend', touchEnd, { passive: false });

    const spawnEnemy = (isBoss = false) => {
      const state = engineRef.current;
      const cX = canvas.width / 2;
      const cY = canvas.height / 2;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.max(canvas.width, canvas.height) * 0.55;

      if (isBoss) {
        state.enemies.push({
          type: 'BOSS',
          x: cX + Math.cos(angle) * dist,
          y: cY + Math.sin(angle) * dist,
          speed: 0.45,
          health: 180,
          maxHealth: 180,
          points: 5000,
          size: 38,
          color: '#f43f5e',
          flashFrames: 0,
          rageMode: false
        });
        return;
      }

      let speedModifier = phase === 1 ? 1.0 : phase === 2 ? 1.4 : 1.9;
      
      if (phase >= 2 && Math.random() > 0.5) {
        state.enemies.push({
          type: 'GLITCH',
          x: cX + Math.cos(angle) * dist,
          y: cY + Math.sin(angle) * dist,
          speed: 3.2 * speedModifier,
          health: 1,
          points: 150,
          size: 6,
          color: '#fbbf24',
          wobble: Math.random() * 100,
          flashFrames: 0
        });
      } else {
        state.enemies.push({
          type: 'NODE',
          x: cX + Math.cos(angle) * dist,
          y: cY + Math.sin(angle) * dist,
          speed: 1.3 * speedModifier,
          health: phase === 3 ? 5 : 3,
          points: 50,
          size: 12,
          color: '#a855f7',
          flashFrames: 0
        });
      }
    };

    const spawnExplosion = (x, y, color, count = 8, forceScalar = 1) => {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (Math.random() * 4 + 2) * forceScalar;
        engineRef.current.particles.push({
          x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          alpha: 1, decay: Math.random() * 0.04 + 0.03, color,
          size: Math.random() * 2 + 2
        });
      }
    };

    // --- BACKGROUND NEURAL NETWORK VISUALIZATION ---
    const drawNetworkBackground = (state) => {
      const nodes = state.networkNodes;
      if (!nodes) return;
      const integrityFactor = Math.max(0.15, integrity / 100);
      ctx.save();

      // edges
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const x = n.nx * canvas.width;
        const y = n.ny * canvas.height;
        const pulse = (Math.sin(state.frameCount * 0.03 + n.pulseOffset) + 1) / 2;
        const baseAlpha = (0.04 + pulse * 0.07) * integrityFactor + state.networkFlare * 0.22;

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const mx = m.nx * canvas.width;
          const my = m.ny * canvas.height;
          const dist = Math.hypot(x - mx, y - my);
          if (dist < canvas.width * 0.22) {
            ctx.strokeStyle = `rgba(99, 102, 241, ${baseAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const x = n.nx * canvas.width;
        const y = n.ny * canvas.height;
        const pulse = (Math.sin(state.frameCount * 0.03 + n.pulseOffset) + 1) / 2;
        const alpha = (0.15 + pulse * 0.22) * integrityFactor + state.networkFlare * 0.3;
        ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // --- LOSS CURVE PANEL ---
    const drawLossChart = (state) => {
      const chartX = 14;
      const chartY = canvas.height - 92;
      const chartW = 130;
      const chartH = 44;

      ctx.save();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.lineWidth = 1;
      ctx.fillRect(chartX - 8, chartY - 16, chartW + 16, chartH + 30);
      ctx.strokeRect(chartX - 8, chartY - 16, chartW + 16, chartH + 30);

      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TRAINING LOSS', chartX, chartY - 4);

      // baseline
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.moveTo(chartX, chartY + chartH);
      ctx.lineTo(chartX + chartW, chartY + chartH);
      ctx.stroke();

      const hist = state.lossHistory;
      if (hist.length > 1) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        hist.forEach((v, i) => {
          const x = chartX + (i / (hist.length - 1)) * chartW;
          const y = chartY + chartH - v * chartH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      const currentLoss = hist.length ? hist[hist.length - 1] : 0;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.font = '8px monospace';
      ctx.fillText(currentLoss.toFixed(2), chartX + chartW - 20, chartY - 4);

      ctx.restore();
    };

    // --- MAIN CORE MATRIX PROCESSOR ---
    const loop = () => {
      const state = engineRef.current;
      const cX = canvas.width / 2;
      const cY = canvas.height / 2;

      if (state.hitStopFrames > 0) {
        state.hitStopFrames--;
        animId = requestAnimationFrame(loop);
        return;
      }

      if (runState === 'BOOT') {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawNetworkBackground(state);
        
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("▲ CORE DEFENSE INITIALIZATION", cX, cY - 70);

        ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
        ctx.font = '11px monospace';
        ctx.fillText("Your core sits at the center. Threat nodes converge on it.", cX, cY - 34);
        ctx.fillText("AIM: move your mouse / finger.  FIRE: click or hold.", cX, cY - 14);
        ctx.fillText("Survive 3 phases. A boss spawns in phase 3 — break it to win.", cX, cY + 6);

        ctx.fillStyle = '#818cf8';
        ctx.font = '9px monospace';
        ctx.fillText("Watch INTEGRITY (top left) — it hits 0, the run ends.", cX, cY + 30);

        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.font = 'bold 12px monospace';
        ctx.fillText("▶ CLICK / TAP TO START", cX, cY + 66);
        
        animId = requestAnimationFrame(loop);
        return;
      }

      // FIXED PURGE WIPE: Safely processes transient structural noise and forces VICTORY display card directly
      if (runState === 'PURGE') {
        state.purgeTimer--;
        
        ctx.fillStyle = Math.random() > 0.4 ? '#ffffff' : '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (state.purgeTimer <= 0) {
          state.isPaused = true;
          setRunState('VICTORY');
        }
        animId = requestAnimationFrame(loop);
        return;
      }

      if (state.isPaused) {
        animId = requestAnimationFrame(loop);
        return;
      }

      state.frameCount++;

      state.phaseTimer++;
      if (phase === 1 && state.phaseTimer >= state.phaseDuration) {
        triggerCommanderTerminal();
        animId = requestAnimationFrame(loop);
        return;
      }
      if (phase === 2 && state.phaseTimer >= state.phaseDuration) {
        setPhase(3);
        state.phaseTimer = 0;
        state.bossWarningTimer = 80; 
      }

      if (phase === 3 && !state.bossSpawned && state.bossWarningTimer === 0) {
        spawnEnemy(true);
        state.bossSpawned = true;
      }

      if (state.bossWarningTimer > 0) state.bossWarningTimer--;

      if (state.systemShockActive && state.systemShockTimer > 0) {
        state.systemShockTimer--;
      } else if (state.systemShockActive) {
        state.systemShockActive = false;
      }

      // sample training loss periodically
      state.lossSampleTimer++;
      if (state.lossSampleTimer >= 20) {
        state.lossSampleTimer = 0;
        const total = state.successfulDefends + state.breaches;
        const lossVal = total > 0 ? state.breaches / (total + 1) : 0;
        state.lossHistory.push(lossVal);
        if (state.lossHistory.length > 50) state.lossHistory.shift();
      }
      state.networkFlare *= 0.92;

      ctx.save();
      let totalShakeX = (Math.random() - 0.5) * state.screenShake + state.recoilX;
      let totalShakeY = (Math.random() - 0.5) * state.screenShake + state.recoilY;
      ctx.translate(totalShakeX, totalShakeY);
      state.screenShake *= 0.84;
      state.recoilX *= 0.78;
      state.recoilY *= 0.78;

      if (state.systemShockActive) {
        ctx.fillStyle = (Math.floor(state.systemShockTimer / 4) % 2 === 0) ? '#f43f5e' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = phase === 3 ? '#0a0203' : '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      drawNetworkBackground(state);

      ctx.strokeStyle = state.systemShockActive ? 'rgba(0,0,0,0.15)' : 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const grid = 90;
      for (let x = 0; x < canvas.width; x += grid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += grid) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      if (upgradeState.hasFirewall) {
        state.firewallRadius += (state.firewallTargetRadius - state.firewallRadius) * 0.22;
        if (state.firewallRadius > 220) state.firewallTargetRadius = 70; 
      }

      if (state.isOverheated) {
        state.heat -= 1.6;
        if (state.heat <= 0) { state.heat = 0; state.isOverheated = false; }
      } else {
        state.heat = Math.max(0, state.heat - 0.5);
      }

      state.fireTimer++;
      const targetAngle = Math.atan2(state.mouse.y - cY, state.mouse.x - cX);

      if (upgradeState.hasCleaver) {
        if (state.mouse.isDown && !state.isOverheated && state.fireTimer >= 38) { 
          state.fireTimer = 0;
          state.screenShake = 26; 
          playSound('cleaver');
          
          state.recoilX = -Math.cos(targetAngle) * 22;
          state.recoilY = -Math.sin(targetAngle) * 22;

          state.lasers.push({
            x: cX, y: cY, vx: Math.cos(targetAngle) * 26, vy: Math.sin(targetAngle) * 26,
            isCleaver: true, color: '#38bdf8'
          });

          state.heat += 34; 
          if (state.heat >= 100) { state.heat = 100; state.isOverheated = true; }
        }
      } else if (!upgradeState.hasFirewall) {
        if (state.mouse.isDown && !state.isOverheated && state.fireTimer >= 9) {
          state.fireTimer = 0;
          playSound('laser');
          state.lasers.push({
            x: cX, y: cY, vx: Math.cos(targetAngle) * 12, vy: Math.sin(targetAngle) * 12,
            isCleaver: false, color: '#a855f7'
          });
          state.heat += 6;
          if (state.heat >= 100) { state.heat = 100; state.isOverheated = true; }
        }
      }

      const spawnInterval = phase === 1 ? 45 : phase === 2 ? 24 : 14;
      if (state.phaseTimer % spawnInterval === 0 && !state.systemShockActive && state.bossWarningTimer === 0) {
        spawnEnemy(false);
      }

      for (let i = state.lasers.length - 1; i >= 0; i--) {
        const l = state.lasers[i];
        l.x += l.vx; l.y += l.vy;

        if (l.isCleaver) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 18;
          ctx.beginPath(); ctx.moveTo(cX, cY); ctx.lineTo(l.x, l.y); ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(cX, cY); ctx.lineTo(l.x, l.y); ctx.stroke();
        } else {
          ctx.fillStyle = l.color;
          ctx.beginPath(); ctx.arc(l.x, l.y, 5, 0, Math.PI * 2); ctx.fill();
        }

        if (l.x < 0 || l.x > canvas.width || l.y < 0 || l.y > canvas.height) {
          state.lasers.splice(i, 1);
        }
      }

      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        const dx = cX - e.x; const dy = cY - e.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        let currentSpeed = e.speed;
        if (e.type === 'BOSS' && e.rageMode) currentSpeed *= 1.7;

        if (!state.systemShockActive) {
          if (e.type === 'GLITCH') {
            e.wobble += 0.25;
            const px = -dy / d; const py = dx / d;
            e.x += (dx / d) * currentSpeed + px * Math.sin(e.wobble) * 4;
            e.y += (dy / d) * currentSpeed + py * Math.sin(e.wobble) * 4;
          } else {
            e.x += (dx / d) * currentSpeed;
            e.y += (dy / d) * currentSpeed;
          }
        }

        if (e.flashFrames > 0) {
          e.flashFrames--;
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = state.systemShockActive ? '#000000' : e.color;
        }

        // READABILITY FIX: Return to circle profile with aggressive thick gold warning borders for enraged state
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = e.type === 'BOSS' ? (e.rageMode ? '#fbbf24' : '#ffffff') : '#ffffff';
        ctx.lineWidth = e.type === 'BOSS' ? (e.rageMode ? 6 : 3) : 1;
        ctx.stroke();

        if (e.type === 'BOSS') {
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(e.x - 40, e.y - 55, 80, 5);
          ctx.fillStyle = e.rageMode ? '#fbbf24' : '#f43f5e';
          ctx.fillRect(e.x - 40, e.y - 55, (e.health / e.maxHealth) * 80, 5);
        }

        if (upgradeState.hasFirewall) {
          if (d < state.firewallRadius + e.size && d > state.firewallRadius - 35) {
            e.flashFrames = 3;
            playSound('hit');
            
            const pushDist = e.type === 'BOSS' ? 25 : 110;
            e.x -= (dx / d) * pushDist;
            e.y -= (dy / d) * pushDist;
            
            e.health -= 1.5;
            if (e.health <= 0) {
              spawnExplosion(e.x, e.y, e.color, 6, 0.9);
              state.enemies.splice(i, 1);
              state.successfulDefends++;
              setScore(prev => prev + e.points);
              continue;
            }
          }
        }

        if (d < 26 + e.size) {
          state.enemies.splice(i, 1);
          state.screenShake = 22;
          state.hitStopFrames = 5; 
          state.breaches++;
          state.networkFlare = 1;
          playSound('explosion');
          setIntegrity(prev => {
            const loss = e.type === 'BOSS' ? 50 : 10;
            const next = prev - loss;
            if (next <= 0) { setRunState('GAME_OVER'); state.isPaused = true; }
            return Math.max(0, next);
          });
          continue;
        }

        for (let j = state.lasers.length - 1; j >= 0; j--) {
          const l = state.lasers[j];
          const lx = e.x - l.x; const ly = e.y - l.y;
          const ld = Math.sqrt(lx * lx + ly * ly);
          const hitRadius = l.isCleaver ? e.size + 24 : e.size + 5;

          if (ld < hitRadius) {
            e.health -= l.isCleaver ? 10 : 1;
            e.flashFrames = l.isCleaver ? 4 : 2; 
            playSound('hit');

            if (!l.isCleaver) {
              state.lasers.splice(j, 1);
              spawnExplosion(l.x, l.y, e.color, 2, 0.4);
            } else {
              const px = -l.vy; const py = l.vx;
              const len = Math.sqrt(px*px + py*py);
              for (let k = 0; k < 3; k++) {
                state.particles.push({
                  x: e.x, y: e.y,
                  vx: (px / len) * (Math.random() * 8 - 4),
                  vy: (py / len) * (Math.random() * 8 - 4),
                  alpha: 1, decay: 0.05, color: '#38bdf8', size: 2.5
                });
              }
            }

            if (e.type === 'BOSS' && e.health <= e.maxHealth / 2 && !state.bossRealityRipTriggered) {
              state.bossRealityRipTriggered = true; 
              state.systemShockActive = true;
              state.systemShockTimer = 65; 
              state.screenShake = 30;
              state.hitStopFrames = 14; 
              e.rageMode = true; 
              playSound('shock');
              
              for (let k = state.enemies.length - 1; k >= 0; k--) {
                if (state.enemies[k].type !== 'BOSS') {
                  state.enemies.splice(k, 1);
                }
              }
              break;
            }

            if (e.health <= 0) {
              spawnExplosion(e.x, e.y, e.color, e.type === 'BOSS' ? 35 : 8, e.type === 'BOSS' ? 1.8 : 1.0);
              playSound('explosion');
              state.enemies.splice(i, 1);
              state.successfulDefends++;
              setScore(prev => prev + e.points);

              if (e.type === 'BOSS') {
                state.purgeTimer = 45; 
                setRunState('PURGE');
              }
              break;
            }
          }
        }
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
        if (p.alpha <= 0) { state.particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      }

      if (upgradeState.hasFirewall) {
        ctx.strokeStyle = state.firewallRadius > 110 ? '#10b981' : 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = state.firewallRadius > 110 ? 5 : 2;
        ctx.beginPath(); ctx.arc(cX, cY, state.firewallRadius, 0, Math.PI * 2); ctx.stroke();
      }

      ctx.fillStyle = '#020617';
      ctx.beginPath(); ctx.arc(cX, cY, 24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = state.isOverheated ? '#ef4444' : state.systemShockActive ? '#ffffff' : phase === 3 ? '#f43f5e' : '#6366f1';
      ctx.lineWidth = 3;
      ctx.stroke();

      if (!upgradeState.hasFirewall) {
        ctx.strokeStyle = upgradeState.hasCleaver ? 'rgba(56, 189, 248, 0.12)' : 'rgba(168, 85, 247, 0.06)';
        ctx.beginPath(); ctx.moveTo(cX, cY); ctx.lineTo(state.mouse.x, state.mouse.y); ctx.stroke();
      }

      const barW = 220; const barH = 5;
      const barX = cX - barW / 2; const barY = canvas.height - 25;

      ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
      ctx.fillRect(barX - 10, barY - 12, barW + 20, barH + 16);

      if (!upgradeState.hasFirewall) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = state.isOverheated ? '#ef4444' : upgradeState.hasCleaver ? '#38bdf8' : '#a855f7';
        ctx.fillRect(barX, barY, (state.heat / 100) * barW, barH);
      } else {
        ctx.fillStyle = '#10b981';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("SHIELD RADIAL ACTIVE", cX, barY + 4);
      }

      if (state.bossWarningTimer > 0) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
        ctx.fillRect(0, cY - 20, canvas.width, 40);
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("⚠️ THREAT INTRUSION: BOSS INBOUND ⚠️", cX, cY + 4);
      }

      drawLossChart(state);

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      canvas.removeEventListener('touchstart', touchStart);
      canvas.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', touchEnd);
    };
  }, [phase, runState, upgradeState, integrity]);

  const state = engineRef.current;
  const totalEvents = state.successfulDefends + state.breaches;
  const accuracy = totalEvents > 0 ? Math.round((state.successfulDefends / totalEvents) * 100) : 100;

  return (
    <div className="relative w-full h-[75vh] bg-slate-950 border-2 border-slate-900 rounded-2xl overflow-hidden font-mono select-none shadow-2xl">
      
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none z-10 text-[10px] font-bold tracking-wider text-slate-400">
        <div className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg">
          INTEGRITY: <span className={integrity > 35 ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}>{integrity}%</span>
        </div>
        <div className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg text-indigo-400">
          PHASE {phase}/3
        </div>
        <div className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg text-amber-400">
          SCORE: {score}
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {runState === 'COMMANDER_TERMINAL' && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col justify-center items-center p-6 z-50">
          <div className="max-w-xs w-full border border-slate-800 bg-slate-900 rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-center text-indigo-400 tracking-wider mb-4 uppercase">CHOOSE UPGRADE INSTANTLY</h3>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => selectUpgrade(true)}
                className="w-full text-left bg-slate-950 border border-sky-500/30 hover:border-sky-400 p-3 rounded-lg group cursor-pointer transition-colors"
              >
                <div className="text-xs font-bold text-sky-400">⚡ CLEAVER BUILD</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  High burst damage. Pierce targets with heavy recoil beams.
                </div>
              </button>

              <button 
                onClick={() => selectUpgrade(false)}
                className="w-full text-left bg-slate-950 border border-emerald-500/30 hover:border-emerald-400 p-3 rounded-lg group cursor-pointer transition-colors"
              >
                <div className="text-xs font-bold text-emerald-400">🛡️ FIREWALL BUILD</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  Spatial crowd control. Waves force threats completely back.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {runState === 'VICTORY' && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col justify-center items-center p-6 z-50">
          <div className="max-w-xs w-full text-center text-white">
            <h2 className="text-sm font-bold tracking-wider uppercase">MAINFRAME SECURED</h2>
            <p className="text-[10px] text-slate-500 mt-2">Convergence achieved — the network held.</p>
            <div className="bg-slate-900 py-3 rounded-lg my-4 text-emerald-400 font-bold text-2xl border border-slate-800">
              {score}
            </div>
            <div className="text-[10px] text-slate-400 mb-4">
              MODEL ACCURACY: <span className="text-indigo-400 font-bold">{accuracy}%</span>
            </div>
            <button onClick={rebootCore} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase cursor-pointer transition-colors">
              Restart
            </button>
          </div>
        </div>
      )}

      {runState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col justify-center items-center p-6 z-50">
          <div className="max-w-xs w-full text-center">
            <h2 className="text-sm font-bold text-rose-500 tracking-wider uppercase">CORE COMPROMISED</h2>
            <p className="text-[10px] text-slate-500 mt-2">Model diverged — integrity lost.</p>
            <div className="text-[10px] text-slate-400 my-4">
              MODEL ACCURACY: <span className="text-rose-400 font-bold">{accuracy}%</span>
            </div>
            <button onClick={rebootCore} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase cursor-pointer transition-colors mt-2">
              Reboot Array
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
