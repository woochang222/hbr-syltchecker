import unittest
from types import SimpleNamespace
from unittest.mock import Mock

from app import ReaderApp


def row(style_id='a', count=2, daphne=False, reviewed=False):
    return SimpleNamespace(style_id=style_id, limit_break=count, daphne=daphne, reviewed=reviewed)


class DuplicateTests(unittest.TestCase):
    def setUp(self):
        self.app = ReaderApp.__new__(ReaderApp)
        self.app.rows = []
        self.app.refresh_row = Mock()

    def test_reviewed_style_is_not_added_again(self):
        old = row(reviewed=True)
        self.app.rows = [old]
        self.assertEqual(self.app.add_results([row()]), (1, 0))
        self.assertEqual(self.app.rows, [old])
        self.assertTrue(old.reviewed)

    def test_different_values_preserve_manual_confirmation_and_report(self):
        old = row(count=0, daphne=False, reviewed=True)
        self.app.rows = [old]
        self.assertEqual(self.app.add_results([row(count=4, daphne=True)]), (1, 1))
        self.assertEqual((old.limit_break, old.daphne, old.reviewed), (0, False, True))
        self.assertEqual(len(self.app.rows), 1)

    def test_unknown_values_do_not_count_as_conflicts(self):
        self.app.rows = [row(reviewed=True)]
        self.assertEqual(self.app.add_results([row(count=None, daphne=None)]), (1, 0))

    def test_new_information_for_reviewed_unknown_field_is_reported(self):
        self.app.rows = [row(count=None, reviewed=True)]
        self.assertEqual(self.app.add_results([row()]), (1, 1))
        self.assertIsNone(self.app.rows[0].limit_break)

    def test_exact_duplicates_within_batch_are_skipped(self):
        self.assertEqual(self.app.add_results([row(), row(), row('b')]), (1, 0))
        self.assertEqual([item.style_id for item in self.app.rows], ['a', 'b'])

    def test_unidentified_cards_are_kept_separately(self):
        self.assertEqual(self.app.add_results([row(''), row('')]), (0, 0))
        self.assertEqual(len(self.app.rows), 2)

    def test_unreviewed_conflicting_results_are_kept_for_review(self):
        self.assertEqual(self.app.add_results([row(count=0), row(count=4)]), (0, 0))
        self.assertEqual(len(self.app.rows), 2)

    def test_reviewed_row_takes_priority_over_unreviewed_duplicate(self):
        old = row(count=0, reviewed=True)
        self.app.rows = [row(count=4), old]
        self.assertEqual(self.app.add_results([row(count=4)]), (1, 1))
        self.assertTrue(old.reviewed)


if __name__ == '__main__':
    unittest.main()
