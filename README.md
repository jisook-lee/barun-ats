# 🏢 바른컴퍼니 채용관리시스템 (Barun ATS)

Node.js + Express 기반의 채용 관리 웹 애플리케이션입니다.

---

## 🚀 빠른 시작 (3단계)

### 1. Node.js 설치 확인
```bash
node -v   # v18 이상 권장
```
Node.js가 없다면 https://nodejs.org 에서 설치하세요.

### 2. 패키지 설치 및 실행
```bash
cd barun-ats
npm install
npm start
```

### 3. 브라우저에서 접속
```
http://localhost:3000
```

---

## 👤 테스트 계정

| 계정 ID | 이름 | 역할 | 비밀번호 |
|---------|------|------|---------|
| admin | 김인사 | 인사팀 관리자 (전체 접근) | 1234 |
| sales1 | 박영업 | 영업팀 담당자 | 1234 |
| cs1 | 이서비스 | CS팀 담당자 | 1234 |
| etc1 | 최기타 | 기타 부서 담당자 | 1234 |

---

## 📁 프로젝트 구조

```
barun-ats/
├── server.js          # Express 서버 + REST API
├── package.json       # 프로젝트 설정
├── data.json          # JSON 파일 DB (자동 생성)
├── public/
│   └── index.html     # 프론트엔드 (React SPA)
└── README.md
```

---

## 🔌 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/login` | 로그인 |
| GET | `/api/applicants` | 지원자 목록 |
| GET | `/api/applicants/:id` | 지원자 상세 |
| POST | `/api/applicants` | 지원자 등록 (인사팀만) |
| PUT | `/api/applicants/:id` | 지원자 수정 |
| DELETE | `/api/applicants/:id` | 지원자 삭제/파기 (인사팀만) |
| GET | `/api/postings` | 채용공고 목록 |
| PUT | `/api/postings/:id` | 채용공고 수정 (인사팀만) |
| GET | `/api/dashboard` | 대시보드 통계 |
| POST | `/api/reset` | 데이터 초기화 |

> 모든 API는 `?role=인사팀` 또는 `?role=부서담당자&department=영업팀` 쿼리로 권한을 제어합니다.

---

## 🔒 개인정보 보호

- **인사팀**: 전체 지원자 정보 열람 가능 (연락처, 이메일, 이력서 포함)
- **부서담당자**: 해당 부서 지원자만 열람, 개인정보(연락처/이메일/이력서/지원경로) 비공개

---

## 🌐 외부 배포 방법

### Render.com (무료, 추천)
1. https://render.com 가입
2. New > Web Service > 이 폴더를 GitHub에 올린 후 연결
3. Build Command: `npm install`
4. Start Command: `npm start`
5. 무료 URL 자동 생성

### Railway (무료)
1. https://railway.app 가입
2. New Project > Deploy from GitHub
3. 자동 감지 후 배포

### 직접 서버 (VPS)
```bash
# 서버에서
git clone [저장소]
cd barun-ats
npm install
npm start
# 또는 pm2로 백그라운드 실행
npm install -g pm2
pm2 start server.js --name barun-ats
```

---

## ⚠️ 운영 시 주의사항

1. **비밀번호**: 현재 평문 저장 → 운영 시 bcrypt 등으로 해싱 필요
2. **인증**: 현재 쿼리 기반 → 운영 시 JWT 토큰 인증 도입 필요
3. **DB**: 현재 JSON 파일 → 운영 시 PostgreSQL/MongoDB 등 교체 권장
4. **HTTPS**: 배포 시 반드시 HTTPS 사용 (개인정보보호법 준수)
5. **백업**: data.json 정기 백업 필요
