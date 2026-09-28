"""Validation at the boundary between the reader and the web importer."""
import json


def build_payload(results, known_ids):
    entries = {}
    for row in results:
        if not row.reviewed:
            continue
        if row.style_id not in known_ids:
            raise ValueError('확인한 항목에 스타일이 지정되지 않았습니다.')
        if row.limit_break is not None and (type(row.limit_break) is not int or not 0 <= row.limit_break <= 4):
            raise ValueError('돌파 수는 0~4여야 합니다.')
        if row.daphne is not None and type(row.daphne) is not bool:
            raise ValueError('다프네 상태가 올바르지 않습니다.')
        if row.limit_break is None and row.daphne is None:
            raise ValueError('돌파 수와 다프네 상태가 모두 미확인인 항목이 있습니다.')
        target = entries.setdefault(row.style_id, {'id': row.style_id})
        for key, value in [('limitBreak', row.limit_break), ('daphne', row.daphne)]:
            if value is None:
                continue
            if key in target and target[key] != value:
                raise ValueError(f'같은 스타일의 결과가 충돌합니다: {row.style_id}')
            target[key] = value
    if not entries:
        raise ValueError('먼저 반영할 항목을 확인해주세요.')
    return {'format': 'hbr-style-recognition', 'version': 1, 'styles': list(entries.values())}


def payload_text(results, known_ids):
    return json.dumps(build_payload(results, known_ids), ensure_ascii=False, indent=2)
