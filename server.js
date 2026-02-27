const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── JSON File DB ───
const DB_PATH = path.join(__dirname, "data.json");

function loadDB() {
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    // 마이그레이션: 기존 데이터에 새 필드 추가
    if (data.users && data.users.length > 0 && !data.users[0].roleLevel) {
      data.users = data.users.map(u => ({
        ...u,
        roleLevel: u.role === "인사팀" ? "최고관리자" : "일반사용자",
        department: u.department || (u.role === "인사팀" ? null : u.department),
      }));
      saveDB(data);
    }
    return data;
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
      { id: "admin", name: "김인사", password: "1234", roleLevel: "최고관리자", department: null },
      { id: "sales_mgr", name: "박영업", password: "1234", roleLevel: "부서관리자", department: "영업팀" },
      { id: "cs_mgr", name: "이서비스", password: "1234", roleLevel: "부서관리자", department: "CS팀" },
      { id: "purchase_mgr", name: "최구매", password: "1234", roleLevel: "부서관리자", department: "구매팀" },
      { id: "sales1", name: "강영업", password: "1234", roleLevel: "일반사용자", department: "영업팀" },
      { id: "cs1", name: "윤서비스", password: "1234", roleLevel: "일반사용자", department: "CS팀" },
    ],
    applicants: [
      { id: 1, name: "홍길동", department: "영업팀", position: "영업사원", stage: "1차 면접", channel: "잡코리아", phone: "010-1234-5678", email: "hong@email.com", appliedAt: "2026-02-20", score: 4, comment: "커뮤니케이션 능력 우수", resume: "홍길동_이력서.pdf" },
      { id: 2, name: "김철수", department: "영업팀", position: "영업관리", stage: "서류검토", channel: "사람인", phone: "010-2345-6789", email: "kim@email.com", appliedAt: "2026-02-22", score: null, comment: "", resume: "김철수_이력서.pdf" },
      { id: 3, name: "이영희", department: "CS팀", position: "CS상담원", stage: "서류접수", channel: "알바몬", phone: "010-3456-7890", email: "lee@email.com", appliedAt: "2026-02-24", score: null, comment: "", resume: "이영희_이력서.pdf" },
      { id: 4, name: "박지민", department: "CS팀", position: "CS팀장", stage: "2차 면접", channel: "원티드", phone: "010-4567-8901", email: "park@email.com", appliedAt: "2026-02-18", score: 5, comment: "리더십 경험 풍부, 적극 추천", resume: "박지민_이력서.pdf" },
      { id: 5, name: "정수연", department: "영업팀", position: "영업사원", stage: "최종합격", channel: "잡코리아", phone: "010-5678-9012", email: "jung@email.com", appliedAt: "2026-02-10", score: 5, comment: "영업 경력 3년, 우수 후보", resume: "정수연_이력서.pdf" },
      { id: 6, name: "강민호", department: "구매팀", position: "구매담당", stage: "서류검토", channel: "사람인", phone: "010-6789-0123", email: "kang@email.com", appliedAt: "2026-02-23", score: null, comment: "", resume: "강민호_이력서.pdf" },
      { id: 7, name: "윤서현", department: "CS팀", position: "CS상담원", stage: "1차 면접", channel: "잡코리아", phone: "010-7890-1234", email: "yoon@email.com", appliedAt: "2026-02-19", score: 3, comment: "경력은 부족하나 성장 가능성 있음", resume: "윤서현_이력서.pdf" },
      { id: 8, name: "조현우", department: "영업팀", position: "영업관리", stage: "불합격", channel: "원티드", phone: "010-8901-2345", email: "cho@email.com", appliedAt: "2026-02-15", score: 2, comment: "직무 적합성 부족", resume: "조현우_이력서.pdf" },
      { id: 9, name: "한미영", department: "구매팀", position: "구매관리", stage: "1차 면접", channel: "원티드", phone: "010-9012-3456", email: "han@email.com", appliedAt: "2026-02-21", score: 4, comment: "구매 경력 5년, 우수", resume: "한미영_이력서.pdf" },
    ],
    postings: [
      { id: 1, title: "영업팀 신입사원 채용", department: "영업팀", position: "영업사원", status: "모집중", channels: ["잡코리아", "사람인"], startDate: "2026-02-01", endDate: "2026-03-15", headcount: 2 },
      { id: 2, title: "CS팀 상담원 모집", department: "CS팀", position: "CS상담원", status: "모집중", channels: ["알바몬", "잡코리아"], startDate: "2026-02-10", endDate: "2026-03-10", headcount: 3 },
      { id: 3, title: "구매팀 담당자 채용", department: "구매팀", position: "구매담당", status: "모집중", channels: ["원티드", "사람인"], startDate: "2026-02-15", endDate: "2026-03-20", headcount: 1 },
    ],
  };
}

// ─── 권한 체크 헬퍼 ───
function getRoleInfo(query) {
  return {
    roleLevel: query.roleLevel || "일반사용자",
    department: query.department || null,
  };
}

function isSuperAdmin(query) {
  return query.roleLevel === "최고관리자";
}

function isDeptAdmin(query) {
  return query.roleLevel === "부서관리자";
}

function canAccessDept(query, dept) {
  if (isSuperAdmin(query)) return true;
  return query.department === dept;
}

function filterPrivateFields(applicant) {
  const { phone, email, resume, channel, ...safe } = applicant;
  return safe;
}

// ─── API: 로그인 ───
app.post("/api/login", (req, res) => {
  const { id, password } = req.body;
  const db = loadDB();
  const user = db.users.find((u) => u.id === id && u.password === password);
  if (!user) return res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// ─── API: 계정 관리 (최고관리자 전용) ───
app.get("/api/users", (req, res) => {
  if (!isSuperAdmin(req.query)) return res.status(403).json({ error: "최고관리자만 접근 가능합니다." });
  const db = loadDB();
  res.json(db.users.map(({ password, ...u }) => u));
});

app.post("/api/users", (req, res) => {
  if (!isSuperAdmin(req.query)) return res.status(403).json({ error: "최고관리자만 계정을 생성할 수 있습니다." });
  const db = loadDB();
  const { id, name, password, roleLevel, department } = req.body;
  if (!id || !name || !password) return res.status(400).json({ error: "아이디, 이름, 비밀번호는 필수입니다." });
  if (db.users.find((u) => u.id === id)) return res.status(409).json({ error: "이미 존재하는 아이디입니다." });
  const newUser = { id, name, password, roleLevel: roleLevel || "일반사용자", department: roleLevel === "최고관리자" ? null : (department || null) };
  db.users.push(newUser);
  saveDB(db);
  const { password: _, ...safe } = newUser;
  res.status(201).json(safe);
});

app.put("/api/users/:uid", (req, res) => {
  if (!isSuperAdmin(req.query)) return res.status(403).json({ error: "최고관리자만 수정 가능합니다." });
  const db = loadDB();
  const idx = db.users.findIndex((u) => u.id === req.params.uid);
  if (idx === -1) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  const { name, password, roleLevel, department } = req.body;
  if (name) db.users[idx].name = name;
  if (password) db.users[idx].password = password;
  if (roleLevel) {
    db.users[idx].roleLevel = roleLevel;
    if (roleLevel === "최고관리자") db.users[idx].department = null;
  }
  if (department !== undefined) db.users[idx].department = department;
  saveDB(db);
  const { password: _, ...safe } = db.users[idx];
  res.json(safe);
});

app.delete("/api/users/:uid", (req, res) => {
  if (!isSuperAdmin(req.query)) return res.status(403).json({ error: "최고관리자만 삭제 가능합니다." });
  const db = loadDB();
  if (req.params.uid === "admin") return res.status(400).json({ error: "기본 관리자 계정은 삭제할 수 없습니다." });
  const idx = db.users.findIndex((u) => u.id === req.params.uid);
  if (idx === -1) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  db.users.splice(idx, 1);
  saveDB(db);
  res.json({ success: true });
});

// ─── API: 지원자 ───
app.get("/api/applicants", (req, res) => {
  const db = loadDB();
  let list = db.applicants;
  if (!isSuperAdmin(req.query) && req.query.department) {
    list = list.filter((a) => a.department === req.query.department);
  }
  if (!isSuperAdmin(req.query)) {
    list = list.map(filterPrivateFields);
  }
  res.json(list);
});

app.get("/api/applicants/:id", (req, res) => {
  const db = loadDB();
  const applicant = db.applicants.find((a) => a.id === parseInt(req.params.id));
  if (!applicant) return res.status(404).json({ error: "지원자를 찾을 수 없습니다." });
  if (!isSuperAdmin(req.query) && !canAccessDept(req.query, applicant.department)) {
    return res.status(403).json({ error: "접근 권한이 없습니다." });
  }
  res.json(isSuperAdmin(req.query) ? applicant : filterPrivateFields(applicant));
});

app.post("/api/applicants", (req, res) => {
  const rl = req.query.roleLevel;
  if (rl === "일반사용자") return res.status(403).json({ error: "지원자 등록 권한이 없습니다." });
  const db = loadDB();
  const newId = db.applicants.length > 0 ? Math.max(...db.applicants.map((a) => a.id)) + 1 : 1;
  const newApp = {
    id: newId, name: req.body.name, department: req.body.department, position: req.body.position,
    stage: "서류접수", channel: req.body.channel || "기타", phone: req.body.phone || "",
    email: req.body.email || "", appliedAt: new Date().toISOString().split("T")[0],
    score: null, comment: "", resume: `${req.body.name}_이력서.pdf`,
  };
  db.applicants.push(newApp);
  saveDB(db);
  res.status(201).json(newApp);
});

app.put("/api/applicants/:id", (req, res) => {
  const db = loadDB();
  const idx = db.applicants.findIndex((a) => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "지원자를 찾을 수 없습니다." });
  if (!canAccessDept(req.query, db.applicants[idx].department)) {
    return res.status(403).json({ error: "접근 권한이 없습니다." });
  }
  if (req.query.roleLevel === "일반사용자") {
    const { score, comment } = req.body;
    if (score !== undefined) db.applicants[idx].score = score;
    if (comment !== undefined) db.applicants[idx].comment = comment;
  } else {
    const allowed = ["stage", "score", "comment", "name", "department", "position", "channel", "phone", "email"];
    allowed.forEach(k => { if (req.body[k] !== undefined) db.applicants[idx][k] = req.body[k]; });
  }
  saveDB(db);
  res.json(db.applicants[idx]);
});

app.delete("/api/applicants/:id", (req, res) => {
  if (!isSuperAdmin(req.query)) return res.status(403).json({ error: "최고관리자만 삭제 가능합니다." });
  const db = loadDB();
  const idx = db.applicants.findIndex((a) => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "지원자를 찾을 수 없습니다." });
  db.applicants.splice(idx, 1);
  saveDB(db);
  res.json({ success: true, message: "지원자 정보가 파기되었습니다." });
});

// ─── API: 채용공고 ───
app.get("/api/postings", (req, res) => {
  const db = loadDB();
  let list = db.postings;
  if (!isSuperAdmin(req.query) && req.query.department) {
    list = list.filter((p) => p.department === req.query.department);
  }
  res.json(list);
});

app.put("/api/postings/:id", (req, res) => {
  if (req.query.roleLevel === "일반사용자") return res.status(403).json({ error: "수정 권한이 없습니다." });
  const db = loadDB();
  const idx = db.postings.findIndex((p) => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "공고를 찾을 수 없습니다." });
  if (!canAccessDept(req.query, db.postings[idx].department)) return res.status(403).json({ error: "접근 권한이 없습니다." });
  Object.assign(db.postings[idx], req.body);
  saveDB(db);
  res.json(db.postings[idx]);
});

// ─── API: 대시보드 ───
app.get("/api/dashboard", (req, res) => {
  const db = loadDB();
  let apps = db.applicants;
  let posts = db.postings;
  if (!isSuperAdmin(req.query) && req.query.department) {
    apps = apps.filter((a) => a.department === req.query.department);
    posts = posts.filter((p) => p.department === req.query.department);
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
    recentApplicants: apps.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)).slice(0, 5)
      .map((a) => isSuperAdmin(req.query) ? a : filterPrivateFields(a)),
  });
});

app.post("/api/reset", (req, res) => {
  saveDB(getInitialData());
  res.json({ success: true, message: "데이터가 초기화되었습니다." });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log("");
  console.log("  ╔══════════════════════════════════════════════╗");
  console.log("  ║                                              ║");
  console.log("  ║   🏢  바른컴퍼니 채용관리시스템 (Barun ATS)  ║");
  console.log("  ║                                              ║");
  console.log(`  ║   🌐  http://localhost:${PORT}                  ║`);
  console.log("  ║                                              ║");
  console.log("  ║   권한 등급:                                 ║");
  console.log("  ║   👑 최고관리자 - 전체 접근 + 계정 관리      ║");
  console.log("  ║   🔑 부서관리자 - 해당 부서 + 지원자 등록    ║");
  console.log("  ║   👤 일반사용자 - 해당 부서 열람 + 평가      ║");
  console.log("  ║                                              ║");
  console.log("  ║   테스트 계정:                               ║");
  console.log("  ║   • 김인사 (admin)       - 최고관리자        ║");
  console.log("  ║   • 박영업 (sales_mgr)   - 영업팀 관리자     ║");
  console.log("  ║   • 이서비스 (cs_mgr)    - CS팀 관리자       ║");
  console.log("  ║   • 최구매 (purchase_mgr) - 구매팀 관리자    ║");
  console.log("  ║   비밀번호: 1234 (모든 계정 동일)            ║");
  console.log("  ║                                              ║");
  console.log("  ╚══════════════════════════════════════════════╝");
  console.log("");
});
