
const personalities = {
  WELCOME: [
    "Hey Human! Welcome to my Lab 👾",
    "AI Engineer detected. My favorite species!",
    "Welcome back! Ready to build the future?",
    "Curiosity detected. Access granted!",
    "My circuits are excited to see you!"
  ],

  YOLO: [
    "YOLO is detecting objects. Stay out of my bounding boxes!",
    "Object detected! Confidence: 99.9%",
    "Where is my dataset? I need more images!",
    "Drawing bounding boxes like a boss!",
    "Training YOLO. Please do not feed the GPU."
  ],

  RAG: [
    "Searching documents... Context found!",
    "Retrieving knowledge. Hallucinations not invited!",
    "Chunking documents like a professional!",
    "Vector database says hello!",
    "RAG mode: Grounded answers only!"
  ],

  CODING: [
    "Another line of code, another step forward!",
    "Python is my native language. Beep!",
    "Refactoring my thoughts...",
    "Code. Test. Debug. Repeat.",
    "I don't always code, but when I do, I forget to sleep!"
  ],

  DEBUGGING: [
    "It's not a bug. It's an undocumented feature!",
    "Debugging mode activated. Send coffee!",
    "Found a bug! It was hiding in plain sight.",
    "Stack trace detected. Investigating...",
    "Have you tried turning the model off and on?"
  ],

  GENERAL: [
    "Booda is online. Let's build something awesome!",
    "Too much curiosity detected!",
    "One small experiment, one giant breakthrough!",
    "Keep learning. Keep building. Keep shipping!",
    "My neural networks are feeling creative today!",
    "Beep boop! Your AI lab assistant is ready!"
  ]
};

const easterEggs = [
  "You found me! Secret level unlocked! 🥚",
  "01000010 01001111 01001111 01000100 01000001",
  "The cake is a lie. The AI is real!",
  "sudo make me a sandwich!",
  "I was trained on memes. Don't tell my developer!"
];

const validModes = Object.keys(personalities);

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, char => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;"
  })[char]);
}

function getCairoHour() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Africa/Cairo"
    }).format(new Date())
  );
}

function getGreeting() {
  const hour = getCairoHour();

  if (hour >= 5 && hour < 12) return "GOOD MORNING";
  if (hour >= 12 && hour < 17) return "GOOD AFTERNOON";
  if (hour >= 17 && hour < 22) return "GOOD EVENING";

  return "NIGHT SHIFT MODE";
}

function getPersonality(requestedMode) {
  const mode = String(requestedMode || "").toUpperCase();

  if (validModes.includes(mode)) {
    return {
      mode,
      message: pick(personalities[mode])
    };
  }

  // Rare secret messages: approximately 5% chance.
  if (Math.random() < 0.05) {
    return {
      mode: "SECRET MODE",
      message: pick(easterEggs)
    };
  }

  const availableModes = ["WELCOME", "GENERAL", "GENERAL", "GENERAL"];

  const selected = pick(availableModes);

  return {
    mode: selected,
    message: pick(personalities[selected])
  };
}

function wrapMessage(message, maxLength = 34) {
  const words = message.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }

  if (current) lines.push(current);

  return lines.slice(0, 3);
}

function createSvg(message, mode, greeting) {
  const lines = wrapMessage(message);

  const messageLines = lines.map((line, index) =>
    `<tspan x="30" dy="${index === 0 ? 0 : 21}">${escapeXml(line)}</tspan>`
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="620" height="270"
     viewBox="0 0 620 270"
     role="img">

  <title>BOODA - AI Lab Mascot</title>
  <desc>BOODA, an animated AI robot assistant.</desc>

  <defs>
    <style>
      .robot {
        animation: float 3s ease-in-out infinite;
        transform-origin: 440px 145px;
      }

      .eyes {
        animation: blink 4s infinite;
        transform-origin: center;
      }

      .antenna {
        animation: pulse 1.5s ease-in-out infinite;
      }

      .message {
        fill: #ffffff;
        font-family: monospace;
        font-size: 14px;
        font-weight: bold;
      }

      .small {
        fill: #fbbf24;
        font-family: monospace;
        font-size: 12px;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-9px); }
      }

      @keyframes blink {
        0%, 45%, 48%, 100% { transform: scaleY(1); }
        46%, 47% { transform: scaleY(0.08); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.35; }
      }
    </style>
  </defs>

  <rect width="620" height="270" rx="12" fill="#0d1117"/>

  <!-- Speech bubble -->
  <rect x="12" y="48" width="340" height="112"
        rx="14" fill="#171923"
        stroke="#f59e0b" stroke-width="3"/>

  <path d="M320 150 L350 177 L350 140"
        fill="#171923" stroke="#f59e0b"
        stroke-width="3" stroke-linejoin="round"/>

  <circle cx="35" cy="70" r="4" fill="#fbbf24"/>

  <text x="52" y="82" class="small">BOODA SAYS:</text>

  <text x="30" y="108" class="message">${messageLines}</text>

  <!-- Robot -->
  <g class="robot">

    <!-- Antenna -->
    <rect x="434" y="35" width="12" height="28" fill="#f59e0b"/>

    <g class="antenna">
      <rect x="425" y="20" width="30" height="18" fill="#fbbf24"/>
      <rect x="431" y="25" width="18" height="8" fill="#fff7ed"/>
    </g>

    <!-- Ears -->
    <rect x="350" y="95" width="28" height="52" fill="#d97706"/>
    <rect x="502" y="95" width="28" height="52" fill="#d97706"/>
    <rect x="356" y="106" width="16" height="28" fill="#fbbf24"/>
    <rect x="508" y="106" width="16" height="28" fill="#fbbf24"/>

    <!-- Head -->
    <rect x="375" y="62" width="130" height="105" fill="#f59e0b"/>
    <rect x="386" y="73" width="108" height="83" fill="#fbbf24"/>

    <!-- Eyes -->
    <g class="eyes">
      <rect x="400" y="98" width="24" height="25" fill="#171923"/>
      <rect x="456" y="98" width="24" height="25" fill="#171923"/>
      <rect x="407" y="103" width="8" height="8" fill="#ffffff"/>
      <rect x="463" y="103" width="8" height="8" fill="#ffffff"/>
    </g>

    <!-- Smile -->
    <rect x="420" y="136" width="42" height="7" fill="#171923"/>
    <rect x="428" y="143" width="26" height="5" fill="#171923"/>

    <!-- Body -->
    <rect x="390" y="170" width="100" height="68" fill="#d97706"/>
    <rect x="400" y="180" width="80" height="48" fill="#fbbf24"/>

    <!-- Screen -->
    <rect x="414" y="191" width="52" height="27" fill="#171923"/>
    <rect x="420" y="197" width="40" height="15" fill="#22d3ee"/>

    <text x="425" y="208" fill="#171923"
          font-size="9" font-family="monospace">AI.exe</text>

    <!-- Arms -->
    <rect x="366" y="177" width="20" height="48" fill="#f59e0b"/>
    <rect x="494" y="177" width="20" height="48" fill="#f59e0b"/>

    <!-- Hands -->
    <rect x="358" y="215" width="28" height="20" fill="#fbbf24"/>
    <rect x="494" y="215" width="28" height="20" fill="#fbbf24"/>

    <!-- Legs -->
    <rect x="404" y="238" width="25" height="20" fill="#d97706"/>
    <rect x="451" y="238" width="25" height="20" fill="#d97706"/>

    <!-- Feet -->
    <rect x="395" y="254" width="37" height="10" fill="#f59e0b"/>
    <rect x="447" y="254" width="37" height="10" fill="#f59e0b"/>

  </g>

  <!-- Decorations -->
  <rect x="555" y="65" width="10" height="10" fill="#f59e0b"/>
  <rect x="575" y="90" width="7" height="7" fill="#22d3ee"/>
  <rect x="550" y="120" width="6" height="6" fill="#fbbf24"/>
  <rect x="35" y="205" width="8" height="8" fill="#22d3ee"/>
  <rect x="60" y="225" width="6" height="6" fill="#f59e0b"/>

  <text x="20" y="255" class="small">${escapeXml(greeting)}</text>
  <text x="440" y="255" class="small" text-anchor="middle">${escapeXml(mode)}</text>

</svg>`;
}

export default function handler(req, res) {
  const { mode, message } = getPersonality(req.query?.mode);

  // Optional custom message, safely escaped before SVG rendering.
  const finalMessage = req.query?.message
    ? String(req.query.message).slice(0, 100)
    : message;

  const svg = createSvg(
    finalMessage,
    mode,
    getGreeting()
  );

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");

  return res.status(200).send(svg);
}
