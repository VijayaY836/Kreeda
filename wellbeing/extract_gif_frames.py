from __future__ import annotations

import re
from pathlib import Path

from PIL import Image, ImageSequence

PROJECT_ROOT = Path(__file__).resolve().parent
SRC_ASSET_ROOTS = [PROJECT_ROOT / 'src' / 'assets', PROJECT_ROOT / 'public' / 'assets']
OUTPUT_ROOT = PROJECT_ROOT / 'public' / 'assets' / 'steps'

GIF_ALIAS_MAP = {
    'setu_bandhasana_5_step': 'setubandhasana',
    'dand_knee': 'dand-knee-supported',
    'dand_basic': 'dand-basic',
    'dand_full': 'dand-full',
    'baithak_basic': 'baithak-basic',
    'high_rep': 'baithak-high-rep',
    'sukshma_vyayama': 'vyayam-mobility-drills',
    'sukshma vyayama': 'vyayam-mobility-drills',
    'sukshma-vyayama': 'vyayam-mobility-drills',
}


def normalize_key(value: str) -> str:
    return re.sub(r'[^a-z0-9]+', '', value.lower())


def extract_step_counts() -> dict[str, int]:
    counts: dict[str, int] = {}

    for data_file in sorted((PROJECT_ROOT / 'src' / 'data').glob('*.ts')):
        text = data_file.read_text(encoding='utf-8')
        pattern = re.compile(r"id\s*:\s*['\"]([^'\"]+)['\"]")
        for match in pattern.finditer(text):
            practice_id = match.group(1)
            steps_start = text.find('steps', match.end())
            if steps_start == -1:
                continue
            array_start = text.find('[', steps_start)
            if array_start == -1:
                continue

            depth = 0
            array_end = -1
            for idx in range(array_start, len(text)):
                ch = text[idx]
                if ch == '[':
                    depth += 1
                elif ch == ']':
                    depth -= 1
                    if depth == 0:
                        array_end = idx
                        break

            if array_end == -1:
                continue

            step_block = text[array_start + 1:array_end]
            step_strings = re.findall(r"'([^'\\]*(?:\\.[^'\\]*)*)'", step_block)
            counts[practice_id] = len(step_strings)

    return counts


def resolve_exercise_id(gif_name: str, step_counts: dict[str, int]) -> str:
    candidate = gif_name
    for key, value in GIF_ALIAS_MAP.items():
        if gif_name.lower() == key.lower() or gif_name.lower() == key.lower().replace('_', '-'):
            return value

    normalized = normalize_key(candidate)
    if normalized in {normalize_key(k): k for k in step_counts}:
        return {normalize_key(k): k for k in step_counts}[normalized]

    for practice_id in step_counts:
        if normalize_key(practice_id) == normalized or normalize_key(practice_id).replace('-', '') == normalized:
            return practice_id

    return candidate


def extract_frames_for_gif(gif_path: Path, exercise_id: str, step_count: int) -> None:
    output_dir = OUTPUT_ROOT / exercise_id
    output_dir.mkdir(parents=True, exist_ok=True)

    with Image.open(gif_path) as img:
        total_frames = getattr(img, 'n_frames', 1)
        if total_frames <= 0:
            total_frames = 1

        frames = [frame.copy().convert('RGB') for frame in ImageSequence.Iterator(img)]

    if not frames:
        return

    if step_count <= 1:
        selected_indices = [0]
    else:
        selected_indices = []
        for step_index in range(step_count):
            selected_indices.append(round(step_index * (total_frames - 1) / (step_count - 1)))

    for step_number, frame_index in enumerate(selected_indices, start=1):
        frame = frames[min(frame_index, len(frames) - 1)]
        output_path = output_dir / f'step_{step_number}.png'
        frame.save(output_path, format='PNG')


def main() -> None:
    step_counts = extract_step_counts()
    gif_files: list[Path] = []
    for asset_root in SRC_ASSET_ROOTS:
        if asset_root.exists():
            gif_files.extend(sorted(asset_root.rglob('*.gif')))

    seen: set[Path] = set()
    for gif_path in gif_files:
        if gif_path in seen:
            continue
        seen.add(gif_path)

        exercise_key = gif_path.stem
        exercise_id = resolve_exercise_id(exercise_key, step_counts)
        step_count = step_counts.get(exercise_id, 1)

        if step_count <= 0:
            step_count = 1

        extract_frames_for_gif(gif_path, exercise_id, step_count)

    print(f'Extracted frames for {len(seen)} GIF file(s) into {OUTPUT_ROOT}')


if __name__ == '__main__':
    main()
