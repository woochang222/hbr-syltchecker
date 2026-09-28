"""Generate mapping candidates for maintainer review, never used at runtime."""
import json
from pathlib import Path
import cv2
from engine import Recognizer, read_image

root = Path(__file__).resolve().parent
reader = Recognizer(root.parent / 'src/data/styles.json', root.parent / 'public', root / 'assets')
source = root / 'reference-data/hbrquest'
manifest = json.loads((source / 'manifest.json').read_text(encoding='utf-8'))
report = []
for i, entry in enumerate(manifest['entries']):
    crop = cv2.resize(read_image(source / entry['file']), (300, 122))
    ranked = reader.identify(crop)
    report.append({'source_id': entry['source_id'], 'file': entry['file'], 'character': entry['character'],
                   'name': entry['source_name'], 'candidates': ranked})
    if (i+1) % 40 == 0:
        print(f'{i+1}/{len(manifest["entries"])}', flush=True)
(root / 'build/mapping-candidates.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print('Mapping candidates ready', flush=True)
