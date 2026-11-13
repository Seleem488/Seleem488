
#!/usr/bin/env python3
"""Generate an animated Minion eating banana-shaped GitHub contributions."""

from datetime import date, timedelta
from html.parser import HTMLParser
from urllib.request import Request, urlopen
from pathlib import Path

USERNAME = "Seleem488"
TODAY = date.today()
START = TODAY - timedelta(days=364)

# GitHub contribution calendar starts on Sunday.
GRID_START = START - timedelta(days=(START.weekday() + 1) % 7)

WEEKS, DAYS = 53, 7
CELL, GAP = 10, 3
STEP = CELL + GAP

LEFT, TOP = 18, 34
WIDTH = LEFT * 2 + WEEKS * STEP - GAP
HEIGHT = TOP + DAYS * STEP + 26

EMPTY_COLOR = "#161b22"

BANANA_COLORS = {
    1: "#facc15",
    2: "#fbbf24",
    3: "#f59e0b",
    4: "#eab308",
}

ANIMATION_SECONDS = 72
CHEW_DURATION = 0.12


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
        raise RuntimeError("Not enough contribution dates to animate.")

    path = "M " + " L ".join(
        f"{x:.1f},{y:.1f}" for x, y in points
    )

    point_index = {
        day: index
        for index, day in enumerate(point_days)
    }

    return points, point_days, point_index, path


def get_eat_times(levels, point_days, point_index, point_count):
    """Return animation times for all non-empty contribution days."""

    times = []

    for day in point_days:
        if levels.get(day, 0) <= 0:
            continue

        eat_at = (
            ANIMATION_SECONDS
            * point_index[day]
            / (point_count - 1)
        )

        # The final route point coincides with the next animation cycle.
        if eat_at >= ANIMATION_SECONDS - 0.000001:
            continue

        times.append(eat_at)

    return times


def build_chewing_animation(eat_times):
    """Generate mouth keyframes synchronized with banana eating."""

    frames = {0.0: 0.55, ANIMATION_SECONDS: 0.55}

    for eat_at in eat_times:
        if eat_at <= 0.000001:
            frames[0.0] = 2.0
            frames[CHEW_DURATION] = 0.55
            continue

        close_at = min(
            ANIMATION_SECONDS,
            eat_at + CHEW_DURATION
        )

        frames[max(0.0, eat_at - 0.06)] = 0.55
        frames[eat_at] = 2.0
        frames[close_at] = 0.55

    ordered_frames = sorted(frames.items())

    values = ";".join(
        f"{value:.2f}" for _, value in ordered_frames
    )

    key_times = ";".join(
        f"{time / ANIMATION_SECONDS:.6f}"
        for time, _ in ordered_frames
    )

    return (
        '<animate attributeName="ry" '
        f'values="{values}" '
        f'keyTimes="{key_times}" '
        f'dur="{ANIMATION_SECONDS}s" '
        'repeatCount="indefinite"/>'
    )


def svg_document(levels):
    points, point_days, point_index, path = build_route()

    eat_times = get_eat_times(
        levels,
        point_days,
        point_index,
        len(points)
    )

    chewing_animation = build_chewing_animation(eat_times)

    parts = [
        (
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{WIDTH}" height="{HEIGHT}" '
            f'viewBox="0 0 {WIDTH} {HEIGHT}" role="img">'
        ),

        '<title>Minion Banana Contribution Graph</title>',

        (
            '<desc>A Minion travels across a GitHub contribution calendar, '
            'eating tiny bananas that represent contribution days.</desc>'
        ),

        '<rect width="100%" height="100%" rx="12" fill="#0d1117"/>',

        '<g font-family="Arial, sans-serif" font-size="10" fill="#8b949e">',
        f'<text x="{LEFT}" y="15">Less</text>',
    ]

    # Banana intensity legend.
    for i, level in enumerate(range(1, 5)):
        x = LEFT + 32 + i * 14

        parts.append(
            f'<rect x="{x}" y="7" width="10" height="10" '
            f'rx="2" fill="{BANANA_COLORS[level]}"/>'
        )

    parts.append(
        f'<text x="{LEFT + 32 + 4 * 14 + 3}" y="15">More</text>'
    )

    parts.append('</g>')
    parts.append('<g shape-rendering="geometricPrecision">')

    # Draw bananas instead of green contribution squares.
    for col in range(WEEKS):
        for row in range(DAYS):
            day = GRID_START + timedelta(days=col * 7 + row)

            if day > TODAY:
                continue

            level = levels.get(day, 0)

            x = LEFT + col * STEP
            y = TOP + row * STEP

            # Empty contribution days remain dark.
            if level == 0:
                parts.append(
                    f'<rect x="{x}" y="{y}" '
                    f'width="{CELL}" height="{CELL}" '
                    f'rx="2" fill="{EMPTY_COLOR}">'
                    f'<title>{day.isoformat()}: no contributions</title>'
                    '</rect>'
                )
                continue

            banana_color = BANANA_COLORS[level]

            eat_at = (
                ANIMATION_SECONDS
                * point_index[day]
                / (len(points) - 1)
            )

            # Banana disappears when the Minion reaches it.
            parts.append(
                f'<g transform="translate({x},{y})">'

                f'<title>{day.isoformat()}: '
                f'contribution level {level}</title>'

                # Banana body.
                f'<path d="M1.1 6.9 '
                f'C2.3 8.7 5.7 9.0 7.9 6.0 '
                f'C9.0 4.5 9.2 2.8 8.8 1.5 '
                f'C8.5 3.9 6.5 6.2 4.3 7.0 '
                f'C3.0 7.5 2.0 7.4 1.1 6.9 Z" '
                f'fill="{banana_color}" '
                f'stroke="#a16207" stroke-width="0.65"/>'

                # Banana stem.
                f'<path d="M8.7 1.6 L9.5 0.8" '
                f'stroke="#854d0e" stroke-width="1.1" '
                f'stroke-linecap="round"/>'

                # Banana tip.
                f'<path d="M1.1 6.9 L0.6 7.8" '
                f'stroke="#854d0e" stroke-width="1.1" '
                f'stroke-linecap="round"/>'

                # Eating animation.
                f'<animate attributeName="opacity" '
                f'values="1;0;0;1" '
                f'keyTimes="0;0.004;0.996;1" '
                f'dur="{ANIMATION_SECONDS}s" '
                f'begin="{eat_at:.3f}s" '
                f'repeatCount="indefinite"/>'

                '</g>'
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

        # Mouth: opens only when eating a banana.
        '<ellipse cx="9" cy="14.3" rx="2.1" ry="0.55" fill="#6b3c12">',
        chewing_animation,
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

    banana_count = sum(
        1 for level in levels.values() if level > 0
    )

    print(
        f"Generated {output} with "
        f"{len(levels)} contribution dates "
        f"and {banana_count} bananas."
    )


if __name__ == "__main__":
    main()
