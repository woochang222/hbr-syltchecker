"""Download public in-game Select artwork used by hbr.style, preserving source IDs."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import time
from urllib.request import Request, urlopen
from urllib.parse import quote

from PIL import Image

CATALOG_URL = 'https://master.hbr.quest/v1/styles.json'
IMAGE_BASE = 'https://cdn.hbr.quest/webp/jp/card/'


def fetch(url):
    request = Request(url, headers={'User-Agent': 'HBRStyleReader/1.0 (local reference download)'})
    for attempt in range(3):
        try:
            with urlopen(request, timeout=30) as response:
                return response.read()
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--catalog', type=Path, help='Use an already downloaded public catalog')
    parser.add_argument('--destination', type=Path, default=Path(__file__).parent / 'reference-data/hbrquest')
    args = parser.parse_args()
    catalog = json.loads(args.catalog.read_text(encoding='utf-8') if args.catalog else fetch(CATALOG_URL))
    destination = args.destination
    cards = destination / 'cards'
    cards.mkdir(parents=True, exist_ok=True)
    entries, failures = [], []
    selected = [row for row in catalog if row.get('tier') in ('SS', 'SSR')]
    for index, row in enumerate(selected):
        source_name = row['strip'].replace('_Party.webp', '_Select.webp')
        if '/' in source_name or '\\' in source_name or not source_name.endswith('_Select.webp'):
            raise ValueError('Unexpected source filename')
        url = IMAGE_BASE + quote(source_name)
        path = cards / source_name
        try:
            if not path.exists():
                content = fetch(url)
                temporary = path.with_suffix('.download')
                temporary.write_bytes(content)
                with Image.open(temporary) as image:
                    image.verify()
                temporary.replace(path)
                time.sleep(.15)
            with Image.open(path) as image:
                width, height = image.size
                if not 2.3 < width / height < 2.65:
                    raise ValueError(f'Unexpected dimensions: {width}x{height}')
            entries.append({
                'source_id': row['id'], 'source_label': row['label'], 'source_name': row['name'],
                'character': row['chara'], 'character_label': row['chara_label'], 'team': row['team'],
                'tier': row['tier'], 'file': f'cards/{source_name}', 'url': url,
                'page_url': f"https://hbr.quest/styles/{row['label'].lower()}",
                'width': width, 'height': height, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            })
        except Exception as error:
            failures.append({'source_id': row['id'], 'url': url, 'error': str(error)})
        if (index + 1) % 20 == 0 or index + 1 == len(selected):
            print(f'{index + 1}/{len(selected)} checked; {len(entries)} ready; {len(failures)} failed', flush=True)
    manifest = {'format': 'hbr-game-select-references', 'version': 1,
                'retrieved_at': datetime.now(timezone.utc).isoformat(), 'catalog_url': CATALOG_URL,
                'source_site': 'https://hbr.style/', 'entries': entries, 'failures': failures}
    (destination / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Saved {len(entries)} cards to {destination}', flush=True)
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
