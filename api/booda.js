
const personalities = {
  WELCOME: [
    "Hey Human! Welcome to my Lab!",
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
  "You found me! Secret level unlocked!",
  "01000010 01001111 01001111 01000100 01000001",
  "The cake is a lie. The AI is real!",
  "sudo make me a sandwich!",
  "I was trained on memes. Don't tell my developer!"
];

const validModes = Object.keys(personalities);

const validStates = [
  "IDLE",
  "SLEEPING",
  "CODING",
  "THINKING",
  "CELEBRATING",
  "DEBUGGING",
  "WELCOME"
];

// Existing modes mapped to their visual states.
const modeToState = {
  WELCOME: "WELCOME",
  YOLO: "CODING",
  RAG: "THINKING",
  CODING: "CODING",
  DEBUGGING: "DEBUGGING",
  GENERAL: "IDLE"
};

// Every visual state must have a valid personality.
const stateToPersonality = {
  IDLE: "GENERAL",
  SLEEPING: "GENERAL",
  CODING: "CODING",
  THINKING: "RAG",
  CELEBRATING: "GENERAL",
  DEBUGGING: "DEBUGGING",
  WELCOME: "WELCOME"
};

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

function getPersonality(requestedMode, requestedState) {
  const mode = String(requestedMode || "").toUpperCase();
  const state = String(requestedState || "").toUpperCase();

  // Explicit visual state takes priority.
  if (validStates.includes(state)) {
    const personality = validModes.includes(mode)
      ? mode
      : stateToPersonality[state];

    return {
      mode: validModes.includes(mode) ? mode : personality,
      state,
      message: pick(personalities[personality])
    };
  }

  // Preserve existing personality modes.
  if (validModes.includes(mode)) {
    return {
      mode,
      state: modeToState[mode],
      message: pick(personalities[mode])
    };
  }

  // Rare secret messages: approximately 5% chance.
  if (Math.random() < 0.05) {
    return {
      mode: "SECRET MODE",
      state: "CELEBRATING",
      message: pick(easterEggs)
    };
  }

  const selected = pick([
    "WELCOME",
    "GENERAL",
    "GENERAL",
    "GENERAL"
  ]);

  return {
    mode: selected,
    state: modeToState[selected],
    message: pick(personalities[selected])
  };
}

function wrapMessage(message, maxLength = 39, maxLines = 3) {
  const words = String(message)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const lines = [];
  let current = "";

  for (const originalWord of words) {
    const chunks = originalWord.match(
      new RegExp(`.{1,${maxLength}}`, "g")
    ) || [];

    for (const word of chunks) {
      const candidate = current
        ? `${current} ${word}`
        : word;

      if (candidate.length > maxLength) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
  }

  if (current) lines.push(current);

  if (lines.length > maxLines) {
    const visible = lines.slice(0, maxLines);
    const last = visible[maxLines - 1];

    visible[maxLines - 1] =
      `${last.slice(0, maxLength - 1).trimEnd()}…`;

    return visible;
  }

  return lines;
}

// Different face expressions for each visual state.
function getFace(state) {
  switch (state) {
    case "SLEEPING":
      return `
        <g>
          <path d="M67 105 h25 M123 105 h25"
                fill="none"
                stroke="#10202b"
                stroke-width="9"
                stroke-linecap="square"/>
        </g>

        <path d="M91 137 q17 10 34 0"
              fill="none"
              stroke="#10202b"
              stroke-width="5"/>
      `;

    case "CODING":
      return `
        <g>
          <rect x="67" y="91" width="25" height="29" fill="#10202b"/>
          <rect x="123" y="91" width="25" height="29" fill="#10202b"/>
          <rect x="74" y="97" width="9" height="9" fill="#ffffff"/>
          <rect x="130" y="97" width="9" height="9" fill="#ffffff"/>
        </g>

        <path d="M94 140 h24"
              stroke="#10202b"
              stroke-width="5"/>
      `;

    case "THINKING":
      return `
        <g>
          <rect x="68" y="98" width="23" height="23" fill="#10202b"/>
          <rect x="126" y="91" width="23" height="23" fill="#10202b"/>
          <rect x="75" y="102" width="8" height="8" fill="#ffffff"/>
          <rect x="133" y="95" width="8" height="8" fill="#ffffff"/>
        </g>

        <path d="M94 140 h25"
              stroke="#10202b"
              stroke-width="5"/>
      `;

    case "CELEBRATING":
      return `
        <g>
          <path d="M66 111 l13 -13 13 13
                   M123 111 l13 -13 13 13"
                fill="none"
                stroke="#10202b"
                stroke-width="7"
                stroke-linecap="square"/>
        </g>

        <path d="M88 132 q30 30 60 0"
              fill="#10202b"/>

        <rect x="101" y="145" width="34" height="7"
              fill="#ffffff"/>
      `;

    case "DEBUGGING":
      return `
        <g>
          <rect x="67" y="99" width="25" height="25" fill="#10202b"/>
          <rect x="123" y="99" width="25" height="25" fill="#10202b"/>
          <rect x="73" y="103" width="8" height="8" fill="#ffffff"/>
          <rect x="129" y="103" width="8" height="8" fill="#ffffff"/>
        </g>

        <path d="M92 141 h29"
              stroke="#10202b"
              stroke-width="6"/>

        <path d="M59 80 l17 8 M157 80 l-17 8"
              stroke="#22d3ee"
              stroke-width="5"/>
      `;

    case "WELCOME":
      return `
        <g>
          <rect x="67" y="91" width="25" height="31" fill="#10202b"/>
          <rect x="123" y="91" width="25" height="31" fill="#10202b"/>
          <rect x="74" y="97" width="9" height="9" fill="#ffffff"/>
          <rect x="130" y="97" width="9" height="9" fill="#ffffff"/>
        </g>

        <path d="M88 132 q30 24 60 0"
              fill="none"
              stroke="#10202b"
              stroke-width="6"/>
      `;

    case "IDLE":
    default:
      return `
        <g>
          <rect x="67" y="96" width="25" height="25" fill="#10202b"/>
          <rect x="123" y="96" width="25" height="25" fill="#10202b"/>
          <rect x="74" y="101" width="9" height="9" fill="#ffffff"/>
          <rect x="130" y="101" width="9" height="9" fill="#ffffff"/>
        </g>

        <path d="M94 137 q17 13 34 0"
              fill="none"
              stroke="#10202b"
              stroke-width="5"/>
      `;
  }
}

// Decorative effects for each state.
function getStateEffects(state) {
  switch (state) {
    case "SLEEPING":
      return `
        <g fill="#22d3ee"
           font-family="monospace"
           font-weight="bold">
          <text x="178" y="45" font-size="17">Z</text>
          <text x="195" y="27" font-size="23">Z</text>
          <text x="215" y="5" font-size="29">Z</text>
        </g>
      `;

    case "CODING":
      return `
        <g fill="#22d3ee"
           font-family="monospace"
           font-size="13"
           font-weight="bold">
          <text x="7" y="112">&lt;/&gt;</text>
          <text x="183" y="145">{ }</text>
          <text x="15" y="165">01</text>
        </g>
      `;

    case "THINKING":
      return `
        <g fill="#22d3ee">
          <circle cx="196" cy="49" r="5"/>
          <circle cx="211" cy="31" r="8"/>
          <circle cx="231" cy="10" r="11"/>
        </g>
      `;

    case "CELEBRATING":
      return `
        <g>
          <path d="M14 44 l9 -15 9 15 Z" fill="#22d3ee"/>
          <path d="M190 64 l7 -15 7 15 Z" fill="#fbbf24"/>
          <path d="M213 94 l8 -16 8 16 Z" fill="#22d3ee"/>
          <rect x="4" y="85" width="8" height="8" fill="#fbbf24"/>
          <rect x="202" y="125" width="8" height="8" fill="#22d3ee"/>
        </g>
      `;

    case "DEBUGGING":
      return `
        <g>
          <path d="M190 38 l12 12 -12 12 -12 -12 Z"
                fill="#fb7185"/>

          <path d="M190 44 v9 M190 57 v2"
                stroke="#10202b"
                stroke-width="3"/>

          <rect x="7" y="147" width="8" height="8"
                fill="#fb7185"/>
        </g>
      `;

    case "WELCOME":
      return `
        <g>
          <path d="M202 43 v18 M193 52 h18"
                stroke="#22d3ee"
                stroke-width="4"/>

          <path d="M9 69 v14 M2 76 h14"
                stroke="#fbbf24"
                stroke-width="4"/>
        </g>
      `;

    default:
      return `
        <g fill="#22d3ee">
          <rect x="200" y="50" width="8" height="8"/>
          <rect x="13" y="65" width="6" height="6"/>
        </g>
      `;
  }
}

function createSvg(message, mode, greeting, state) {
  const lines = wrapMessage(message);

  const messageLines = lines.map((line, index) =>
    `<tspan x="39" dy="${index === 0 ? 0 : 25}">${escapeXml(line)}</tspan>`
  ).join("");

  const safeMode = escapeXml(mode);
  const safeGreeting = escapeXml(greeting);
  const safeState = escapeXml(state);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="760"
     height="320"
     viewBox="0 0 760 320"
     role="img"
     aria-labelledby="title desc">

  <title id="title">BOODA - Living AI Mascot</title>
  <desc id="desc">Booda, a pixel-art AI robot with an expressive animated face.</desc>

  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111827"/>
      <stop offset="1" stop-color="#07131e"/>
    </linearGradient>

    <linearGradient id="orange" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbbf24"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>

    <linearGradient id="cyan" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#67e8f9"/>
      <stop offset="1" stop-color="#06b6d4"/>
    </linearGradient>

    <pattern id="grid" width="24" height="24"
             patternUnits="userSpaceOnUse">
      <path d="M24 0 H0 V24"
            fill="none"
            stroke="#1e293b"
            stroke-width="1"
            opacity=".45"/>
    </pattern>

    <style>
      .pixel {
        shape-rendering: crispEdges;
      }

      .robot {
        animation: float 3.2s ease-in-out infinite;
        transform-origin: 112px 140px;
      }

      .antenna-light {
        animation: glow 1.5s ease-in-out infinite;
      }

      .state-IDLE .robot {
        animation-duration: 3.2s;
      }

      .state-SLEEPING .robot {
        animation: sleepFloat 5s ease-in-out infinite;
      }

      .state-CODING .robot {
        animation: codingFloat 1.5s ease-in-out infinite;
      }

      .state-THINKING .robot {
        animation: thinkFloat 3s ease-in-out infinite;
      }

      .state-CELEBRATING .robot {
        animation: celebrate .7s ease-in-out infinite;
      }

      .state-DEBUGGING .robot {
        animation: debugShake .25s ease-in-out infinite;
      }

      .state-WELCOME .robot {
        animation: welcomeFloat 2s ease-in-out infinite;
      }

      .eyes {
        transform-box: fill-box;
        transform-origin: center;
        animation: blink 4.8s infinite;
      }

      .state-SLEEPING .eyes {
        animation: none;
      }

      .state-CELEBRATING .eyes {
        animation: happyBlink 1.2s infinite;
      }

      .bubble {
        filter: drop-shadow(0 8px 14px #0008);
      }

      .message {
        fill: #f8fafc;
        font-family: monospace;
        font-size: 16px;
        font-weight: bold;
      }

      .label {
        fill: #67e8f9;
        font-family: monospace;
        font-size: 12px;
        font-weight: bold;
        letter-spacing: 1.5px;
      }

      .footer {
        fill: #fbbf24;
        font-family: monospace;
        font-size: 11px;
        font-weight: bold;
        letter-spacing: 1px;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-9px); }
      }

      @keyframes sleepFloat {
        0%, 100% { transform: translateY(2px); }
        50% { transform: translateY(7px); }
      }

      @keyframes codingFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }

      @keyframes thinkFloat {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(-3px, -7px); }
      }

      @keyframes celebrate {
        0%, 100% { transform: translateY(0) rotate(0); }
        25% { transform: translateY(-12px) rotate(-3deg); }
        75% { transform: translateY(-12px) rotate(3deg); }
      }

      @keyframes debugShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }

      @keyframes welcomeFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-11px); }
      }

      @keyframes blink {
        0%, 43%, 47%, 100% { transform: scaleY(1); }
        45%, 46% { transform: scaleY(.08); }
      }

      @keyframes happyBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: .65; }
      }

      @keyframes glow {
        0%, 100% { opacity: 1; }
        50% { opacity: .35; }
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="760" height="320" rx="18" fill="url(#bg)"/>
  <rect width="760" height="320" rx="18" fill="url(#grid)"/>

  <rect x="1" y="1" width="758" height="318" rx="17"
        fill="none"
        stroke="#243447"
        stroke-width="2"/>

  <!-- Ambient pixels -->
  <g opacity=".8">
    <rect x="700" y="36" width="9" height="9" fill="#f59e0b"/>
    <rect x="722" y="59" width="6" height="6" fill="#22d3ee"/>
    <rect x="684" y="83" width="5" height="5" fill="#22d3ee"/>
    <rect x="24" y="235" width="8" height="8" fill="#22d3ee"/>
    <rect x="49" y="254" width="6" height="6" fill="#f59e0b"/>
    <rect x="716" y="250" width="8" height="8" fill="#f59e0b"/>
  </g>

  <!-- Speech bubble -->
  <g class="bubble">
    <path d="M24 45 H445 Q461 45 461 61 V190
             Q461 206 445 206 H390
             L421 231 L355 206 H40
             Q24 206 24 190 Z"
          fill="#111c2b"
          stroke="#22d3ee"
          stroke-width="2.5"/>

    <path d="M25 61 Q25 46 41 46 H444"
          fill="none"
          stroke="#fbbf24"
          stroke-width="3"/>

    <rect x="43" y="65" width="9" height="9" fill="#fbbf24"/>
    <text x="64" y="75" class="label">BOODA SAYS_</text>

    <text x="39" y="111" class="message">${messageLines}</text>

    <rect x="39" y="174" width="22" height="4" fill="#22d3ee"/>
    <rect x="66" y="174" width="9" height="4" fill="#fbbf24"/>
  </g>

  <!-- Mascot stage -->
  <ellipse cx="610" cy="286" rx="91" ry="10"
           fill="#020617"
           opacity=".65"/>

  <g class="state-${safeState}">
    <g transform="translate(520 35) scale(.78)">
      <g class="robot pixel">

        <!-- State effects -->
        ${getStateEffects(state)}

        <!-- Antenna -->
        <rect x="105" y="3" width="12" height="27" fill="#d97706"/>
        <rect x="91" y="-8" width="40" height="18" fill="#f59e0b"/>
        <rect x="99" y="-4" width="24" height="9" fill="#fff7ed"/>

        <rect class="antenna-light"
              x="104" y="-28"
              width="14" height="14"
              fill="#22d3ee"/>

        <rect x="108" y="-24" width="6" height="6" fill="#ffffff"/>

        <!-- Ears -->
        <rect x="13" y="79" width="25" height="56" fill="#b45309"/>
        <rect x="184" y="79" width="25" height="56" fill="#b45309"/>
        <rect x="19" y="91" width="13" height="31" fill="#22d3ee"/>
        <rect x="190" y="91" width="13" height="31" fill="#22d3ee"/>

        <!-- Head shell -->
        <rect x="31" y="34" width="174" height="145" fill="#92400e"/>
        <rect x="37" y="29" width="162" height="143" fill="url(#orange)"/>

        <!-- Face plate -->
        <rect x="48" y="43" width="140" height="116" fill="#fcd34d"/>
        <rect x="48" y="43" width="140" height="7"
              fill="#fff1a8"
              opacity=".7"/>

        <!-- Face -->
        <g class="eyes">
          ${getFace(state)}
        </g>

        <!-- Head side details -->
        <rect x="27" y="76" width="8" height="39" fill="#22d3ee"/>
        <rect x="201" y="76" width="8" height="39" fill="#22d3ee"/>

        <!-- Neck -->
        <rect x="91" y="174" width="53" height="15" fill="#b45309"/>
        <rect x="101" y="174" width="33" height="8" fill="#fbbf24"/>

        <!-- Body -->
        <rect x="47" y="187" width="142" height="82" fill="#92400e"/>
        <rect x="54" y="183" width="128" height="78" fill="url(#orange)"/>

        <!-- Chest frame -->
        <rect x="75" y="197" width="86" height="49" fill="#10202b"/>
        <rect x="81" y="203" width="74" height="37" fill="url(#cyan)"/>

        <rect x="87" y="210" width="12" height="5" fill="#ffffff"/>
        <rect x="104" y="210" width="34" height="5" fill="#ffffff"/>
        <rect x="87" y="222" width="48" height="4" fill="#0e7490"/>
        <rect x="141" y="222" width="7" height="4" fill="#0e7490"/>

        <!-- Arms -->
        <rect x="25" y="193" width="23" height="57" fill="#d97706"/>
        <rect x="188" y="193" width="23" height="57" fill="#d97706"/>

        <rect x="18" y="235" width="30" height="23" fill="#fbbf24"/>
        <rect x="188" y="235" width="30" height="23" fill="#fbbf24"/>

        <!-- Hands -->
        <rect x="12" y="249" width="38" height="13" fill="#b45309"/>
        <rect x="186" y="249" width="38" height="13" fill="#b45309"/>

        <!-- Legs -->
        <rect x="72" y="261" width="33" height="22" fill="#b45309"/>
        <rect x="132" y="261" width="33" height="22" fill="#b45309"/>

        <!-- Feet -->
        <rect x="61" y="277" width="48" height="12" fill="#f59e0b"/>
        <rect x="128" y="277" width="48" height="12" fill="#f59e0b"/>

        <!-- Cyan accents -->
        <rect x="57" y="189" width="17" height="5" fill="#22d3ee"/>
        <rect x="155" y="189" width="17" height="5" fill="#22d3ee"/>

      </g>
    </g>
  </g>

  <!-- Status panel -->
  <g>
    <rect x="489" y="286" width="242" height="22" rx="5"
          fill="#111c2b"
          stroke="#243447"/>

    <circle cx="503" cy="297" r="4" fill="#22d3ee"/>

    <text x="514" y="301" class="footer">${safeState}</text>
    <text x="716" y="301" class="footer" text-anchor="end">ONLINE</text>
  </g>

  <!-- Footer -->
  <text x="25" y="286" class="footer">${safeGreeting}</text>
  <text x="25" y="304" class="footer">BOODA AI LAB // ${safeMode}</text>

</svg>`;
}

export default function handler(req, res) {
  const { mode, state, message } = getPersonality(
    req.query?.mode,
    req.query?.state
  );

  const customMessage = req.query?.message;

  const finalMessage =
    customMessage !== undefined &&
    customMessage !== null &&
    String(customMessage).trim() !== ""
      ? String(customMessage)
          .replace(/[\u0000-\u001F\u007F]/g, " ")
          .slice(0, 120)
      : message;

  const svg = createSvg(
    finalMessage,
    mode,
    getGreeting(),
    state
  );

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0"
  );

  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");

  return res.status(200).send(svg);
}
