const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── JSON File DB ───
const DB_PATH = path.join(__dirname, "data.json");

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    const initial = getInitialData();
    saveDB(initial);
    return initial;
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function getInitialData() {
  return {
    users: [
      { id: "admin", name: "김인사", password: "1234", role: "인사팀", department: null },
      { id: "sales1", name: "박영업", password: "1234", role: "부서담당자", department: "영업팀" },
      { id: "cs1", name: "이서비스", password: "1234", role: "부서담당자", department: "CS팀" },
      { id: "etc1", name: "최기타", password: "1234", role: "부서담당자", department: "기타" },
    ],
    applicants: [
      { id: 1, name: "홍길동", department: "영업팀", position: "영업사원", stage: "1차 면접", channel: "잡코리아", phone: "010-1234-5678", email: "hong@email.com", appliedAt: "2026-02-20", score: 4, comment: "커뮤니케이션 능력 우수", resume: "홍길동_이력서.pdf" },
      { id: 2, name: "김철수", department: "영업팀", position: "영업관리", stage: "서류검토", channel: "사람인", phone: "010-2345-6789", email: "kim@email.com", appliedAt: "2026-02-22", score: null, comment: "", resume: "김철수_이력서.pdf" },
      { id: 3, name: "이영희", department: "CS팀", position: "CS상담원", stage: "서류접수", channel: "알바몬", phone: "010-3456-7890", email: "lee@email.com", appliedAt: "2026-02-24", score: null, comment: "", resume: "이영희_이력서.pdf" },
      { id: 4, name: "박지민", department: "CS팀", position: "CS팀장", stage: "2차 면접", channel: "원티드", phone: "010-4567-8901", email: "park@email.com", appliedAt: "2026-02-18", score: 5, comment: "리더십 경험 풍부, 적극 추천", resume: "박지민_이력서.pdf" },
      { id: 5, name: "정수연", department: "영업팀", position: "영업사원", stage: "최종합격", channel: "잡코리아", phone: "010-5678-9012", email: "jung@email.com", appliedAt: "2026-02-10", score: 5, comment: "영업 경력 3년, 우수 후보", resume: "정수연_이력서.pdf" },
      { id: 6, name: "강민호", department: "기타", position: "경영지원", stage: "서류검토", channel: "사람인", phone: "010-6789-0123", email: "kang@email.com", appliedAt: "2026-02-23", score: null, comment: "", resume: "강민호_이력서.pdf" },
      { id: 7, name: "윤서현", department: "CS팀", position: "CS상담원", stage: "1차 면접", channel: "잡코리아", phone: "010-7890-1234", email: "yoon@email.com", appliedAt: "2026-02-19", score: 3, comment: "경력은 부족하나 성장 가능성 있음", resume: "윤서현_이력서.pdf" },
      { id: 8, name: "조현우", department: "영업팀", position: "영업관리", stage: "불합격", channel: "원티드", phone: "010-8901-2345", email: "cho@email.com", appliedAt: "2026-02-15", score: 2, comment: "직무 적합성 부족", resume: "조현우_이력서.pdf" },
    ],
    postings: [
      { id: 1, title: "영업팀 신입사원 채용", department: "영업팀", position: "영업사원", status: "모집중", channels: ["잡코리아", "사람인"], startDate: "2026-02-01", endDate: "2026-03-15", headcount: 2 },
      { id: 2, title: "CS팀 상담원 모집", department: "CS팀", position: "CS상담원", status: "모집중", channels: ["알바몬", "잡코리아"], startDate: "2026-02-10", endDate: "2026-03-10", headcount: 3 },
      { id: 3, title: "경영지원 담당자 채용", department: "기타", position: "경영지원", status: "준비중", channels: ["원티드"], startDate: "2026-03-01", endDate: "2026-03-31", headcount: 1 },
    ],
  };
}

// ─── 개인정보 필터링 (부서담당자용) ───
function filterPrivateFields(applicant) {
  const { phone, email, resume, channel, ...safe } = applicant;
  return safe;
}

// ─── API Routes ───

// 로그인
app.post("/api/login", (req, res) => {
  const { id, password } = req.body;
  const db = loadDB();
  const user = db.users.find((u) => u.id === id && u.password === password);
  if (!user) return res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// 지원자 목록 조회
app.get("/api/applicants", (req, res) => {
  const { role, department } = req.query; // role: 인사팀 | 부서담당자, department: 부서명
  const db = loadDB();
  let list = db.applicants;

  if (role === "부서담당자" && department) {
    // 부서담당자: 해당 부서만 + 개인정보 제거
    list = list.filter((a) => a.department === department).map(filterPrivateFields);
  }
  // 인사팀: 전체 데이터 (개인정보 포함)

  res.json(list);
});

// 지원자 상세 조회
app.get("/api/applicants/:id", (req, res) => {
  const { role, department } = req.query;
  const db = loadDB();
  const app = db.applicants.find((a) => a.id === parseInt(req.params.id));
  if (!app) return res.status(404).json({ error: "지원자를 찾을 수 없습니다." });

  if (role === "부서담당자") {
    if (app.department !== department) return res.status(403).json({ error: "접근 권한이 없습니다." });
    return res.json(filterPrivateFields(app));
  }
  res.json(app);
});

// 지원자 등록 (인사팀만)
app.post("/api/applicants", (req, res) => {
  const { role } = req.query;
  if (role !== "인사팀") return res.status(403).json({ error: "인사팀만 등록할 수 있습니다." });

  const db = loadDB();
  const newId = db.applicants.length > 0 ? Math.max(...db.applicants.map((a) => a.id)) + 1 : 1;
  const newApp = {
    id: newId,
    name: req.body.name,
    department: req.body.department,
    position: req.body.position,
    stage: "서류접수",
    channel: req.body.channel || "기타",
    phone: req.body.phone || "",
    email: req.body.email || "",
    appliedAt: new Date().toISOString().split("T")[0],
    score: null,
    comment: "",
    resume: `${req.body.name}_이력서.pdf`,
  };
  db.applicants.push(newApp);
  saveDB(db);
  res.status(201).json(newApp);
});

// 지원자 수정 (단계 변경, 평가 등)
app.put("/api/applicants/:id", (req, res) => {
  const { role, department } = req.query;
  const db = loadDB();
  const idx = db.applicants.findIndex((a) => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "지원자를 찾을 수 없습니다." });

  // 부서담당자: 자기 부서만 + 평가/단계만 수정 가능
  if (role === "부서담당자") {
    if (db.applicants[idx].department !== department) return res.status(403).json({ error: "접근 권한이 없습니다." });
    const { stage, score, comment } = req.body;
    if (stage !== undefined) db.applicants[idx].stage = stage;
    if (score !== undefined) db.applicants[idx].score = score;
    if (comment !== undefined) db.applicants[idx].comment = comment;
  } else {
    // 인사팀: 모든 필드 수정 가능
    Object.assign(db.applicants[idx], req.body);
  }

  saveDB(db);
  res.json(db.applicants[idx]);
});

// 지원자 삭제 (인사팀만 - 개인정보 파기)
app.delete("/api/applicants/:id", (req, res) => {
  const { role } = req.query;
  if (role !== "인사팀") return res.status(403).json({ error: "인사팀만 삭제할 수 있습니다." });

  const db = loadDB();
  const idx = db.applicants.findIndex((a) => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "지원자를 찾을 수 없습니다." });

  db.applicants.splice(idx, 1);
  saveDB(db);
  res.json({ success: true, message: "지원자 정보가 파기되었습니다." });
});

// 채용공고 목록
app.get("/api/postings", (req, res) => {
  const { role, department } = req.query;
  const db = loadDB();
  let list = db.postings;
  if (role === "부서담당자" && department) {
    list = list.filter((p) => p.department === department);
  }
  res.json(list);
});

// 채용공고 수정 (인사팀만)
app.put("/api/postings/:id", (req, res) => {
  const { role } = req.query;
  if (role !== "인사팀") return res.status(403).json({ error: "인사팀만 수정할 수 있습니다." });

  const db = loadDB();
  const idx = db.postings.findIndex((p) => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "공고를 찾을 수 없습니다." });

  Object.assign(db.postings[idx], req.body);
  saveDB(db);
  res.json(db.postings[idx]);
});

// 대시보드 통계
app.get("/api/dashboard", (req, res) => {
  const { role, department } = req.query;
  const db = loadDB();
  let apps = db.applicants;
  let posts = db.postings;

  if (role === "부서담당자" && department) {
    apps = apps.filter((a) => a.department === department);
    posts = posts.filter((p) => p.department === department);
  }

  const stages = ["서류접수", "서류검토", "1차 면접", "2차 면접", "최종합격", "불합격"];
  const stageCounts = {};
  stages.forEach((s) => (stageCounts[s] = apps.filter((a) => a.stage === s).length));

  res.json({
    total: apps.length,
    active: apps.filter((a) => a.stage !== "불합격" && a.stage !== "최종합격").length,
    hired: apps.filter((a) => a.stage === "최종합격").length,
    openPostings: posts.filter((p) => p.status === "모집중").length,
    stageCounts,
    recentApplicants: apps
      .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
      .slice(0, 5)
      .map((a) => (role === "부서담당자" ? filterPrivateFields(a) : a)),
  });
});

// DB 초기화 (개발용)
app.post("/api/reset", (req, res) => {
  saveDB(getInitialData());
  res.json({ success: true, message: "데이터가 초기화되었습니다." });
});

// SPA fallback - 모든 경로에서 index.html 제공
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log("");
  console.log("  ╔══════════════════════════════════════════════╗");
  console.log("  ║                                              ║");
  console.log("  ║   🏢  바른컴퍼니 채용관리시스템 (Barun ATS)  ║");
  console.log("  ║                                              ║");
  console.log(`  ║   🌐  http://localhost:${PORT}                  ║`);
  console.log("  ║                                              ║");
  console.log("  ║   테스트 계정:                               ║");
  console.log("  ║   • 김인사 (admin)    - 인사팀 관리자        ║");
  console.log("  ║   • 박영업 (sales1)   - 영업팀 담당자        ║");
  console.log("  ║   • 이서비스 (cs1)    - CS팀 담당자          ║");
  console.log("  ║   • 최기타 (etc1)     - 기타 부서 담당자     ║");
  console.log("  ║   비밀번호: 1234 (모든 계정 동일)            ║");
  console.log("  ║                                              ║");
  console.log("  ╚══════════════════════════════════════════════╝");
  console.log("");
});
