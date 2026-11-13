
#!/usr/bin/env python3
"""Generate an animated Minion-style character eating GitHub contribution squares."""

from datetime import date, timedelta
from html.parser import HTMLParser
from urllib.request import Request, urlopen
from pathlib import Path

USERNAME = "Seleem488"
TODAY = date.today()
START = TODAY - timedelta(days=364)

# GitHub's contribution calendar is arranged in Sunday-first columns.
GRID_START = START - timedelta(days=(START.weekday() + 1) % 7)

WEEKS, DAYS = 53, 7
CELL, GAP = 10, 3
STEP = CELL + GAP

LEFT, TOP = 18, 34
WIDTH = LEFT * 2 + WEEKS * STEP - GAP
HEIGHT = TOP + DAYS * STEP + 26

LEVEL_COLORS = [
    "#161b22",
    "#0e4429",
    "#006d32",
    "#26a641",
    "#39d353",
]

ANIMATION_SECONDS = 72


class ContributionParser(HTMLParser):
    """Read contribution date/level pairs from GitHub calendar markup."""

    def __init__(self):
        super().__init__()
        self.levels = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)

        day = attrs.get("data-date")
        level = attrs.get("data-level")

        if day and level is not None:
            try:
                self.levels[date.fromisoformat(day)] = max(
                    0, min(4, int(level))
                )
            except (ValueError, TypeError):
                pass


def fetch_contributions():
    url = (
        f"https://github.com/users/{USERNAME}/contributions"
        f"?from={GRID_START.isoformat()}&to={TODAY.isoformat()}"
    )

    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 MinionsContributionGenerator"
        },
    )

    with urlopen(request, timeout=30) as response:
        page = response.read().decode("utf-8", errors="replace")

    parser = ContributionParser()
    parser.feed(page)

    if not parser.levels:
        raise RuntimeError(
            "GitHub returned no contribution date/level pairs; "
            "the contribution calendar markup may have changed."
        )

    return parser.levels


def build_route():
    """Build a serpentine route through the contribution calendar."""

    points = []
    point_days = []

    for col in range(WEEKS):
        rows = (
            range(DAYS)
            if col % 2 == 0
            else range(DAYS - 1, -1, -1)
        )

        for row in rows:
            day = GRID_START + timedelta(days=col * 7 + row)

            if day <= TODAY:
                x = LEFT + col * STEP + CELL / 2
                y = TOP + row * STEP + CELL / 2

                points.append((x, y))
                point_days.append(day)

    if len(points) < 2:
        raise RuntimeError(
            "Not enough contribution dates to animate the character."
        )

    path = "M " + " L ".join(
        f"{x:.1f},{y:.1f}" for x, y in points
    )

    point_index = {
        day: index
        for index, day in enumerate(point_days)
    }

    return points, point_days, point_index, path


def svg_document(levels):
    points, point_days, point_index, path = build_route()

    parts = [
        (
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{WIDTH}" height="{HEIGHT}" '
            f'viewBox="0 0 {WIDTH} {HEIGHT}" role="img">'
        ),
        (
            '<title>Animated Minion eating GitHub contribution squares</title>'
        ),
        (
            '<desc>A Minion travels across the contribution calendar '
            'and green contribution squares disappear as it reaches them.</desc>'
        ),
        '<rect width="100%" height="100%" rx="12" fill="#0d1117"/>',

        '<g font-family="Arial, sans-serif" font-size="10" fill="#8b949e">',
        f'<text x="{LEFT}" y="15">Less</text>',
    ]

    # Contribution level legend.
    for i, color in enumerate(LEVEL_COLORS):
        x = LEFT + 32 + i * 14

        parts.append(
            f'<rect x="{x}" y="7" width="10" height="10" '
            f'rx="2" fill="{color}"/>'
        )

    parts.append(
        f'<text x="{LEFT + 32 + 5 * 14 + 3}" y="15">More</text>'
    )

    parts.append('</g>')
    parts.append('<g shape-rendering="geometricPrecision">')

    # Draw contribution cells.
    for col in range(WEEKS):
        for row in range(DAYS):
            day = GRID_START + timedelta(days=col * 7 + row)

            if day > TODAY:
                continue

            level = levels.get(day, 0)

            x = LEFT + col * STEP
            y = TOP + row * STEP

            eat_animation = ""

            # Only non-empty contribution squares are edible.
            if level > 0:
                eat_at = (
                    ANIMATION_SECONDS
                    * point_index[day]
                    / (len(points) - 1)
                )

                eat_animation = (
                    '<animate '
                    'attributeName="opacity" '
                    'values="1;0;0;1" '
                    'keyTimes="0;0.004;0.996;1" '
                    f'dur="{ANIMATION_SECONDS}s" '
                    f'begin="{eat_at:.3f}s" '
                    'repeatCount="indefinite"/>'
                )

            parts.append(
                f'<rect x="{x}" y="{y}" '
                f'width="{CELL}" height="{CELL}" '
                f'rx="2" fill="{LEVEL_COLORS[level]}">'
                f'<title>{day.isoformat()}: '
                f'contribution level {level}</title>'
                f'{eat_animation}'
                '</rect>'
            )

    parts.append('</g>')

    # Animated Minion.
    parts.extend([
        '<g transform="translate(0,0)">',

        '<g>',
        (
            f'<animateMotion dur="{ANIMATION_SECONDS}s" '
            f'repeatCount="indefinite" rotate="0" '
            f'path="{path}"/>'
        ),

        '<g transform="translate(-9,-16)">',

        '<g>',
        (
            '<animateTransform '
            'attributeName="transform" '
            'type="translate" '
            'values="0,0;0,-2;0,0" '
            'dur="0.55s" '
            'repeatCount="indefinite"/>'
        ),

        # Yellow body.
        (
            '<ellipse cx="9" cy="14" rx="7.5" ry="11.5" '
            'fill="#f9d21b" stroke="#d6a900" stroke-width="0.8"/>'
        ),

        # Blue overalls.
        (
            '<path d="M2.3 16.5 Q9 14.5 15.7 16.5 '
            'L15.7 23 Q9 26 2.3 23Z" '
            'fill="#2474b8" stroke="#174f82" stroke-width="0.8"/>'
        ),

        (
            '<path d="M4 16.2 L4 19.5 M14 16.2 L14 19.5" '
            'stroke="#174f82" stroke-width="1.3"/>'
        ),

        # Goggles.
        (
            '<rect x="1.5" y="7.5" width="15" height="5.8" '
            'rx="2.8" fill="#b9c1c9" '
            'stroke="#59636e" stroke-width="1"/>'
        ),

        '<circle cx="6.1" cy="10.4" r="3.4" fill="#f5f5f5" stroke="#59636e" stroke-width="0.8"/>',
        '<circle cx="12" cy="10.4" r="3.4" fill="#f5f5f5" stroke="#59636e" stroke-width="0.8"/>',

        '<circle cx="6.8" cy="10.6" r="1.35" fill="#4b83a8"/>',
        '<circle cx="11.4" cy="10.6" r="1.35" fill="#4b83a8"/>',

        '<circle cx="7.1" cy="10.5" r="0.55" fill="#111827"/>',
        '<circle cx="11.2" cy="10.5" r="0.55" fill="#111827"/>',

        # Animated chewing mouth.
        '<ellipse cx="9" cy="14.3" rx="2.1" ry="0.55" fill="#6b3c12">',
        (
            '<animate attributeName="ry" '
            'values="0.55;1.8;0.55" '
            'dur="0.39s" '
            'repeatCount="indefinite"/>'
        ),
        '</ellipse>',

        # Arms.
        (
            '<path d="M2.5 21.5 L0.8 25 M15.5 21.5 L17.2 25" '
            'stroke="#f9d21b" stroke-width="2" '
            'stroke-linecap="round"/>'
        ),

        # Legs.
        (
            '<path d="M6 24 L5 27 M12 24 L13 27" '
            'stroke="#273746" stroke-width="2" '
            'stroke-linecap="round"/>'
        ),

        '</g>',
        '</g>',
        '</g>',
        '</g>',
        '</svg>',
    ])

    return "\n".join(parts)


def main():
    levels = fetch_contributions()

    output = Path("dist/minions-contribution.svg")
    output.parent.mkdir(parents=True, exist_ok=True)

    output.write_text(
        svg_document(levels),
        encoding="utf-8",
    )

    print(
        f"Generated {output} with "
        f"{len(levels)} contribution dates."
    )


if __name__ == "__main__":
    main()
