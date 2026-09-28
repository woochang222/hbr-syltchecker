"""Exercise native widgets without changing the user's clipboard or opening a browser."""
from pathlib import Path
import json
import tkinter as tk
from unittest.mock import patch
import numpy as np
from app import ReaderApp
from engine import Result, read_image


def main():
    root = tk.Tk()
    app = ReaderApp(root)
    try:
        root.update()
        assert app.logo_image.width() == 36
        assert str(app.logo_label.cget('image'))
        assert app.window_icon.width() > 0
        assert app.paths[2].joinpath('app.ico').is_file()
        style_id = 'kayamori_ruka_base'
        preview_path = Path(__file__).parent / 'build/crops.png'
        crop = read_image(preview_path)[0:122, 300:600] if preview_path.exists() else np.zeros((122, 300, 3), np.uint8)
        row = Result('sample.jpg', crop, [(style_id, 38)], style_id, 2, False, False, 38, .99)
        app.rows.append(row)
        app.refresh_row(0)
        app.tree.selection_set('0')
        root.update()
        assert app.selected == 0
        app.count_value.set('0')
        app.daphne_value.set('미확인')
        app.confirm()
        assert row.reviewed and row.limit_break == 0 and row.daphne is None
        duplicate = Result('duplicate.jpg', crop, [(style_id, 38)], style_id, 4, True, False, 38, .99)
        app.events.put(('rows', [duplicate]))
        app.events.put(('done', []))
        app.poll()
        assert len(app.rows) == len(app.tree.get_children()) == 1
        assert row.reviewed and row.limit_break == 0 and row.daphne is None
        assert '중복 1개' in app.status.get() and '다른 결과 1개' in app.status.get()
        captured = []
        with patch.object(root, 'clipboard_clear'), patch.object(root, 'clipboard_append', side_effect=captured.append):
            app.copy()
        payload = json.loads(captured[0])
        assert payload['styles'] == [{'id': style_id, 'limitBreak': 0}]
        build = Path(__file__).parent / 'build'
        build.mkdir(exist_ok=True)
        (build / 'smoke-payload.json').write_text(captured[0], encoding='utf-8')
        app.search_value.set('카야모리')
        app.filter_styles()
        assert all('카야모리' in value for value in app.style_combo['values'])
        root.update()
        assert app.preview.winfo_width() >= 390
        assert app.tree.winfo_width() >= 400
        app.exclude()
        assert not row.reviewed
        app.set_busy(True)
        app.recognizer = object()
        app.events.put(('updated', {'catalog': app.paths[0], 'root': app.paths[1], 'downloaded': 0,
                                   'reused': len(app.styles), 'count': len(app.styles)}))
        app.poll()
        assert not app.busy and app.recognizer is None and row.style_id in app.by_id
        app.set_busy(True)
        app.events.put(('update-error', 'Offline: previous data kept'))
        app.poll()
        assert not app.busy and app.status.get() == 'Offline: previous data kept'
        print('UI selection, edit, confirm, export, search, exclude: PASS')
        print('UI update success/error event handling: PASS')
    finally:
        root.destroy()
        app.temp.cleanup()


if __name__ == '__main__':
    main()
