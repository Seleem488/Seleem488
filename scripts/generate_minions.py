
#!/usr/bin/env python3
"""Generate a multi-year animated Minion eating banana-shaped GitHub contributions."""

from datetime import date, timedelta
from html.parser import HTMLParser
from urllib.request import Request, urlopen
from pathlib import Path
import calendar

USERNAME = "Seleem488"

# The animation starts at 2026 and travels backwards to 2023.
YEARS = (2026, 2025, 2024, 2023)

# Each year gets 24 seconds. Total animation = 96 seconds.
YEAR_DURATION = 24
TOTAL_DURATION = YEAR_DURATION * len(YEARS)

CHEW_DURATION = 0.035

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
    """Fetch one calendar year's contribution data."""

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
            f"GitHub returned no contribution data for {year}. "
            "The contribution calendar markup may have changed."
        )

    return parser.levels


def get_grid_start(year):
    """Return the Sunday on or before January 1."""

    first_day = date(year, 1, 1)
    return first_day - timedelta(
        days=(first_day.weekday() + 1) % 7
    )


def build_year_route(year, today):
    """Build a vertical serpentine route for one calendar year."""

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

    path = "M " + " L ".join(
        f"{x:.1f},{y:.1f}" for x, y in points
    )

    point_index = {
        day: index
        for index, day in enumerate(point_days)
    }

    return grid_start, points, point_days, point_index, path


def get_global_time(year_index, local_index, point_count):
    """Convert a date's route position into global animation time."""

    if point_count <= 1:
        progress = 0
    else:
        progress = local_index / (point_count - 1)

    return (
        year_index * YEAR_DURATION
        + progress * YEAR_DURATION
    )


def visibility_animation(start_time, end_time):
    """Show an element only during its time window in the full loop."""

    start = max(0, min(1, start_time / TOTAL_DURATION))
    end = max(0, min(1, end_time / TOTAL_DURATION))

    if start <= 0:
        values = "1;0;0"
        key_times = f"0;{end:.6f};1"
    elif end >= 1:
        values = "0;1;0"
        key_times = f"0;{start:.6f};1"
    else:
        values = "0;1;0;0"
        key_times = f"0;{start:.6f};{end:.6f};1"

    return (
        '<animate attributeName="opacity" '
        f'values="{values}" '
        f'keyTimes="{key_times}" '
        'calcMode="discrete" '
        f'dur="{TOTAL_DURATION}s" '
        'repeatCount="indefinite"/>'
    )


def build_chewing_animation(eat_times):
    """Synchronize the Minion's mouth with all banana eating events."""

    frames = {0.0: 0.55, TOTAL_DURATION: 0.55}

    for eat_at in eat_times:
        open_at = max(0, eat_at)
        close_at = min(
            TOTAL_DURATION,
            open_at + CHEW_DURATION
        )

        if open_at > 0:
            frames[max(0, open_at - 0.015)] = 0.55

        frames[open_at] = 2.0
        frames[close_at] = 0.55

    ordered = sorted(frames.items())

    values = ";".join(
        f"{value:.2f}" for _, value in ordered
    )

    key_times = ";".join(
        f"{time / TOTAL_DURATION:.6f}"
        for time, _ in ordered
    )

    return (
        '<animate attributeName="ry" '
        f'values="{values}" '
        f'keyTimes="{key_times}" '
        f'dur="{TOTAL_DURATION}s" '
        'repeatCount="indefinite"/>'
    )


def build_month_labels(year, year_index, point_days, point_index):
    """Create month labels that appear as the Minion reaches each month."""

    parts = []

    for month in range(1, 13):
        month_days = [
            day for day in point_days
            if day.month == month
        ]

        if not month_days:
            continue

        # Use the first route position in this month.
        first_index = min(point_index[day] for day in month_days)

        # The next month's first route position defines the transition.
        if month < 12:
            next_month_days = [
                day for day in point_days
                if day.month == month + 1
            ]

            if next_month_days:
                next_index = min(
                    point_index[day] for day in next_month_days
                )
            else:
                next_index = len(point_days) - 1
        else:
            next_index = len(point_days) - 1

        start_time = get_global_time(
            year_index, first_index, len(point_days)
        )

        end_time = get_global_time(
            year_index, next_index, len(point_days)
        )

        # Ensure the last month remains visible until the year ends.
        if month == 12 or end_time <= start_time:
            end_time = (year_index + 1) * YEAR_DURATION

        parts.append(
            f'<text x="{LEFT + 95}" y="18" '
            f'font-family="Arial, sans-serif" '
            f'font-size="11" fill="#f0f6fc" opacity="0">'
            f'{MONTH_NAMES[month - 1]}'
            f'{visibility_animation(start_time, end_time)}'
            '</text>'
        )

    return parts


def draw_banana(day, level, x, y, eat_at):
    """Draw one banana and make it disappear when eaten."""

    banana_color = BANANA_COLORS[level]

    return (
        f'<g transform="translate({x},{y})">'
        f'<title>{day.isoformat()}: contribution level {level}</title>'

        # Banana body.
        f'<path d="M1.1 6.9 '
        f'C2.3 8.7 5.7 9.0 7.9 6.0 '
        f'C9.0 4.5 9.2 2.8 8.8 1.5 '
        f'C8.5 3.9 6.5 6.2 4.3 7.0 '
        f'C3.0 7.5 2.0 7.4 1.1 6.9 Z" '
        f'fill="{banana_color}" '
        f'stroke="#a16207" stroke-width="0.65"/>'

        # Stem.
        f'<path d="M8.7 1.6 L9.5 0.8" '
        f'stroke="#854d0e" stroke-width="1.1" '
        f'stroke-linecap="round"/>'

        # Tip.
        f'<path d="M1.1 6.9 L0.6 7.8" '
        f'stroke="#854d0e" stroke-width="1.1" '
        f'stroke-linecap="round"/>'

        # Disappear after the Minion reaches it.
        f'<animate attributeName="opacity" '
        f'values="1;0;0;1" '
        f'keyTimes="0;0.004;0.996;1" '
        f'dur="{TOTAL_DURATION}s" '
        f'begin="{eat_at:.4f}s" '
        f'repeatCount="indefinite"/>'

        '</g>'
    )


def draw_minion(path, year_index, chewing_animation):
    """Draw a Minion that travels along the year's contribution route."""

    offset = year_index * YEAR_DURATION

    parts = [
        '<g opacity="0">',
        visibility_animation(
            offset,
            offset + YEAR_DURATION
        ),

        '<g>',
        (
            f'<animateMotion '
            f'dur="{YEAR_DURATION}s" '
            f'begin="{offset}s" '
            f'repeatCount="indefinite" '
            f'rotate="0" '
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

        # Mouth.
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
    ]

    return "\n".join(parts)


def svg_document(year_data):
    """Build the complete four-year animated SVG."""

    today = date.today()

    prepared = []
    all_eat_times = []

    # Prepare all years and collect global eating times.
    for year_index, year in enumerate(YEARS):
        levels = year_data[year]

        (
            grid_start,
            points,
            point_days,
            point_index,
            path
        ) = build_year_route(year, today)

        prepared.append({
            "year": year,
            "year_index": year_index,
            "levels": levels,
            "grid_start": grid_start,
            "points": points,
            "point_days": point_days,
            "point_index": point_index,
            "path": path,
        })

        for day in point_days:
            if levels.get(day, 0) <= 0:
                continue

            eat_at = get_global_time(
                year_index,
                point_index[day],
                len(points)
            )

            # Skip the last route point because it coincides
            # with the transition to the next year.
            if point_index[day] == len(points) - 1:
                continue

            all_eat_times.append(eat_at)

    chewing_animation = build_chewing_animation(all_eat_times)

    parts = [
        (
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'width="{WIDTH}" height="{HEIGHT}" '
            f'viewBox="0 0 {WIDTH} {HEIGHT}" role="img">'
        ),

        '<title>Minion Multi-Year Banana Contribution Graph</title>',

        (
            '<desc>A Minion travels through GitHub contribution calendars '
            'from 2026 back to 2023, eating banana-shaped contributions.</desc>'
        ),

        '<rect width="100%" height="100%" rx="12" fill="#0d1117"/>',

        # Static legend.
        '<g font-family="Arial, sans-serif" font-size="10" fill="#8b949e">',
        f'<text x="{LEFT}" y="18">Year</text>',
    ]

    for i, level in enumerate(range(1, 5)):
        x = WIDTH - 100 + i * 14

        parts.append(
            f'<rect x="{x}" y="8" width="10" height="10" '
            f'rx="2" fill="{BANANA_COLORS[level]}"/>'
        )

    parts.append(
        f'<text x="{WIDTH - 100 + 4 * 14 + 3}" y="17">More</text>'
    )
    parts.append('</g>')

    # Draw each year's calendar in the same position.
    # Only one calendar is visible at a time.
    for item in prepared:
        year = item["year"]
        year_index = item["year_index"]
        levels = item["levels"]
        grid_start = item["grid_start"]
        point_days = item["point_days"]
        point_index = item["point_index"]
        path = item["path"]

        offset = year_index * YEAR_DURATION

        parts.append('<g opacity="0">')
        parts.append(
            visibility_animation(
                offset,
                offset + YEAR_DURATION
            )
        )

        # Year title.
        parts.append(
            f'<text x="{LEFT}" y="18" '
            f'font-family="Arial, sans-serif" '
            f'font-size="13" font-weight="bold" '
            f'fill="#f0f6fc">{year}</text>'
        )

        # Month label changes as the Minion moves.
        parts.extend(
            build_month_labels(
                year,
                year_index,
                point_days,
                point_index
            )
        )

        # Draw the calendar.
        parts.append('<g shape-rendering="geometricPrecision">')

        for col in range(WEEKS):
            for row in range(DAYS):
                day = grid_start + timedelta(days=col * 7 + row)

                if day.year != year or day > today:
                    continue

                level = levels.get(day, 0)

                x = LEFT + col * STEP
                y = TOP + row * STEP

                if level == 0:
                    parts.append(
                        f'<rect x="{x}" y="{y}" '
                        f'width="{CELL}" height="{CELL}" '
                        f'rx="2" fill="{EMPTY_COLOR}">'
                        f'<title>{day.isoformat()}: no contributions</title>'
                        '</rect>'
                    )
                    continue

                eat_at = get_global_time(
                    year_index,
                    point_index[day],
                    len(point_days)
                )

                parts.append(
                    draw_banana(
                        day,
                        level,
                        x,
                        y,
                        eat_at
                    )
                )

        parts.append('</g>')

        # Minion for this year's route.
        parts.append(
            draw_minion(
                path,
                year_index,
                chewing_animation
            )
        )

        parts.append('</g>')

    parts.append('</svg>')

    return "\n".join(parts)


def main():
    print(f"Fetching GitHub contributions for {USERNAME}...")

    year_data = {}

    for year in YEARS:
        print(f"Fetching {year}...")

        year_data[year] = fetch_contributions(year)

        count = sum(
            1 for level in year_data[year].values()
            if level > 0
        )

        print(
            f"  {year}: {len(year_data[year])} dates, "
            f"{count} contribution days."
        )

    output = Path("dist/minions-contribution.svg")
    output.parent.mkdir(parents=True, exist_ok=True)

    output.write_text(
        svg_document(year_data),
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
    print(f"Full animation duration: {TOTAL_DURATION} seconds.")


if __name__ == "__main__":
    main()
