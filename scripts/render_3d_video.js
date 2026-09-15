
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const componentIndex = args.indexOf('--component');
const outputIndex = args.indexOf('--output');

const component = componentIndex !== -1 ? args[componentIndex + 1] : 'quantum_plasma_chrono_pill';
const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : 'output.mp4';

// Identify unique design archetype
function getArchetype(name) {
  const c = name.toLowerCase();
  if (c.includes('sphere') || c.includes('orb') || c.includes('globe') || c.includes('audio')) return 'sphere';
  if (c.includes('scanner') || c.includes('keypad') || c.includes('hud') || c.includes('fingerprint')) return 'biometric';
  if (c.includes('card') || c.includes('tile') || c.includes('badge')) return 'card';
  if (c.includes('slider') || c.includes('gauge') || c.includes('speedometer') || c.includes('dial') || c.includes('chart')) return 'dial';
  return 'pill';
}

const archetype = getArchetype(component);
console.log(`Rendering [${archetype.toUpperCase()}] archetype for: ${component}`);

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  const formattedName = component.replace(/_/g, ' ').toUpperCase();

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: #03060f; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      #canvas { width: 1080px; height: 1920px; }
    </style>
  </head>
  <body>
    <canvas id="canvas" width="1080" height="1920"></canvas>
    <script>
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');

      const ARCHETYPE = "` + archetype + `";
      const COMP_NAME = "` + formattedName + `";

      function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
      function easeInOutQuad(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

      const sparks = [];
      for (let i = 0; i < 40; i++) {
        sparks.push({
          angle: Math.random() * Math.PI * 2,
          speed: 4 + Math.random() * 9,
          size: 2 + Math.random() * 3
        });
      }

      window.renderFrame = function(frame) {
        ctx.clearRect(0, 0, 1080, 1920);

        // 1. Archetype-Specific Radial Background
        const bgGrad = ctx.createRadialGradient(540, 960, 50, 540, 960, 900);
        if (ARCHETYPE === 'sphere') {
          bgGrad.addColorStop(0, '#1d0b2e'); bgGrad.addColorStop(0.5, '#0c0517'); bgGrad.addColorStop(1, '#020106');
        } else if (ARCHETYPE === 'biometric') {
          bgGrad.addColorStop(0, '#261706'); bgGrad.addColorStop(0.5, '#120a02'); bgGrad.addColorStop(1, '#050200');
        } else if (ARCHETYPE === 'card') {
          bgGrad.addColorStop(0, '#062017'); bgGrad.addColorStop(0.5, '#02100a'); bgGrad.addColorStop(1, '#010503');
        } else if (ARCHETYPE === 'dial') {
          bgGrad.addColorStop(0, '#2b1002'); bgGrad.addColorStop(0.5, '#140600'); bgGrad.addColorStop(1, '#050200');
        } else {
          bgGrad.addColorStop(0, '#0c1630'); bgGrad.addColorStop(0.5, '#060a16'); bgGrad.addColorStop(1, '#020408');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1080, 1920);

        // Perspective Floor Grid
        ctx.save();
        ctx.strokeStyle = ARCHETYPE === 'sphere' ? 'rgba(255, 0, 128, 0.08)' : (ARCHETYPE === 'biometric' ? 'rgba(255, 153, 0, 0.08)' : 'rgba(0, 242, 254, 0.08)');
        ctx.lineWidth = 1.5;
        for (let y = 1120; y < 1920; y += 45) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke();
        }
        for (let x = -400; x <= 1480; x += 120) {
          ctx.beginPath(); ctx.moveTo(540, 960); ctx.lineTo(x, 1920); ctx.stroke();
        }
        ctx.restore();

        // 2. Cursor Positioning & Click Timing
        let cursorX = 880, cursorY = 1450, cursorScale = 1.0, isClicked = false;
        if (frame < 45) {
          const t = easeInOutQuad(frame / 45);
          cursorX = 880 + (540 - 880) * t;
          cursorY = 1450 + (960 - 1450) * t;
        } else if (frame >= 45 && frame < 52) {
          cursorX = 540; cursorY = 960; cursorScale = 0.82; isClicked = true;
        } else {
          isClicked = true;
          const t = easeOutCubic(Math.min(1, (frame - 52) / 40));
          cursorX = 540 + 180 * t; cursorY = 960 + 260 * t; cursorScale = Math.max(0, 1.0 - t * 0.9);
        }

        const cx = 540, cy = 960;
        const morphT = isClicked ? easeOutCubic(Math.min(1, (frame - 48) / 32)) : 0;

        // 3. Shockwave Rings on Click
        if (frame >= 48) {
          const waveT = (frame - 48) / 40;
          if (waveT <= 1) {
            ctx.save();
            ctx.translate(cx, cy);
            for (let w = 0; w < 3; w++) {
              const r = (waveT * 440) + (w * 35);
              const alpha = Math.max(0, (1 - waveT) * 0.7 - (w * 0.15));
              ctx.beginPath();
              ctx.arc(0, 0, r, 0, Math.PI * 2);
              ctx.strokeStyle = ARCHETYPE === 'sphere' ? 'rgba(255, 0, 128, ' + alpha + ')' : (ARCHETYPE === 'biometric' ? 'rgba(255, 170, 0, ' + alpha + ')' : 'rgba(0, 242, 254, ' + alpha + ')');
              ctx.lineWidth = 3;
              ctx.shadowBlur = 20;
              ctx.shadowColor = ctx.strokeStyle;
              ctx.stroke();
            }
            ctx.restore();
          }
        }

        // 4. Render Distinct Archetype
        ctx.save();
        ctx.translate(cx, cy);

        if (ARCHETYPE === 'sphere') {
          // --- SPHERE ARCHETYPE: Rotating 3D Particle Orb & Audio Waveform ---
          const rotSpeed = isClicked ? 0.08 : 0.02;
          const spin = frame * rotSpeed;
          
          for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate(spin + (i * Math.PI / 3));
            ctx.beginPath();
            ctx.ellipse(0, 0, 240 + (isClicked ? 40 * morphT : 0), 90, (i * Math.PI / 6), 0, Math.PI * 2);
            ctx.strokeStyle = i === 0 ? '#ff007f' : (i === 1 ? '#7928ca' : '#00f2fe');
            ctx.lineWidth = 3;
            ctx.shadowBlur = 30;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.stroke();
            ctx.restore();
          }

          const coreR = 100 + (isClicked ? 25 * morphT : 0);
          ctx.beginPath();
          ctx.arc(0, 0, coreR, 0, Math.PI * 2);
          const sGrad = ctx.createRadialGradient(-30, -30, 10, 0, 0, coreR);
          sGrad.addColorStop(0, '#ff007f'); sGrad.addColorStop(0.6, '#7928ca'); sGrad.addColorStop(1, '#050210');
          ctx.fillStyle = sGrad;
          ctx.shadowBlur = 45; ctx.shadowColor = '#ff007f';
          ctx.fill();

          if (isClicked) {
            const numBars = 32;
            for (let b = 0; b < numBars; b++) {
              const bAngle = (b / numBars) * Math.PI * 2 + frame * 0.05;
              const barH = 30 + Math.sin(frame * 0.3 + b * 2) * 45 * morphT;
              const x1 = Math.cos(bAngle) * (coreR + 10);
              const y1 = Math.sin(bAngle) * (coreR + 10);
              const x2 = Math.cos(bAngle) * (coreR + 10 + barH);
              const y2 = Math.sin(bAngle) * (coreR + 10 + barH);
              ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
              ctx.strokeStyle = '#00f2fe'; ctx.lineWidth = 3.5;
              ctx.stroke();
            }
          }

          ctx.font = 'bold 28px sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
          ctx.fillText(COMP_NAME, 0, 260);
          ctx.font = '600 16px sans-serif'; ctx.fillStyle = isClicked ? '#38ef7d' : '#ff007f';
          ctx.fillText(isClicked ? '96kHz SPATIAL AUDIO RESONATING' : 'IDLE • CLICK TO RESONATE', 0, 295);

        } else if (ARCHETYPE === 'card') {
          // --- CARD ARCHETYPE: 3D Holographic Vault Card Flip ---
          const tiltX = Math.sin(frame * 0.05) * 5;
          ctx.rotate((tiltX * Math.PI) / 180);

          const cardW = 380, cardH = 540;
          ctx.beginPath();
          ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 24);
          const cGrad = ctx.createLinearGradient(-cardW / 2, -cardH / 2, cardW / 2, cardH / 2);
          cGrad.addColorStop(0, '#0c2e22'); cGrad.addColorStop(0.5, '#061710'); cGrad.addColorStop(1, '#020a06');
          ctx.fillStyle = cGrad;
          ctx.shadowBlur = 50; ctx.shadowColor = isClicked ? '#10b981' : 'rgba(16, 185, 129, 0.4)';
          ctx.fill();

          ctx.lineWidth = 3;
          ctx.strokeStyle = isClicked ? '#38ef7d' : 'rgba(56, 239, 125, 0.4)';
          ctx.stroke();

          // Gold EMV Chip
          ctx.beginPath(); ctx.roundRect(-cardW / 2 + 40, -cardH / 2 + 50, 60, 45, 8);
          ctx.fillStyle = '#ffd700'; ctx.shadowBlur = 15; ctx.shadowColor = '#ffd700'; ctx.fill();

          ctx.font = 'bold 24px sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
          ctx.fillText(COMP_NAME, -cardW / 2 + 40, 20);

          ctx.font = '14px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillText('VAULT ID: #9821-SECURE', -cardW / 2 + 40, 50);

          const balance = isClicked ? (morphT * 148920).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';
          ctx.font = 'bold 36px monospace'; ctx.fillStyle = '#38ef7d';
          ctx.fillText('$' + balance, -cardW / 2 + 40, 130);

          ctx.beginPath(); ctx.roundRect(-cardW / 2 + 40, cardH / 2 - 80, cardW - 80, 50, 12);
          ctx.fillStyle = isClicked ? '#10b981' : 'rgba(16, 185, 129, 0.2)';
          ctx.fill();
          ctx.font = 'bold 16px sans-serif'; ctx.fillStyle = isClicked ? '#04150c' : '#38ef7d'; ctx.textAlign = 'center';
          ctx.fillText(isClicked ? 'TRANSACTION CONFIRMED ✓' : 'CLICK TO AUTHORIZE', 0, cardH / 2 - 48);

        } else if (ARCHETYPE === 'biometric') {
          // --- BIOMETRIC ARCHETYPE: Tactical Radar & Laser Scanner ---
          const hudR = 210;
          ctx.beginPath(); ctx.arc(0, 0, hudR, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(25, 15, 5, 0.9)';
          ctx.shadowBlur = 45; ctx.shadowColor = isClicked ? '#38ef7d' : '#ff9900';
          ctx.fill();
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = isClicked ? '#38ef7d' : '#ff9900';
          ctx.stroke();

          // Rotating outer targeting brackets
          const bracketRot = frame * (isClicked ? 0.09 : 0.02);
          ctx.save();
          ctx.rotate(bracketRot);
          for (let b = 0; b < 4; b++) {
            ctx.beginPath();
            ctx.arc(0, 0, hudR + 25, b * Math.PI / 2 + 0.2, b * Math.PI / 2 + Math.PI / 3);
            ctx.lineWidth = 4; ctx.strokeStyle = isClicked ? '#38ef7d' : '#ffaa00'; ctx.stroke();
          }
          ctx.restore();

          // Fingerprint Ridges
          for (let r = 25; r < 140; r += 16) {
            ctx.beginPath();
            ctx.arc(0, 0, r, 0.2 * Math.PI, 1.8 * Math.PI);
            ctx.strokeStyle = isClicked ? '#38ef7d' : 'rgba(255, 153, 0, 0.45)';
            ctx.lineWidth = 2.5; ctx.stroke();
          }

          // Laser Scanning Beam
          if (isClicked) {
            const scanY = Math.sin(frame * 0.2) * 130;
            ctx.beginPath(); ctx.moveTo(-160, scanY); ctx.lineTo(160, scanY);
            ctx.strokeStyle = '#00ff66'; ctx.lineWidth = 5; ctx.shadowBlur = 30; ctx.shadowColor = '#00ff66';
            ctx.stroke();
          }

          ctx.font = 'bold 28px sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
          ctx.fillText(COMP_NAME, 0, 275);
          ctx.font = '700 16px sans-serif'; ctx.fillStyle = isClicked ? '#38ef7d' : '#ff9900';
          ctx.fillText(isClicked ? 'IDENTITY VERIFIED • ACCESS GRANTED' : 'TOUCH SENSOR TO SCAN', 0, 310);

        } else if (ARCHETYPE === 'dial') {
          // --- DIAL ARCHETYPE: Speedometer Gauge & RPM Needle ---
          const dialR = 210;
          ctx.beginPath(); ctx.arc(0, 0, dialR, 0.75 * Math.PI, 2.25 * Math.PI);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.lineWidth = 18; ctx.stroke();

          const dialPct = isClicked ? (0.2 + 0.8 * morphT) : (0.2 + Math.sin(frame * 0.08) * 0.05);
          const endAngle = 0.75 * Math.PI + (dialPct * 1.5 * Math.PI);
          ctx.beginPath(); ctx.arc(0, 0, dialR, 0.75 * Math.PI, endAngle);
          const dGrad = ctx.createLinearGradient(-dialR, 0, dialR, 0);
          dGrad.addColorStop(0, '#ffd700'); dGrad.addColorStop(1, '#ff4500');
          ctx.strokeStyle = dGrad; ctx.lineWidth = 18; ctx.shadowBlur = 30; ctx.shadowColor = '#ff4500';
          ctx.stroke();

          // Needle
          ctx.save();
          ctx.rotate(endAngle - Math.PI / 2);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -dialR + 15);
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.stroke();
          ctx.restore();

          // Center Hub
          ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI * 2);
          ctx.fillStyle = '#1a0802'; ctx.fill();
          ctx.lineWidth = 3; ctx.strokeStyle = '#ff4500'; ctx.stroke();

          const rpm = Math.floor(dialPct * 8800);
          ctx.font = 'bold 42px monospace'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
          ctx.fillText(rpm, 0, 80);
          ctx.font = '700 16px sans-serif'; ctx.fillStyle = '#ff4500';
          ctx.fillText('RPM TURBO', 0, 110);

          ctx.font = 'bold 28px sans-serif'; ctx.fillStyle = '#ffffff';
          ctx.fillText(COMP_NAME, 0, 275);
          ctx.font = '600 16px sans-serif'; ctx.fillStyle = isClicked ? '#38ef7d' : '#ffd700';
          ctx.fillText(isClicked ? 'MAX VELOCITY ACHIEVED' : 'CLICK TO ACCELERATE', 0, 310);

        } else {
          // --- PILL / DYNAMIC ISLAND ARCHETYPE ---
          const compW = 480 + 160 * morphT;
          const compH = 140 + 80 * morphT;
          const compR = 70 - 30 * morphT;

          ctx.shadowBlur = 45 + (isClicked ? 25 : 0);
          ctx.shadowColor = isClicked ? '#38ef7d' : '#00f2fe';

          ctx.beginPath();
          ctx.roundRect(-compW / 2, -compH / 2, compW, compH, compR);
          const pGrad = ctx.createLinearGradient(-compW / 2, -compH / 2, compW / 2, compH / 2);
          pGrad.addColorStop(0, 'rgba(18, 30, 58, 0.9)'); pGrad.addColorStop(1, 'rgba(8, 14, 28, 0.95)');
          ctx.fillStyle = pGrad; ctx.fill();

          ctx.lineWidth = 3.5;
          ctx.strokeStyle = isClicked ? '#38ef7d' : '#00f2fe';
          ctx.stroke();

          if (!isClicked) {
            const pulse = (Math.sin(frame * 0.12) + 1) / 2;
            ctx.beginPath(); ctx.arc(-compW / 2 + 55, 0, 14 + pulse * 3, 0, Math.PI * 2);
            ctx.fillStyle = '#00f2fe'; ctx.shadowBlur = 20; ctx.shadowColor = '#00f2fe'; ctx.fill();

            ctx.font = 'bold 30px sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
            ctx.fillText(COMP_NAME, -compW / 2 + 95, 2);
            ctx.font = '600 16px sans-serif'; ctx.fillStyle = '#4facfe';
            ctx.fillText('STANDBY • CLICK TO ACTIVATE', -compW / 2 + 95, 28);
          } else {
            const pct = Math.min(100, Math.floor(morphT * 100));
            ctx.beginPath(); ctx.arc(-compW / 2 + 65, -30, 22, 0, Math.PI * 2);
            ctx.fillStyle = '#38ef7d'; ctx.shadowBlur = 25; ctx.shadowColor = '#38ef7d'; ctx.fill();

            ctx.font = 'bold 30px sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
            ctx.fillText(COMP_NAME, -compW / 2 + 105, -32);
            ctx.font = '700 18px sans-serif'; ctx.fillStyle = '#38ef7d';
            ctx.fillText(pct === 100 ? 'QUANTUM CORE ONLINE • 100%' : 'CHARGING PLASMA CELL...', -compW / 2 + 105, -6);

            const barW = compW - 130;
            ctx.beginPath(); ctx.roundRect(-compW / 2 + 65, 32, barW, 12, 6);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; ctx.fill();
            ctx.beginPath(); ctx.roundRect(-compW / 2 + 65, 32, Math.max(12, barW * (pct / 100)), 12, 6);
            ctx.fillStyle = '#38ef7d'; ctx.shadowBlur = 15; ctx.shadowColor = '#38ef7d'; ctx.fill();
            ctx.font = 'bold 18px monospace'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'right';
            ctx.fillText(pct + '%', compW / 2 - 65, 18);
          }
        }
        ctx.restore();

        // 5. Post-Click Particle Spark Burst
        if (frame >= 48) {
          const sparkT = (frame - 48) / 35;
          if (sparkT <= 1) {
            ctx.save();
            ctx.translate(cx, cy);
            for (let s of sparks) {
              const dist = sparkT * s.speed * 48;
              const sx = Math.cos(s.angle) * dist;
              const sy = Math.sin(s.angle) * dist;
              const alpha = Math.max(0, 1 - sparkT);
              ctx.beginPath(); ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
              ctx.fillStyle = ARCHETYPE === 'sphere' ? '#ff007f' : (ARCHETYPE === 'biometric' ? '#ffaa00' : '#38ef7d');
              ctx.globalAlpha = alpha; ctx.shadowBlur = 15; ctx.shadowColor = ctx.fillStyle; ctx.fill();
            }
            ctx.restore();
          }
        }

        // 6. Virtual Cursor Pointer
        if (cursorScale > 0.05) {
          ctx.save();
          ctx.translate(cursorX, cursorY);
          ctx.scale(cursorScale, cursorScale);
          ctx.shadowBlur = 25; ctx.shadowColor = 'rgba(0, 242, 254, 0.9)';

          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(0, 36); ctx.lineTo(10, 28);
          ctx.lineTo(18, 44); ctx.lineTo(26, 40); ctx.lineTo(18, 24);
          ctx.lineTo(30, 24); ctx.closePath();
          ctx.fillStyle = '#ffffff'; ctx.fill();
          ctx.lineWidth = 2.5; ctx.strokeStyle = '#00f2fe'; ctx.stroke();

          if (frame >= 46 && frame < 54) {
            ctx.beginPath(); ctx.arc(0, 0, (frame - 45) * 6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 242, 254, 0.8)'; ctx.lineWidth = 2; ctx.stroke();
          }
          ctx.restore();
        }
      };
    </script>
  </body>
  </html>
  `;

  await page.setContent(htmlContent);

  const fps = 30;
  const totalFrames = 150;

  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', `${fps}`,
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '20',
    outputFile
  ]);

  console.log(`Rendering ${totalFrames} frames for archetype [${archetype.toUpperCase()}]...`);
  for (let i = 0; i < totalFrames; i++) {
    await page.evaluate((f) => window.renderFrame(f), i);
    const screenshotBuffer = await page.screenshot({ type: 'png' });
    ffmpeg.stdin.write(screenshotBuffer);
  }

  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  await browser.close();
  console.log(`Distinct 3D Video successfully generated at ${outputFile}`);
})();
