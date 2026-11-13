
const messages = [
  "Hey Human! Welcome to my Lab 👾",
  "Scanning visitor... AI Engineer detected!",
  "Ready for some AI experiments? 🧪",
  "Warning: Too much curiosity detected! 😂",
  "BashaBot is online. Let's build something awesome ⚡",
  "Beep boop! Another day, another AI experiment 🚀",
  "Curiosity detected. Welcome to the Lab! 🔬",
  "010101... Human detected. Access granted! 🤖",
  "Building the future, one line at a time!",
  "Welcome to my digital playground! 🎮",
  "Keep calm and let AI do the magic!",
  "System online. Creativity at maximum level!"
];

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;"
  })[char]);
}

export default function handler(req, res) {
  const message = messages[
    Math.floor(Math.random() * messages.length)
  ];

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="620"
     height="270"
     viewBox="0 0 620 270">

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
        transform-origin: 440px 35px;
      }

      .bubble {
        fill: #171923;
        stroke: #f59e0b;
        stroke-width: 3;
      }

      .message {
        fill: #ffffff;
        font-family: monospace;
        font-size: 17px;
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

  <!-- Speech bubble -->
  <rect class="bubble" x="12" y="48"
        width="340" height="112" rx="14"/>

  <path d="M320 150 L350 177 L350 140"
        fill="#171923" stroke="#f59e0b"
        stroke-width="3" stroke-linejoin="round"/>

  <circle cx="35" cy="70" r="4" fill="#fbbf24"/>

  <text x="52" y="82" class="small">BASHABOT SAYS:</text>

  <foreignObject x="30" y="94" width="305" height="58">
    <div xmlns="http://www.w3.org/1999/xhtml"
         style="color:white;font-family:monospace;
                font-size:16px;font-weight:bold;
                line-height:1.4;overflow-wrap:anywhere;">
      ${escapeXml(message)}
    </div>
  </foreignObject>

  <!-- Robot -->
  <g class="robot">

    <!-- Antenna -->
    <rect x="434" y="35" width="12" height="28" fill="#f59e0b"/>
    <g class="antenna">
      <rect x="425" y="20" width="30" height="18"
            fill="#fbbf24"/>
      <rect x="431" y="25" width="18" height="8"
            fill="#fff7ed"/>
    </g>

    <!-- Ears -->
    <rect x="350" y="95" width="28" height="52"
          fill="#d97706"/>
    <rect x="502" y="95" width="28" height="52"
          fill="#d97706"/>
    <rect x="356" y="106" width="16" height="28"
          fill="#fbbf24"/>
    <rect x="508" y="106" width="16" height="28"
          fill="#fbbf24"/>

    <!-- Head -->
    <rect x="375" y="62" width="130" height="105"
          fill="#f59e0b"/>
    <rect x="386" y="73" width="108" height="83"
          fill="#fbbf24"/>

    <!-- Eyes -->
    <g class="eyes">
      <rect x="400" y="98" width="24" height="25"
            fill="#171923"/>
      <rect x="456" y="98" width="24" height="25"
            fill="#171923"/>
      <rect x="407" y="103" width="8" height="8"
            fill="#ffffff"/>
      <rect x="463" y="103" width="8" height="8"
            fill="#ffffff"/>
    </g>

    <!-- Smile -->
    <rect x="420" y="136" width="42" height="7"
          fill="#171923"/>
    <rect x="428" y="143" width="26" height="5"
          fill="#171923"/>

    <!-- Body -->
    <rect x="390" y="170" width="100" height="68"
          fill="#d97706"/>
    <rect x="400" y="180" width="80" height="48"
          fill="#fbbf24"/>

    <!-- Chest screen -->
    <rect x="414" y="191" width="52" height="27"
          fill="#171923"/>
    <rect x="420" y="197" width="40" height="15"
          fill="#22d3ee"/>
    <text x="425" y="208"
          fill="#171923"
          font-size="9"
          font-family="monospace">AI.exe</text>

    <!-- Arms -->
    <rect x="366" y="177" width="20" height="48"
          fill="#f59e0b"/>
    <rect x="494" y="177" width="20" height="48"
          fill="#f59e0b"/>

    <!-- Hands -->
    <rect x="358" y="215" width="28" height="20"
          fill="#fbbf24"/>
    <rect x="494" y="215" width="28" height="20"
          fill="#fbbf24"/>

    <!-- Legs -->
    <rect x="404" y="238" width="25" height="20"
          fill="#d97706"/>
    <rect x="451" y="238" width="25" height="20"
          fill="#d97706"/>

    <!-- Feet -->
    <rect x="395" y="254" width="37" height="10"
          fill="#f59e0b"/>
    <rect x="447" y="254" width="37" height="10"
          fill="#f59e0b"/>

  </g>

  <!-- Decorative pixels -->
  <rect x="555" y="65" width="10" height="10" fill="#f59e0b"/>
  <rect x="575" y="90" width="7" height="7" fill="#22d3ee"/>
  <rect x="550" y="120" width="6" height="6" fill="#fbbf24"/>
  <rect x="35" y="205" width="8" height="8" fill="#22d3ee"/>
  <rect x="60" y="225" width="6" height="6" fill="#f59e0b"/>

  <text x="20" y="255" class="small">
    BASHABOT v1.0 // AI LAB ONLINE
  </text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0"
  );
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");

  return res.status(200).send(svg);
}
