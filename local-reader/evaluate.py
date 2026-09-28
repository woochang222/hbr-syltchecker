"""Regression checks using user-supplied screenshots kept outside the repository."""
import argparse
from pathlib import Path
import json
import cv2
import numpy as np
from app import resource_paths
from engine import Recognizer, detect_cards, read_image

FIXTURES = [
    ('*100303*', [4, 2, 2, 0, 0, 2, 0, 1, 4, 1, 2, 1, 2, 3, 1, 2], [],
     ['kayamori_ruka_circuit_burst', 'kayamori_ruka_base', 'kayamori_ruka_cardinal_echo', 'kayamori_ruka_suit',
      'kayamori_ruka_unison_res', 'kayamori_ruka_diva', 'kayamori_ruka_pawapuro_res', 'kayamori_ruka_joker_res',
      'izumi_yuki_base', 'izumi_yuki_yukata', 'izumi_yuki_suit', 'izumi_yuki_dress', 'izumi_yuki_ruby',
      'izumi_yuki_unison_res', 'aikawa_megumi_base', 'aikawa_megumi_one_night_dream']),
    ('*100606*', [2, 3, 3, 1, 1, 1, 4, 1, 3, 1, 4, 4], [11],
     ['tojo_tsukasa_base', 'tojo_tsukasa_swimsuit', 'tojo_tsukasa_suit', 'tojo_tsukasa_bunny', 'tojo_tsukasa_sorrow',
      'tojo_tsukasa_persona_res', 'asakura_karen_base', 'asakura_karen_scarlet_rebellion', 'asakura_karen_suit',
      'asakura_karen_swimsuit', 'asakura_karen_free', 'asakura_karen_unison_res']),
    ('*100614*', [4, 2, 2, 2, 3, 4, 2, 1, 4, 2, 4, 1, 4, 4, 2, 4], [0, 6, 7, 10, 12],
     ['higuchi_seika_exploration', 'higuchi_seika_catharsis', 'higuchi_seika_swimsuit', 'hiiragi_kozue_base',
      'hiiragi_kozue_waitress', 'byakko_base', 'byakko_queen', 'byakko_white_fang_res', 'yamawaki_base',
      'yamawaki_holy_knight', 'yamawaki_one_piece', 'yamawaki_white_suit_res', 'yamawaki_unison_res',
      'yamawaki_loneliness', 'sakuraba_seira_base', 'sakuraba_seira_new_year']),
    ('*101231.png', [1, 4, 1, 1, 3, 2, 3, 1, 1, 4, 2, 0], [1],
     ['bungo_yayoi_hanami', 'bungo_yayoi_unison_res', 'bungo_yayoi_summer_vacation_res', 'kanzaki_adelheid_base',
      'kanzaki_adelheid_ice_flower', 'kanzaki_adelheid_girl', 'kanzaki_adelheid_swimsuit', 'kanzaki_adelheid_servant_res',
      'satsuki_mari_base', 'satsuki_mari_assassin', 'satsuki_mari_bride', 'satsuki_mari_swimsuit']),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--screenshots', type=Path, required=True)
    args = parser.parse_args()
    reader = Recognizer(*resource_paths())
    summary = []
    for pattern, counts, daphne, ids in FIXTURES:
        path = next(args.screenshots.glob(pattern))
        rows = reader.recognize(path)
        assert len(rows) == len(counts), (path.name, len(rows))
        assert [row.style_id for row in rows] == ids, (path.name, 'style mismatch')
        assert [index for index, row in enumerate(rows) if row.daphne is True] == daphne
        for index, row in enumerate(rows):
            assert row.limit_break is None or row.limit_break == counts[index], (path.name, index, row.limit_break)
        original = read_image(path)
        for scale in [.75, 1.25]:
            resized = cv2.resize(original, None, fx=scale, fy=scale)
            assert len(detect_cards(resized)) == len(rows), (path.name, scale)
        padded = cv2.copyMakeBorder(original, 0, 0, 100, 100, cv2.BORDER_CONSTANT)
        assert len(detect_cards(padded)) == len(rows), (path.name, 'horizontal padding')
        summary.append({'file': path.name, 'cards': len(rows), 'styles': len(rows),
                        'count_read': sum(row.limit_break is not None for row in rows),
                        'count_unknown': sum(row.limit_break is None for row in rows),
                        'daphne_read': sum(row.daphne is not None for row in rows)})
    for pattern in ['*100335*', '*100625*', '*100628*']:
        path = next(args.screenshots.glob(pattern))
        try:
            detect_cards(read_image(path))
        except ValueError:
            pass
        else:
            raise AssertionError(f'Party screen accepted: {path.name}')
    try:
        detect_cards(np.full((800, 1600, 3), 128, np.uint8))
    except ValueError:
        pass
    else:
        raise AssertionError('Blank image accepted')
    print(json.dumps(summary, ensure_ascii=True, indent=2))


if __name__ == '__main__':
    main()
