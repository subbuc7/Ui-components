const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is missing.");
  process.exit(1);
}

// Curated cinematic categories inspired by modern creative web studios
const CINEMATIC_TYPES = [
  "3D cylindrical arc carousel with horizontal drag inertia and spotlight focus",
  "Cinematic interactive bento feature card with mouse-tracked specular glow",
  "3D magnetic floating halo button with multi-ring luminous pulse",
  "3D card fan-deck selector that expands on hover with perspective tilt",
  "Interactive 3D particle constellation globe with drag rotation",
  "Cinematic liquid gradient card with glass refraction and floating typography",
  "3D accordion folder expander with mechanical depth transitions",
  "Scroll-reactive 3D telemetry meter with smooth damping physics"
];

function extractCode(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }
  if (Array.isArray(data.steps)) {
    for (let i = data.steps.length - 1; i >= 0; i--) {
      const step = data.steps[i];
      if (step.content && Array.isArray(step.content)) {
        for (const item of step.content) {
          if (item && typeof item.text === "string" && item.text.trim()) {
            return item.text;
          }
        }
      }
    }
  }
  return "";
}

async function generateSingle(category, index, timeStr) {
  const prompt = "Create a single, complete, ultra-premium, self-contained HTML file for an original cinematic website component: " + category + ".\n\nStrict requirements:\n1. Completely self-contained single-file with embedded <style> and <script> tags. No external libraries or CDNs.\n2. Visual direction: Cinematic dark mode (#05070c), refined glassmorphism, subtle golden or cyan lighting, crisp micro-typography, and high-end aesthetics.\n3. Motion: True 3D perspective (CSS preserve-3d, translateZ), smooth physics, and full mobile touch + mouse reactivity.\n4. Originality: Do not copy existing code verbatim; build an original, production-ready implementation.\n5. Output raw HTML only (no markdown backticks).";

  console.log(`[${index}/2] Generating: ${category}...`);

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY
    },
    body: JSON.stringify({
      model: "gemini-3.6-flash",
      input: prompt
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error("API Error: " + response.status + " - " + err);
  }

  const data = await response.json();
  let code = extractCode(data);
  code = code.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  const outputDir = path.join(process.cwd(), 'components');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const filename = `component-${timeStr}_part${index}.html`;
  fs.writeFileSync(path.join(outputDir, filename), code, 'utf8');
  console.log(`Saved: ${filename}`);
}

async function runBatch() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = String(now.getHours()).padStart(2, '0') + "-" + String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${date}_${time}`;

  // Pick 2 random, distinct categories
  const shuffled = [...CINEMATIC_TYPES].sort(() => 0.5 - Math.random());
  await generateSingle(shuffled[0], 1, timeStr);
  await generateSingle(shuffled, 2, timeStr);
}

runBatch().catch(err => {
  console.error("Batch run failed:", err);
  process.exit(1);
});
