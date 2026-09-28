"""Windows desktop UI for the offline style-list reader."""
from pathlib import Path
import queue
import subprocess
import sys
import tempfile
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import webbrowser

import cv2
from PIL import Image, ImageGrab, ImageTk

from engine import Recognizer
from export import payload_text
from updater import load_active, update_data, UpdateCancelled


SITE_URL = 'https://woochang222.github.io/hbr-syltchecker/'


def resource_paths(use_cache=False):
    if getattr(sys, 'frozen', False):
        root = Path(sys._MEIPASS)
        assets = root / 'assets'
    else:
        root = Path(__file__).resolve().parent.parent
        assets = root / 'local-reader/assets'
    catalog = root / 'local-reader/reference-data/catalog.json'
    if use_cache:
        catalog, root = load_active(catalog, root)
    return catalog, root, assets


class ReaderApp:
    def __init__(self, root):
        import json
        self.root = root
        root.title('헤번레 스타일 읽기')
        root.geometry('1180x780')
        root.minsize(960, 650)
        self.paths = resource_paths(use_cache=True)
        self.styles = json.loads(self.paths[0].read_text(encoding='utf-8'))['styles']
        self.by_id = {style['id']: style for style in self.styles}
        self.labels = {style['id']: f"{style['character_name']} / {style['style_name']}" for style in self.styles}
        self.ids_by_label = {label: key for key, label in self.labels.items()}
        if len(self.ids_by_label) != len(self.labels):
            self.labels = {key: f'{label} [{key}]' for key, label in self.labels.items()}
            self.ids_by_label = {label: key for key, label in self.labels.items()}
        self.rows = []
        self.events = queue.Queue()
        self.cancelled = threading.Event()
        self.busy = False
        self.recognizer = None
        self.temp = tempfile.TemporaryDirectory(prefix='hbr-reader-')
        self.selected = None
        self.status = tk.StringVar(value='스타일 목록 스크린샷을 선택하세요.')
        self.summary = tk.StringVar(value='0개 / 확인 완료 0개')
        self.style_value = tk.StringVar()
        self.search_value = tk.StringVar()
        self.count_value = tk.StringVar(value='미확인')
        self.daphne_value = tk.StringVar(value='미확인')
        self.browser_value = tk.StringVar(value='기본 브라우저')
        self.detail_value = tk.StringVar()
        self.build_ui()
        root.protocol('WM_DELETE_WINDOW', self.close)
        root.after(100, self.poll)

    def build_ui(self):
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('.', font=('맑은 고딕', 10))
        style.configure('Treeview', rowheight=28)
        outer = ttk.Frame(self.root, padding=16)
        outer.pack(fill='both', expand=True)
        toolbar = ttk.Frame(outer)
        toolbar.pack(fill='x', pady=(0, 12))
        self.controls = []
        for label, command in [('사진 추가', self.add_files), ('이미지 붙여넣기', self.paste_image),
                               ('확실한 결과 일괄 확인', self.review_confident), ('전체 비우기', self.clear)]:
            button = ttk.Button(toolbar, text=label, command=command)
            button.pack(side='left', padx=(0, 6))
            self.controls.append(button)
        self.cancel_button = ttk.Button(toolbar, text='중지', command=self.cancelled.set, state='disabled')
        self.cancel_button.pack(side='left')
        ttk.Label(toolbar, textvariable=self.summary).pack(side='right')

        split = ttk.Panedwindow(outer, orient='horizontal')
        split.pack(fill='both', expand=True)
        left = ttk.Frame(split)
        right = ttk.Frame(split, padding=(16, 0, 0, 0))
        split.add(left, weight=3)
        split.add(right, weight=2)
        self.tree = ttk.Treeview(left, columns=('style', 'count', 'daphne', 'status'), show='headings', selectmode='browse')
        for name, label, width in [('style', '스타일', 300), ('count', '돌파', 45), ('daphne', '다프네', 60), ('status', '확인', 90)]:
            self.tree.heading(name, text=label)
            self.tree.column(name, width=width, minwidth=40, stretch=name == 'style')
        scrollbar = ttk.Scrollbar(left, orient='vertical', command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side='right', fill='y')
        self.tree.pack(fill='both', expand=True)
        self.tree.bind('<<TreeviewSelect>>', self.select)
        self.tree.tag_configure('reviewed', foreground='#207447')
        self.tree.tag_configure('uncertain', foreground='#985514')

        self.preview = ttk.Label(right, anchor='center')
        self.preview.pack(fill='x', pady=(0, 8))
        ttk.Label(right, textvariable=self.detail_value, wraplength=380).pack(fill='x', pady=(0, 16))
        ttk.Label(right, text='스타일 검색').pack(anchor='w')
        search = ttk.Entry(right, textvariable=self.search_value)
        search.pack(fill='x', pady=(4, 8))
        search.bind('<KeyRelease>', self.filter_styles)
        self.style_combo = ttk.Combobox(right, textvariable=self.style_value, state='readonly', width=38)
        self.style_combo.pack(fill='x', pady=(0, 16))
        ttk.Label(right, text='한계 돌파').pack(anchor='w')
        ttk.Combobox(right, textvariable=self.count_value, state='readonly', values=['미확인', '0', '1', '2', '3', '4']).pack(fill='x', pady=(4, 16))
        ttk.Label(right, text='다프네').pack(anchor='w')
        ttk.Combobox(right, textvariable=self.daphne_value, state='readonly', values=['미확인', '적용', '미적용']).pack(fill='x', pady=(4, 16))
        buttons = ttk.Frame(right)
        buttons.pack(fill='x')
        for label, command in [('확인하고 다음', self.confirm), ('반영 제외', self.exclude)]:
            button = ttk.Button(buttons, text=label, command=command)
            button.pack(side='left', padx=(0, 6))
            self.controls.append(button)

        footer = ttk.Frame(outer)
        footer.pack(fill='x', pady=(14, 0))
        for label, command in [('확인한 결과 복사', self.copy), ('JSON 저장', self.save), ('스타일 자료 업데이트', self.update_catalog)]:
            button = ttk.Button(footer, text=label, command=command)
            button.pack(side='left', padx=(0, 6))
            self.controls.append(button)
        ttk.Button(footer, text='사이트 열기', command=self.open_site).pack(side='right')
        ttk.Combobox(footer, textvariable=self.browser_value, state='readonly', width=13,
                     values=['기본 브라우저', '크롬', '엣지']).pack(side='right', padx=6)
        self.progress = ttk.Progressbar(outer, mode='indeterminate')
        self.progress.pack(fill='x', pady=(12, 6))
        ttk.Label(outer, textvariable=self.status, wraplength=1080).pack(fill='x')

    def set_busy(self, busy):
        self.busy = busy
        for button in self.controls:
            button.configure(state='disabled' if busy else 'normal')
        self.cancel_button.configure(state='normal' if busy else 'disabled')
        if busy:
            self.progress.start()
        else:
            self.progress.stop()

    def add_files(self):
        paths = filedialog.askopenfilenames(title='스타일 목록 스크린샷', filetypes=[('이미지', '*.png *.jpg *.jpeg *.webp *.bmp')])
        if paths:
            self.start(paths)

    def paste_image(self):
        try:
            image = ImageGrab.grabclipboard()
            if isinstance(image, list):
                self.start(image)
            elif isinstance(image, Image.Image):
                path = Path(self.temp.name) / f'clipboard-{len(list(Path(self.temp.name).glob("*.png")))}.png'
                image.save(path)
                self.start([str(path)])
            else:
                messagebox.showinfo('이미지 붙여넣기', '클립보드에 이미지가 없습니다.')
        except Exception as error:
            messagebox.showerror('이미지 붙여넣기', str(error))

    def start(self, paths):
        if self.busy:
            return
        self.cancelled.clear()
        self.set_busy(True)
        self.status.set('스타일 인식 자료를 준비하고 있습니다.')

        def work():
            failures = []
            try:
                if self.recognizer is None:
                    self.recognizer = Recognizer(*self.paths)
                for index, path in enumerate(paths):
                    if self.cancelled.is_set():
                        break
                    self.events.put(('status', f'{index + 1}/{len(paths)} 분석 중: {Path(path).name}'))
                    try:
                        rows = self.recognizer.recognize(path, self.cancelled.is_set)
                        self.events.put(('rows', rows))
                    except Exception as error:
                        failures.append(f'{Path(path).name}: {error}')
            except Exception as error:
                failures.append(str(error))
            finally:
                self.events.put(('done', failures))

        threading.Thread(target=work, daemon=True).start()

    def poll(self):
        try:
            while True:
                kind, value = self.events.get_nowait()
                if kind == 'status':
                    self.status.set(value)
                elif kind == 'rows':
                    for row in value:
                        self.rows.append(row)
                        self.refresh_row(len(self.rows) - 1)
                    self.update_summary()
                    if self.selected is None and self.rows:
                        self.tree.selection_set('0')
                elif kind == 'done':
                    self.set_busy(False)
                    self.status.set('분석 중지됨.' if self.cancelled.is_set() else '분석 완료. 반영할 결과를 확인하세요.')
                    if value:
                        messagebox.showwarning('분석하지 못한 사진', '\n\n'.join(value))
                elif kind == 'updated':
                    import json
                    self.paths = (value['catalog'], value['root'], self.paths[2])
                    self.styles = json.loads(self.paths[0].read_text(encoding='utf-8'))['styles']
                    self.by_id = {style['id']: style for style in self.styles}
                    self.labels = {style['id']: f"{style['character_name']} / {style['style_name']}" for style in self.styles}
                    if len(set(self.labels.values())) != len(self.labels):
                        self.labels = {key: f'{label} [{key}]' for key, label in self.labels.items()}
                    self.ids_by_label = {label: key for key, label in self.labels.items()}
                    self.recognizer = None
                    for index, row in enumerate(self.rows):
                        if row.style_id not in self.by_id:
                            row.style_id, row.reviewed = '', False
                        self.refresh_row(index)
                    self.update_summary()
                    if self.selected is not None:
                        self.select()
                    self.set_busy(False)
                    self.status.set(f"자료 {value['count']}개 준비 완료 · 새 다운로드 {value['downloaded']}개 · 기존 자료 재사용 {value['reused']}개")
                elif kind == 'update-error':
                    self.set_busy(False)
                    self.status.set(value)
        except queue.Empty:
            pass
        self.root.after(100, self.poll)

    def update_summary(self):
        self.summary.set(f'{len(self.rows)}개 / 확인 완료 {sum(row.reviewed for row in self.rows)}개')

    def refresh_row(self, index):
        row = self.rows[index]
        label = self.labels.get(row.style_id, '스타일 미확인')
        state = '완료' if row.reviewed else '검토 대기' if row.confident else '확인 필요'
        values = (label, row.limit_break if row.limit_break is not None else '?',
                  '적용' if row.daphne is True else '미적용' if row.daphne is False else '?', state)
        tag = 'reviewed' if row.reviewed else 'uncertain' if not row.confident else ''
        if self.tree.exists(str(index)):
            self.tree.item(str(index), values=values, tags=(tag,))
        else:
            self.tree.insert('', 'end', iid=str(index), values=values, tags=(tag,))

    def select(self, _event=None):
        selected = self.tree.selection()
        if not selected:
            return
        self.selected = int(selected[0])
        row = self.rows[self.selected]
        image = Image.fromarray(cv2.cvtColor(row.crop, cv2.COLOR_BGR2RGB)).resize((390, 159), Image.Resampling.LANCZOS)
        self.preview_image = ImageTk.PhotoImage(image)
        self.preview.configure(image=self.preview_image)
        self.detail_value.set(f'{Path(row.source).name}\n일치 특징점 {row.match_score}개 / 숫자 점수 {row.digit_score:.2f}')
        self.search_value.set('')
        self.filter_styles()
        self.style_value.set(self.labels.get(row.style_id, ''))
        self.count_value.set(str(row.limit_break) if row.limit_break is not None else '미확인')
        self.daphne_value.set('적용' if row.daphne is True else '미적용' if row.daphne is False else '미확인')

    def filter_styles(self, _event=None):
        query = self.search_value.get().strip().casefold()
        candidates = [key for key, _ in self.rows[self.selected].candidates] if self.selected is not None else []
        ids = candidates + [key for key in self.labels if key not in candidates]
        self.style_combo['values'] = [self.labels[key] for key in ids if key in self.labels and query in self.labels[key].casefold()]

    def update_catalog(self):
        if self.busy:
            return
        self.cancelled.clear()
        self.set_busy(True)
        self.status.set('GitHub의 최신 스타일 자료를 확인하고 있습니다.')

        def work():
            try:
                bundled_catalog, bundled_root, _ = resource_paths()
                result = update_data(bundled_catalog, bundled_root,
                                     progress=lambda value: self.events.put(('status', value)),
                                     cancelled=self.cancelled.is_set)
                self.events.put(('updated', result))
            except UpdateCancelled as error:
                self.events.put(('update-error', str(error)))
            except Exception as error:
                self.events.put(('update-error', f'업데이트하지 못했습니다. 기존 자료를 유지합니다. ({error})'))

        threading.Thread(target=work, daemon=True).start()

    def confirm(self):
        if self.selected is None or self.busy:
            return
        style_id = self.ids_by_label.get(self.style_value.get())
        if not style_id:
            messagebox.showinfo('확인 필요', '스타일을 선택해주세요.')
            return
        count = None if self.count_value.get() == '미확인' else int(self.count_value.get())
        daphne = {'적용': True, '미적용': False, '미확인': None}[self.daphne_value.get()]
        if count is None and daphne is None:
            messagebox.showinfo('확인 필요', '돌파 수 또는 다프네 상태를 확인해주세요.')
            return
        row = self.rows[self.selected]
        row.style_id, row.limit_break, row.daphne, row.reviewed = style_id, count, daphne, True
        self.refresh_row(self.selected)
        self.update_summary()
        for offset in range(1, len(self.rows) + 1):
            index = (self.selected + offset) % len(self.rows)
            if not self.rows[index].reviewed:
                self.tree.selection_set(str(index))
                self.tree.see(str(index))
                break

    def exclude(self):
        if self.selected is not None and not self.busy:
            self.rows[self.selected].reviewed = False
            self.refresh_row(self.selected)
            self.update_summary()

    def review_confident(self):
        eligible = [row for row in self.rows if row.confident and not row.reviewed]
        if not eligible:
            messagebox.showinfo('일괄 확인', '일괄 확인할 결과가 없습니다. 개별 항목을 확인해주세요.')
            return
        if messagebox.askyesno('일괄 확인', f'인식 점수가 높은 {len(eligible)}개 항목을 반영 대상으로 확인할까요?'):
            for row in eligible:
                row.reviewed = True
            for index in range(len(self.rows)):
                self.refresh_row(index)
            self.update_summary()

    def copy(self):
        try:
            text = payload_text(self.rows, self.by_id)
            self.root.clipboard_clear()
            self.root.clipboard_append(text)
            self.status.set('복사했습니다. 웹의 인식 결과 가져오기에 붙여넣으세요.')
        except Exception as error:
            messagebox.showerror('복사하지 못했습니다', str(error))

    def save(self):
        try:
            text = payload_text(self.rows, self.by_id)
            path = filedialog.asksaveasfilename(defaultextension='.json', initialfile='hbr-styles.json', filetypes=[('JSON', '*.json')])
            if path:
                Path(path).write_text(text, encoding='utf-8')
                self.status.set('인식 결과를 저장했습니다.')
        except Exception as error:
            messagebox.showerror('저장하지 못했습니다', str(error))

    def clear(self):
        if self.rows and messagebox.askyesno('전체 비우기', '현재 인식 결과를 모두 비울까요?'):
            self.rows.clear()
            self.selected = None
            self.tree.delete(*self.tree.get_children())
            self.preview.configure(image='')
            self.detail_value.set('')
            self.style_value.set('')
            self.style_combo['values'] = []
            self.count_value.set('미확인')
            self.daphne_value.set('미확인')
            self.update_summary()

    def open_site(self):
        browser = self.browser_value.get()
        try:
            if browser == '기본 브라우저':
                if not webbrowser.open(SITE_URL):
                    raise ValueError('기본 브라우저를 열지 못했습니다.')
                return
            import winreg
            executable = 'chrome.exe' if browser == '크롬' else 'msedge.exe'
            for hive in [winreg.HKEY_CURRENT_USER, winreg.HKEY_LOCAL_MACHINE]:
                for flag in [winreg.KEY_WOW64_64KEY, winreg.KEY_WOW64_32KEY]:
                    try:
                        with winreg.OpenKey(hive, f'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\{executable}', 0, winreg.KEY_READ | flag) as key:
                            path = winreg.QueryValue(key, None)
                        subprocess.Popen([path, SITE_URL])
                        return
                    except OSError:
                        continue
            raise ValueError(f'{browser} 설치 경로를 찾지 못했습니다.')
        except Exception as error:
            messagebox.showerror('사이트 열기', str(error))

    def close(self):
        if self.busy and not messagebox.askyesno('종료', '진행 중인 분석을 중지하고 종료할까요?'):
            return
        self.cancelled.set()
        self.root.destroy()


def main():
    if len(sys.argv) >= 3 and sys.argv[1] == '--self-test':
        import json
        report = {}
        try:
            reader = Recognizer(*resource_paths())
            root = tk.Tk()
            root.withdraw()
            ReaderApp(root)
            root.update()
            root.destroy()
            report = {'status': 'ok', 'catalog': len(reader.styles), 'references': len(reader.references)}
            if len(sys.argv) > 3:
                rows = reader.recognize(sys.argv[3])
                report['cards'] = len(rows)
                report['styles_identified'] = sum(bool(row.style_id) for row in rows)
        except Exception as error:
            report = {'status': 'error', 'error': str(error)}
        Path(sys.argv[2]).write_text(json.dumps(report, ensure_ascii=False), encoding='utf-8')
        return
    root = tk.Tk()
    try:
        ReaderApp(root)
        root.mainloop()
    except Exception as error:
        messagebox.showerror('시작하지 못했습니다', str(error))
        raise


if __name__ == '__main__':
    main()
