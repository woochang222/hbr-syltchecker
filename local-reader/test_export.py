import unittest
from types import SimpleNamespace
from export import build_payload


def row(style_id='a', limit_break=0, daphne=None, reviewed=True):
    return SimpleNamespace(style_id=style_id, limit_break=limit_break, daphne=daphne, reviewed=reviewed)


class ExportTests(unittest.TestCase):
    def test_unreviewed_results_are_never_exported(self):
        result = build_payload([row(), row('b', reviewed=False)], {'a', 'b'})
        self.assertEqual(result['styles'], [{'id': 'a', 'limitBreak': 0}])

    def test_merge_complementary_duplicates_and_explicit_false(self):
        result = build_payload([row(), row(limit_break=None, daphne=False)], {'a'})
        self.assertEqual(result['styles'], [{'id': 'a', 'limitBreak': 0, 'daphne': False}])

    def test_conflicts_block_export(self):
        with self.assertRaises(ValueError):
            build_payload([row(limit_break=1), row(limit_break=4)], {'a'})

    def test_invalid_or_empty_results_block_export(self):
        for rows in [[], [row('unknown')], [row(limit_break=True)], [row(limit_break=5)],
                     [row(daphne='false')], [row(limit_break=None)]]:
            with self.subTest(rows=rows), self.assertRaises(ValueError):
                build_payload(rows, {'a'})


if __name__ == '__main__':
    unittest.main()
