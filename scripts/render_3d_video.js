const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const componentIndex = args.indexOf('--component');
const outputIndex = args.indexOf('--output');

const component = componentIndex !== -1 ? args[componentIndex + 1] : 'quantum_plasma_chrono_pill';
const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : 'output.mp4';

console.log(`Starting High-Fidelity 3D Render with Cursor Interaction for: ${component}`);

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

      const COMP_NAME = "` + formattedName + `";

      const sparks = [];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 9;
        sparks.push({
          angle: angle,
          speed: speed,
          size: 2 + Math.random() * 3,
          color: i % 2 === 0 ? '#00f2fe' : '#38ef7d'
        });
      }

      function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
      function easeInOutQuad(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

      window.renderFrame = function(frame) {
        ctx.clearRect(0, 0, 1080, 1920);

        // 1. Deep Space Luxury Background & 3D Floor Grid
        const bgGrad = ctx.createRadialGradient(540, 960, 50, 540, 960, 850);
        bgGrad.addColorStop(0, '#0c1630');
        bgGrad.addColorStop(0.5, '#060a16');
        bgGrad.addColorStop(1, '#020408');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1080, 1920);

        // Perspective grid on bottom half
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.07)';
        ctx.lineWidth = 1.5;
        const gridYStart = 1100;
        for (let y = gridYStart; y < 1920; y += 45) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1080, y);
          ctx.stroke();
        }
        for (let x = -400; x <= 1480; x += 120) {
          ctx.beginPath();
          ctx.moveTo(540, 960);
          ctx.lineTo(x, 1920);
          ctx.stroke();
        }
        ctx.restore();

        // 2. Cursor Positioning & State Timing
        // Frame 0 - 45: Cursor approaches from (880, 1450) to (540, 960)
        // Frame 45 - 50: Click Press
        // Frame 50 - 150: Component Morph & Active Interaction
        let cursorX = 880, cursorY = 1450, cursorScale = 1.0, isClicked = false;
        if (frame < 45) {
          const t = easeInOutQuad(frame / 45);
          cursorX = 880 + (540 - 880) * t;
          cursorY = 1450 + (960 - 1450) * t;
        } else if (frame >= 45 && frame < 52) {
          cursorX = 540;
          cursorY = 960;
          cursorScale = 0.82;
          isClicked = true;
        } else {
          isClicked = true;
          const t = easeOutCubic(Math.min(1, (frame - 52) / 40));
          cursorX = 540 + 180 * t;
          cursorY = 960 + 260 * t;
          cursorScale = Math.max(0, 1.0 - t * 0.9);
        }

        const cx = 540, cy = 960;
        const clickProgress = isClicked ? Math.min(1, (frame - 48) / 30) : 0;
        const morphEased = easeOutCubic(clickProgress);

        const compW = 480 + 160 * morphEased;
        const compH = 140 + 80 * morphEased;
        const compR = 70 - 30 * morphEased;

        // 3. Shockwave concentric rings on click
        if (frame >= 48) {
          const waveT = (frame - 48) / 40;
          if (waveT <= 1) {
            ctx.save();
            ctx.translate(cx, cy);
            for (let w = 0; w < 3; w++) {
              const ringRadius = (waveT * 420) + (w * 35);
              const ringAlpha = Math.max(0, (1 - waveT) * 0.65 - (w * 0.15));
              ctx.beginPath();
              ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
              ctx.strokeStyle = w % 2 === 0 ? 'rgba(0, 242, 254, ' + ringAlpha + ')' : 'rgba(56, 239, 125, ' + ringAlpha + ')';
              ctx.lineWidth = 3 - w * 0.8;
              ctx.shadowBlur = 25;
              ctx.shadowColor = '#00f2fe';
              ctx.stroke();
            }
            ctx.restore();
          }
        }

        // 4. Draw Component Body with Glassmorphism & Neon Bevel
        ctx.save();
        ctx.translate(cx, cy);

        // Subtle 3D breathing tilt
        const tiltX = Math.sin(frame * 0.05) * 4;
        ctx.rotate((tiltX * Math.PI) / 180);

        // Outer Neon Glow Shadow
        ctx.shadowBlur = 45 + (isClicked ? 25 : 0);
        ctx.shadowColor = isClicked ? '#38ef7d' : '#00f2fe';

        // Glass Base Fill
        ctx.beginPath();
        ctx.roundRect(-compW / 2, -compH / 2, compW, compH, compR);
        const glassGrad = ctx.createLinearGradient(-compW / 2, -compH / 2, compW / 2, compH / 2);
        glassGrad.addColorStop(0, 'rgba(18, 30, 58, 0.88)');
        glassGrad.addColorStop(1, 'rgba(8, 14, 28, 0.94)');
        ctx.fillStyle = glassGrad;
        ctx.fill();

        // Neon Stroke Contour
        ctx.lineWidth = 3.5;
        const strokeGrad = ctx.createLinearGradient(-compW / 2, -compH / 2, compW / 2, compH / 2);
        if (isClicked) {
          strokeGrad.addColorStop(0, '#38ef7d');
          strokeGrad.addColorStop(0.5, '#00f2fe');
          strokeGrad.addColorStop(1, '#11998e');
        } else {
          strokeGrad.addColorStop(0, '#00f2fe');
          strokeGrad.addColorStop(0.5, '#4facfe');
          strokeGrad.addColorStop(1, '#00c6ff');
        }
        ctx.strokeStyle = strokeGrad;
        ctx.stroke();

        // Specular Sheen across top glass surface
        ctx.beginPath();
        ctx.roundRect(-compW / 2 + 6, -compH / 2 + 4, compW - 12, compH * 0.45,);
        const sheenGrad = ctx.createLinearGradient(0, -compH / 2, 0, 0);
        sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = sheenGrad;
        ctx.fill();

        // Laser scanline sweeping inside component
        const sweepX = -compW / 2 + ((frame * 9) % (compW + 100));
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-compW / 2, -compH / 2, compW, compH, compR);
        ctx.clip();
        ctx.fillStyle = 'rgba(0, 242, 254, 0.15)';
        ctx.fillRect(sweepX - 25, -compH / 2, 50, compH);
        ctx.restore();

        // 5. Component Content & Animated Typography
        if (!isClicked) {
          // Status Orb Indicator
          const pulse = (Math.sin(frame * 0.12) + 1) / 2;
          ctx.beginPath();
          ctx.arc(-compW / 2 + 55, 0, 14 + pulse * 3, 0, Math.PI * 2);
          ctx.fillStyle = '#00f2fe';
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#00f2fe';
          ctx.fill();

          // Title
          ctx.font = 'bold 30px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffffff';
          ctx.fillText(COMP_NAME, -compW / 2 + 95, 2);

          // Subtitle / Action Cue
          ctx.font = '600 16px sans-serif';
          ctx.fillStyle = '#4facfe';
          ctx.fillText('STANDBY • CLICK TO INTERACT', -compW / 2 + 95, 28);
        } else {
          // Post-Click Active Morph State
          const pct = Math.min(100, Math.floor(easeOutCubic(Math.min(1, (frame - 48) / 35)) * 100));

          // Verified Icon Orb
          ctx.beginPath();
          ctx.arc(-compW / 2 + 65, -30, 22, 0, Math.PI * 2);
          ctx.fillStyle = '#38ef7d';
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#38ef7d';
          ctx.fill();

          // White checkmark inside orb
          ctx.beginPath();
          ctx.moveTo(-compW / 2 + 56, -30);
          ctx.lineTo(-compW / 2 + 63, -22);
          ctx.lineTo(-compW / 2 + 76, -38);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#051b11';
          ctx.stroke();

          // Title
          ctx.font = 'bold 30px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#38ef7d';
          ctx.fillText(COMP_NAME, -compW / 2 + 105, -32);

          // Status Badge Text
          ctx.font = '700 18px sans-serif';
          ctx.fillStyle = '#38ef7d';
          ctx.fillText(pct === 100 ? 'SYSTEM SYNCHRONIZED • ACTIVE' : 'INITIALIZING QUANTUM CORE...', -compW / 2 + 105, -6);

          // Interactive Live Progress Bar
          const barW = compW - 130;
          const barH = 12;
          const barX = -compW / 2 + 65;
          const barY = 32;

          ctx.beginPath();
          ctx.roundRect(barX, barY, barW, barH, 6);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.shadowBlur = 0;
          ctx.fill();

          // Fill progress
          ctx.beginPath();
          ctx.roundRect(barX, barY, Math.max(12, barW * (pct / 100)), barH, 6);
          const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
          barGrad.addColorStop(0, '#00f2fe');
          barGrad.addColorStop(1, '#38ef7d');
          ctx.fillStyle = barGrad;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#38ef7d';
          ctx.fill();

          // Digital Counter text
          ctx.font = 'bold 18px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'right';
          ctx.fillText(pct + '%', compW / 2 - 65, 18);
        }
        ctx.restore();

        // 6. Post-click particle spark burst
        if (frame >= 48) {
          const sparkT = (frame - 48) / 35;
          if (sparkT <= 1) {
            ctx.save();
            ctx.translate(cx, cy);
            for (let s of sparks) {
              const dist = sparkT * s.speed * 45;
              const sx = Math.cos(s.angle) * dist;
              const sy = Math.sin(s.angle) * dist;
              const alpha = Math.max(0, 1 - sparkT);
              ctx.beginPath();
              ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
              ctx.fillStyle = s.color;
              ctx.globalAlpha = alpha;
              ctx.shadowBlur = 15;
              ctx.shadowColor = s.color;
              ctx.fill();
            }
            ctx.restore();
          }
        }

        // 7. Render Sleek Virtual Cursor Pointer
        if (cursorScale > 0.05) {
          ctx.save();
          ctx.translate(cursorX, cursorY);
          ctx.scale(cursorScale, cursorScale);

          // Cursor Drop Shadow
          ctx.shadowBlur = 25;
          ctx.shadowColor = 'rgba(0, 242, 254, 0.9)';

          // Vector Mouse Cursor Path
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 36);
          ctx.lineTo(10, 28);
          ctx.lineTo(18, 44);
          ctx.lineTo(26, 40);
          ctx.lineTo(18, 24);
          ctx.lineTo(30, 24);
          ctx.closePath();

          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#00f2fe';
          ctx.stroke();

          // Subtle click pulse ring around cursor tip on click
          if (frame >= 46 && frame < 54) {
            ctx.beginPath();
            ctx.arc(0, 0, (frame - 45) * 6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 242, 254, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
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
  const totalFrames = 150; // 5.0 seconds @ 30fps

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

  console.log(`Rendering ${totalFrames} frames of 3D motion graphics with cursor interaction...`);
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
  console.log(`High-Fidelity 3D Video successfully generated at ${outputFile}`);
})();
