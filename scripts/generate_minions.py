
#!/usr/bin/env python3
"""Generate one continuous multi-year Minion eating GitHub contribution bananas."""

from datetime import date, timedelta
from html.parser import HTMLParser
from urllib.request import Request, urlopen
from pathlib import Path
from math import hypot

# ============================================================
# Configuration
# ============================================================

USERNAME = "Seleem488"

# Newest year first.
YEARS = (2026, 2025, 2024, 2023)

YEAR_DURATION = 24
TOTAL_DURATION = YEAR_DURATION * len(YEARS)

CHEW_DURATION = 0.12

WEEKS, DAYS = 53, 7
CELL, GAP = 10, 3
STEP = CELL + GAP

LEFT, TOP = 24, 48
WIDTH = LEFT * 2 + WEEKS * STEP - GAP
HEIGHT = TOP + DAYS * STEP + 20

EMPTY_COLOR = "#161b22"

BANANA_COLORS = {
    1: "#facc15",
    2: "#fbbf24",
    3: "#f59e0b",
    4: "#eab308",
}

MONTH_NAMES = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
]


# ============================================================
# GitHub contribution parser
# ============================================================

class ContributionParser(HTMLParser):
    """Extract contribution dates and levels from GitHub HTML."""

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


def fetch_contributions(year):
    """Fetch contribution data for one calendar year."""

    today = date.today()
    start = date(year, 1, 1)
    end = min(date(year, 12, 31), today)

    if start > today:
        return {}

    url = (
        f"https://github.com/users/{USERNAME}/contributions"
        f"?from={start.isoformat()}&to={end.isoformat()}"
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
            f"No contribution data returned for {year}. "
            "GitHub may have changed its calendar HTML."
        )

    return parser.levels


# ============================================================
# Calendar geometry
# ============================================================

def get_grid_start(year):
    """Return the Sunday on or before January 1."""

    first_day = date(year, 1, 1)

    return first_day - timedelta(
        days=(first_day.weekday() + 1) % 7
    )


def build_year_route(year, today):
    """Create a serpentine route through one calendar year."""

    grid_start = get_grid_start(year)
    year_start = date(year, 1, 1)
    year_end = min(date(year, 12, 31), today)

    points = []
    point_days = []

    for col in range(WEEKS):
        rows = (
            range(DAYS)
            if col % 2 == 0
            else range(DAYS - 1, -1, -1)
        )

        for row in rows:
            day = grid_start + timedelta(days=col * 7 + row)

            if year_start <= day <= year_end:
                x = LEFT + col * STEP + CELL / 2
                y = TOP + row * STEP + CELL / 2

                points.append((x, y))
                point_days.append(day)

    if len(points) < 2:
        raise RuntimeError(f"Not enough dates to animate {year}.")

    return {
        "year": year,
        "grid_start": grid_start,
        "points": points,
        "point_days": point_days,
    }


# ============================================================
# One continuous route for all years
# ============================================================

def prepare_global_route(year_data, today):
    """
    Join every year into one continuous route.

    The Minion has one path and one animation.
    Timing is calculated from cumulative route distance.
    """

    prepared = []

    for year in YEARS:
        item = build_year_route(year, today)
        item["levels"] = year_data[year]
        prepared.append(item)

    global_points = []
    year_start_indices = []

    for item in prepared:
        year_start_indices.append(len(global_points))
        global_points.extend(item["points"])

    if len(global_points) < 2:
        raise RuntimeError("Global route is too short.")

    # Calculate cumulative distance along the complete path.
    cumulative = [0.0]

    for previous, current in zip(
        global_points,
        global_points[1:]
    ):
        distance = hypot(
            current[0] - previous[0],
            current[1] - previous[1]
        )

        cumulative.append(cumulative[-1] + distance)

    total_distance = cumulative[-1]

    if total_distance <= 0:
        raise RuntimeError("Invalid global route distance.")

    def distance_to_time(distance):
        return distance / total_distance * TOTAL_DURATION

    day_times = {}
    year_windows = {}

    for year_index, item in enumerate(prepared):
        start_index = year_start_indices[year_index]

        if year_index + 1 < len(prepared):
            end_index = year_start_indices[year_index + 1]
            end_time = distance_to_time(cumulative[end_index])
        else:
            end_time = TOTAL_DURATION

        start_time = distance_to_time(cumulative[start_index])

        year_windows[item["year"]] = (
            start_time,
            end_time,
        )

        for local_index, day in enumerate(item["point_days"]):
            global_index = start_index + local_index

            day_times[day] = distance_to_time(
                cumulative[global_index]
            )

    path = "M " + " L ".join(
        f"{x:.1f},{y:.1f}"
        for x, y in global_points
    )

    return prepared, path, day_times, year_windows


# ============================================================
# SVG animation helpers
# ============================================================

def visibility_animation(start_time, end_time):
    """Show an element only during its assigned animation window."""

    start = max(
        0.0,
        min(1.0, start_time / TOTAL_DURATION)
    )

    end = max(
        0.0,
        min(1.0, end_time / TOTAL_DURATION)
    )

    if start <= 0.000001 and end >= 0.999999:
        values = "1"
        key_times = "0"

    elif start <= 0.000001:
        values = "1;0"
        key_times = f"0;{end:.8f}"

    elif end >= 0.999999:
        values = "0;1"
        key_times = f"0;{start:.8f}"

    else:
        values = "0;1;0"
        key_times = f"0;{start:.8f};{end:.8f}"

    return (
        '<animate attributeName="opacity" '
        f'values="{values}" '
        f'keyTimes="{key_times}" '
        'calcMode="discrete" '
        f'dur="{TOTAL_DURATION}s" '
        'repeatCount="indefinite"/>'
    )


def build_chewing_animation(eat_times):
    """Synchronize the Minion's mouth with banana eating."""

    frames = {
        0.0: 0.55,
        TOTAL_DURATION: 0.55,
    }

    for eat_at in eat_times:
        open_at = max(0.0, eat_at)
        close_at = min(
            TOTAL_DURATION,
            open_at + CHEW_DURATION
        )

        if open_at > 0:
            frames[max(0.0, open_at - 0.025)] = 0.55

        frames[open_at] = 2.0
        frames[close_at] = 0.55

    # Sort and remove duplicate timestamps.
    ordered = sorted(frames.items())
    clean_frames = {}

    for timestamp, value in ordered:
        clean_frames[timestamp] = value

    ordered = sorted(clean_frames.items())

    values = ";".join(
        f"{value:.2f}"
        for _, value in ordered
    )

    key_times = ";".join(
        f"{timestamp / TOTAL_DURATION:.8f}"
        for timestamp, _ in ordered
    )

    return (
        '<animate attributeName="ry" '
        f'values="{values}" '
        f'keyTimes="{key_times}" '
        f'dur="{TOTAL_DURATION}s" '
        'repeatCount="indefinite"/>'
    )


# ============================================================
# Month labels
# ============================================================

def build_month_labels(item, day_times, year_window):
    """Display month labels based on the actual route order."""

    point_days = item["point_days"]
    year_end_time = year_window[1]

    # Find consecutive month runs along the route.
    runs = []

    for day in point_days:
        if not runs or runs[-1]["month"] != day.month:
            runs.append({
                "month": day.month,
                "first_day": day,
            })

    parts = []

    for index, run in enumerate(runs):
        start_time = day_times[run["first_day"]]

        if index + 1 < len(runs):
            next_run = runs[index + 1]
            end_time = day_times[next_run["first_day"]]
        else:
            end_time = year_end_time

        if end_time <= start_time:
            continue

        parts.append(
            f'<text x="{LEFT + 95}" y="36" '
            'font-family="Arial, sans-serif" '
            'font-size="11" fill="#f0f6fc" opacity="0">'
            f'{MONTH_NAMES[run["month"] - 1]}'
            f'{visibility_animation(start_time, end_time)}'
            '</text>'
        )

    return parts


# ============================================================
# Banana drawing
# ============================================================

def draw_banana(day, level, x, y, eat_at):
    """Draw a banana that disappears when the Minion reaches it."""

    color = BANANA_COLORS[level]

    return (
        f'<g transform="translate({x},{y})">'

        f'<title>{day.isoformat()}: contribution level {level}</title>'

        # Banana body.
        f'<path d="M1.1 6.9 '
        f'C2.3 8.7 5.7 9.0 7.9 6.0 '
        f'C9.0 4.5 9.2 2.8 8.8 1.5 '
        f'C8.5 3.9 6.5 6.2 4.3 7.0 '
        f'C3.0 7.5 2.0 7.4 1.1 6.9 Z" '
        f'fill="{color}" '
        'stroke="#a16207" stroke-width="0.65"/>'

        # Stem.
        '<path d="M8.7 1.6 L9.5 0.8" '
        'stroke="#854d0e" stroke-width="1.1" '
        'stroke-linecap="round"/>'

        # Tip.
        '<path d="M1.1 6.9 L0.6 7.8" '
        'stroke="#854d0e" stroke-width="1.1" '
        'stroke-linecap="round"/>'

        # Disappear at the eating time.
        '<animate attributeName="opacity" '
        'values="1;0;0;1" '
        'keyTimes="0;0.004;0.996;1" '
        f'dur="{TOTAL_DURATION}s" '
        f'begin="{eat_at:.6f}s" '
        'repeatCount="indefinite"/>'

        '</g>'
    )


# ============================================================
# Minion drawing
# ============================================================

def draw_minion(path, chewing_animation):
    """Create exactly one Minion with one continuous motion path."""

    parts = [
        '<g>',

        # The only motion animation in the SVG.
        (
            '<animateMotion '
            f'dur="{TOTAL_DURATION}s" '
            'begin="0s" '
            'repeatCount="indefinite" '
            'rotate="0" '
            f'path="{path}"/>'
        ),

        '<g transform="translate(-9,-16)">',

        '<g>',

        # Gentle bouncing.
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
            'fill="#f9d21b" '
            'stroke="#d6a900" stroke-width="0.8"/>'
        ),

        # Blue overalls.
        (
            '<path d="M2.3 16.5 Q9 14.5 15.7 16.5 '
            'L15.7 23 Q9 26 2.3 23Z" '
            'fill="#2474b8" '
            'stroke="#174f82" stroke-width="0.8"/>'
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

        # Animated mouth.
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
    ]

    return "\n".join(parts)


# ============================================================
# Complete SVG generation
# ============================================================

def svg_document(year_data):
    """Build the complete multi-year SVG."""

    today = date.today()

    (
        prepared,
        global_path,
        day_times,
        year_windows,
    ) = prepare_global_route(year_data, today)

    # Prepare chewing events.
    all_eat_times = []

    for item in prepared:
        levels = item["levels"]

        for day in item["point_days"]:
            if levels.get(day, 0) > 0:
                all_eat_times.append(day_times[day])

    chewing_animation = build_chewing_animation(all_eat_times)

    parts = [
        (
            '<svg xmlns="http://www.w3.org/2000/svg" '
            f'width="{WIDTH}" height="{HEIGHT}" '
            f'viewBox="0 0 {WIDTH} {HEIGHT}" role="img">'
        ),

        '<title>One Minion Eating Multi-Year GitHub Contributions</title>',

        (
            '<desc>A single Minion travels through contribution calendars '
            'from 2026 to 2023, eating banana-shaped contributions.</desc>'
        ),

        '<rect width="100%" height="100%" rx="12" fill="#0d1117"/>',

        # Static legend.
        '<g font-family="Arial, sans-serif" font-size="10" fill="#8b949e">',
        f'<text x="{LEFT}" y="18">Contribution activity</text>',
    ]

    for index, level in enumerate(range(1, 5)):
        x = WIDTH - 100 + index * 14

        parts.append(
            f'<rect x="{x}" y="8" width="10" height="10" '
            f'rx="2" fill="{BANANA_COLORS[level]}"/>'
        )

    parts.append(
        f'<text x="{WIDTH - 100 + 4 * 14 + 3}" y="17">More</text>'
    )

    parts.append('</g>')

    # Draw each calendar in the same position.
    for item in prepared:
        year = item["year"]
        grid_start = item["grid_start"]
        levels = item["levels"]

        start_time, end_time = year_windows[year]

        # Calendar visibility window.
        parts.append('<g opacity="0">')
        parts.append(
            visibility_animation(start_time, end_time)
        )

        # Year title.
        parts.append(
            f'<text x="{LEFT}" y="36" '
            'font-family="Arial, sans-serif" '
            'font-size="13" font-weight="bold" '
            'fill="#f0f6fc">'
            f'{year}</text>'
        )

        # Current month.
        parts.extend(
            build_month_labels(
                item,
                day_times,
                year_windows[year],
            )
        )

        # Calendar cells and bananas.
        parts.append('<g shape-rendering="geometricPrecision">')

        for col in range(WEEKS):
            for row in range(DAYS):
                day = grid_start + timedelta(days=col * 7 + row)

                if day.year != year or day > today:
                    continue

                level = levels.get(day, 0)

                x = LEFT + col * STEP
                y = TOP + row * STEP

                if level <= 0:
                    parts.append(
                        f'<rect x="{x}" y="{y}" '
                        f'width="{CELL}" height="{CELL}" '
                        f'rx="2" fill="{EMPTY_COLOR}">'
                        f'<title>{day.isoformat()}: no contributions</title>'
                        '</rect>'
                    )
                    continue

                eat_at = day_times.get(day)

                if eat_at is None:
                    continue

                parts.append(
                    draw_banana(
                        day,
                        level,
                        x,
                        y,
                        eat_at,
                    )
                )

        parts.append('</g>')
        parts.append('</g>')

    # Exactly ONE Minion for all four years.
    parts.append(
        draw_minion(
            global_path,
            chewing_animation,
        )
    )

    parts.append('</svg>')

    return "\n".join(parts)


# ============================================================
# Main
# ============================================================

def main():
    print(f"Fetching contributions for {USERNAME}...")

    year_data = {}

    for year in YEARS:
        print(f"Fetching {year}...")

        year_data[year] = fetch_contributions(year)

        banana_count = sum(
            1
            for level in year_data[year].values()
            if level > 0
        )

        print(
            f"  {year}: {len(year_data[year])} dates, "
            f"{banana_count} bananas."
        )

    output = Path("dist/minions-contribution.svg")
    output.parent.mkdir(parents=True, exist_ok=True)

    svg = svg_document(year_data)

    output.write_text(
        svg,
        encoding="utf-8",
    )

    total_bananas = sum(
        1
        for levels in year_data.values()
        for level in levels.values()
        if level > 0
    )

    print()
    print(f"Generated: {output}")
    print(f"Years: {YEARS[0]} -> {YEARS[-1]}")
    print(f"Total bananas: {total_bananas}")
    print(f"Animation duration: {TOTAL_DURATION} seconds.")
    print("Minion instances: 1")
    print("Motion paths: 1")


if __name__ == "__main__":
    main()
