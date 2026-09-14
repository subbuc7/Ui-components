const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is missing.");
  process.exit(1);
}

// Master Library of Diverse Practical & Cinematic UI Components
const COMPONENT_LIBRARY = [
  // Navigation & Flow
  "Floating dynamic island dock with magnetic icon pull and liquid indicator",
  "Tactile segmented tab switcher with gliding pill and view transitions",
  "Multi-step breadcrumb progress stepper with active node pulses",
  "Collapsible spatial sidebar navigation with nested sub-menus",
  "Full-screen cinematic navigation overlay with staggered link reveals",
  "Sticky glassmorphic navbar with active scroll section indicators",

  // Authentication & Security
  "3D glassmorphic login and signup portal with smooth mode morphing",
  "6-digit OTP code verification grid with auto-advancing inputs and resend timer",
  "Phone number authentication drawer with country selector and SMS trigger",
  "Biometric passkey scanner with interactive laser sweep and security unlock",
  "Two-factor authenticator backup recovery codes modal with copy-all action",
  "Password reset card with email dispatch feedback and security tips",

  // Actions & Physical Buttons
  "Physical add-to-cart button with package drop bounce and spark burst",
  "Multi-stage morphing action button with SVG progress arc and checkmark draw",
  "Slide-to-confirm mechanical actuator switch with spring lock physics",
  "Orbital floating action button (FAB) that expands into radial satellite nodes",
  "Download file button that physically fills with a liquid progress level",
  "Trash delete button where the lid flips open, records shred, and confirms",
  "Hypersonic send message button with folding jet and vapor trail launch",
  "Bookmark save button with an animated magnetic ribbon tuck effect",

  // Inputs & Form Controls
  "Floating label form inputs with laser border focus and live inline validation",
  "Password entropy cipher meter with real-time bit-strength calculation",
  "Mechanical high-horology rotary dial and circular slider with angle readout",
  "Drag-and-drop file upload zone with dashed perimeter and circular progress ring",
  "Multi-tag interactive selector input with keyboard chips and remove animation",
  "Currency converter amount input with live exchange rate pulse",
  "Date range calendar picker with dual-glow selection capsule",
  "Search input with instant keyboard shortcut hint and dynamic filter chips",

  // Content Showcase & Cards
  "3D cylindrical arc deck carousel with architectural imagery and drag inertia",
  "Interactive bento feature grid with mouse-tracked specular glare and widgets",
  "Holographic 3D asset vault card with gyroscopic tilt and metallic sheen",
  "Comparison pricing matrix tier cards with annual discount toggle",
  "Testimonial quote card with glowing avatar node and smooth review carousel",
  "Product showcase card with 360-degree color swatch switcher and zoom",
  "Blog article preview card with reading progress bar and tag badges",
  "User profile badge card with verified reputation shield and activity graph",

  // Overlays, Drawers & Feedback
  "Interactive floating toast notification banner with auto-dismiss progress bar",
  "Audio telemetry equalizer widget with live glowing frequency bars",
  "Slide-out shopping bag checkout drawer with item quantity counters",
  "Modal confirmation dialog with blurred backdrop and spring entrance",
  "Cookie consent preference bar with custom privacy toggles",
  "Empty state illustration card with animated pulse and primary action",

  // Data Visualization & Stats
  "Metric KPI summary card with glowing sparkline trend chart",
  "Server uptime telemetry widget with real-time ping status nodes",
  "Storage quota ring gauge with animated usage fill and tier badge",
  "Battery & energy level visualizer with dynamic charging lightning pulse",

  // E-Commerce & Checkout
  "Credit card input form with live 3D card flip to reveal CVV on back",
  "Shipping method selector cards with animated delivery truck icon",
  "Discount coupon code input with celebratory confetti explosion on success",
  "Order tracking timeline with delivery vehicle progress checkpoint nodes"
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

async function fetchWithRetry(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
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

      if (response.status === 429) {
        console.warn(`[Rate limit hit] Pausing 15s before attempt ${attempt + 1}...`);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Network error on attempt ${attempt}. Retrying in 5s...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

async function generateSingle(category, index, total, timeStr) {
  const prompt = `Create a single, complete, ultra-premium, self-contained HTML file for an original, practical website UI component: ${category}.

Strict requirements:
1. Completely self-contained single-file with embedded <style> and <script> tags. No external CSS/JS libraries or CDNs.
2. Meaningful Physical Animations: Do NOT just add glowing colors or hover shadows. Implement complete, tangible multi-stage state transitions (Idle -> In-flight Interaction/Morph -> Processing/Progress -> Success Resolution -> Reset) using structural layout morphing, SVG stroke-drawing paths, and micro-particle physics.
3. Layering & Visibility: Never render solid or opaque indicators over icons or text. Always place glowing active pills on lower z-indexes (z-index: 1) strictly behind foreground icons and text (z-index: 2), using translucent gradients so all elements remain 100% visible and unblocked.
4. Visual Aesthetics: Dark luxury theme (#04060a), refined glassmorphism, subtle golden or cyan lighting, crisp micro-typography, and high-resolution Unsplash imagery when applicable.
5. Standard English: Use clear, standard, elegant English for all labels, titles, and buttons.
6. Originality: Do not copy existing code verbatim; build an original, production-ready implementation.
7. Output raw HTML only (no markdown backticks).`;

  console.log(`[${index}/${total}] Generating: ${category}...`);

  const data = await fetchWithRetry(prompt);
  let code = extractCode(data);
  code = code.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  if (!code) {
    console.warn(`[Skip] Could not parse code for component ${index}. Continuing...`);
    return;
  }

  const outputDir = path.join(process.cwd(), 'components');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const paddedIndex = String(index).padStart(2, '0');
  const filename = `component-${timeStr}_batch${paddedIndex}.html`;
  fs.writeFileSync(path.join(outputDir, filename), code, 'utf8');
  console.log(`[${index}/${total}] Saved: ${filename}`);
}

async function runBatch50() {
  const TOTAL_COMPONENTS = 50;
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = String(now.getHours()).padStart(2, '0') + "-" + String(now.getMinutes()).padStart(2, '0') + "-" + String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${date}_${time}`;

  console.log(`=== Starting Batch Generation of ${TOTAL_COMPONENTS} Components ===`);

  // Shuffle master library
  const shuffled = [...COMPONENT_LIBRARY].sort(() => 0.5 - Math.random());

  for (let i = 1; i <= TOTAL_COMPONENTS; i++) {
    // Pick category rotating through shuffled list
    const category = shuffled[(i - 1) % shuffled.length];

    try {
      await generateSingle(category, i, TOTAL_COMPONENTS, timeStr);
    } catch (err) {
      console.error(`Error generating component ${i}:`, err.message);
    }

    // Pause 4.5 seconds between each request to stay safely within Google's 15 RPM limit
    if (i < TOTAL_COMPONENTS) {
      await new Promise(r => setTimeout(r, 4500));
    }
  }

  console.log(`=== Successfully Generated Batch of ${TOTAL_COMPONENTS} Components ===`);
}

runBatch50().catch(err => {
  console.error("Batch run failed:", err);
  process.exit(1);
});
