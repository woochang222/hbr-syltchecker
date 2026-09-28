"""Opt-in network smoke test against the published GitHub catalog, using a temporary cache."""
import json
from pathlib import Path
import tempfile
from app import resource_paths
from engine import Recognizer
from updater import update_data, load_active


def main():
    catalog, root, assets = resource_paths()
    with tempfile.TemporaryDirectory(prefix='hbr-update-check-') as directory:
        cache = Path(directory) / 'cache'
        first = update_data(catalog, root, cache=cache)
        assert first['count'] == 223 and first['downloaded'] == 0
        missing = next((cache / 'blobs').glob('*.webp'))
        missing.unlink()
        second = update_data(catalog, Path(directory) / 'empty-bundle', cache=cache)
        assert second['downloaded'] == 1 and second['reused'] == 222
        third = update_data(catalog, root, cache=cache)
        assert third['downloaded'] == 0
        active, image_root = load_active(catalog, root, cache)
        reader = Recognizer(active, image_root, assets)
        assert len(reader.references) == 223
        report = {'status': 'ok', 'styles': 223, 'first_downloads': first['downloaded'],
                  'missing_image_downloads': second['downloaded'], 'repeat_downloads': third['downloaded'],
                  'offline_references': len(reader.references)}
        (Path(__file__).parent / 'build/live-update-report.json').write_text(json.dumps(report), encoding='utf-8')
        print(json.dumps(report))


if __name__ == '__main__':
    main()
