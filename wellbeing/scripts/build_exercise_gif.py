#!/usr/bin/env python3
"""Turn a square 2x2 exercise step sheet into a looping, web-sized GIF."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="2x2 PNG source sheet")
    parser.add_argument("output", type=Path, help="destination GIF")
    parser.add_argument("--size", type=int, default=520, help="square frame size")
    parser.add_argument("--gutter", type=int, default=6, help="pixels to omit around the centre gutters")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    with Image.open(args.source) as sheet:
        if sheet.width != sheet.height:
            raise ValueError("source sheet must be square")

        half = sheet.width // 2
        gutter = args.gutter
        boxes = (
            (0, 0, half - gutter, half - gutter),
            (half + gutter, 0, sheet.width, half - gutter),
            (0, half + gutter, half - gutter, sheet.height),
            (half + gutter, half + gutter, sheet.width, sheet.height),
        )
        steps = [
            sheet.crop(box).resize((args.size, args.size), Image.Resampling.LANCZOS)
            for box in boxes
        ]

    # Start -> lift -> final pose -> controlled return -> start.
    sequence = [steps[0], steps[1], steps[2], steps[1], steps[3]]
    palette_frames = [frame.convert("P", palette=Image.Palette.ADAPTIVE, colors=128) for frame in sequence]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    palette_frames[0].save(
        args.output,
        save_all=True,
        append_images=palette_frames[1:],
        duration=[850, 650, 1200, 650, 950],
        loop=0,
        optimize=True,
        disposal=2,
    )


if __name__ == "__main__":
    main()
