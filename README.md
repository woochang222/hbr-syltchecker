# HBR Style Checker (헤븐번즈 레드 스타일 체커)

헤븐번즈 레드의 스타일 체커 웹 페이지 입니다.

이 프로젝트는 헤븐번즈 레드(HBR)의 캐릭터 스타일을 체크하기 위해 만들었습니다.

## 🚀 주요 기능

- **SS/레조넌스 집중**: 활용도가 높은 주요 스타일 위주로 관리합니다.
- **필터 드로어**: 필터 버튼으로 원소, 부대, 티어, 메타 조합 조건을 한 번에 조정할 수 있습니다.
- **메타 조합 프리셋**: 무, 화, 빙, 뇌, 광, 암 속성별 추천 조합을 빠르게 적용할 수 있습니다.
- **다중 필터링**: 원소, 부대, 티어, 검색어, 보유 단계 조건으로 스타일을 필터링할 수 있습니다.
- **필터 요약 표시**: 현재 적용된 프리셋과 필터 조건, 결과 수를 요약해서 보여줍니다.
- **보유 현황 저장**: 브라우저의 `LocalStorage`를 사용하여 사용자의 보유 체크 현황과 필터 설정(Dim/Hide)을 자동으로 저장합니다.
- **시각적 효과**:
  - **교복 스타일**: 보유 시 다이아몬드 그라데이션 테두리와 애니메이션 효과가 적용됩니다.
  - **배지 표시**: 한정(Limited) 및 레조넌스(Resonance) 스타일에 대한 배지를 제공합니다.
- **반응형 디자인**: 데스크톱과 모바일 환경 모두 최적화된 그리드 뷰를 제공합니다.

## 🛠 실행 방법

프로젝트 디렉토리에서 아래 명령어를 실행하세요.

```powershell
# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev

# 테스트 실행
npm test

# 코드 스타일 검사
npm run lint

# 프로덕션 빌드
npm run build

# 데이터/이미지/메타 조합 검증 리포트
npm run validate:data-report

# 출처 URL 네트워크 검증
npm run validate:source-urls
```

## 📂 데이터 구조

- `src/data/styles.json`: 캐릭터 및 스타일의 상세 정보 (원소, 부대, 티어 등)
- `src/data/meta_teams.json`: 현재 유행하는 메타 조합 정보
- `src/data/style_manifest.json`: 스타일별 검증 기대값, 출처 URL, 이미지 검증 상태
- `src/data/meta_team_manifest.json`: 메타 조합별 기대 스타일 목록, 출처 URL, 검토 상태
- `public/images/styles/`: 스타일 카드에 사용하는 로컬 이미지 파일

## ✅ 검증 기준

- `npm test`: 스타일 데이터 무결성, 이미지 참조, 메타 조합 구조, 필터 유틸리티를 검증합니다.
- `npm run lint`: 앱 코드와 Node 검증 스크립트의 ESLint 규칙을 확인합니다.
- `npm run build`: Vite 프로덕션 빌드가 성공하는지 확인합니다.
- `npm run validate:data-report`: manifest 누락, 미검증 이미지, 파일명 불일치, 메타 조합 검토 상태를 검사합니다.
- `npm run validate:source-urls`: manifest에 기록된 Game8 출처 URL에 네트워크로 접근 가능한지 확인합니다.
