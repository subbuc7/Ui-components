const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const componentIndex = args.indexOf('--component');
const outputIndex = args.indexOf('--output');

const component = componentIndex !== -1 ? args[componentIndex + 1] : 'neon_battery_pill';
const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : 'output.mp4';

console.log(`Starting 3D render for: ${component}`);

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: radial-gradient(circle at center, #0a0f24 0%, #02040a 100%); overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      #canvas { width: 1080px; height: 1920px; }
    </style>
  </head>
  <body>
    <canvas id="canvas" width="1080" height="1920"></canvas>
    <script>
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      let frame = 0;

      function draw() {
        ctx.fillStyle = 'rgba(2, 4, 10, 0.2)';
        ctx.fillRect(0, 0, 1080, 1920);

        const cx = 540, cy = 960;
        const time = frame * 0.04;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.3);

        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.ellipse(0, 0, 320 + Math.sin(time + i) * 20, 140 + Math.cos(time + i) * 15, (i * Math.PI) / 4, 0, Math.PI * 2);
          ctx.strokeStyle = i % 2 === 0 ? '#00f2fe' : '#4facfe';
          ctx.lineWidth = 4;
          ctx.shadowBlur = 35;
          ctx.shadowColor = '#00f2fe';
          ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.translate(cx, cy);
        const pillW = 460;
        const pillH = 140;
        const r = 70;

        ctx.beginPath();
        ctx.roundRect(-pillW/2, -pillH/2, pillW, pillH, r);
        ctx.fillStyle = 'rgba(15, 25, 50, 0.7)';
        ctx.shadowBlur = 50;
        ctx.shadowColor = '#00f2fe';
        ctx.fill();
        ctx.strokeStyle = '#38ef7d';
        ctx.lineWidth = 3;
        ctx.stroke();

        const pulse = (Math.sin(time * 3) + 1) / 2;
        ctx.beginPath();
        ctx.arc(-pillW/2 + 50, 0, 14 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = '#11998e';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#38ef7d';
        ctx.fill();

        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText('${component.replace(/_/g, ' ').toUpperCase()}', -pillW/2 + 90, 12);
        ctx.restore();

        frame++;
        requestAnimationFrame(draw);
      }
      draw();
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
    '-crf', '22',
    outputFile
  ]);

  console.log(`Rendering ${totalFrames} frames...`);
  for (let i = 0; i < totalFrames; i++) {
    const screenshotBuffer = await page.screenshot({ type: 'png', omitBackground: true });
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
  console.log(`Video successfully generated at ${outputFile}`);
})();
