
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
  "IDLE", "SLEEPING", "CODING", "THINKING",
  "CELEBRATING", "DEBUGGING", "WELCOME"
];

const modeToState = {
  WELCOME: "WELCOME",
  YOLO: "CODING",
  RAG: "THINKING",
  CODING: "CODING",
  DEBUGGING: "DEBUGGING",
  GENERAL: "IDLE"
};

const stateToPersonality = {
  IDLE: "GENERAL",
  SLEEPING: "GENERAL",
  CODING: "CODING",
  THINKING: "RAG",
  CELEBRATING: "GENERAL",
  DEBUGGING: "DEBUGGING",
  WELCOME: "WELCOME"
};

const validOutfits = [
  "JACKET", "HOODIE", "HOOD", "BEANIE", "LAB", "ORANGE"
];

const stateToOutfit = {
  IDLE: "JACKET",
  SLEEPING: "JACKET",
  WELCOME: "HOODIE",
  CODING: "BEANIE",
  THINKING: "LAB",
  DEBUGGING: "HOOD",
  CELEBRATING: "ORANGE"
};

const COLORS = {
  outline: "#101116",
  hair: "#15110f",
  skin: "#e0a878",
  skinShade: "#c99266",
  beard: "#15110f",
  mouth: "#a0524a",
  mouthDark: "#7a1f1f",
  jacket: "#3d4244",
  jacketDark: "#292e30",
  zipper: "#b8c0c2",
  pants: "#5a6240",
  shoes: "#ffffff",
  cyan: "#22d3ee",
  white: "#ffffff",
  blanket: "#344b68",
  blanketLight: "#526b8b",
  blanketDark: "#26384f",
  pillow: "#d8dce2",
  jeans: "#2f4f8f",
  hoodie: "#1f2433",
  hoodieDark: "#161a26",
  hoodGray: "#3a3f4b",
  hoodBody: "#2a303c",
  hoodBodyDark: "#1c212b",
  string: "#e8e8ec",
  blue: "#2b4a8a",
  blueDark: "#203868",
  orange: "#f29a1a",
  orangeDark: "#c97a10",
  coat: "#f1f1f4",
  coatDark: "#1f2433",
  coatSeam: "#d3d6dd",
  red: "#dd3333",
  shades: "#16161a",
  shine: "#3a3a46",
  laptop: "#cfd2d8"
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
  return Number(new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hourCycle: "h23",
    timeZone: "Africa/Cairo"
  }).format(new Date()));
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

  if (validModes.includes(mode)) {
    return {
      mode,
      state: modeToState[mode],
      message: pick(personalities[mode])
    };
  }

  if (Math.random() < 0.05) {
    return {
      mode: "SECRET MODE",
      state: "CELEBRATING",
      message: pick(easterEggs)
    };
  }

  const selected = pick(["WELCOME", "GENERAL", "GENERAL", "GENERAL"]);

  return {
    mode: selected,
    state: modeToState[selected],
    message: pick(personalities[selected])
  };
}

function getOutfit(requestedOutfit, state) {
  const outfit = String(requestedOutfit || "").toUpperCase();

  return validOutfits.includes(outfit)
    ? outfit
    : stateToOutfit[state] || "JACKET";
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
      const candidate = current ? `${current} ${word}` : word;

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
    visible[maxLines - 1] =
      `${visible[maxLines - 1].slice(0, maxLength - 1).trimEnd()}…`;
    return visible;
  }

  return lines;
}

// ---------------------------------------------------------------
// Pixel helper
// ---------------------------------------------------------------

function pixel(x, y, w, h, color) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
}

// ---------------------------------------------------------------
// Pixel Grid
// ---------------------------------------------------------------

class PixelGrid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cells = Array.from(
      { length: height },
      () => Array(width).fill(null)
    );
  }

  put(x, y, w, h, color) {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        if (
          xx >= 0 && yy >= 0 &&
          xx < this.width && yy < this.height
        ) {
          this.cells[yy][xx] = color;
        }
      }
    }
  }

  toSvg(outlineColor) {
    const out = this.cells.map(row => row.slice());

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.cells[y][x]) continue;

        const touching = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1]
        ].some(([nx, ny]) =>
          nx >= 0 && ny >= 0 &&
          nx < this.width && ny < this.height &&
          this.cells[ny][nx]
        );

        if (touching) out[y][x] = outlineColor;
      }
    }

    let svg = "";

    for (let y = 0; y < this.height; y++) {
      let x = 0;

      while (x < this.width) {
        const color = out[y][x];

        if (!color) {
          x++;
          continue;
        }

        let end = x;

        while (end + 1 < this.width && out[y][end + 1] === color) {
          end++;
        }

        svg += `<rect x="${x}" y="${y}" width="${end - x + 1}" height="1" fill="${color}"/>`;
        x = end + 1;
      }
    }

    return svg;
  }
}

// ---------------------------------------------------------------
// Outfit definitions
// ---------------------------------------------------------------

function getOutfitStyle(outfit) {
  const c = COLORS;

  switch (outfit) {
    case "HOODIE":
      return {
        main: c.hoodie,
        dark: c.hoodieDark,
        seam: c.hoodieDark,
        pants: c.jeans,
        torso(g) {
          g.put(5, 12, 6, 1, c.hoodieDark);
          g.put(6, 13, 1, 3, c.string);
          g.put(9, 13, 1, 3, c.string);
          g.put(5, 16, 6, 1, c.hoodieDark);
        }
      };

    case "HOOD":
      return {
        main: c.hoodBody,
        dark: c.hoodBodyDark,
        seam: c.hoodBodyDark,
        pants: c.jeans,
        hood: true,
        torso(g) {
          g.put(5, 12, 6, 1, c.hoodBodyDark);
          g.put(6, 13, 1, 3, c.cyan);
          g.put(9, 13, 1, 3, c.cyan);
          g.put(5, 16, 6, 1, c.hoodBodyDark);
        }
      };

    case "BEANIE":
      return {
        main: c.blue,
        dark: c.blueDark,
        seam: c.blueDark,
        pants: c.hoodie,
        beanie: true,
        torso(g) {
          g.put(5, 12, 6, 1, c.blueDark);
          g.put(6, 13, 1, 3, c.string);
          g.put(9, 13, 1, 3, c.string);
          g.put(5, 16, 6, 1, c.blueDark);
        }
      };

    case "LAB":
      return {
        main: c.coat,
        dark: c.coatDark,
        seam: c.coatSeam,
        pants: c.jeans,
        torso(g) {
          g.put(7, 12, 2, 7, c.coatDark);
          g.put(5, 14, 1, 1, c.red);
          g.put(10, 15, 1, 1, c.cyan);
        }
      };

    case "ORANGE":
      return {
        main: c.orange,
        dark: c.orangeDark,
        seam: c.orangeDark,
        pants: c.jeans,
        shades: true,
        torso(g) {
          g.put(5, 12, 6, 1, c.orangeDark);
          g.put(6, 13, 1, 3, c.string);
          g.put(9, 13, 1, 3, c.string);
          g.put(5, 16, 6, 1, c.orangeDark);
        }
      };

    case "JACKET":
    default:
      return {
        main: c.jacket,
        dark: c.jacketDark,
        seam: c.jacketDark,
        pants: c.pants,
        torso(g) {
          g.put(5, 12, 6, 1, c.jacketDark);
          g.put(7, 12, 2, 7, c.zipper);
          g.put(5, 16, 2, 1, c.jacketDark);
          g.put(9, 16, 2, 1, c.jacketDark);
        }
      };
  }
}

// ---------------------------------------------------------------
// Standing character - corrected facial layout
// ---------------------------------------------------------------

function getStandingCharacter(state, outfit) {
  const c = COLORS;
  const o = getOutfitStyle(outfit);
  const g = new PixelGrid(16, 25);

  const pose =
    state === "CELEBRATING" ? "both-up" :
    state === "WELCOME" ? "right-up" :
    state === "CODING" ? "coding" :
    "down";

  const bigSmile =
    state === "WELCOME" || state === "CELEBRATING";

  const sleeping =
    state === "IDLE" || state === "SLEEPING";

  // -----------------------------------------------------------
  // Legs and shoes
  // -----------------------------------------------------------

  g.put(5, 19, 2, 3, o.pants);
  g.put(9, 19, 2, 3, o.pants);

  g.put(4, 22, 3, 2, c.shoes);
  g.put(9, 22, 3, 2, c.shoes);

  // -----------------------------------------------------------
  // Torso
  // -----------------------------------------------------------

  g.put(4, 12, 8, 7, o.main);

  // -----------------------------------------------------------
  // Arms
  // -----------------------------------------------------------

  const leftUp = pose === "both-up";
  const rightUp = pose === "both-up" || pose === "right-up";

  if (leftUp) {
    g.put(3, 12, 1, 2, o.main);
    g.put(1, 10, 2, 4, o.main);
    g.put(1, 8, 2, 2, c.skin);
  } else if (pose === "coding") {
    g.put(2, 13, 2, 3, o.main);
    g.put(2, 16, 2, 1, c.skin);
  } else {
    g.put(2, 13, 2, 5, o.main);
    g.put(2, 18, 2, 1, c.skin);
  }

  if (rightUp) {
    g.put(12, 12, 1, 2, o.main);
    g.put(13, 10, 2, 4, o.main);
    g.put(13, 8, 2, 2, c.skin);
  } else if (pose === "coding") {
    g.put(12, 13, 2, 3, o.main);
    g.put(12, 16, 2, 1, c.skin);
  } else {
    g.put(12, 13, 2, 5, o.main);
    g.put(12, 18, 2, 1, c.skin);
  }

  if (!leftUp) g.put(4, 13, 1, 5, o.seam);
  if (!rightUp) g.put(11, 13, 1, 5, o.seam);

  // -----------------------------------------------------------
  // Outfit details
  // -----------------------------------------------------------

  o.torso(g);

  if (pose === "coding") {
    g.put(5, 14, 6, 2, c.cyan);
    g.put(4, 16, 8, 1, c.laptop);
  }

  // -----------------------------------------------------------
  // Hood behind the head
  // -----------------------------------------------------------

  if (o.hood) {
    g.put(3, 2, 10, 1, c.hoodGray);
    g.put(2, 3, 12, 9, c.hoodGray);
  }

  // -----------------------------------------------------------
  // Head, neck and ears
  // -----------------------------------------------------------

  // Neck
  g.put(6, 11, 4, 3, c.skinShade);
  g.put(7, 11, 2, 2, c.skin);

  // Face base
  g.put(5, 4, 6, 2, c.skin);
  g.put(4, 6, 8, 4, c.skin);
  g.put(5, 10, 6, 2, c.skin);

  // Ears
  g.put(3, 6, 1, 2, c.skinShade);
  g.put(12, 6, 1, 2, c.skinShade);

  g.put(3, 6, 1, 1, c.skin);
  g.put(12, 6, 1, 1, c.skin);

  // -----------------------------------------------------------
  // Beard and moustache
  // -----------------------------------------------------------

  // Sideburns
  g.put(4, 8, 1, 3, c.beard);
  g.put(11, 8, 1, 3, c.beard);

  // Cheek beard
  g.put(5, 10, 2, 2, c.beard);
  g.put(9, 10, 2, 2, c.beard);

  // Chin beard
  g.put(6, 12, 4, 1, c.beard);
  g.put(7, 13, 2, 1, c.beard);

  // Moustache
  g.put(6, 9, 2, 1, c.beard);
  g.put(8, 9, 2, 1, c.beard);

  // -----------------------------------------------------------
  // Hair and headwear
  // -----------------------------------------------------------

  if (o.beanie) {
    g.put(3, 2, 10, 3, c.orange);
    g.put(3, 4, 10, 1, c.orangeDark);
    g.put(7, 1, 2, 1, c.white);

    g.put(3, 5, 1, 3, c.hair);
    g.put(12, 5, 1, 3, c.hair);
  } else if (o.hood) {
    g.put(4, 3, 8, 2, c.hair);
    g.put(5, 4, 6, 1, c.hair);
  } else {
    g.put(4, 2, 8, 2, c.hair);
    g.put(3, 3, 2, 2, c.hair);
    g.put(11, 3, 2, 2, c.hair);

    g.put(5, 1, 2, 1, c.hair);
    g.put(8, 1, 2, 1, c.hair);
  }

  // -----------------------------------------------------------
  // Eyebrows
  // -----------------------------------------------------------

  if (state === "THINKING") {
    g.put(5, 5, 2, 1, c.hair);
    g.put(9, 4, 2, 1, c.hair);
  } else if (state === "DEBUGGING") {
    g.put(5, 5, 2, 1, c.hair);
    g.put(9, 5, 2, 1, c.hair);
  } else {
    g.put(5, 5, 2, 1, c.hair);
    g.put(9, 5, 2, 1, c.hair);
  }

  // -----------------------------------------------------------
  // Eyes - aligned symmetrically
  // -----------------------------------------------------------

  if (sleeping) {
    g.put(5, 7, 2, 1, c.outline);
    g.put(9, 7, 2, 1, c.outline);
  } else {
    // Left eye
    g.put(5, 7, 2, 1, c.white);
    g.put(6, 7, 1, 1, c.outline);

    // Right eye
    g.put(9, 7, 2, 1, c.white);
    g.put(9, 7, 1, 1, c.outline);
  }

  // -----------------------------------------------------------
  // Nose - centered
  // -----------------------------------------------------------

  g.put(7, 8, 2, 1, c.skinShade);
  g.put(8, 8, 1, 1, c.skin);

  // -----------------------------------------------------------
  // Mouth - below the nose
  // -----------------------------------------------------------

  if (bigSmile) {
    g.put(7, 10, 2, 1, c.mouthDark);
    g.put(7, 10, 2, 1, c.white);
    g.put(7, 11, 2, 1, c.mouth);
  } else {
    g.put(7, 10, 2, 1, c.mouth);
  }

  // -----------------------------------------------------------
  // Sunglasses
  // -----------------------------------------------------------

  if (o.shades) {
    g.put(4, 6, 3, 2, c.shades);
    g.put(9, 6, 3, 2, c.shades);
    g.put(7, 6, 2, 1, c.shades);

    g.put(5, 6, 1, 1, c.shine);
    g.put(10, 6, 1, 1, c.shine);
  }

  return `
    <g class="standing-character">
      ${g.toSvg(c.outline)}
    </g>
  `;
}

// ---------------------------------------------------------------
// Sleeping character
// ---------------------------------------------------------------

function getSleepingCharacter() {
  const c = COLORS;

  return `
    <g class="sleeping-character">
      ${pixel(3, 12, 8, 3, c.outline)}
      ${pixel(4, 12, 6, 2, c.pillow)}
      ${pixel(4, 14, 5, 1, "#b9c0ca")}

      ${pixel(2, 7, 7, 5, c.outline)}
      ${pixel(3, 6, 5, 2, c.hair)}
      ${pixel(2, 7, 2, 3, c.hair)}
      ${pixel(5, 5, 2, 2, c.hair)}
      ${pixel(8, 7, 2, 2, c.hair)}

      ${pixel(4, 8, 7, 5, c.outline)}
      ${pixel(5, 8, 6, 4, c.skin)}
      ${pixel(10, 9, 2, 3, c.skin)}
      ${pixel(7, 10, 2, 1, c.outline)}

      ${pixel(5, 12, 6, 3, c.outline)}
      ${pixel(6, 12, 4, 2, c.beard)}
      ${pixel(9, 13, 2, 1, c.beard)}
      ${pixel(7, 14, 2, 1, c.mouth)}

      ${pixel(10, 13, 3, 3, c.skin)}
      ${pixel(11, 12, 11, 6, c.outline)}
      ${pixel(12, 13, 9, 4, c.jacket)}

      ${pixel(10, 11, 13, 8, c.outline)}
      ${pixel(11, 11, 11, 7, c.blanket)}
      ${pixel(12, 12, 9, 5, c.blanketLight)}

      ${pixel(13, 13, 5, 1, c.blanketDark)}
      ${pixel(17, 15, 4, 1, c.blanketDark)}
      ${pixel(12, 17, 8, 1, c.blanketDark)}

      ${pixel(10, 11, 2, 8, c.outline)}
      ${pixel(11, 12, 1, 6, c.blanketDark)}

      ${pixel(21, 17, 3, 2, c.outline)}
      ${pixel(22, 17, 2, 1, c.shoes)}

      <g class="sleep-z">
        <text x="19" y="8" fill="${c.cyan}"
          font-family="monospace" font-size="5" font-weight="bold">Z</text>
        <text x="22" y="5" fill="${c.cyan}"
          font-family="monospace" font-size="4" font-weight="bold">z</text>
      </g>
    </g>
  `;
}

// ---------------------------------------------------------------
// State effects
// ---------------------------------------------------------------

function getStateEffects(state) {
  switch (state) {
    case "IDLE":
    case "SLEEPING":
      return `
        <g fill="#22d3ee" font-family="monospace" font-weight="bold">
          <text x="675" y="74" font-size="17">Z</text>
          <text x="697" y="53" font-size="22">Z</text>
          <text x="720" y="28" font-size="28">Z</text>
        </g>
      `;

    case "CODING":
      return `
        <g fill="#22d3ee" font-family="monospace"
          font-size="15" font-weight="bold">
          <text x="518" y="105">&lt;/&gt;</text>
          <text x="695" y="145">{ }</text>
          <text x="527" y="183">01</text>
        </g>
      `;

    case "THINKING":
      return `
        <g fill="#22d3ee">
          <circle cx="710" cy="51" r="5"/>
          <circle cx="727" cy="33" r="8"/>
          <circle cx="743" cy="12" r="10"/>
        </g>
      `;

    case "CELEBRATING":
      return `
        <g>
          <path d="M520 60 l10 -17 10 17 Z" fill="#22d3ee"/>
          <path d="M710 68 l8 -16 8 16 Z" fill="#fbbf24"/>
          <path d="M738 104 l8 -16 8 16 Z" fill="#22d3ee"/>
          <rect x="518" y="125" width="8" height="8" fill="#fbbf24"/>
          <rect x="730" y="165" width="8" height="8" fill="#22d3ee"/>
        </g>
      `;

    case "DEBUGGING":
      return `
        <g>
          <path d="M715 37 l13 13 -13 13 -13 -13 Z" fill="#fb7185"/>
          <path d="M715 44 v9 M715 57 v2"
            stroke="#101116" stroke-width="3"/>
          <rect x="526" y="155" width="8" height="8" fill="#fb7185"/>
        </g>
      `;

    case "WELCOME":
      return `
        <g>
          <path d="M718 40 v18 M709 49 h18"
            stroke="#22d3ee" stroke-width="4"/>
          <path d="M520 75 v14 M513 82 h14"
            stroke="#fbbf24" stroke-width="4"/>
        </g>
      `;

    default:
      return `
        <g fill="#22d3ee">
          <rect x="720" y="50" width="8" height="8"/>
          <rect x="530" y="65" width="6" height="6"/>
        </g>
      `;
  }
}

// ---------------------------------------------------------------
// SVG generator
// ---------------------------------------------------------------

function createSvg(message, mode, greeting, state, outfit) {
  const lines = wrapMessage(message);

  const messageLines = lines.map((line, index) =>
    `<tspan x="39" dy="${index === 0 ? 0 : 25}">${escapeXml(line)}</tspan>`
  ).join("");

  const safeMode = escapeXml(mode);
  const safeGreeting = escapeXml(greeting);
  const safeState = escapeXml(state);

  const sleeping = state === "IDLE" || state === "SLEEPING";

  const character = sleeping
    ? getSleepingCharacter()
    : getStandingCharacter(state, outfit);

  const characterTransform = sleeping
    ? "translate(530 82) scale(8)"
    : "translate(558 40) scale(9)";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
  width="760"
  height="320"
  viewBox="0 0 760 320"
  preserveAspectRatio="xMidYMid meet"
  overflow="hidden"
  role="img"
  aria-labelledby="title desc">

  <title id="title">BOODA - Pixel Art AI Mascot</title>
  <desc id="desc">BOODA, an original bearded pixel-art AI engineer.</desc>

  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111827"/>
      <stop offset="1" stop-color="#07131e"/>
    </linearGradient>

    <pattern id="grid" width="24" height="24"
      patternUnits="userSpaceOnUse">
      <path d="M24 0 H0 V24" fill="none"
        stroke="#1e293b" stroke-width="1" opacity=".45"/>
    </pattern>

    <style>
      * {
        shape-rendering: crispEdges;
      }

      .character-motion {
        transform-box: fill-box;
        transform-origin: center;
        will-change: transform;
      }

      .state-IDLE .character-motion,
      .state-SLEEPING .character-motion {
        animation: sleepFloat 5s ease-in-out infinite;
      }

      .state-CODING .character-motion {
        animation: codingFloat 1.5s ease-in-out infinite;
      }

      .state-THINKING .character-motion {
        animation: thinkFloat 3s ease-in-out infinite;
      }

      .state-CELEBRATING .character-motion {
        animation: celebrate .7s ease-in-out infinite;
      }

      .state-DEBUGGING .character-motion {
        animation: debugShake .25s ease-in-out infinite;
      }

      .state-WELCOME .character-motion {
        animation: welcomeFloat 2s ease-in-out infinite;
      }

      .sleep-z {
        animation: sleepZ 2.5s ease-in-out infinite;
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

      @keyframes sleepFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(3px); }
      }

      @keyframes sleepZ {
        0%, 100% { opacity: .45; }
        50% { opacity: 1; }
      }

      @keyframes codingFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }

      @keyframes thinkFloat {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(-2px, -6px); }
      }

      @keyframes celebrate {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      @keyframes debugShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }

      @keyframes welcomeFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-7px); }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation: none !important;
        }
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="760" height="320" rx="18" fill="url(#bg)"/>
  <rect width="760" height="320" rx="18" fill="url(#grid)"/>

  <rect x="1" y="1" width="758" height="318" rx="17"
    fill="none" stroke="#243447" stroke-width="2"/>

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
  <g>
    <path d="M24 45 H445 Q461 45 461 61 V190
      Q461 206 445 206 H390
      L421 231 L355 206 H40
      Q24 206 24 190 Z"
      fill="#111c2b" stroke="#22d3ee" stroke-width="2.5"/>

    <path d="M25 61 Q25 46 41 46 H444"
      fill="none" stroke="#fbbf24" stroke-width="3"/>

    <rect x="43" y="65" width="9" height="9" fill="#fbbf24"/>
    <text x="64" y="75" class="label">BOODA SAYS</text>

    <text x="39" y="111" class="message">${messageLines}</text>

    <rect x="39" y="174" width="22" height="4" fill="#22d3ee"/>
    <rect x="66" y="174" width="9" height="4" fill="#fbbf24"/>
  </g>

  <!-- Character stage -->
  <ellipse cx="625" cy="286" rx="91" ry="10"
    fill="#020617" opacity=".65"/>

  <!-- Character -->
  <g class="state-${safeState}">
    <g class="character-position" transform="${characterTransform}">
      <g class="character-motion">
        ${character}
      </g>
    </g>
  </g>

  <!-- State effects -->
  ${getStateEffects(state)}

  <!-- Status panel -->
  <g>
    <rect x="489" y="286" width="242" height="22" rx="5"
      fill="#111c2b" stroke="#243447"/>

    <circle cx="503" cy="297" r="4" fill="#22d3ee"/>

    <text x="514" y="301" class="footer">${safeState}</text>
    <text x="716" y="301" class="footer"
      text-anchor="end">ONLINE</text>
  </g>

  <!-- Footer -->
  <text x="25" y="286" class="footer">${safeGreeting}</text>
  <text x="25" y="304" class="footer">BOODA AI LAB // ${safeMode}</text>
</svg>`;
}

// ---------------------------------------------------------------
// API HANDLER
// ---------------------------------------------------------------

export default function handler(req, res) {
  const { mode, state, message } = getPersonality(
    req.query?.mode,
    req.query?.state
  );

  const outfit = getOutfit(req.query?.outfit, state);
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
    state,
    outfit
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
