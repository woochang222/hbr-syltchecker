"""Publish reviewed game-ID mappings with the web catalog and image checksums."""
import argparse
import hashlib
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--initialize-mapping', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent
    reference = root / 'reference-data'
    styles = json.loads((root.parent / 'src/data/styles.json').read_text(encoding='utf-8'))
    source = json.loads((reference / 'hbrquest/manifest.json').read_text(encoding='utf-8'))
    mapping_path = reference / 'style-map.json'
    if args.initialize_mapping:
        if mapping_path.exists():
            raise ValueError('Mapping already exists; review and edit it explicitly.')
        candidates = json.loads(args.initialize_mapping.read_text(encoding='utf-8'))
        mapping = {}
        for row in candidates:
            ranked = row['candidates']
            if not ranked or ranked[0][1] < 10 or (len(ranked) > 1 and ranked[0][1] - ranked[1][1] < 5):
                raise ValueError(f'Manual mapping required: {row["source_id"]}')
            local_id = ranked[0][0]
            if local_id in mapping:
                raise ValueError(f'Duplicate mapping: {local_id}')
            mapping[local_id] = row['source_id']
        mapping_path.write_text(json.dumps(mapping, indent=2) + '\n', encoding='utf-8')
    mapping = json.loads(mapping_path.read_text(encoding='utf-8'))
    by_source = {row['source_id']: row for row in source['entries']}
    published = []
    character_pairs = {}
    for style in styles:
        if style['id'] not in mapping:
            raise ValueError(f'Review the new style mapping first: {style["id"]}')
        row = by_source[mapping[style['id']]]
        character_pairs.setdefault(row['character_label'], set()).add(style['character_name'])
        file = f'local-reader/reference-data/hbrquest/{row["file"]}'
        sha = hashlib.sha256((root.parent / file).read_bytes()).hexdigest()
        if sha != row['sha256']:
            raise ValueError(f'Image hash changed: {file}')
        published.append({'id': style['id'], 'character_name': style['character_name'],
                          'style_name': style['style_name'], 'image_url': '/' + file,
                          'reference_kind': 'game-select', 'sha256': sha, 'source_id': row['source_id']})
    if any(len(names) != 1 for names in character_pairs.values()):
        raise ValueError('Inconsistent character mapping')
    if len(set(row['source_id'] for row in published)) != len(published):
        raise ValueError('Duplicate game style ID')
    document = {'format': 'hbr-reader-catalog', 'version': 1, 'styles': published}
    content = json.dumps(document, ensure_ascii=False, indent=2) + '\n'
    (reference / 'catalog.json').write_text(content, encoding='utf-8')
    print(f'Published {len(published)} mapped game cards')


if __name__ == '__main__':
    main()
