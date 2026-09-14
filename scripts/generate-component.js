const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is missing.");
  process.exit(1);
}

// Master Library of 20 Practical & Cinematic UI Components
const COMPONENT_LIBRARY = [
  // 1. Navigation & Flow
  "Floating dynamic island dock with magnetic icon pull and liquid indicator",
  "Tactile segmented tab switcher with gliding pill and view transitions",
  "Multi-step breadcrumb progress stepper with active node pulses",
  
  // 2. Authentication & Identity
  "3D glassmorphic login and signup portal with smooth mode morphing",
  "6-digit OTP code verification grid with auto-advancing inputs and resend timer",
  "Phone number authentication drawer with country selector and SMS trigger",
  "Biometric passkey scanner with interactive laser sweep and security unlock",

  // 3. Actions & Physical Buttons
  "Physical add-to-cart button with package drop bounce and spark burst",
  "Multi-stage morphing action button with SVG progress arc and checkmark draw",
  "Slide-to-confirm mechanical actuator switch with spring lock physics",
  "Orbital floating action button (FAB) that expands into radial satellite nodes",

  // 4. Inputs & Form Controls
  "Floating label form inputs with laser border focus and live inline validation",
  "Password entropy cipher meter with real-time bit-strength calculation",
  "Mechanical high-horology rotary dial and circular slider with angle readout",
  "Drag-and-drop file upload zone with dashed perimeter and circular progress ring",

  // 5. Content Showcase & Cards
  "3D cylindrical arc deck carousel with architectural imagery and drag inertia",
  "Interactive bento feature grid with mouse-tracked specular glare and widgets",
  "Holographic 3D asset vault card with gyroscopic tilt and metallic sheen",
  "Comparison pricing matrix tier cards with annual discount toggle",

  // 6. Overlays & Feedback
  "Interactive floating toast notification banner with auto-dismiss progress bar",
  "Audio telemetry equalizer widget with live glowing frequency bars"
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
  const prompt = "Create a single, complete, ultra-premium, self-contained HTML file for an original, practical website UI component: " + category + ".\n\nStrict requirements:\n1. Completely self-contained single-file with embedded <style> and <script> tags. No external CSS/JS libraries or CDNs.\n2. Meaningful Physical Animations: Do NOT just add glowing colors or hover shadows. Implement complete, tangible multi-stage state transitions (Idle -> In-flight Interaction/Morph -> Processing/Progress -> Success Resolution -> Reset) using structural layout morphing, SVG stroke-drawing paths, and micro-particle physics.\n3. Layering & Visibility: Never render solid or opaque indicators over icons or text. Always place glowing active pills on lower z-indexes (z-index: 1) strictly behind foreground icons and text (z-index: 2), using translucent gradients so all elements remain 100% visible and unblocked.\n4. Visual Aesthetics: Dark luxury theme (#04060a), refined glassmorphism, subtle golden or cyan lighting, crisp micro-typography, and high-resolution Unsplash imagery when applicable.\n5. Standard English: Use clear, standard, elegant English for all labels, titles, and buttons.\n6. Originality: Do not copy existing code verbatim; build an original, production-ready implementation.\n7. Output raw HTML only (no markdown backticks).";

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

  if (!code) {
    throw new Error("Could not extract generated code from response.");
  }

  const outputDir = path.join(process.cwd(), 'components');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `component-${timeStr}_part${index}.html`;
  fs.writeFileSync(path.join(outputDir, filename), code, 'utf8');
  console.log(`Saved: ${filename}`);
}

async function runBatch() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = String(now.getHours()).padStart(2, '0') + "-" + String(now.getMinutes()).padStart(2, '0') + "-" + String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${date}_${time}`;

  // Shuffle and pick 2 distinct categories
  const shuffled = [...COMPONENT_LIBRARY].sort(() => 0.5 - Math.random());

  // 1. Generate Part 1
  await generateSingle(shuffled[0], 1, timeStr);

  // 2. Pause 15 seconds to stay safely within Google API rate limits
  console.log("Waiting 15 seconds to prevent rate limits before part 2...");
  await new Promise(resolve => setTimeout(resolve, 15000));

  // 3. Generate Part 2
  await generateSingle(shuffled, 2, timeStr);
}

runBatch().catch(err => {
  console.error("Batch run failed:", err);
  process.exit(1);
});
