import copy
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest

from PIL import Image
from updater import update_data, load_active, validate_catalog, UpdateCancelled, REPOSITORY_URL, CATALOG_PATH


class UpdaterTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.cache = self.root / 'cache'
        stream = io.BytesIO()
        Image.new('RGB', (356, 144), 'red').save(stream, format='WEBP')
        self.image = stream.getvalue()
        self.sha = hashlib.sha256(self.image).hexdigest()
        self.row = {'id': 'ruka', 'character_name': '루카', 'style_name': '기본', 'reference_kind': 'game-select',
                    'sha256': self.sha, 'image_url': '/local-reader/reference-data/hbrquest/cards/Ruka.webp'}
        self.document = {'format': 'hbr-reader-catalog', 'version': 1, 'styles': [self.row]}
        self.calls = []
        self.catalog = self.root / 'bundled.json'
        self.catalog.write_text(json.dumps(self.document), encoding='utf-8')

    def download(self, url):
        self.calls.append(url)
        return json.dumps(self.document).encode() if url.endswith(CATALOG_PATH) else self.image

    def update(self, **kwargs):
        return update_data(self.catalog, self.root, cache=self.cache, download=kwargs.pop('download', self.download), **kwargs)

    def test_download_then_reuse_without_image_requests(self):
        first = self.update()
        self.assertEqual(first['downloaded'], 1)
        self.calls.clear()
        second = self.update()
        self.assertEqual(second['downloaded'], 0)
        self.assertEqual(self.calls, [REPOSITORY_URL + CATALOG_PATH])
        self.assertEqual(load_active(self.catalog, self.root, self.cache), (self.cache / 'active.json', self.cache))

    def test_reuse_bundled_images_without_network_download(self):
        path = self.root / self.row['image_url'].lstrip('/')
        path.parent.mkdir(parents=True)
        path.write_bytes(self.image)
        self.assertEqual(self.update()['downloaded'], 0)
        self.assertEqual(len(self.calls), 1)

    def test_only_changed_image_downloaded(self):
        self.update()
        stream = io.BytesIO()
        Image.new('RGB', (356, 144), 'blue').save(stream, format='WEBP')
        self.image = stream.getvalue()
        changed = {**self.row, 'id': 'yuki', 'sha256': hashlib.sha256(self.image).hexdigest(),
                   'image_url': '/local-reader/reference-data/hbrquest/cards/Yuki.webp'}
        self.document['styles'].append(changed)
        self.calls.clear()
        result = self.update()
        self.assertEqual(result['downloaded'], 1)
        self.assertEqual(result['count'], 2)
        self.assertEqual(len(self.calls), 2)

    def test_bad_hash_and_connection_failure_keep_active_catalog(self):
        self.update()
        before = (self.cache / 'active.json').read_bytes()
        self.row['sha256'] = '0' * 64
        with self.assertRaises(ValueError):
            self.update()
        self.assertEqual((self.cache / 'active.json').read_bytes(), before)
        with self.assertRaises(OSError):
            self.update(download=lambda url: (_ for _ in ()).throw(OSError('offline')))
        self.assertEqual((self.cache / 'active.json').read_bytes(), before)

    def test_cancel_keeps_active_catalog(self):
        self.update()
        before = (self.cache / 'active.json').read_bytes()
        with self.assertRaises(UpdateCancelled):
            self.update(cancelled=lambda: True)
        self.assertEqual((self.cache / 'active.json').read_bytes(), before)

    def test_cancel_after_last_file_does_not_activate(self):
        self.update()
        before = (self.cache / 'active.json').read_bytes()
        cancelled = [False]
        with self.assertRaises(UpdateCancelled):
            self.update(progress=lambda message: cancelled.__setitem__(0, True), cancelled=lambda: cancelled[0])
        self.assertEqual((self.cache / 'active.json').read_bytes(), before)

    def test_non_image_with_matching_hash_does_not_activate(self):
        self.image = b'not an image'
        self.row['sha256'] = hashlib.sha256(self.image).hexdigest()
        with self.assertRaises(OSError):
            self.update()
        self.assertFalse((self.cache / 'active.json').exists())

    def test_corrupt_cache_falls_back_and_can_be_repaired(self):
        self.update()
        (self.cache / f'blobs/{self.sha}.webp').write_bytes(b'broken')
        self.assertEqual(load_active(self.catalog, self.root, self.cache), (self.catalog, self.root))
        self.assertEqual(self.update()['downloaded'], 1)

    def test_reject_unsafe_paths_versions_and_duplicate_ids(self):
        for path in ['/local-reader/reference-data/hbrquest/cards/../../outside.webp', 'https://example.com/a.webp', '/other/a.webp']:
            document = copy.deepcopy(self.document)
            document['styles'][0]['image_url'] = path
            with self.assertRaises(ValueError):
                validate_catalog(document)
        for change in [{'version': 2}, {'styles': [self.row, self.row]}]:
            with self.assertRaises(ValueError):
                validate_catalog({**self.document, **change})


if __name__ == '__main__':
    unittest.main()
