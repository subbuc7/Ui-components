const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is missing.");
  process.exit(1);
}

// Categories to pick from for daily variety
const COMPONENT_TYPES = [
  "3D biometric passkey scanner button with particle ripples",
  "Luxury kinetic navigation dock with liquid gold indicator and glassmorphism",
  "3D animated holographic credit or asset vault card with mouse tilt",
  "High-horology watch bezel rotary dial with brushed titanium finish",
  "3D multi-layered mechanical purge delete button with particle disintegration",
  "Floating dynamic island controller with glass refraction and expand animation",
  "3D glassmorphic audio visualizer equalizer widget with glowing bars"
];

async function generateComponent() {
  const randomType = COMPONENT_TYPES[Math.floor(Math.random() * COMPONENT_TYPES.length)];
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
Create a single, complete, ultra-premium, self-contained HTML file for a 3D animated UI component: "${randomType}".

Strict requirements:
1. Completely self-contained single-file with embedded <style> and <script> tags. No external CSS/JS dependencies or CDNs.
2. Ultra-premium luxury visual aesthetic: obsidian/dark theme (#05070c), metallic accents (gold, titanium, or ruby), frosted glassmorphism (backdrop-filter: blur), subtle ambient glows, and crisp typography.
3. True 3D perspective and depth using CSS transform-style: preserve-3d and translateZ.
4. Interactive animations: smooth cursor/touch tracking with realistic lighting glare/reflections, and micro-interactions on click/tap.
5. Provide ONLY the raw HTML code. Do NOT wrap in markdown codeblocks (no \`\`\`html or \`\`\`).
`;

  console.log(`Generating component: ${randomType}...`);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8 }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  let code = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Clean any markdown code blocks if present
  code = code.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  // Ensure components directory exists
  const outputDir = path.join(process.cwd(), 'components');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save the daily component file
  const filename = `component-${today}.html`;
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, code, 'utf8');

  console.log(`Successfully generated and saved: ${filePath}`);
}

generateComponent().catch((err) => {
  console.error("Failed to generate component:", err);
  process.exit(1);
});

