const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is missing.");
  process.exit(1);
}

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

  const prompt = "Create a single, complete, ultra-premium, self-contained HTML file for a 3D animated UI component: " + randomType + ".\n\nStrict requirements:\n1. Completely self-contained single-file with embedded <style> and <script> tags. No external CSS/JS dependencies or CDNs.\n2. Ultra-premium luxury visual aesthetic: obsidian/dark theme (#05070c), metallic accents (gold, titanium, or ruby), frosted glassmorphism (backdrop-filter: blur), subtle ambient glows, and crisp typography.\n3. True 3D perspective and depth using CSS transform-style: preserve-3d and translateZ.\n4. Interactive animations: smooth cursor/touch tracking with realistic lighting glare/reflections, and micro-interactions on click/tap.\n5. Provide ONLY the raw HTML code. Do NOT wrap in markdown codeblocks.";

  console.log("Generating component: " + randomType + "...");

  // Google Gemini Interactions API Endpoint
  const apiUrl = "https://generativelanguage.googleapis.com/v1beta/interactions";

  const response = await fetch(apiUrl, {
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
    const errorText = await response.text();
    throw new Error("Gemini API Error: " + response.status + " - " + errorText);
  }

  const data = await response.json();

  // Extract generated text from Interactions API response
  let code = "";
  if (data.steps && data.steps[0] && data.steps[0].content && data.steps[0].content[0]) {
    code = data.steps[0].content[0].text;
  } else if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    code = data.candidates[0].content.parts[0].text;
  }

  code = code.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  if (!code) {
    throw new Error("No code generated in API response: " + JSON.stringify(data));
  }

  const outputDir = path.join(process.cwd(), 'components');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = "component-" + today + ".html";
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, code, "utf8");

  console.log("Successfully generated and saved: " + filePath);
}

generateComponent().catch((err) => {
  console.error("Failed to generate component:", err);
  process.exit(1);
});
