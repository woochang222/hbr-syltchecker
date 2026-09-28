"""Capture actual reader widgets with sample recognition data for the user guide."""
import ctypes
from pathlib import Path
import tkinter as tk

from PIL import Image

from app import ReaderApp
from engine import Recognizer
from export import payload_text


def capture(root, destination):
    import win32gui
    import win32ui
    root.update()
    hwnd = win32gui.GetParent(root.winfo_id())
    left, top, right, bottom = win32gui.GetWindowRect(hwnd)
    width, height = right - left, bottom - top
    dc = win32gui.GetDC(hwnd)
    source = win32ui.CreateDCFromHandle(dc)
    target = source.CreateCompatibleDC()
    bitmap = win32ui.CreateBitmap()
    bitmap.CreateCompatibleBitmap(source, width, height)
    target.SelectObject(bitmap)
    try:
        if not ctypes.windll.user32.PrintWindow(hwnd, target.GetSafeHdc(), 2):
            raise RuntimeError('PrintWindow failed')
        image = Image.frombuffer('RGB', (width, height), bitmap.GetBitmapBits(True), 'raw', 'BGRX', 0, 1)
        if max(channel[1] for channel in image.getextrema()) == 0:
            raise RuntimeError('Window capture is blank')
        image.save(destination)
    finally:
        win32gui.DeleteObject(bitmap.GetHandle())
        target.DeleteDC()
        source.DeleteDC()
        win32gui.ReleaseDC(hwnd, dc)


def main():
    out = Path(__file__).resolve().parent.parent / 'docs/reader-guide/images'
    out.mkdir(parents=True, exist_ok=True)
    root = tk.Tk()
    app = ReaderApp(root)
    try:
        capture(root, out / '02-reader-start.png')
        reader = Recognizer(*app.paths)
        app.rows = reader.recognize(str(Path.home() / 'Downloads/Screenshot_20260928_100303_HeavenBurnsRed.jpg'))
        for i in range(len(app.rows)):
            app.refresh_row(i)
        app.update_summary()
        app.tree.selection_set('0')
        app.status.set('분석 완료. 반영할 결과를 확인하세요.')
        root.update()
        capture(root, out / '03-reader-results.png')
        # The sample contains these four verified Ruka cards, with counts 4/2/2/0.
        for i in range(4):
            app.rows[i].reviewed = True
            app.refresh_row(i)
        app.update_summary()
        capture(root, out / '04-reader-reviewed.png')
        (out.parent / 'sample-result.json').write_text(payload_text(app.rows, app.by_id), encoding='utf-8')
    finally:
        app.temp.cleanup()
        root.destroy()


if __name__ == '__main__':
    main()
