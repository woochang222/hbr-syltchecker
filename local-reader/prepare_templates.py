"""One-time development tool: extract small numeral samples from an approved screenshot."""
from pathlib import Path
import sys
import cv2
from engine import detect_cards, read_image

cards = detect_cards(read_image(sys.argv[1]))
destination = Path(__file__).parent / 'assets'
destination.mkdir(exist_ok=True)
for index, number in enumerate([4, 2, 2, 0, 0, 2, 0, 1, 4, 1, 2, 1, 2, 3, 1, 2]):
    cv2.imwrite(str(destination / f'digit_{number}_{index}.png'), cards[index][0][91:116, 138:159])
if len(sys.argv) > 2:
    daphne_cards = detect_cards(read_image(sys.argv[2]))
    cv2.imwrite(str(destination / 'daphne.png'), daphne_cards[1][0][83:121, 257:298])
