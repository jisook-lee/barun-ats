const express = require("express");
const path = require("path");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://jisooklee_db_user:DzL0uY3cyav75g7n@cluster0.qbv77xe.mongodb.net/?appName=Cluster0";
const DB_NAME = "barun_ats";
let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log("  ✅ MongoDB Atlas 연결 성공!");
  const userCount = await db.collection("users").countDocuments();
  if (userCount === 0) { console.log("  📦 초기 데이터 입력 중..."); await seedData(); }
}

async function seedData() {
  await db.collection("users").insertMany([
    { uid: "admin", name: "김인사", password: "1234", roleLevel: "최고관리자", department: null },
    { uid: "sales_mgr", name: "박영업", password: "1234", roleLevel: "부서관리자", department: "영업팀" },
    { uid: "cs_mgr", name: "이서비스", password: "1234", roleLevel: "부서관리자", department: "CS팀" },
    { uid: "purchase_mgr", name: "최구매", password: "1234", roleLevel: "부서관리자", department: "구매팀" },
    { uid: "sales1", name: "강영업", password: "1234", roleLevel: "일반사용자", department: "영업팀" },
    { uid: "cs1", name: "윤서비스", password: "1234", roleLevel: "일반사용자", department: "CS팀" },
  ]);
  await db.collection("counters").deleteMany({});
  await db.collection("counters").insertOne({ _id: "applicantId", seq: 9 });
  await db.collection("counters").insertOne({ _id: "postingId", seq: 3 });
  await db.collection("applicants").insertMany([
    { aid: 1, name: "홍길동", department: "영업팀", position: "영업사원", stage: "1차 면접", channel: "잡코리아", phone: "010-1234-5678", email: "hong@email.com", appliedAt: "2026-02-20", score: 4, comment: "커뮤니케이션 능력 우수", files: [] },
    { aid: 2, name: "김철수", department: "영업팀", position: "영업관리", stage: "서류검토", channel: "사람인", phone: "010-2345-6789", email: "kim@email.com", appliedAt: "2026-02-22", score: null, comment: "", files: [] },
    { aid: 3, name: "이영희", department: "CS팀", position: "CS상담원", stage: "서류접수", channel: "알바몬", phone: "010-3456-7890", email: "lee@email.com", appliedAt: "2026-02-24", score: null, comment: "", files: [] },
    { aid: 4, name: "박지민", department: "CS팀", position: "CS팀장", stage: "2차 면접", channel: "원티드", phone: "010-4567-8901", email: "park@email.com", appliedAt: "2026-02-18", score: 5, comment: "리더십 경험 풍부", files: [] },
    { aid: 5, name: "정수연", department: "영업팀", position: "영업사원", stage: "최종합격", channel: "잡코리아", phone: "010-5678-9012", email: "jung@email.com", appliedAt: "2026-02-10", score: 5, comment: "영업 경력 3년", files: [] },
    { aid: 6, name: "강민호", department: "구매팀", position: "구매담당", stage: "서류검토", channel: "사람인", phone: "010-6789-0123", email: "kang@email.com", appliedAt: "2026-02-23", score: null, comment: "", files: [] },
    { aid: 7, name: "윤서현", department: "CS팀", position: "CS상담원", stage: "1차 면접", channel: "잡코리아", phone: "010-7890-1234", email: "yoon@email.com", appliedAt: "2026-02-19", score: 3, comment: "성장 가능성 있음", files: [] },
    { aid: 8, name: "조현우", department: "영업팀", position: "영업관리", stage: "불합격", channel: "원티드", phone: "010-8901-2345", email: "cho@email.com", appliedAt: "2026-02-15", score: 2, comment: "직무 적합성 부족", files: [] },
    { aid: 9, name: "한미영", department: "구매팀", position: "구매관리", stage: "1차 면접", channel: "원티드", phone: "010-9012-3456", email: "han@email.com", appliedAt: "2026-02-21", score: 4, comment: "구매 경력 5년", files: [] },
  ]);
  await db.collection("postings").insertMany([
    { pid: 1, title: "영업팀 신입사원 채용", department: "영업팀", position: "영업사원", status: "모집중", channels: ["잡코리아", "사람인"], startDate: "2026-02-01", endDate: "2026-03-15", headcount: 2 },
    { pid: 2, title: "CS팀 상담원 모집", department: "CS팀", position: "CS상담원", status: "모집중", channels: ["알바몬", "잡코리아"], startDate: "2026-02-10", endDate: "2026-03-10", headcount: 3 },
    { pid: 3, title: "구매팀 담당자 채용", department: "구매팀", position: "구매담당", status: "모집중", channels: ["원티드", "사람인"], startDate: "2026-02-15", endDate: "2026-03-20", headcount: 1 },
  ]);
}

async function getNextId(name) {
  const r = await db.collection("counters").findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { returnDocument: "after", upsert: true });
  return r.seq;
}

// File Upload
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({ destination: (r, f, cb) => cb(null, UPLOAD_DIR), filename: (r, f, cb) => cb(null, Date.now() + "_" + Buffer.from(f.originalname, 'latin1').toString('utf8')) });
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(UPLOAD_DIR));

function isSA(q) { return q.roleLevel === "최고관리자"; }
function canDept(q, d) { return isSA(q) || q.department === d; }
function clean(a) { return { id: a.aid, name: a.name, department: a.department, position: a.position, stage: a.stage, channel: a.channel, phone: a.phone, email: a.email, appliedAt: a.appliedAt, score: a.score, comment: a.comment, files: a.files || [] }; }
function cleanSafe(a) { const c = clean(a); delete c.phone; delete c.email; delete c.channel; delete c.files; return c; }

// Login
app.post("/api/login", async (req, res) => {
  const u = await db.collection("users").findOne({ uid: req.body.id, password: req.body.password });
  if (!u) return res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
  res.json({ success: true, user: { id: u.uid, name: u.name, roleLevel: u.roleLevel, department: u.department } });
});

// Users
app.get("/api/users", async (req, res) => {
  if (!isSA(req.query)) return res.status(403).json({ error: "최고관리자만 접근 가능합니다." });
  const users = await db.collection("users").find().toArray();
  res.json(users.map(u => ({ id: u.uid, name: u.name, roleLevel: u.roleLevel, department: u.department })));
});
app.post("/api/users", async (req, res) => {
  if (!isSA(req.query)) return res.status(403).json({ error: "최고관리자만 생성 가능합니다." });
  const { id, name, password, roleLevel, department } = req.body;
  if (!id || !name || !password) return res.status(400).json({ error: "필수 항목을 입력하세요." });
  if (await db.collection("users").findOne({ uid: id })) return res.status(409).json({ error: "이미 존재하는 아이디입니다." });
  const nu = { uid: id, name, password, roleLevel: roleLevel || "일반사용자", department: roleLevel === "최고관리자" ? null : department };
  await db.collection("users").insertOne(nu);
  res.status(201).json({ id, name, roleLevel: nu.roleLevel, department: nu.department });
});
app.put("/api/users/:uid", async (req, res) => {
  if (!isSA(req.query)) return res.status(403).json({ error: "최고관리자만 수정 가능합니다." });
  const up = {};
  if (req.body.name) up.name = req.body.name;
  if (req.body.password) up.password = req.body.password;
  if (req.body.roleLevel) { up.roleLevel = req.body.roleLevel; if (req.body.roleLevel === "최고관리자") up.department = null; }
  if (req.body.department !== undefined) up.department = req.body.department;
  await db.collection("users").updateOne({ uid: req.params.uid }, { $set: up });
  const u = await db.collection("users").findOne({ uid: req.params.uid });
  res.json({ id: u.uid, name: u.name, roleLevel: u.roleLevel, department: u.department });
});
app.delete("/api/users/:uid", async (req, res) => {
  if (!isSA(req.query)) return res.status(403).json({ error: "최고관리자만 삭제 가능합니다." });
  if (req.params.uid === "admin") return res.status(400).json({ error: "기본 관리자 계정은 삭제 불가." });
  await db.collection("users").deleteOne({ uid: req.params.uid });
  res.json({ success: true });
});

// Applicants
app.get("/api/applicants", async (req, res) => {
  const f = (!isSA(req.query) && req.query.department) ? { department: req.query.department } : {};
  const apps = await db.collection("applicants").find(f).toArray();
  res.json(apps.map(a => isSA(req.query) ? clean(a) : cleanSafe(a)));
});
app.post("/api/applicants", async (req, res) => {
  if (req.query.roleLevel === "일반사용자") return res.status(403).json({ error: "등록 권한 없음." });
  const aid = await getNextId("applicantId");
  const na = { aid, name: req.body.name, department: req.body.department, position: req.body.position, stage: "서류접수", channel: req.body.channel || "기타", phone: req.body.phone || "", email: req.body.email || "", appliedAt: new Date().toISOString().split("T")[0], score: null, comment: "", files: [] };
  await db.collection("applicants").insertOne(na);
  res.status(201).json(clean(na));
});
app.put("/api/applicants/:id", async (req, res) => {
  const a = await db.collection("applicants").findOne({ aid: parseInt(req.params.id) });
  if (!a) return res.status(404).json({ error: "지원자 없음." });
  if (!canDept(req.query, a.department)) return res.status(403).json({ error: "권한 없음." });
  const up = {};
  if (req.query.roleLevel === "일반사용자") {
    if (req.body.score !== undefined) up.score = req.body.score;
    if (req.body.comment !== undefined) up.comment = req.body.comment;
  } else {
    ["stage","score","comment","name","department","position","channel","phone","email"].forEach(k => { if (req.body[k] !== undefined) up[k] = req.body[k]; });
  }
  await db.collection("applicants").updateOne({ aid: parseInt(req.params.id) }, { $set: up });
  const updated = await db.collection("applicants").findOne({ aid: parseInt(req.params.id) });
  res.json(clean(updated));
});
app.delete("/api/applicants/:id", async (req, res) => {
  if (!isSA(req.query)) return res.status(403).json({ error: "최고관리자만 삭제 가능." });
  await db.collection("applicants").deleteOne({ aid: parseInt(req.params.id) });
  res.json({ success: true, message: "지원자 정보 파기 완료." });
});
app.post("/api/applicants/bulk", async (req, res) => {
  if (req.query.roleLevel === "일반사용자") return res.status(403).json({ error: "등록 권한 없음." });
  const { applicants: list } = req.body;
  if (!Array.isArray(list) || !list.length) return res.status(400).json({ error: "데이터 없음." });
  let count = 0;
  for (const ap of list) {
    if (!ap.name) continue;
    const aid = await getNextId("applicantId");
    await db.collection("applicants").insertOne({ aid, name: ap.name, department: ap.department || "기타", position: ap.position || "", stage: "서류접수", channel: ap.channel || "기타", phone: ap.phone || "", email: ap.email || "", appliedAt: ap.appliedAt || new Date().toISOString().split("T")[0], score: null, comment: "", files: [] });
    count++;
  }
  res.status(201).json({ success: true, count });
});
app.post("/api/applicants/bulk-delete", async (req, res) => {
  if (!isSA(req.query)) return res.status(403).json({ error: "최고관리자만 삭제 가능." });
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: "삭제 대상 없음." });
  const r = await db.collection("applicants").deleteMany({ aid: { $in: ids } });
  res.json({ success: true, deleted: r.deletedCount });
});

// Files
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "파일 없음." });
  res.json({ success: true, url: `/uploads/${req.file.filename}`, originalName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'), size: req.file.size });
});
app.get("/api/files/:aid", async (req, res) => {
  const a = await db.collection("applicants").findOne({ aid: parseInt(req.params.aid) });
  if (!a) return res.status(404).json({ error: "지원자 없음." });
  if (!isSA(req.query) && !canDept(req.query, a.department)) return res.status(403).json({ error: "권한 없음." });
  res.json(a.files || []);
});
app.post("/api/files/:aid", async (req, res) => {
  if (req.query.roleLevel === "일반사용자") return res.status(403).json({ error: "권한 없음." });
  const fe = { id: Date.now(), name: req.body.name || "첨부파일", url: req.body.url, type: req.body.type || "file", addedAt: new Date().toISOString().split("T")[0] };
  await db.collection("applicants").updateOne({ aid: parseInt(req.params.aid) }, { $push: { files: fe } });
  res.status(201).json(fe);
});
app.delete("/api/files/:aid/:fid", async (req, res) => {
  if (req.query.roleLevel === "일반사용자") return res.status(403).json({ error: "권한 없음." });
  await db.collection("applicants").updateOne({ aid: parseInt(req.params.aid) }, { $pull: { files: { id: parseInt(req.params.fid) } } });
  res.json({ success: true });
});

// Postings
app.get("/api/postings", async (req, res) => {
  const f = (!isSA(req.query) && req.query.department) ? { department: req.query.department } : {};
  const ps = await db.collection("postings").find(f).toArray();
  res.json(ps.map(p => ({ id: p.pid, title: p.title, department: p.department, position: p.position, status: p.status, channels: p.channels, startDate: p.startDate, endDate: p.endDate, headcount: p.headcount })));
});
app.put("/api/postings/:id", async (req, res) => {
  if (req.query.roleLevel === "일반사용자") return res.status(403).json({ error: "수정 권한 없음." });
  const p = await db.collection("postings").findOne({ pid: parseInt(req.params.id) });
  if (!p) return res.status(404).json({ error: "공고 없음." });
  if (!canDept(req.query, p.department)) return res.status(403).json({ error: "권한 없음." });
  const up = {};
  ["title","department","position","status","channels","startDate","endDate","headcount"].forEach(k => { if (req.body[k] !== undefined) up[k] = req.body[k]; });
  await db.collection("postings").updateOne({ pid: parseInt(req.params.id) }, { $set: up });
  const updated = await db.collection("postings").findOne({ pid: parseInt(req.params.id) });
  res.json({ id: updated.pid, title: updated.title, department: updated.department, position: updated.position, status: updated.status, channels: updated.channels, startDate: updated.startDate, endDate: updated.endDate, headcount: updated.headcount });
});
app.delete("/api/postings/:id", async (req, res) => {
  if (req.query.roleLevel === "일반사용자") return res.status(403).json({ error: "삭제 권한 없음." });
  const p = await db.collection("postings").findOne({ pid: parseInt(req.params.id) });
  if (!p) return res.status(404).json({ error: "공고 없음." });
  if (!isSA(req.query) && p.department !== req.query.department) return res.status(403).json({ error: "권한 없음." });
  await db.collection("postings").deleteOne({ pid: parseInt(req.params.id) });
  res.json({ success: true });
});

// Dashboard
app.get("/api/dashboard", async (req, res) => {
  const f = (!isSA(req.query) && req.query.department) ? { department: req.query.department } : {};
  const apps = await db.collection("applicants").find(f).toArray();
  const posts = await db.collection("postings").find(f).toArray();
  const stages = ["서류접수","서류검토","1차 면접","2차 면접","최종합격","불합격"];
  const sc = {}; stages.forEach(s => sc[s] = apps.filter(a => a.stage === s).length);
  res.json({
    total: apps.length, active: apps.filter(a => !["불합격","최종합격"].includes(a.stage)).length,
    hired: apps.filter(a => a.stage === "최종합격").length, openPostings: posts.filter(p => p.status === "모집중").length,
    stageCounts: sc,
    recentApplicants: apps.sort((a, b) => (b.appliedAt || "").localeCompare(a.appliedAt || "")).slice(0, 5).map(a => isSA(req.query) ? clean(a) : cleanSafe(a)),
  });
});

// Reset
app.post("/api/reset", async (req, res) => {
  await db.collection("users").deleteMany({});
  await db.collection("applicants").deleteMany({});
  await db.collection("postings").deleteMany({});
  await db.collection("counters").deleteMany({});
  await seedData();
  res.json({ success: true, message: "데이터가 초기화되었습니다." });
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("");
    console.log("  ╔══════════════════════════════════════════════════╗");
    console.log("  ║   🏢  바른컴퍼니 채용관리시스템 (Barun ATS)      ║");
    console.log("  ║   💾  MongoDB Atlas 영구 저장 모드               ║");
    console.log(`  ║   🌐  http://localhost:${PORT}                      ║`);
    console.log("  ╚══════════════════════════════════════════════════╝");
    console.log("");
  });
}).catch(err => { console.error("  ❌ MongoDB 연결 실패:", err.message); process.exit(1); });
