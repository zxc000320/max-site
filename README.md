# 🎮 MAX의 놀이터 (MAX_Play_Ground)

> 아무나 올 수 없다..

브라우저에서 바로 즐길 수 있는 미니 게임을 모아 둔 개인 웹사이트입니다.
군 복무 중에 틈틈이 만들었고, 게임은 대부분 프레임워크 없이 순수 JavaScript로 구현했습니다.

🔗 **사이트 바로가기: https://max-play-ground.netlify.app/**

---

## 🕹️ 미니 게임

| 게임 | 설명 | 모드 |
| --- | --- | --- |
| **Tic Tac Toe** | 3×3 칸에 먼저 한 줄을 완성하면 승리. Python으로 작성해 PyScript로 브라우저에서 실행 | 1인(vs AI) / 2인 |
| **Wordle** | 다섯 글자 영어 단어 맞히기. 정답 확인·리셋 기능 | 1인 |
| **Dot And Box** | 점 사이에 선을 그어 상자를 더 많이 완성하는 쪽이 승리 | 1인(vs AI) / 2인, 보드 크기 3종 |
| **Minesweeper** | 클래식 지뢰찾기. 우클릭으로 깃발/물음표 표시, 타이머 | 초급 · 중급 · 고급 · 마스터 |
| **Swipe Brick Breaker** | 드래그로 각도를 정해 공을 발사하는 벽돌깨기. 예상 경로 표시 | 배속 x1 · x2 · x4 · x8 |
| **Reaction Speed** | 화면이 초록색으로 바뀌는 순간 클릭! 현재/평균 반응 속도 측정 | 1인 |

### 🚧 개발 중

- **오목 (Omok)**: 렌주룰 기반, 흑돌 금수 판정, 무르기 기능 (남은 과제: 3-3 거짓 금수 판정)
- **나인 멘스 모리스 (Nine Men's Morris)**
- **에임 테스트 (Aim Test)**

## 📑 사이트 구성

- **메인**: 소개 영상과 랭킹 · 로그인 · 게임 바로가기 카드
- **랭킹 & 공지**: 공지사항, 전체 랭킹, 최근 1년 랭킹 탭
- **로그인 / 회원가입 / 계정 찾기** 페이지 (UI)
- **미니 게임**: 위 게임 모음
- **YouTube**: [MAX 유튜브 채널](https://www.youtube.com/@MAX-mq5uf/videos) 소개
- **게시판**: 제목·내용을 입력하는 글쓰기 폼 (UI)

## 🛠️ 사용 기술

- **HTML / CSS / JavaScript**: 게임 로직은 Canvas와 DOM으로 직접 구현
- **PyScript**: Python으로 작성한 Tic Tac Toe를 브라우저에서 실행
- **Bootstrap, jQuery**: 레이아웃과 UI 컴포넌트
- **goormIDE**: 개발 환경
- **Netlify**: 배포

## 📁 폴더 구조

```
max-site/
├── index.html            # 메인 페이지 (모든 섹션과 게임 포함)
├── membership.html       # 회원가입
├── memberfind.html       # 아이디/비밀번호 찾기
├── style.css
├── assets/
│   ├── js/               # 게임별 스크립트 (wordle.js, minesweeper.js, omok.js ...)
│   ├── css/              # 게임별 스타일
│   ├── py/               # tic_tac_toe.py (PyScript)
│   ├── images/
│   └── fonts/
└── vendor/               # Bootstrap, jQuery
```

## ▶️ 로컬에서 실행하기

빌드 과정이 없는 정적 사이트라서 간단한 웹 서버만 있으면 됩니다.

```bash
git clone https://github.com/zxc000320/max-site.git
cd max-site/max-site
python -m http.server 8000
```

브라우저에서 `http://localhost:8000` 으로 접속하세요.
(PyScript는 `index.html`을 파일로 직접 열면 동작하지 않으므로 서버로 띄워야 합니다.)

## 🙏 참고

- 사이트 레이아웃: [TemplateMo](https://templatemo.com/) 템플릿을 바탕으로 수정
- 오목 렌주룰 구현 참고: [Amustaos5j/gomokuMachine1](https://github.com/Amustaos5j/gomokuMachine1), [hsh-game/omok](https://github.com/hsh-game/omok)
