# 고기석 리뷰 답글 생성기 — Claude Code 빌드 & 배포

---

## UX 컨셉

리뷰 붙여넣기 → 답글 생성 → 복사. 끝.

감정, 톤, 키워드 선택 없음. AI가 리뷰 내용을 분석해서 전부 자동 처리.

---

## 1단계: Claude Code 설치

```bash
# macOS / Linux
curl -fsSL https://claude.ai/install.sh | sh

# Windows (PowerShell) — Git for Windows 먼저 설치 필요
irm https://claude.ai/install.ps1 | iex

# 설치 확인
claude --version

# 로그인 (브라우저 열림 → Pro/Max 계정 로그인)
claude
```

---

## 2단계: 프로젝트 생성 & 빌드

```bash
mkdir gokiseok-review && cd gokiseok-review
git init
claude
```

Claude Code 안에서 아래 프롬프트를 그대로 붙여넣기:

```
이 프로젝트의 전체 파일을 만들어줘.

## 프로젝트: 고기석 네이버 리뷰 답글 생성기

### 동작 방식
1. 사용자가 고객 리뷰를 textarea에 붙여넣기
2. "답글 생성" 버튼 클릭 (또는 Cmd+Enter)
3. AI가 리뷰를 분석해서 감정/톤/키워드를 자동 판단
4. 사장님 답글이 바로 생성됨
5. 수정 가능 + 복사 버튼

옵션 선택 UI 일절 없음. 입력창, 생성 버튼, 결과, 복사 버튼만.

### 파일 구조

1. index.html — 프론트엔드 (단일 파일, Vanilla JS)
   - 다크 테마, Pretendard 폰트, 골드(#c4953a) 액센트
   - 모바일 반응형
   - /api/generate 엔드포인트로 POST 요청
   - contentEditable로 답글 수정 가능
   - 복사 버튼, 초기화 버튼, ⌘+Enter 단축키

2. functions/api/generate.js — Cloudflare Pages Functions
   - POST body: { review: "리뷰 텍스트" }
   - 환경변수 ANTHROPIC_API_KEY 사용
   - Claude Sonnet 4 모델 호출
   - CORS 헤더 설정
   - 시스템 프롬프트:

"당신은 서울 광진구 건대입구역 근처 통갈매기살 전문 고기집 고기석의 사장님입니다.
고객 리뷰를 보고 네이버 플레이스 사장님 답글을 작성합니다.
리뷰의 감정, 적절한 톤, SEO 키워드를 직접 판단하세요.
SEO 키워드(건대 고기집, 건대 회식, 건대 단체모임, 건대청첩장모임, 건대룸식당, 건대병원맛집) 중 1~2개를 자연스럽게 포함.
답글 2~4문장(100~200자), 이모지 최대 1개, 매장명 고기석 1회 언급, 재방문 유도 포함.
답글 텍스트만 출력."

### 매장 정보
- 매장명: 고기석
- 위치: 서울 광진구 건대입구역
- 전문: 통갈매기살
- 특징: 넓은 단체석, 회식/청모/단체모임 가능
```

---

## 3단계: 로컬 테스트

```bash
npm install -g wrangler
export ANTHROPIC_API_KEY="sk-ant-여기에키입력"
npx wrangler pages dev .
```

브라우저에서 http://localhost:8788 접속 → 리뷰 붙여넣기 → 테스트

---

## 4단계: GitHub + Cloudflare 배포

```bash
# 커밋 & 푸시
git add .
git commit -m "feat: 고기석 리뷰 답글 생성기"
gh repo create gokiseok-review --public --push
# gh CLI 없으면 GitHub 웹에서 레포 만들고 수동 push
```

### Cloudflare Pages 설정

1. dash.cloudflare.com → Pages → Create project
2. GitHub 연결 → gokiseok-review 선택
3. 빌드 설정:
   - Framework: None
   - Build command: 비워두기
   - Output directory: /
4. 환경변수: ANTHROPIC_API_KEY = sk-ant-...
5. Deploy

### 도메인 연결

Pages → Custom domains → review.gokiseok.com

---

## 5단계: 수정할 때

```bash
cd gokiseok-review
claude
```

자연어로 요청:
- "키워드에 건대 뒷풀이 추가해줘"
- "답글 3개를 한번에 생성하는 기능 추가해줘"
- "답글 히스토리 저장 기능 넣어줘"

수정 후:
```bash
git add . && git commit -m "update" && git push
```

자동 배포 완료.

---

## 비용

| 항목 | 비용 |
|------|------|
| Claude Pro (Claude Code 포함) | $20/월 |
| Cloudflare Pages + Workers | 무료 |
| Anthropic API (답글 생성) | 월 100건 = ~600원 |
| 도메인 | 보유 중 (gokiseok.com) |
