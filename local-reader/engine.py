"""Offline recognition of HBR style-list cards."""
from dataclasses import dataclass, field
from pathlib import Path
import json

import cv2
import numpy as np


def read_image(path):
    image = cv2.imdecode(np.fromfile(path, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError('이미지를 읽을 수 없습니다.')
    return image


def clusters(values, tolerance):
    groups = []
    for value in sorted(values):
        if not groups or value - np.median(groups[-1]) > tolerance:
            groups.append([value])
        else:
            groups[-1].append(value)
    return groups


def detect_cards(image):
    """Infer complete rows from repeated card rectangles, not screen coordinates."""
    h, w = image.shape[:2]
    if w / h < 1.3:
        raise ValueError('가로 방향의 스타일 목록 스크린샷이 필요합니다.')
    scaled = cv2.resize(image, (round(w * 800 / h), 800))
    hsv = cv2.cvtColor(scaled, cv2.COLOR_BGR2HSV)
    mask = ((hsv[:, :, 1] > 65) & (hsv[:, :, 2] > 45)).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 19), np.uint8))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    candidates = []
    for contour in contours:
        x, y, cw, ch = cv2.boundingRect(contour)
        if 2.2 < cw / ch < 2.65 and cw > 150 and 70 < ch < 190 and y > 120 and y + ch < 780:
            candidates.append((x, y, cw, ch))
    if len(candidates) < 6:
        raise ValueError('완전한 스타일 목록 카드를 찾지 못했습니다. 부대 편성 화면은 지원하지 않습니다.')
    cw, ch = np.median(np.array(candidates)[:, 2:], axis=0)
    candidates = [b for b in candidates if abs(b[2] - cw) < cw * .06 and abs(b[3] - ch) < ch * .05]
    columns = [int(np.median(g)) for g in clusters([b[0] for b in candidates], cw * .1) if len(g) >= 2]
    rows = [int(np.median(g)) for g in clusters([b[1] for b in candidates], ch * .12) if len(g) >= 2]
    if len(columns) < 3 or len(rows) < 2:
        raise ValueError('스타일 목록의 카드 배열을 확인하지 못했습니다.')
    if np.std(np.diff(columns)) > cw * .15:
        raise ValueError('카드 간격이 일정하지 않습니다. 전체 화면 스크린샷을 사용해주세요.')
    cards = []
    for y in rows:
        for x in columns:
            crop = scaled[y:y + round(ch), x:x + round(cw)]
            cards.append((cv2.resize(crop, (300, 122)), (x, y, round(cw), round(ch))))
    return cards


@dataclass
class Result:
    source: str
    crop: np.ndarray
    candidates: list = field(default_factory=list)
    style_id: str = ''
    limit_break: int | None = None
    daphne: bool | None = None
    reviewed: bool = False
    match_score: int = 0
    digit_score: float = 0

    @property
    def confident(self):
        runner_up = self.candidates[1][1] if len(self.candidates) > 1 else 0
        return (bool(self.style_id) and self.match_score >= 10 and self.match_score - runner_up >= 5
                and self.limit_break is not None and self.digit_score >= .75 and self.daphne is not None)


class Recognizer:
    def __init__(self, catalog_path, image_root, assets):
        catalog = json.loads(Path(catalog_path).read_text(encoding='utf-8'))
        self.styles = catalog['styles'] if isinstance(catalog, dict) else catalog
        self.assets = Path(assets)
        self.sift = cv2.SIFT_create(nfeatures=500, contrastThreshold=.025)
        self.matcher = cv2.BFMatcher()
        self.digits = [(int(path.stem.split('_')[1]), cv2.cvtColor(read_image(path), cv2.COLOR_BGR2GRAY))
                       for path in sorted(self.assets.glob('digit_*_*.png'))]
        if not self.digits:
            raise ValueError('숫자 인식 자료가 없습니다.')
        self.daphne_template = cv2.cvtColor(read_image(self.assets / 'daphne.png'), cv2.COLOR_BGR2GRAY)
        self.references = []
        for style in self.styles:
            path = Path(image_root) / style['image_url'].lstrip('/')
            if not path.is_file():
                continue
            image = read_image(path)
            game_card = style.get('reference_kind') == 'game-select'
            image = cv2.resize(image, (300, 122) if game_card else (240, 240))
            mask = np.full(image.shape[:2], 255, np.uint8)
            if not game_card:
                mask[:48] = 0
            kp, desc = self.sift.detectAndCompute(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY), mask)
            if desc is not None:
                self.references.append((style['id'], kp, desc))

    def read_count(self, crop):
        roi = cv2.cvtColor(crop[82:122, 124:171], cv2.COLOR_BGR2GRAY)
        scores = []
        for number in range(5):
            score = 0
            for value, template in self.digits:
                if value != number:
                    continue
                for scale in [.9, 1., 1.1]:
                    resized = cv2.resize(template, None, fx=scale, fy=scale)
                    score = max(score, float(cv2.minMaxLoc(cv2.matchTemplate(roi, resized, cv2.TM_CCOEFF_NORMED))[1]))
            scores.append((number, score))
        scores.sort(key=lambda item: item[1], reverse=True)
        best, second = scores[:2]
        return (best[0] if best[1] > .70 and best[1] - second[1] > .05 else None), best[1]

    def read_daphne(self, crop):
        roi = cv2.cvtColor(crop[72:122, 245:300], cv2.COLOR_BGR2GRAY)
        score = float(cv2.minMaxLoc(cv2.matchTemplate(roi, self.daphne_template, cv2.TM_CCOEFF_NORMED))[1])
        return True if score >= .7 else False if score < .5 else None

    def identify(self, crop):
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        mask = np.zeros(gray.shape, np.uint8)
        mask[12:110, 130:290] = 255
        kp, desc = self.sift.detectAndCompute(gray, mask)
        if desc is None or len(desc) < 3:
            return []
        ranked = []
        for style_id, reference_kp, reference_desc in self.references:
            matches = self.matcher.knnMatch(reference_desc, desc, k=2)
            good = [m for m, n in matches if m.distance < .72 * n.distance]
            score = 0
            if len(good) >= 4:
                source = np.float32([reference_kp[m.queryIdx].pt for m in good])
                target = np.float32([kp[m.trainIdx].pt for m in good])
                matrix, inliers = cv2.estimateAffinePartial2D(source, target, method=cv2.RANSAC, ransacReprojThreshold=3)
                if matrix is not None:
                    scale = np.hypot(matrix[0, 0], matrix[1, 0])
                    if .2 < scale < 3:
                        score = int(inliers.sum())
            if score:
                ranked.append((style_id, score))
        return sorted(ranked, key=lambda item: item[1], reverse=True)[:5]

    def recognize(self, path, cancelled=lambda: False):
        results = []
        for crop, _ in detect_cards(read_image(path)):
            if cancelled():
                break
            candidates = self.identify(crop)
            result = Result(str(path), crop, candidates)
            if candidates:
                candidate, result.match_score = candidates[0]
                if result.match_score >= 7 and (len(candidates) < 2 or result.match_score - candidates[1][1] >= 3):
                    result.style_id = candidate
            result.limit_break, result.digit_score = self.read_count(crop)
            result.daphne = self.read_daphne(crop)
            results.append(result)
        return results
