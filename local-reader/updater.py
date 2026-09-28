"""Explicit, transactional GitHub data updates. Recognition itself stays offline."""
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import tempfile
from urllib.request import Request, urlopen

from PIL import Image

REPOSITORY_URL = 'https://raw.githubusercontent.com/woochang222/hbr-syltchecker/main/'
CATALOG_PATH = 'local-reader/reference-data/catalog.json'


class UpdateCancelled(Exception):
    pass


def cache_directory():
    return Path(os.environ.get('LOCALAPPDATA', Path.home() / '.cache')) / 'HBRStyleReader/data'


def fetch(url):
    request = Request(url, headers={'User-Agent': 'HBRStyleReader/1.1', 'Cache-Control': 'no-cache'})
    with urlopen(request, timeout=20) as response:
        data = response.read(5_000_001)
    if len(data) > 5_000_000:
        raise ValueError('업데이트 파일 크기가 너무 큽니다.')
    return data


def validate_catalog(document, cached=False):
    if not isinstance(document, dict) or document.get('format') != 'hbr-reader-catalog' or document.get('version') != 1:
        raise ValueError('지원하지 않는 스타일 데이터 형식입니다.')
    rows = document.get('styles')
    if not isinstance(rows, list) or not 1 <= len(rows) <= 5000:
        raise ValueError('스타일 목록이 올바르지 않습니다.')
    seen = set()
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get('id'), str) or not re.fullmatch(r'[a-z0-9_]+', row['id']):
            raise ValueError('스타일 ID가 올바르지 않습니다.')
        if row['id'] in seen:
            raise ValueError('중복된 스타일 ID가 있습니다.')
        seen.add(row['id'])
        for key in ['character_name', 'style_name']:
            if not isinstance(row.get(key), str) or not 1 <= len(row[key]) <= 200:
                raise ValueError('스타일 이름이 올바르지 않습니다.')
        sha = row.get('sha256', '')
        if not isinstance(sha, str) or not re.fullmatch(r'[a-f0-9]{64}', sha):
            raise ValueError('이미지 검증 값이 올바르지 않습니다.')
        image = row.get('image_url', '')
        if not isinstance(image, str) or not image.startswith('/') or '\\' in image or '..' in PurePosixPath(image).parts:
            raise ValueError('이미지 경로가 올바르지 않습니다.')
        expected = f'/blobs/{sha}.webp' if cached else '/local-reader/reference-data/hbrquest/cards/'
        if (cached and image != expected) or (not cached and not image.startswith(expected)):
            raise ValueError('허용되지 않은 이미지 경로입니다.')
        if not re.fullmatch(r'[A-Za-z0-9_]+\.webp', PurePosixPath(image).name) or row.get('reference_kind') != 'game-select':
            raise ValueError('지원하지 않는 이미지 자료입니다.')
    return document


def digest(path):
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError:
        return None


def load_active(bundled_catalog, bundled_root, cache=None):
    cache = Path(cache) if cache else cache_directory()
    path = cache / 'active.json'
    try:
        document = validate_catalog(json.loads(path.read_text(encoding='utf-8')), cached=True)
        if all(digest(cache / row['image_url'].lstrip('/')) == row['sha256'] for row in document['styles']):
            return path, cache
    except (OSError, ValueError, TypeError):
        pass
    return Path(bundled_catalog), Path(bundled_root)


def atomic_write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as stream:
        temporary = Path(stream.name)
        stream.write(content)
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def update_data(bundled_catalog, bundled_root, cache=None, download=fetch, progress=lambda message: None, cancelled=lambda: False):
    cache = Path(cache) if cache else cache_directory()
    document = validate_catalog(json.loads(download(REPOSITORY_URL + CATALOG_PATH)))
    downloaded, reused = 0, 0
    normalized = []
    for index, row in enumerate(document['styles']):
        if cancelled():
            raise UpdateCancelled('업데이트를 중지했습니다. 기존 자료를 유지합니다.')
        sha = row['sha256']
        target = cache / f'blobs/{sha}.webp'
        if digest(target) == sha:
            reused += 1
        else:
            bundled = Path(bundled_root) / row['image_url'].lstrip('/')
            if digest(bundled) == sha:
                content = bundled.read_bytes()
                reused += 1
            else:
                content = download(REPOSITORY_URL + row['image_url'].lstrip('/'))
                downloaded += 1
            if hashlib.sha256(content).hexdigest() != sha:
                raise ValueError('이미지 검증에 실패했습니다. 기존 자료를 유지합니다.')
            with Image.open(io.BytesIO(content)) as image:
                if image.width > 2000 or image.height > 1000 or not 2.3 < image.width / image.height < 2.65:
                    raise ValueError('게임 카드 이미지 규격이 올바르지 않습니다.')
                image.verify()
            atomic_write(target, content)
        normalized.append({**row, 'image_url': f'/blobs/{sha}.webp'})
        progress(f'스타일 자료 확인 {index + 1}/{len(document["styles"])}')
    if cancelled():
        raise UpdateCancelled('업데이트를 중지했습니다. 기존 자료를 유지합니다.')
    active = {'format': document['format'], 'version': document['version'], 'styles': normalized}
    content = (json.dumps(active, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    atomic_write(cache / 'active.json', content)
    return {'catalog': cache / 'active.json', 'root': cache, 'downloaded': downloaded, 'reused': reused,
            'count': len(normalized)}
