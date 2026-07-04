import { useState, useRef, useEffect } from "react";
import { loginOrCreateUser, registerHorse, markHorsesPaid, getMyHorses, getAllHorses, approveHorse, deleteHorse, saveDeadline, getDeadline, clearDeadline } from "./firebase/db";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ADMIN_USER = "admin";
const ADMIN_PASS = "unaadam2026";
const EXPLAINER_CODE = "naadamtailbar2026";

// Sequential number counter — first paid horse gets #1, next #2, etc.
let nextHorseNumber = { value: 1 };
function getNextNumber() { return nextHorseNumber.value++; }


const AGE_GROUPS = [
  { id: 1, name: "Даага" },
  { id: 2, name: "Шүдлэн" },
  { id: 3, name: "Хязаалан" },
  { id: 4, name: "Соёолон" },
  { id: 5, name: "Их нас" },
  { id: 6, name: "Азарга" },
  { id: 7, name: "Сонгомол дээд" },
  { id: 8, name: "Сонгомол дунд" },
  { id: 9, name: "Сонгомол бага" },
];






// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Nunito:wght@400;500;600;700&display=swap');
:root{
  --navy:#0f2170;--navy2:#0d2080;--navy3:#1a2f85;--navy4:#0e2a90;
  --gold:#e8c060;--gold2:#f5d882;--gold3:#b8922a;--gold-bg:rgba(232,192,96,.12);
  --red:#c0392b;--red2:#e74c3c;
  --white:#fff;--white-dim:rgba(255,255,255,.75);--white-faint:rgba(255,255,255,.15);
  --border-gold:rgba(232,192,96,.35);--border-white:rgba(255,255,255,.15);
  --green:rgba(39,174,96,.15);--green-b:rgba(39,174,96,.35);--green-t:#2ecc71;
}
*{box-sizing:border-box;margin:0;padding:0;}
body,#root{font-family:'Nunito',sans-serif;background:var(--navy2);color:var(--white);min-height:100vh;}
.app{min-height:100vh;background:linear-gradient(160deg,var(--navy2) 0%,var(--navy4) 50%,#071660 100%);position:relative;overflow-x:hidden;}
.app::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 50% at 50% -20%,rgba(232,192,96,.08) 0%,transparent 70%);pointer-events:none;}

/* HEADER */
.hdr{background:rgba(10,26,94,.92);border-bottom:1px solid var(--border-gold);padding:0 20px;display:flex;align-items:center;justify-content:space-between;height:60px;position:sticky;top:0;z-index:100;backdrop-filter:blur(12px);}
.logo-text{font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:var(--gold);letter-spacing:2px;}
.logo-sub{font-size:10px;color:var(--white-dim);letter-spacing:1px;margin-top:-2px;}
.nav-tabs{display:flex;gap:4px;}
.ntab{padding:8px 14px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--white-dim);font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px;}
.ntab.active{background:var(--gold-bg);border-color:var(--border-gold);color:var(--gold);}
.ntab:hover:not(.active){background:var(--white-faint);color:var(--white);}
.user-badge{background:var(--gold-bg);border:1px solid var(--border-gold);border-radius:20px;padding:6px 14px;font-size:13px;color:var(--gold2);font-weight:600;cursor:pointer;transition:all .2s;}
.user-badge:hover{background:rgba(232,192,96,.2);}
.role-chip{display:inline-block;border-radius:12px;padding:3px 10px;font-size:11px;font-weight:700;letter-spacing:.5px;margin-left:6px;}
.role-admin{background:rgba(192,57,43,.2);border:1px solid rgba(192,57,43,.4);color:#ff8a80;}
.role-explainer{background:rgba(52,152,219,.2);border:1px solid rgba(52,152,219,.4);color:#7ec8f5;}
.role-user{background:var(--gold-bg);border:1px solid var(--border-gold);color:var(--gold2);}

/* AUTH */
.auth-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;}
.auth-card{background:rgba(15,33,112,.6);border:1px solid var(--border-gold);border-radius:20px;padding:40px 36px;width:100%;max-width:420px;text-align:center;backdrop-filter:blur(20px);}
.auth-emblem{font-size:48px;margin-bottom:8px;}
.auth-title{font-family:'Cinzel',serif;font-size:22px;color:var(--gold);margin-bottom:4px;letter-spacing:2px;}
.auth-subtitle{font-size:13px;color:var(--white-dim);margin-bottom:24px;line-height:1.6;}
.tab-row{display:flex;gap:6px;margin-bottom:20px;}
.tab-btn{flex:1;padding:10px;border-radius:10px;border:1px solid var(--border-white);background:var(--white-faint);color:var(--white-dim);font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;}
.tab-btn.active{background:var(--gold-bg);border-color:var(--border-gold);color:var(--gold);}

label{display:block;text-align:left;font-size:13px;font-weight:600;color:var(--white-dim);margin-bottom:6px;margin-top:14px;}
input[type="text"],input[type="number"],input[type="password"],input[type="number"],select,textarea{width:100%;background:var(--white-faint);border:1px solid var(--border-white);border-radius:10px;padding:12px 14px;color:var(--white);font-family:'Nunito',sans-serif;font-size:15px;transition:all .2s;outline:none;}
input::placeholder{color:rgba(255,255,255,.3);}
input:focus,select:focus,textarea:focus{border-color:var(--gold);background:rgba(232,192,96,.08);}
select option{background:var(--navy);color:var(--white);}
textarea{resize:vertical;min-height:72px;}

/* BUTTONS */
.btn-gold{width:100%;background:linear-gradient(135deg,var(--gold3),var(--gold));border:none;border-radius:10px;padding:14px;color:var(--navy2);font-family:'Nunito',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:18px;letter-spacing:.3px;}
.btn-gold:hover{filter:brightness(1.1);transform:translateY(-1px);}
.btn-gold:disabled{opacity:.45;cursor:not-allowed;transform:none;}
.btn-outline{background:transparent;border:1px solid var(--border-gold);border-radius:10px;padding:11px 20px;color:var(--gold);font-family:'Nunito',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;}
.btn-outline:hover{background:var(--gold-bg);}
.btn-ghost{background:var(--white-faint);border:1px solid var(--border-white);border-radius:10px;padding:10px 16px;color:var(--white-dim);font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.btn-ghost:hover{background:rgba(255,255,255,.2);color:var(--white);}
.btn-red{background:rgba(192,57,43,.2);border:1px solid rgba(192,57,43,.4);border-radius:8px;padding:7px 14px;color:#ff8a80;font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.btn-red:hover{background:rgba(192,57,43,.35);}

/* OTP */

/* PAGE WRAPPER */
.page{padding:24px 20px 48px;max-width:920px;margin:0 auto;}
.page-sm{padding:24px 20px 48px;max-width:640px;margin:0 auto;}

/* BACK */
.back-btn{display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--white-dim);font-family:'Nunito',sans-serif;font-size:14px;cursor:pointer;padding:0;margin-bottom:20px;transition:color .2s;}
.back-btn:hover{color:var(--gold);}

/* SECTION TITLE */
.sec-title{font-family:'Cinzel',serif;font-size:15px;color:var(--gold);margin-bottom:14px;display:flex;align-items:center;gap:10px;}
.sec-title::after{content:'';flex:1;height:1px;background:var(--border-gold);}

/* BANNER */
.banner{background:rgba(15,33,112,.5);border:1px solid var(--border-gold);border-radius:16px;padding:20px 24px;margin-bottom:22px;position:relative;overflow:hidden;}
.banner::after{content:'';position:absolute;right:18px;top:50%;transform:translateY(-50%);font-size:70px;opacity:.1;}
.banner h2{font-family:'Cinzel',serif;font-size:20px;color:var(--gold);margin-bottom:6px;}
.banner p{color:var(--white-dim);font-size:13px;line-height:1.6;max-width:480px;}

/* STATS */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px;}
.stat-card{background:var(--white-faint);border:1px solid var(--border-white);border-radius:12px;padding:14px;text-align:center;}
.stat-val{font-family:'Cinzel',serif;font-size:22px;color:var(--gold);font-weight:700;}
.stat-label{font-size:11px;color:var(--white-dim);margin-top:3px;text-transform:uppercase;letter-spacing:.5px;}

/* AGE GRID */
.age-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}
.age-card{background:rgba(15,33,112,.5);border:1px solid var(--border-white);border-radius:14px;padding:18px 14px;transition:all .25s;text-align:center;}
.age-card.has{border-color:var(--border-gold);}
.age-label{font-family:'Cinzel',serif;font-size:14px;color:var(--white);font-weight:700;margin-bottom:4px;}
.badge{display:inline-block;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;}
.badge-gold{background:var(--gold-bg);border:1px solid var(--border-gold);color:var(--gold2);}
.badge-dim{background:var(--white-faint);border:1px solid var(--border-white);color:var(--white-dim);}
.age-reg-btn{margin-top:10px;width:100%;background:linear-gradient(135deg,var(--gold3),var(--gold));border:none;border-radius:8px;padding:9px 0;color:var(--navy2);font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;}
.age-reg-btn:hover{filter:brightness(1.1);}

/* FORM CARD */
.fcard{background:rgba(15,33,112,.5);border:1px solid var(--border-white);border-radius:16px;padding:22px;margin-bottom:14px;}
.fcard h3{font-family:'Cinzel',serif;font-size:14px;color:var(--gold);margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border-gold);}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.err-msg{color:var(--red2);font-size:12px;margin-top:4px;}

/* UPLOAD */
.upload-zone{border:2px dashed var(--border-gold);border-radius:10px;padding:16px;text-align:center;cursor:pointer;transition:all .2s;margin-top:4px;position:relative;overflow:hidden;}
.upload-zone:hover,.upload-zone.filled{background:var(--gold-bg);}
.upload-zone.filled{border-color:var(--gold);}
.upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;background:none;border:none;}
.upload-preview{width:100%;max-height:200px;object-fit:contain;border-radius:7px;margin-top:6px;background:rgba(0,0,0,0.15);}
.upload-icon{font-size:24px;margin-bottom:4px;}
.upload-lbl{font-size:12px;color:var(--white-dim);font-weight:600;}
.upload-hint{font-size:11px;color:rgba(255,255,255,.35);margin-top:2px;}

/* COUNT GRID */

/* STEP DOTS */

/* NUMBER REVEAL */
.num-circle{width:130px;height:130px;border-radius:50%;background:linear-gradient(135deg,var(--gold3),var(--gold));display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 18px;box-shadow:0 0 40px rgba(232,192,96,.3);}
.num-big{font-family:'Cinzel',serif;font-size:44px;font-weight:700;color:var(--navy2);line-height:1;}
.num-lbl{font-size:11px;color:var(--navy3);font-weight:700;letter-spacing:1px;text-transform:uppercase;}

/* PAYMENT */
.pay-summary{background:rgba(15,33,112,.5);border:1px solid var(--border-gold);border-radius:14px;padding:18px;margin-bottom:18px;}
.pay-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border-white);font-size:14px;}
.pay-row:last-child{border-bottom:none;}
.pay-total{font-size:16px;font-weight:700;color:var(--gold);margin-top:4px;}
.bank-info-box{background:rgba(15,33,112,.7);border:2px solid var(--border-gold);border-radius:14px;padding:22px;margin-bottom:18px;}
.bank-info-title{font-family:'Cinzel',serif;font-size:14px;color:var(--gold2);margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border-gold);display:flex;align-items:center;gap:8px;}
.bank-info-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border-white);}
.bank-info-row:last-child{border-bottom:none;}
.bank-info-label{font-size:12px;color:var(--white-dim);font-weight:600;}
.bank-info-val{font-size:14px;color:var(--white);font-weight:700;font-family:'Cinzel',serif;letter-spacing:.5px;}
.bank-info-val.highlight{color:var(--gold);font-size:18px;letter-spacing:2px;}
.copy-btn{background:var(--gold-bg);border:1px solid var(--border-gold);border-radius:6px;padding:4px 10px;color:var(--gold2);font-size:11px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;transition:all .2s;margin-left:8px;}
.copy-btn:hover{background:rgba(232,192,96,.25);}
.txn-input-box{background:rgba(15,33,112,.5);border:1px solid var(--border-gold);border-radius:14px;padding:20px;margin-bottom:16px;}
.txn-input-box h4{font-family:'Cinzel',serif;font-size:13px;color:var(--gold);margin-bottom:12px;}
.txn-id-display{background:var(--gold-bg);border:1px solid var(--border-gold);border-radius:8px;padding:10px 14px;font-family:'Cinzel',serif;font-size:20px;font-weight:700;color:var(--gold);text-align:center;letter-spacing:3px;margin-bottom:12px;}

/* WARNING */
.warn-box{background:rgba(192,57,43,.12);border:1px solid rgba(192,57,43,.35);border-radius:10px;padding:12px 14px;font-size:13px;color:#ff8a80;line-height:1.5;margin-bottom:14px;display:flex;gap:8px;align-items:flex-start;}

/* HORSE LIST ITEM */
.horse-item{background:rgba(15,33,112,.5);border:1px solid var(--border-white);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;margin-bottom:8px;cursor:pointer;transition:all .2s;}
.horse-item:hover{border-color:var(--border-gold);}
.horse-num{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--gold3),var(--gold));display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:var(--navy2);flex-shrink:0;}
.horse-name{font-weight:700;font-size:14px;}
.horse-meta{font-size:12px;color:var(--white-dim);margin-top:2px;}
.status-paid{margin-left:auto;background:var(--green);border:1px solid var(--green-b);border-radius:20px;padding:3px 10px;font-size:11px;color:var(--green-t);font-weight:700;white-space:nowrap;flex-shrink:0;}
.status-pend{margin-left:auto;background:rgba(192,57,43,.12);border:1px solid rgba(192,57,43,.3);border-radius:20px;padding:3px 10px;font-size:11px;color:var(--red2);font-weight:700;white-space:nowrap;flex-shrink:0;}

/* EXPLAINER */
.live-dot{width:11px;height:11px;border-radius:50%;background:var(--red2);animation:pulse 1.5s infinite;flex-shrink:0;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);}}
.filter-bar{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px;}
.chip{padding:6px 14px;border-radius:20px;border:1px solid var(--border-white);background:var(--white-faint);color:var(--white-dim);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'Nunito',sans-serif;}
.chip.active,.chip:hover{border-color:var(--gold);background:var(--gold-bg);color:var(--gold);}
.horse-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;}
.exp-card{background:rgba(15,33,112,.5);border:1px solid var(--border-white);border-radius:14px;overflow:hidden;cursor:pointer;transition:all .25s;}
.exp-card:hover{border-color:var(--border-gold);transform:translateY(-2px);}
.exp-img{width:100%;height:90px;background:linear-gradient(135deg,var(--navy3),var(--navy4));display:flex;align-items:center;justify-content:center;font-size:36px;position:relative;}
.exp-img img{width:100%;height:100%;object-fit:cover;}
.num-badge{position:absolute;top:7px;left:7px;background:linear-gradient(135deg,var(--gold3),var(--gold));border-radius:7px;padding:2px 9px;font-family:'Cinzel',serif;font-size:13px;font-weight:700;color:var(--navy2);}
.exp-body{padding:12px;}
.exp-name{font-weight:700;font-size:14px;margin-bottom:3px;}
.exp-meta{font-size:12px;color:var(--white-dim);line-height:1.5;}
.tag{display:inline-block;background:var(--gold-bg);border:1px solid var(--border-gold);border-radius:5px;padding:1px 7px;font-size:11px;color:var(--gold2);font-weight:700;}

/* ADMIN */
.admin-tabs{display:flex;gap:6px;margin-bottom:22px;flex-wrap:wrap;}
.adm-tab{padding:9px 18px;border-radius:10px;border:1px solid var(--border-white);background:var(--white-faint);color:var(--white-dim);font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.adm-tab.active{background:rgba(192,57,43,.15);border-color:rgba(192,57,43,.4);color:#ff8a80;}
.adm-tab:hover:not(.active){background:rgba(255,255,255,.1);color:var(--white);}
.adm-card{background:rgba(15,33,112,.5);border:1px solid var(--border-white);border-radius:14px;padding:18px;margin-bottom:10px;}
.adm-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid var(--border-white);font-size:14px;}
.adm-row:last-child{border-bottom:none;}
.adm-label{color:var(--white-dim);font-size:13px;min-width:100px;}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(6,14,58,.85);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;backdrop-filter:blur(8px);}
.modal{background:var(--navy);border:1px solid var(--border-gold);border-radius:18px;padding:26px;width:100%;max-width:500px;max-height:82vh;overflow-y:auto;}
.modal-title{font-family:'Cinzel',serif;font-size:17px;color:var(--gold);margin-bottom:14px;padding-bottom:11px;border-bottom:1px solid var(--border-gold);display:flex;justify-content:space-between;align-items:center;}
.modal-close{background:none;border:none;color:var(--white-dim);font-size:22px;cursor:pointer;line-height:1;padding:0 4px;}
.detail-row{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--border-white);font-size:14px;}
.detail-row:last-child{border-bottom:none;}
.detail-lbl{color:var(--white-dim);min-width:110px;font-weight:600;font-size:13px;flex-shrink:0;}

/* MISC */
.spinner{width:30px;height:30px;border:3px solid var(--border-gold);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 10px;}
@keyframes spin{to{transform:rotate(360deg);}}
.pass-wrap{position:relative;}
.pass-wrap input{padding-right:42px;}
.eye-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,.45);font-size:18px;cursor:pointer;padding:0;line-height:1;transition:color .2s;}
.eye-btn:hover{color:var(--gold);}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--gold3),var(--gold));color:var(--navy2);padding:12px 20px;border-radius:16px;font-weight:700;font-size:14px;z-index:300;box-shadow:0 6px 28px rgba(232,192,96,.4);animation:toastIn .3s ease;white-space:normal;max-width:calc(100vw - 32px);width:max-content;text-align:center;line-height:1.5;word-break:keep-all;}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(16px);}}
@media(max-width:480px){.toast{bottom:16px;font-size:13px;padding:10px 16px;border-radius:12px;}}
.empty-state{text-align:center;padding:56px 20px;color:var(--white-dim);}
.empty-state .big{font-size:44px;margin-bottom:10px;}
.info-row{background:rgba(15,33,112,.4);border:1px solid var(--border-gold);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:10px;margin-bottom:20px;}

@media(max-width:620px){
  .age-grid{grid-template-columns:repeat(3,1fr);}
  .stats-row{grid-template-columns:repeat(2,1fr);}
  .form-row{grid-template-columns:1fr;}
  .bank-grid{grid-template-columns:1fr 1fr;}
  .ntab span{display:none;}
  .hdr{padding:0 12px;}
}
`;

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  // Auth state — persisted to localStorage so refresh doesn't log out
  const [role, setRole] = useState(()=>{
    try { return localStorage.getItem("naadam_role") || null; } catch(e){ return null; }
  });
  const [authTab, setAuthTab] = useState("user"); // user | admin | explainer
  const [user, setUser] = useState(()=>{
    try {
      const saved = localStorage.getItem("naadam_user");
      return saved ? JSON.parse(saved) : null;
    } catch(e){ return null; }
  });

  // Registration deadline — admin sets this, stored in localStorage
  const [regDeadline, setRegDeadline] = useState(()=>{
    const saved = localStorage.getItem("naadam_reg_deadline");
    return saved || "2026-07-12T06:00";
  });
  const isRegClosed = regDeadline && new Date() > new Date(regDeadline);

  // Navigation — also persist screen/role so refresh stays on dashboard, not login
  const [screen, setScreen] = useState(()=>{
    try {
      const savedRole = localStorage.getItem("naadam_role");
      const savedUser = localStorage.getItem("naadam_user");
      if(savedRole && savedUser) return "dashboard";
    } catch(e){}
    return "login";
  });
  const [activeNav, setActiveNav] = useState("dashboard");

  // Persist role/user to localStorage whenever they change
  useEffect(()=>{
    try {
      if(role) localStorage.setItem("naadam_role", role); else localStorage.removeItem("naadam_role");
      if(user) localStorage.setItem("naadam_user", JSON.stringify(user)); else localStorage.removeItem("naadam_user");
    } catch(e){}
  },[role,user]);

  // Horse registration state
  const [selectedAge, setSelectedAge] = useState(null);
  const [horseCount, setHorseCount] = useState(0);
  const [curIdx, setCurIdx] = useState(0);
  const [hForm, setHForm] = useState({});
  const [hFormErr, setHFormErr] = useState({});
  const [pendingHorses, setPendingHorses] = useState([]);

  // Global horse store (simulates DB)
  const [allReg, setAllReg] = useState({}); // { ageGroupId: [horse,...] }

  // On page load/refresh, if a user session was restored, reload their data from Firebase
  useEffect(()=>{
    if(!role || !user) return;
    (async()=>{
      try {
        if(role==="user" && user.phone){
          const horses = await getMyHorses(user.phone);
          const byAge = {};
          horses.forEach(h=>{ if(!byAge[h.ageGroupId]) byAge[h.ageGroupId]=[]; byAge[h.ageGroupId].push(h); });
          setAllReg(byAge);
          const paidHorses = horses.filter(h=>h.paid===true);
          const allApproved = paidHorses.length>0 && paidHorses.every(h=>h.approved===true);
          const hasPending = paidHorses.length>0 && paidHorses.some(h=>h.approved!==true);
          if(allApproved){ setScreen("success"); }
          else if(hasPending){ setWaitingApproval(true); setScreen("waiting"); }
          else { setScreen("dashboard"); setActiveNav("dashboard"); }
        } else if(role==="admin"){
          const allH = await getAllHorses();
          const byAge = {};
          allH.forEach(h=>{ if(!byAge[h.ageGroupId]) byAge[h.ageGroupId]=[]; byAge[h.ageGroupId].push(h); });
          setAllReg(byAge);
          setAdminPendingCount(allH.filter(h=>h.paid===true&&h.approved!==true&&h.approved!==1).length);
          setScreen("admin"); setActiveNav("admin");
          const dl = await getDeadline();
          if(dl){ setRegDeadline(dl); localStorage.setItem("naadam_reg_deadline",dl); }
        } else if(role==="explainer"){
          setScreen("explainer"); setActiveNav("explainer");
        }
      } catch(e){ console.error("Session restore error:", e); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]); // run once on mount only

  // Payment
  const [payLoading, setPayLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [adminPendingCount, setAdminPendingCount] = useState(0);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [approvalPollInterval, setApprovalPollInterval] = useState(null);

  // Poll Firebase every 5 seconds when waiting for admin approval
  useEffect(()=>{
    if(!waitingApproval || !user?.phone) return;
    const interval = setInterval(async()=>{
      try {
        const horses = await getMyHorses(user.phone);
        const paidHorses = horses.filter(h=>h.paid===true);
        if(paidHorses.length>0 && paidHorses.every(h=>h.approved===true)){
          const byAge={};
          horses.forEach(h=>{if(!byAge[h.ageGroupId])byAge[h.ageGroupId]=[];byAge[h.ageGroupId].push(h);});
          setAllReg(byAge);
          setWaitingApproval(false);
          setScreen("success");
          showToast("Бүртгэл баталгаажлаа! 🎉");
          clearInterval(interval);
        }
      } catch(e){ console.error("Polling error:", e); }
    }, 5000);
    return ()=>clearInterval(interval);
  },[waitingApproval, user?.phone]);

  // Explainer / Admin UI
  const [expFilter, setExpFilter] = useState("all");
  const [expSearch, setExpSearch] = useState("");
  const [expHorse, setExpHorse] = useState(null);
  const [adminTab, setAdminTab] = useState("overview");
  const [adminHorse, setAdminHorse] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(null),3000); };

  // Derived
  const flatHorses = Object.values(allReg).flat();

  // Countdown timer display
  const [timeLeft, setTimeLeft] = useState("");
  useState(()=>{
    const tick = () => {
      if (!regDeadline) { setTimeLeft(""); return; }
      const diff = new Date(regDeadline) - new Date();
      if (diff <= 0) { setTimeLeft("Бүртгэл хаагдсан"); return; }
      const d = Math.floor(diff/86400000);
      const h = Math.floor((diff%86400000)/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      setTimeLeft(`${d>0?d+"өдөр ":""}${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return ()=>clearInterval(id);
  });
  const paidHorses = flatHorses.filter(h=>h.paid);
  const pendCount = flatHorses.filter(h=>!h.paid).length;
  const myHorses = flatHorses.filter(h=>h.ownerPhone === user?.phone);
  const lastPending = pendingHorses[pendingHorses.length-1];

  // ── AUTH HANDLERS ────────────────────────────────────────────────────────
  const doRegister = async () => {
    const surname = document.getElementById("rs")?.value?.trim();
    const name = document.getElementById("rn")?.value?.trim();
    const el_rp = document.getElementById("rp"); const phone = (el_rp?.dataset?.val || el_rp?.value || "").trim();
    if(!surname||!name){showToast("Овог нэрээ оруулна уу");return;}
    if(!phone||phone.replace(/\D/g,"").length!==8){showToast("Гар утасны дугаар 8 оронтой байх ёстой");return;}
    try {
      const fbUser = await loginOrCreateUser({surname, givenName:name, phone});
      setUser({...fbUser, givenName:name, surname, phone});
      setRole("user"); setScreen("dashboard"); setActiveNav("dashboard");
      const horses = await getMyHorses(phone);
      const byAge = {};
      horses.forEach(h=>{ if(!byAge[h.ageGroupId]) byAge[h.ageGroupId]=[]; byAge[h.ageGroupId].push(h); });
      setAllReg(byAge);
      showToast("Тавтай морилно уу!");
    } catch(e){ showToast("Алдаа: "+e.message); }
  };
  const doLogin = async () => {
    const el_lp = document.getElementById("lp"); const phone = (el_lp?.dataset?.val || el_lp?.value || "").trim();
    if(!phone||phone.replace(/\D/g,"").length!==8){showToast("Гар утасны дугаар 8 оронтой байх ёстой");return;}
    try {
      // Find existing user by phone
      const fbUser = await loginOrCreateUser({surname:"", givenName:"", phone});
      if(!fbUser.givenName && !fbUser.surname){
        showToast("Ийм утасны дугаартай хэрэглэгч олдсонгүй. Дугаараа зөв бичсэн эсэхээ шалгана уу, эсвэл бүртгүүлнэ үү.");
        return;
      }
      setUser({...fbUser, givenName: fbUser.givenName || phone, phone});
      setRole("user"); setScreen("dashboard"); setActiveNav("dashboard");
      const horses = await getMyHorses(phone);
      const byAge = {};
      horses.forEach(h=>{ if(!byAge[h.ageGroupId]) byAge[h.ageGroupId]=[]; byAge[h.ageGroupId].push(h); });
      setAllReg(byAge);
      showToast("Тавтай морилно уу!");
    } catch(e){
      showToast("Ийм утасны дугаартай хэрэглэгч олдсонгүй. Дугаараа зөв бичсэн эсэхээ шалгана уу, эсвэл бүртгүүлнэ үү.");
    }
  };
  const doAdminLogin = async () => {
    const u = document.getElementById("au")?.value?.trim();
    const p = document.getElementById("ap")?.value?.trim();
    if(u===ADMIN_USER && p===ADMIN_PASS){
      setUser({name:"Админ"}); setRole("admin"); setScreen("admin"); setActiveNav("admin");
      try {
        const allH = await getAllHorses();
        const byAge = {};
        allH.forEach(h=>{ if(!byAge[h.ageGroupId]) byAge[h.ageGroupId]=[]; byAge[h.ageGroupId].push(h); });
        setAllReg(byAge);
        setAdminPendingCount(allH.filter(h=>h.paid===true&&h.approved!==true&&h.approved!==1).length);
        const dl = await getDeadline();
        if(dl){ setRegDeadline(dl); localStorage.setItem("naadam_reg_deadline",dl); }
      } catch(e){ console.error("Admin load:", e); showToast("Алдаа: "+e.message); }
    } else { showToast("Нэвтрэх нэр эсвэл нууц үг буруу байна"); }
  };
  const doExplainerLogin = () => {
    const code = document.getElementById("ec")?.value?.trim();
    if(code===EXPLAINER_CODE){
      setUser({name:"Тайлбарлагч"}); setRole("explainer"); setScreen("explainer"); setActiveNav("explainer");
    } else { showToast("Код буруу байна"); }
  };
  const doOtp = () => {
    if(otp.join("").length<4){showToast("4 оронтой OTP код оруулна уу");return;}
    setScreen("dashboard"); setActiveNav("dashboard"); showToast("Амжилттай нэвтэрлээ!");
  };
  const logout=()=>{
    setRole(null);setUser(null);setScreen("login");setActiveNav("dashboard");
    try { localStorage.removeItem("naadam_role"); localStorage.removeItem("naadam_user"); } catch(e){}
  };

  // ── REGISTRATION FLOW ────────────────────────────────────────────────────
  const openAge=(ag)=>{setSelectedAge(ag);setHorseCount(1);setCurIdx(0);setHForm({});setScreen("horseForm");};

  const setField=(k,v)=>{
    setHForm(f=>({...f,[k]:v}));
    if(hFormErr[k])setHFormErr(e=>{const n={...e};delete n[k];return n;});
  };

  // Allow only Cyrillic letters, spaces, digits, punctuation — block Latin letters
  const cyrilOnly = (v) => {
    if (/[A-Za-z]/.test(v)) showToast("⚠ Та зөвхөн Монголоор бичнэ үү");
    return v.replace(/[A-Za-z]/g, "");
  };
  // For registration number: allow Cyrillic letters + digits only, warn on Latin
  const regOnly = (v) => {
    if (/[A-Za-z]/.test(v)) showToast("⚠ Та зөвхөн Монголоор бичнэ үү");
    return v.replace(/[^А-ЯҮӨЁа-яүөё0-9]/gu, "").toUpperCase();
  };

  // Parse Mongolian national registration number: 2 letters + YYMMDD (6 digits)
  // Returns { valid, dob: Date, age, tooYoung } or { valid: false, reason }
  const parseRegNum = (reg) => {
    if (!reg) return { valid: false, reason: "Регистрийн дугаар оруулна уу" };
    const clean = reg.trim().toUpperCase();
    // Format: 2 Cyrillic letters + YY (birth year) + 6 random digits = 10 chars
    // e.g. АА19123456
    const valid10 = /^[А-ЯҮӨЁ]{2}[0-9]{8}$/u;
    if (!valid10.test(clean)) {
      return { valid: false, reason: "Регистрийн дугаар буруу байна (Жишээ: УШ16080752 — 2 кирилл үсэг + ОН + 6 тоо, нийт 10 тэмдэгт)" };
    }
    // Extract birth year from positions 2-3
    const yy = parseInt(clean.slice(2, 4), 10);
    // Century: 00–26 → 2000s, 27–99 → 1900s
    const birthYear = yy <= 26 ? 2000 + yy : 1900 + yy;
    const today = new Date(2026, 5, 6);
    const currentYear = today.getFullYear();
    // Minimum age: 7 years → born in 2019 or earlier (2026 - 7 = 2019)
    const maxBirthYear = currentYear - 8; // 2018
    if (birthYear > maxBirthYear) {
      return { valid: false, tooYoung: true, birthYear, approxAge: currentYear - birthYear };
    }
    const approxAge = currentYear - birthYear;
    return { valid: true, birthYear, approxAge };
  };

  const validateForm=(f)=>{
    const e={};
    if(!f.horseName)e.horseName="Морины нэр оруулна уу";
    if(!f.ownerName)e.ownerName="Эзний нэр оруулна уу";
    if(!f.uyaachName)e.uyaachName="Уяачийн нэр оруулна уу";
    if(!f.riderName)e.riderName="Уралдаанч хүүхдийн нэр оруулна уу";
    // Validate rider registration number and minimum age
    if(!f.riderReg){
      e.riderReg="Уралдаанч хүүхдийн регистрийн дугаар оруулна уу";
    } else {
      const parsed = parseRegNum(f.riderReg);
      if(!parsed.valid) {
        if(parsed.tooYoung) e.riderReg = "Үндэсний их баяр наадмын үндэсний хурдан морины уралдаанд уралдах морийг 8 ба түүнээс дээш насны хүүхэд унаж уралдана.";
        else e.riderReg = parsed.reason;
      }
    }
    if(!f.riderConsent)e.riderConsent="Зөвшөөрлийн баримт шаардлагатай";
    if(!f.insurance||f.insurance.length!==5)e.insurance="Даатгалын баримтын сүүлийн 5 оронтой дугаар оруулна уу";
    return e;
  };

  const saveHorse=async()=>{
    if(isSaving) return;
    setIsSaving(true);
    const errs=validateForm(hForm);
    if(Object.keys(errs).length){setHFormErr(errs);showToast("Заавал талбаруудыг бөглөнө үү");setIsSaving(false);return;}
    setHFormErr({});
    // Number sharing logic:
    // - User's FIRST horse ever → new number, pay
    // - Different age group, user already has a number → reuse number, FREE
    // - Same age group again (2nd horse in same category) → new number, pay
    const myAllHorses = [
      ...pendingHorses.filter(h=>h.ownerPhone===user?.phone),
      ...Object.values(allReg).flat().filter(h=>h.ownerPhone===user?.phone&&h.paid)
    ];
    // First number this user ever received
    const myFirstNumber = myAllHorses.length > 0 ? myAllHorses[0].number : null;
    // How many horses does user already have in THIS age group?
    const myHorsesInThisAge = myAllHorses.filter(h=>h.ageGroupId===selectedAge.id).length;
    // Reuse number only if: user has a number AND this is first horse in this age group
    const reuseNumber = myFirstNumber && myHorsesInThisAge === 0;
    const needsPayment = false; // Үндэсний наадам - бүгд үнэгүй // free only when reusing number in new age group
    showToast("Дугаар авч байна...");
    // Get the REAL atomic number from Firebase FIRST
    let realNum = reuseNumber ? myFirstNumber : null;
    let fbId = null;
    try {
      const fbHorse = await registerHorse(user?.id, user?.phone, selectedAge.id, selectedAge.name, {...hForm, number:0, needsPayment});
      realNum = fbHorse.number;
      fbId = fbHorse.id;
    } catch(e){
      console.error("Firebase save error:", e);
      showToast("Алдаа: "+(e.message||e.code||"Firebase холбогдсонгүй"));
      setIsSaving(false);
      return;
    }
    if(!realNum){ showToast("Дугаар авахад алдаа гарлаа"); setIsSaving(false); return; }
    const horse={...hForm,number:realNum,needsPayment,ageGroupId:selectedAge.id,ageGroupName:selectedAge.name,
      ownerPhone:user?.phone,paid:false,id:Date.now()+Math.random(),fbId};
    setPendingHorses(p=>[...p,horse]);
    setIsSaving(false);
    setScreen("numReveal");
  };

  const afterReveal=()=>{
    // Go back to dashboard so user can register more horses in other age categories
    setPendingHorses(prev=>[...prev]); // keep accumulated pending horses
    setScreen("dashboard");
    setActiveNav("dashboard");
    showToast("Морь бүртгэгдлээ! Дараагийн морио бүртгэнэ үү эсвэл төлбөр хийнэ үү.");
  };

  // Generate a unique transaction reference ID shown to user
  const doSubmitPayment=async()=>{
    if(payLoading) return;
    setPayLoading(true);
    await new Promise(r=>setTimeout(r,300));
    {
      // Mark as paid (pending admin approval)
      const paid=pendingHorses.map(h=>({...h,paid:true,approved:true}));
      setAllReg(prev=>{
        const n={...prev};
        paid.forEach(h=>{if(!n[h.ageGroupId])n[h.ageGroupId]=[];n[h.ageGroupId]=[...n[h.ageGroupId],h];});
        return n;
      });
      // Mark paid in Firebase
      // Mark paid in Firebase
      try {
        const fbIds = pendingHorses.map(h=>h.fbId).filter(Boolean);
        if(fbIds.length) await markHorsesPaid(fbIds);
      } catch(e){ console.error(e); }
      setPendingHorses([]);
      setPayLoading(false);
      setScreen("success");
      showToast("Бүртгэл баталгаажлаа! 🎉");
      // Email notification to admin with full details
      try {
        const horseDetails = paid.map(h=>
          `Дугаар: ${h.number} | Морь: ${h.horseName} | Ангилал: ${h.ageGroupName} | Зүс: ${h.horseColor||"—"} | Эзэн: ${h.ownerName} (${h.ownerRegion||"—"}) | Уяач: ${h.uyaachName||"—"} (${h.uyaachRegion||"—"}) | Уралдаанч: ${h.riderSurname||""} ${h.riderName}, ${h.riderSchool||"—"}, ${h.riderAge||"—"} нас | Төлбөр: ${h.needsPayment?"30,000₮":"Үнэгүй (ижил дугаар)"}`
        ).join("\\n\\n");
        await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            service_id:"service_pcdqu3d",
            template_id:"template_76xsdxs",
            user_id:"Pn3Q2XWWjTs6OYBrr",
            template_params:{
              owner_name: user?.name,
              phone: user?.phone,
              horse_numbers: paid.map(h=>h.number).join(", "),
              age_groups: paid.map(h=>h.ageGroupName).join(", "),
              amount: paid.filter(h=>h.needsPayment).length * 30000,
              horse_details: horseDetails
            }
          })
        });
      } catch(e){ console.log("Email notification failed:", e); }
    }
  };

  // ── EXPORT CSV ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = [
      "Дугаар","Морины нэр","Зүс","Насны ангилал",
      "Эзний нэр","Эзний цол","Эзний харъяалал",
      "Уяачийн нэр","Уяачийн цол",
      "Уралдаанч овог","Уралдаанч нэр","Уралдаанчийн сургууль","Уралдаанчийн нас","Өмнөх амжилт",
      "Төлбөр","Зөвшөөрөл","Бүртгэсэн огноо"
    ];
    const rows = flatHorses.map(h=>[
      h.number, h.horseName, h.horseColor||"",
      h.ageGroupName,
      h.ownerName, h.ownerTitle||"", h.ownerRegion||"",
      h.uyaachName||"", h.uyaachTitle||"",
      h.riderSurname||"", h.riderName, h.riderSchool||"", h.riderAge||"", (h.history||"").replace(/,/g,"；").replace(/\n/g," "),
      h.paid?"Төлсөн":"Хүлээгдэж буй",
      h.approved?"Зөвшөөрсөн":"Үгүй",
      h.id ? new Date(h.id).toLocaleDateString("mn-MN") : ""
    ].map(v=>
      typeof v==="string" && (v.includes(",") || v.includes('"') || v.includes("\n"))
        ? `"${v.replace(/"/g,'""')}"`
        : v
    ));
    const BOM = "﻿"; // UTF-8 BOM for Excel
    const csv = BOM + [headers, ...rows].map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `нааdam2026_бүртгэл_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${flatHorses.length} бүртгэл экспортлогдлоо ✓`);
  };

  const exportByAge = (ageId) => {
    const horses = ageId === "all" ? flatHorses : flatHorses.filter(h=>h.ageGroupId===ageId);
    const ageName = ageId === "all" ? "бүгд" : AGE_GROUPS.find(a=>a.id===ageId)?.name || ageId;
    const headers = [
      "Дугаар","Морины нэр","Зүс",
      "Эзний нэр","Уяачийн нэр",
      "Уралдаанч овог","Уралдаанч нэр","Уралдаанчийн нас","Төлбөр","Зөвшөөрөл"
    ];
    const rows = horses.map(h=>[
      h.number, h.horseName, h.horseColor||"",
      h.ownerName, h.uyaachName||"",
      h.riderSurname||"", h.riderName, h.riderAge||"",
      h.paid?"Төлсөн":"Хүлээгдэж буй",
      h.approved?"Зөвшөөрсөн":"Үгүй"
    ]);
    const BOM = "﻿";
    const csv = BOM + [headers, ...rows].map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `нааdam2026_${ageName}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${horses.length} морь экспортлогдлоо ✓`);
  };

  // Admin actions
  const adminApprove=async(h)=>{
    try { await approveHorse(h.fbId||h.id); } catch(e){}
    setAllReg(prev=>{
      const n={...prev};
      n[h.ageGroupId]=n[h.ageGroupId].map(x=>x.id===h.id?{...x,approved:true}:x);
      return n;
    });
    if(waitingApproval && h.ownerPhone===user?.phone){
      setWaitingApproval(false);
      setScreen("success");
      showToast("Бүртгэл баталгаажлаа! 🎉");
    } else {
      showToast("Бүртгэл зөвшөөрөгдлөө");
    }
  };
  const adminReject=async(h)=>{
    try { await deleteHorse(h.fbId||h.id); } catch(e){}
    setAllReg(prev=>{
      const n={...prev};
      n[h.ageGroupId]=n[h.ageGroupId].filter(x=>x.id!==h.id);
      return n;
    });
    showToast("Бүртгэл цуцлагдлаа");
  };

  // Nav helper
  const goNav=(tab,sc)=>{setActiveNav(tab);setScreen(sc);};

  // Clipboard copy with textarea fallback for sandboxed environments
  const copyText = (text, label) => {
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); showToast(`${label} хуулагдлаа ✓`); }
      catch { showToast(`${label}: ${text}`); }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(()=>showToast(`${label} хуулагдлаа ✓`)).catch(fallback);
    } else { fallback(); }
  };

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* ── HEADER ── */}
        {role && (
          <header className="hdr">
            <div>
              <div className="logo-text">НААДАМ</div>
                          </div>

            <nav className="nav-tabs">
              {role==="user" && <>
                <button className={`ntab ${activeNav==="dashboard"?"active":""}`} onClick={()=>goNav("dashboard","dashboard")}>🏠 <span>Нүүр</span></button>
                <button className={`ntab ${activeNav==="myhorses"?"active":""}`} onClick={()=>goNav("myhorses","myhorses")}> <span>Морьд</span></button>
              </>}
              {role==="explainer" && (
                <button className={`ntab ${activeNav==="explainer"?"active":""}`} onClick={()=>goNav("explainer","explainer")}>📢 <span>Тайлбарлагч</span></button>
              )}
              {role==="admin" && <>
                <button className={`ntab ${activeNav==="admin"?"active":""}`} onClick={()=>goNav("admin","admin")}>🔐 <span>Удирдлага</span></button>
                <button className={`ntab ${activeNav==="explainer"?"active":""}`} onClick={()=>goNav("explainer","explainer")}>📢 <span>Тайлбарлагч</span></button>
              </>}
            </nav>

            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <div className="user-badge" style={{cursor:"default"}}>
                {role==="admin"&&<span className="role-chip role-admin">Админ</span>}
                {role==="explainer"&&<span className="role-chip role-explainer">Тайлбарлагч</span>}
                {role==="user"&&<span className="role-chip role-user">Хэрэглэгч</span>}
                {" "}{user?.givenName||user?.name?.split(" ")[1]||user?.name}
              </div>
              <button onClick={logout}
                style={{background:"rgba(192,57,43,.15)",border:"1px solid rgba(192,57,43,.4)",borderRadius:"20px",padding:"6px 14px",color:"#ff8a80",fontFamily:"'Nunito',sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer",transition:"all .2s"}}
                onMouseOver={e=>e.target.style.background="rgba(192,57,43,.3)"}
                onMouseOut={e=>e.target.style.background="rgba(192,57,43,.15)"}>
                Гарах
              </button>
            </div>
          </header>
        )}

        <main>

          {/* ══ LOGIN ══ */}
          {screen==="login" && (
            <div className="auth-screen">
              <div className="auth-card">
                
                <img src="data:image/png;base64,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" 
                  style={{width:"220px",maxWidth:"90%",margin:"0 auto 12px",display:"block"}}
                  alt="Үндэсний их баяр наадам"/>
                <div className="auth-title">ҮНДЭСНИЙ ИХ БАЯР НААДАМ</div>
                <div className="auth-subtitle">🇲🇳 Хурдан морины бүртгэл</div>

                <div className="tab-row">
                  <button className={`tab-btn ${authTab==="user"?"active":""}`} onClick={()=>setAuthTab("user")}>👤 Хэрэглэгч</button>
                  <button className={`tab-btn ${authTab==="explainer"?"active":""}`} onClick={()=>setAuthTab("explainer")}>📢 Тайлбарлагч</button>
                  <button className={`tab-btn ${authTab==="admin"?"active":""}`} onClick={()=>setAuthTab("admin")}>🔐 Админ</button>
                </div>

                {/* USER */}
                {authTab==="user" && <UserAuth doRegister={doRegister} doLogin={doLogin}/>}

                {/* EXPLAINER */}
                {authTab==="explainer" && (
                  <>
                    <div className="info-row" style={{marginBottom:"4px"}}>
                      <span style={{fontSize:"20px"}}>📢</span>
                      <div>
                        <div style={{fontWeight:700,fontSize:"14px",color:"var(--gold)"}}>Тайлбарлагчийн нэвтрэх</div>
                        <div style={{fontSize:"12px",color:"var(--white-dim)"}}>Зохион байгуулагчаас олгосон нэвтрэх кодоо оруулна уу</div>
                      </div>
                    </div>
                    <label>Нэвтрэх код</label>
                    <EyeInput id="ec" placeholder="Нэвтрэх код"/>
                    <button className="btn-gold" onClick={doExplainerLogin}>Нэвтрэх →</button>
                  </>
                )}

                {/* ADMIN */}
                {authTab==="admin" && (
                  <>
                    <div className="info-row" style={{marginBottom:"4px"}}>
                      <span style={{fontSize:"20px"}}>🔐</span>
                      <div>
                        <div style={{fontWeight:700,fontSize:"14px",color:"#ff8a80"}}>Админы нэвтрэх</div>
                        <div style={{fontSize:"12px",color:"var(--white-dim)"}}>Зөвхөн зохион байгуулагчдад зориулагдсан</div>
                      </div>
                    </div>
                    <label>Нэвтрэх нэр</label>
                    <input id="au" type="text" placeholder="Нэвтрэх нэр"/>
                    <label>Нууц үг</label>
                    <EyeInput id="ap" placeholder="Нууц үг"/>
                    <button className="btn-gold" onClick={doAdminLogin} style={{background:"linear-gradient(135deg,#7b1010,var(--red2))"}}>Нэвтрэх →</button>
                  </>
                )}
              </div>
            </div>
          )}



          {/* ══ USER DASHBOARD ══ */}
          {screen==="dashboard" && role==="user" && (
            <div className="page">
              <div className="banner">
                <h2>Тавтай морилно уу, {user?.givenName}!</h2>
                <p>Мориныхоо насны ангиллыг сонгоод бүртгэлийг эхлүүлнэ үү. Бүртгэлийн хураамж морь тутамд 30,000₮ байна.</p>
                <div className="stats-row">
                  <div className="stat-card"><div className="stat-val">{myHorses.length}</div><div className="stat-label">Нийт морь</div></div>
                  <div className="stat-card"><div className="stat-val">{myHorses.filter(h=>h.paid).length}</div><div className="stat-label">Төлбөр хийсэн</div></div>
                  <div className="stat-card"><div className="stat-val">{flatHorses.length}</div><div className="stat-label">Нийт бүртгэл</div></div>
                  <div className="stat-card"><div className="stat-val">{AGE_GROUPS.length}</div><div className="stat-label">Насны ангилал</div></div>
                </div>
              </div>

              {/* Registration status banner */}
              {regDeadline && (
                <div style={{
                  background: isRegClosed ? "rgba(192,57,43,.15)" : "rgba(39,174,96,.1)",
                  border: `1px solid ${isRegClosed ? "rgba(192,57,43,.4)" : "rgba(39,174,96,.3)"}`,
                  borderRadius:"12px", padding:"12px 16px", marginBottom:"16px",
                  display:"flex", alignItems:"center", gap:"12px"
                }}>
                  <span style={{fontSize:"20px"}}>{isRegClosed ? "🔒" : "⏰"}</span>
                  <div>
                    <div style={{fontWeight:700, fontSize:"14px", color: isRegClosed ? "#ff8a80" : "#2ecc71"}}>
                      {isRegClosed ? "Бүртгэл хаагдсан" : `Бүртгэл хаагдах хүртэл: ${timeLeft}`}
                    </div>
                    <div style={{fontSize:"12px", color:"var(--white-dim)", marginTop:"2px"}}>
                      {isRegClosed
                        ? "Бүртгэлийн хугацаа дууссан байна"
                        : `Хаагдах огноо: ${new Date(regDeadline).toLocaleString("mn-MN")}`}
                    </div>
                  </div>
                </div>
              )}

              <div className="sec-title">Насны Ангилал — Морь Бүртгэх</div>
              <div className="age-grid">
                {AGE_GROUPS.map(ag=>{
                  const cnt=(allReg[ag.id]||[]).filter(h=>h.ownerPhone===user?.phone).length;
                  return (
                    <div key={ag.id} className={`age-card ${cnt>0?"has":""}`}>
                      <div className="age-label">{ag.name}</div>

                      {cnt>0 && <span className="badge badge-gold" style={{display:"block",marginBottom:"8px"}}>{cnt} морь бүртгэлтэй</span>}
                      {isRegClosed
                      ? <div className="age-reg-btn" style={{background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.4)",cursor:"not-allowed"}}>🔒 Хаагдсан</div>
                      : <button className="age-reg-btn" onClick={()=>openAge(ag)}>{cnt>0?"+ Дахин бүртгэх":"+ Морь бүртгэх"}</button>
                    }
                    </div>
                  );
                })}
              </div>

              {myHorses.length>0 && <>
                <div className="sec-title">Миний Бүртгэлтэй Морьд</div>
                {myHorses.map(h=>(
                  <div key={h.id} className="horse-item">
                    <div className="horse-num">{h.number}</div>
                    <div><div className="horse-name">{h.horseName}</div><div className="horse-meta">{h.ageGroupName} · Уяач: {h.uyaachName||"—"} · Уралдаанч: {h.riderName}</div></div>
                    {h.paid?<span className="status-paid">✓ Төлсөн</span>:<span className="status-pend">⏳ Хүлээгдэж буй</span>}
                  </div>
                ))}
              </>}
            </div>
          )}

          {/* ══ MY HORSES ══ */}
          {screen==="myhorses" && role==="user" && (
            <div className="page-sm">
              <div className="sec-title">Миний Морьд</div>
              {myHorses.length===0
                ? <div className="empty-state"><div className="big">📋</div><div>Одоохондоо бүртгэлтэй морь байхгүй</div></div>
                : myHorses.map(h=>(
                  <div key={h.id} className="horse-item">
                    <div className="horse-num">{h.number}</div>
                    <div>
                      <div className="horse-name">{h.horseName}</div>
                      <div className="horse-meta">{h.ageGroupName} · Уяач: {h.uyaachName||"—"} · Уралдаанч: {h.riderName}</div>
                    </div>
                    {h.paid?<span className="status-paid">✓ Төлсөн</span>:<span className="status-pend">⏳ Хүлээгдэж буй</span>}
                  </div>
                ))
              }
            </div>
          )}

          {/* ══ AGE GROUP ══ */}
          {/* ══ HORSE FORM ══ */}
          {screen==="horseForm" && selectedAge && (
            <div className="page-sm">
              <button className="back-btn" onClick={()=>setScreen("dashboard")}>← Буцах</button>
              <div style={{marginBottom:"14px"}}>
                <div style={{fontFamily:"'Cinzel',serif",color:"var(--gold)",fontSize:"16px",marginBottom:"3px"}}>{selectedAge.name} — {curIdx+1}-р морь</div>
                <div style={{color:"var(--white-dim)",fontSize:"13px"}}>{selectedAge?.name} ангилал — морины мэдээлэл</div>
              </div>
              

              {/* Horse */}
              <div className="fcard">
                <h3>Морины мэдээлэл</h3>
                <label>Морины нэр *</label>
                <input type="text" placeholder="Морины нэр" value={hForm.horseName||""} onChange={e=>setField("horseName",cyrilOnly(e.target.value))}/>
                {hFormErr.horseName&&<p className="err-msg">⚠ {hFormErr.horseName}</p>}
                <div>
                  <label>Морины зүс</label>
                  <input type="text" placeholder="Жишээ: Хүрэн, Шарга, Бор, Хар..." value={hForm.horseColor||""} onChange={e=>setField("horseColor",cyrilOnly(e.target.value))}/>
                </div>
                <label>Морины зураг (9×12) *</label>
                <div className={`upload-zone ${hForm.horseImage?"filled":""}`}>
                  <input type="file" accept="image/*" onChange={e=>{
                    const f=e.target.files[0];
                    if(f){
                      setField("horseImageName",f.name);
                      const reader=new FileReader();
                      reader.onload=ev=>{
                        const img=new Image();
                        img.onload=()=>{
                          const canvas=document.createElement("canvas");
                          const MAX=600;
                          let w=img.width, h=img.height;
                          if(w>h){if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}}
                          else{if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}}
                          canvas.width=w; canvas.height=h;
                          canvas.getContext("2d").drawImage(img,0,0,w,h);
                          let quality=0.5;
                          let result=canvas.toDataURL("image/jpeg",quality);
                          while(result.length>700000 && quality>0.1){
                            quality-=0.1;
                            result=canvas.toDataURL("image/jpeg",quality);
                          }
                          setField("horseImage",result);
                        };
                        img.src=ev.target.result;
                      };
                      reader.readAsDataURL(f);
                    }
                  }}/>
                  {hForm.horseImage
                    ? <><img src={hForm.horseImage} className="upload-preview" style={{objectFit:"contain",background:"rgba(0,0,0,0.2)"}} alt="horse"/><div style={{color:"var(--gold)",fontSize:"12px",marginTop:"6px"}}>✓ {hForm.horseImageName}</div></>
                    : <><div className="upload-icon">📷</div><div className="upload-lbl">Зураг оруулах</div><div className="upload-hint">9×12 см · JPG, PNG</div></>
                  }
                </div>
                <label>Тамга / Тэмдэг</label>
                <input type="text" placeholder="Тамгын дугаар эсвэл тайлбар" value={hForm.horseStamp||""} onChange={e=>setField("horseStamp",cyrilOnly(e.target.value))}/>
                <label>Өмнөх амжилт/ түүх</label>
                <textarea placeholder="Өмнөх амжилт, уралдааны дүн, байр..." value={hForm.history||""} onChange={e=>setField("history",e.target.value)}/>


              </div>

              {/* Owner */}
              <div className="fcard">
                <h3>👤 Эзний мэдээлэл</h3>
                <label>Эзний овог нэр *</label>
                <input type="text" placeholder="Бүтэн нэр" value={hForm.ownerName||""} onChange={e=>setField("ownerName",cyrilOnly(e.target.value))}/>
                {hFormErr.ownerName&&<p className="err-msg">⚠ {hFormErr.ownerName}</p>}
                <div className="form-row">
                  <div>
                    <label>Цол / Зэрэг</label>
                    <input type="text" placeholder="" value={hForm.ownerTitle||""} onChange={e=>setField("ownerTitle",cyrilOnly(e.target.value))}/>
                  </div>
                  <div>
                    <label>Морины эзний харъяалал</label>
                    <input type="text" placeholder="Аймаг, сум" value={hForm.ownerRegion||""} onChange={e=>setField("ownerRegion",cyrilOnly(e.target.value))}/>
                  </div>
                </div>
              </div>

              {/* Rider */}
              <div className="fcard">
                <h3>Уяач болон уралдаанч хүүхдийн мэдээлэл</h3>
                <label>Уяачийн овог нэр *</label>
                <input type="text" placeholder="Бүтэн нэр" value={hForm.uyaachName||""} onChange={e=>setField("uyaachName",cyrilOnly(e.target.value))}/>
                {hFormErr.uyaachName&&<p className="err-msg">⚠ {hFormErr.uyaachName}</p>}
                <label>Цол / Зэрэг</label>
                <input type="text" placeholder="" value={hForm.uyaachTitle||""} onChange={e=>setField("uyaachTitle",cyrilOnly(e.target.value))}/>
                <label>Уяачийн харъяалал</label>
                <input type="text" placeholder="Уяачийн аймаг, сум" value={hForm.uyaachRegion||""} onChange={e=>setField("uyaachRegion",cyrilOnly(e.target.value))}/>
                <label>Уралдаанч хүүхдийн овог *</label>
                <input type="text" placeholder="Овог" value={hForm.riderSurname||""} onChange={e=>setField("riderSurname",cyrilOnly(e.target.value))}/>
                {hFormErr.riderSurname&&<p className="err-msg">⚠ {hFormErr.riderSurname}</p>}
                <label>Уралдаанч хүүхдийн нэр *</label>
                <input type="text" placeholder="Нэр" value={hForm.riderName||""} onChange={e=>setField("riderName",cyrilOnly(e.target.value))}/>
                {hFormErr.riderName&&<p className="err-msg">⚠ {hFormErr.riderName}</p>}
                <label>Уралдаанч хүүхдийн сургууль</label>
                <input type="text" placeholder="Сургуулийн нэр" value={hForm.riderSchool||""} onChange={e=>setField("riderSchool",cyrilOnly(e.target.value))}/>
                <label>Уралдаанч хүүхдийн нас *</label>
                <input type="number" placeholder="Нас" min={1} max={18}
                  value={hForm.riderAge||""}
                  onChange={e=>setField("riderAge",e.target.value)}
                  style={{fontSize:"18px",textAlign:"center"}}
                />
                {hFormErr.riderAge&&<p className="err-msg">⚠ {hFormErr.riderAge}</p>}
              </div>

              <button className="btn-gold" onClick={saveHorse} disabled={isSaving}
                style={{opacity:isSaving?0.7:1,cursor:isSaving?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
                {isSaving ? (
                  <>
                    <span style={{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(10,26,94,.3)",borderTopColor:"#0d2080",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                    Дугаар авч байна...
                  </>
                ) : "Хадгалаад дугаар авах ✓"}
              </button>
            </div>
          )}

          {/* ══ NUMBER REVEAL ══ */}
          {screen==="numReveal" && lastPending && (
            <div className="auth-screen">
              <div className="auth-card" style={{maxWidth:"460px"}}>
                <div style={{fontSize:"34px",marginBottom:"6px"}}>🎉</div>
                <div className="auth-title">Дугаар олгогдлоо!</div>
                {!lastPending.needsPayment && (
                  <div className="auth-subtitle">
                    Өмнө авсан дугаараа хэрэглэнэ — үнэгүй
                  </div>
                )}
                <div className="num-circle"><span className="num-big">{lastPending.number}</span><span className="num-lbl">Дугаар</span></div>

                <div style={{background:"var(--white-faint)",borderRadius:"10px",padding:"12px",marginBottom:"8px",fontSize:"14px"}}>
                  {[
                    ["Морь", lastPending.horseName],
                    ["Ангилал", lastPending.ageGroupName],
                    ["Эзэн", lastPending.ownerName],
                    ["Уяач", lastPending.uyaachName||"—"],
                    ["Уралдаанч хүүхэд", lastPending.riderName],
                    ["Регистр", lastPending.riderReg||"—"],
                  ].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                      <span style={{color:"var(--white-dim)",fontSize:"12px"}}>{l}</span>
                      <span style={{fontWeight:700,fontSize:"13px"}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="warn-box">⚠️ Энэ дугаар төлбөр хийгдсэний дараа баталгаажна. 15 минутын дотор төлбөр хийгдээгүй тохиолдолд дугаар өөр хэрэглэгчид шилжинэ.</div>
                <div style={{background:"rgba(15,33,112,.6)",border:"1px solid var(--border-gold)",borderRadius:"14px",padding:"18px",textAlign:"center"}}>
                  <div style={{fontSize:"15px",fontWeight:700,color:"var(--gold)",marginBottom:"6px"}}>
                    Өөр насны ангилалд морь бүртгүүлэх үү?
                  </div>
                  <div style={{fontSize:"13px",color:"var(--white-dim)",marginBottom:"16px",lineHeight:1.5}}>
                    Тийм бол насны ангилал сонгох хуудас руу буцна.<br/>
                    Үгүй бол одоо төлбөр хийнэ.
                  </div>
                  <div style={{display:"flex",gap:"10px"}}>
                    <button className="btn-gold" style={{marginTop:0,flex:1}} onClick={afterReveal}>
                      ✓ Тийм
                    </button>
                    <button className="btn-outline" style={{flex:1}} onClick={()=>{afterReveal();setTimeout(()=>setScreen("payment"),100);}}>
                      💳 Үгүй, төлбөр хийх
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ PAYMENT ══ */}
          {screen==="payment" && (
            <div className="page-sm">
              <button className="back-btn" onClick={()=>setScreen("dashboard")}>← Буцах (Морь нэмэх)</button>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"20px",color:"var(--gold)",marginBottom:"18px"}}>💳 Нэгдсэн Бүртгэлийн Хураамж</div>

              {/* Summary */}
              <div className="pay-summary">
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"13px",color:"var(--gold2)",marginBottom:"10px"}}>Тооцооны дэлгэрэнгүй</div>
                {pendingHorses.map(h=>(
                  <div key={h.id} className="pay-row">
                    <span>#{h.number} {h.horseName} <span className="tag">{h.ageGroupName}</span></span>
                    {h.needsPayment
                      ? <span style={{color:"var(--gold)"}}>30,000₮</span>
                      : <span style={{color:"#2ecc71",fontSize:"12px"}}>✓ Үнэгүй</span>
                    }
                  </div>
                ))}
                <div className="pay-row pay-total">
                  <span>Нийт дүн</span>
                  <span>{(pendingHorses.filter(h=>h.needsPayment).length*30000).toLocaleString()}₮</span>
                </div>
                {pendingHorses.some(h=>!h.needsPayment) && (
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,.5)",marginTop:"8px",padding:"8px 0",borderTop:"1px solid var(--border-white)",lineHeight:1.6}}>
                    ℹ️ #{pendingHorses.find(h=>!h.needsPayment)?.number} дугаарыг өмнө нь авсан тул нэмэлт төлбөргүй. Ижил дугаартай цамцаа ашиглана уу.
                  </div>
                )}
              </div>

              {/* Bank account info */}
              <div className="sec-title">Дансны мэдээлэл</div>
              <div className="bank-info-box">
                <div className="bank-info-title">🏦Худалдаа Хөгжлийн Банк — Шилжүүлэх данс</div>
                {/* Данс эзэмшигч — no copy button */}
                <div className="bank-info-row">
                  <span className="bank-info-label">Данс эзэмшигч</span>
                  <span className="bank-info-val">Гэндэн оюу ХХК</span>
                </div>
                {/* Дансны дугаар — copy button */}
                <div className="bank-info-row">
                  <span className="bank-info-label">Дансны дугаар</span>
                  <span style={{display:"flex",alignItems:"center"}}>
                    <span className="bank-info-val">860004000447007682</span>
                    <button className="copy-btn" onClick={()=>copyText("860004000447007682","Дансны дугаар")}>Хуулах</button>
                  </span>
                </div>
                {/* Банк — no copy button */}
                <div className="bank-info-row">
                  <span className="bank-info-label">Банк</span>
                  <span className="bank-info-val">Худалдаа Хөгжлийн Банк</span>
                </div>
                <div className="bank-info-row">
                  <span className="bank-info-label">Шилжүүлэх дүн</span>
                  <span className="bank-info-val highlight">{(pendingHorses.filter(h=>h.needsPayment).length*30000).toLocaleString()}₮</span>
                </div>
              </div>

              {/* Horse numbers auto-filled as transaction description */}
              <div className="txn-input-box">
                <h4>📋 Гүйлгээний утга</h4>
                <p style={{fontSize:"13px",color:"var(--white-dim)",marginBottom:"12px",lineHeight:1.6}}>
                  Гүйлгээний утга хэсэгт та авсан дугааруудаа хуулаад бичээрэй.
                </p>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div className="txn-id-display" style={{fontSize:"22px",letterSpacing:"3px",flex:1,margin:0}}>
                    {[...new Set(pendingHorses.filter(h=>h.needsPayment).map(h=>h.number))].join(", ")||pendingHorses[0]?.number}
                  </div>
                  <button
                    onClick={()=>copyText([...new Set(pendingHorses.filter(h=>h.needsPayment).map(h=>h.number))].join(", ")||String(pendingHorses[0]?.number||""),"Дугаарууд")}
                    style={{background:"linear-gradient(135deg,var(--gold3),var(--gold))",border:"none",borderRadius:"10px",
                      padding:"12px 16px",color:"var(--navy2)",fontFamily:"'Nunito',sans-serif",
                      fontWeight:700,fontSize:"13px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                    📋 Хуулах
                  </button>
                </div>
              </div>


              {payLoading ? (
                <div style={{textAlign:"center",padding:"20px"}}><div className="spinner"/><div style={{color:"var(--gold2)",fontSize:"13px"}}>Хүсэлт илгээж байна...</div></div>
              ) : (
                <button className="btn-gold" onClick={doSubmitPayment}>Бүртгэл илгээх ✓</button>
              )}
            </div>
          )}

          {/* ══ SUCCESS ══ */}
          {/* ══ WAITING FOR APPROVAL ══ */}
          {screen==="waiting" && (
            <div className="auth-screen">
              <div className="auth-card" style={{maxWidth:"440px",textAlign:"center"}}>
                <div style={{fontSize:"48px",marginBottom:"12px"}}>⏳</div>
                <div className="auth-title" style={{marginBottom:"8px"}}>Төлбөр хүлээгдэж байна...</div>

                {/* Bank transfer instruction */}
                <div style={{background:"rgba(232,192,96,.1)",border:"1px solid rgba(232,192,96,.3)",borderRadius:"14px",padding:"16px",marginBottom:"16px",textAlign:"left"}}>
                  <div style={{fontSize:"12px",color:"var(--gold)",fontWeight:700,marginBottom:"10px",letterSpacing:"1px"}}>ШИЛЖҮҮЛЭХ МЭДЭЭЛЭЛ</div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.08)",fontSize:"13px"}}>
                    <span style={{color:"var(--white-dim)"}}>Банк</span>
                    <span style={{fontWeight:700}}>Худалдаа Хөгжлийн Банк</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.08)",fontSize:"13px"}}>
                    <span style={{color:"var(--white-dim)"}}>Данс</span>
                    <span style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      <span style={{fontWeight:700,fontFamily:"'Cinzel',serif",letterSpacing:"1px"}}>860004000447007682</span>
                      <button onClick={()=>copyText("860004000447007682","Дансны дугаар")}
                        style={{background:"rgba(232,192,96,.15)",border:"1px solid rgba(232,192,96,.3)",borderRadius:"6px",padding:"3px 10px",color:"var(--gold)",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif",whiteSpace:"nowrap"}}>
                        Хуулах
                      </button>
                    </span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.08)",fontSize:"13px"}}>
                    <span style={{color:"var(--white-dim)"}}>Дүн</span>
                    <span style={{fontWeight:700,color:"var(--gold)",fontSize:"15px"}}>
                      {(flatHorses.filter(h=>h.paid&&h.ownerPhone===user?.phone&&h.needsPayment!==false).length*30000).toLocaleString()}₮
                    </span>
                  </div>
                  <div style={{padding:"8px 0 2px",fontSize:"13px"}}>
                    <div style={{color:"var(--white-dim)",marginBottom:"4px"}}>Гүйлгээний утга</div>
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:"18px",fontWeight:700,color:"var(--gold)",letterSpacing:"3px"}}>
                        {flatHorses.filter(h=>h.paid&&h.ownerPhone===user?.phone).map(h=>h.number).join(", ")}
                      </div>
                      <button onClick={()=>copyText(flatHorses.filter(h=>h.paid&&h.ownerPhone===user?.phone).map(h=>h.number).join(", "),"Дугаарууд")}
                        style={{background:"rgba(232,192,96,.15)",border:"1px solid rgba(232,192,96,.3)",borderRadius:"6px",padding:"3px 10px",color:"var(--gold)",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>
                        Хуулах
                      </button>
                    </div>
                  </div>
                </div>

                {/* Animated dots */}
                <div style={{display:"flex",justifyContent:"center",gap:"8px",marginBottom:"14px"}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:"10px",height:"10px",borderRadius:"50%",background:"var(--gold)",animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
                  ))}
                </div>
                <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4;}40%{transform:scale(1);opacity:1;}}`}</style>

                <div style={{fontSize:"13px",color:"rgba(255,255,255,.5)",lineHeight:1.7,marginBottom:"6px"}}>
                  Та <strong style={{color:"#ff8a80"}}>15 минутын дотор</strong> төлбөрөө шилжүүлээрэй.<br/>
                  Амжилттай шилжүүлсэн тохиолдолд танд <strong style={{color:"var(--gold)"}}>БАТАЛГААЖУУЛАХ ХУУДАС</strong> гарч ирнэ.
                </div>
              </div>
            </div>
          )}

          {screen==="success" && (
            <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0d2080 0%,#071660 60%,#030820 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"20px 16px 40px"}}>

              {/* ── CONFIRMATION CARD ── */}
              <div id="success-card" style={{
                maxWidth:"400px",width:"100%",
                background:"linear-gradient(160deg,#0d2080 0%,#0e2a90 100%)",
                border:"2px solid #e8c060",borderRadius:"24px",
                padding:"0 0 20px",overflow:"hidden",
                fontFamily:"Arial,sans-serif",color:"#fff",
                boxShadow:"0 8px 40px rgba(0,0,0,.5)"
              }}>
                {/* Gold header band */}
                <div style={{background:"linear-gradient(135deg,#b8922a,#e8c060)",padding:"16px 20px",textAlign:"center"}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:"11px",color:"#0d2080",letterSpacing:"2px",marginBottom:"2px",fontWeight:700}}>
                    ҮНДЭСНИЙ ИХ БАЯР НААДАМ 2026
                  </div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:"18px",color:"#0d2080",fontWeight:700}}>
                    БҮРТГЭЛ БАТАЛГААЖЛАА ✓
                  </div>
                </div>

                {/* Owner info */}
                <div style={{padding:"14px 20px 0",textAlign:"center"}}>
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,.5)",marginBottom:"2px"}}>ЭЗЭН</div>
                  <div style={{fontSize:"16px",fontWeight:700,color:"#fff"}}>{user?.name}</div>
                </div>

                {/* Horse cards */}
                <div style={{padding:"12px 16px 0"}}>
                  {flatHorses.filter(h=>h.paid&&h.ownerPhone===user?.phone).map((h,idx)=>(
                    <div key={h.id} style={{
                      background:"rgba(255,255,255,.07)",
                      border:"1px solid rgba(232,192,96,.35)",
                      borderRadius:"16px",padding:"14px 16px",
                      marginBottom:"10px"
                    }}>
                      {/* Big number */}
                      <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
                        <div style={{
                          width:"72px",height:"72px",borderRadius:"50%",flexShrink:0,
                          background:"linear-gradient(135deg,#b8922a,#e8c060)",
                          display:"flex",flexDirection:"column",
                          alignItems:"center",justifyContent:"center",
                          boxShadow:"0 0 20px rgba(232,192,96,.4)"
                        }}>
                          <span style={{fontFamily:"'Cinzel',serif",fontSize:h.number>99?"20px":"26px",fontWeight:700,color:"#0d2080",lineHeight:1}}>{h.number}</span>
                          <span style={{fontSize:"8px",color:"#0d2080",fontWeight:700,letterSpacing:"1px",marginTop:"2px"}}>ДУГААР</span>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:"16px",marginBottom:"4px"}}>{h.horseName}</div>
                          <div style={{display:"inline-block",background:"rgba(232,192,96,.15)",border:"1px solid rgba(232,192,96,.3)",borderRadius:"6px",padding:"2px 8px",fontSize:"11px",color:"#f5d882",marginBottom:"6px"}}>{h.ageGroupName}</div>
                          <div style={{fontSize:"12px",color:"rgba(255,255,255,.6)",lineHeight:1.6}}>
                            Уяач: {h.uyaachName||"—"}<br/>
                            Уралдаанч: {h.riderSurname||""} {h.riderName}{h.riderAge?` · ${h.riderAge} нас`:""}
                          </div>
                        </div>
                      </div>
                      {/* Same number reuse note */}
                      {!h.needsPayment && (
                        <div style={{marginTop:"8px",fontSize:"11px",color:"#2ecc71",padding:"4px 8px",background:"rgba(39,174,96,.1)",borderRadius:"6px",textAlign:"center"}}>
                          ✓ Ижил дугаар — нэмэлт төлбөргүй
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Important instruction */}
                <div style={{margin:"4px 16px 0",background:"rgba(232,192,96,.1)",border:"1px solid rgba(232,192,96,.3)",borderRadius:"12px",padding:"12px 14px",textAlign:"center"}}>
                  <div style={{fontSize:"13px",fontWeight:700,color:"#e8c060",marginBottom:"4px"}}>⚠️ ЧУХАЛ МЭДЭЭЛЭЛ</div>
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,.75)",lineHeight:1.6}}>
                    Энэ баримтыг хадгалж уралдааны өдөр үзүүлнэ үү.<br/>
                    Дугаараа уралдааны өдөр үзүүлнэ үү. Дугаараа <strong style={{color:"#e8c060"}}>дугаараа</strong> заана уу.
                  </div>
                </div>
              </div>

              {/* ── SAVE BUTTON ── */}
              <div style={{maxWidth:"400px",width:"100%",marginTop:"16px",display:"flex",flexDirection:"column",gap:"10px"}}>
                <button style={{
                  width:"100%",background:"linear-gradient(135deg,#b8922a,#e8c060)",
                  border:"none",borderRadius:"14px",padding:"16px",
                  color:"#0d2080",fontFamily:"'Nunito',sans-serif",fontSize:"16px",
                  fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",
                  justifyContent:"center",gap:"10px",boxShadow:"0 4px 20px rgba(232,192,96,.3)"
                }}
                  onClick={async()=>{
                    const el=document.getElementById("success-card");
                    if(!el) return;
                    if(!window.html2canvas){
                      await new Promise((res,rej)=>{
                        const s=document.createElement("script");
                        s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
                        s.onload=res; s.onerror=rej;
                        document.head.appendChild(s);
                      });
                    }
                    try {
                      showToast("Зураг бэлдэж байна...");
                      const canvas = await window.html2canvas(el,{
                        backgroundColor:"#0d2080",scale:3,useCORS:true,logging:false
                      });
                      const nums=flatHorses.filter(h=>h.paid&&h.ownerPhone===user?.phone).map(h=>h.number).join("-");
                      const fileName=`Үндэсний_наадам_${nums}.png`;
                      const dataUrl = canvas.toDataURL("image/png");

                      // Detect platform
                      const ua = navigator.userAgent || "";
                      const isAndroid = /Android/i.test(ua);
                      const isIOS = /iPhone|iPad|iPod/i.test(ua);

                      if (isIOS && navigator.share) {
                        // iOS: Web Share API works reliably and opens "Save Image" sheet
                        canvas.toBlob(async(blob)=>{
                          try {
                            await navigator.share({
                              title:"Үндэсний их баяр наадам 2026",
                              files:[new File([blob],fileName,{type:"image/png"})]
                            });
                            showToast("✓ Хадгалагдлаа!");
                          } catch(e){
                            if(e.name!=="AbortError"){
                              const link=document.createElement("a");
                              link.href=dataUrl; link.download=fileName;
                              document.body.appendChild(link); link.click(); document.body.removeChild(link);
                              showToast("✓ Татаж авлаа!");
                            }
                          }
                        },"image/png");
                      } else {
                        // Android & Desktop: direct download is most reliable.
                        // On Android Chrome this saves straight into the Gallery/Photos via Downloads.
                        const link=document.createElement("a");
                        link.href=dataUrl; link.download=fileName;
                        document.body.appendChild(link); link.click(); document.body.removeChild(link);
                        if (isAndroid) {
                          showToast("✓ Татагдлаа! Зургийн апп → Татсан зургууд");
                        } else {
                          showToast("✓ Татаж авлаа!");
                        }
                      }
                    } catch(e){ console.error(e); window.print(); }
                  }}>
                  📥 Хадгалах
                </button>
                {/* Plain-language help for older/less tech-savvy users */}
                <div style={{fontSize:"12px",color:"rgba(255,255,255,.45)",textAlign:"center",lineHeight:1.6,padding:"0 8px"}}>
                  📱 Зураг "Татсан файлууд" (Downloads) хавтсанд хадгалагдана.<br/>
                  Утасныхаа <strong>Зургийн апп (Gallery/Photos)</strong> нээгээд <strong>"Татсан зургууд"</strong> эсвэл <strong>"Downloads"</strong> цомгийг шалгана уу.
                </div>
                <button style={{
                  width:"100%",background:"transparent",
                  border:"1px solid rgba(255,255,255,.2)",borderRadius:"14px",padding:"13px",
                  color:"rgba(255,255,255,.6)",fontFamily:"'Nunito',sans-serif",
                  fontSize:"14px",fontWeight:600,cursor:"pointer"
                }} onClick={()=>goNav("dashboard","dashboard")}>
                  Нүүр хуудас руу →
                </button>
              </div>
            </div>
          )}

          {/* ══ EXPLAINER ══ */}
          {screen==="explainer" && (
            <div className="page">
              <div style={{background:"rgba(15,33,112,.5)",border:"1px solid var(--border-gold)",borderRadius:"14px",padding:"16px 20px",marginBottom:"18px",display:"flex",alignItems:"center",gap:"12px"}}>
                <div className="live-dot"/>
                <div>
                  <div style={{fontFamily:"'Cinzel',serif",color:"var(--gold)",fontSize:"15px",marginBottom:"2px"}}>🎙 Тайлбарлагчийн Самбар</div>
                  <div style={{fontSize:"12px",color:"var(--white-dim)"}}>Бүртгэлтэй морьдын мэдээлэл · Дугаар · Насны ангилал</div>
                </div>
                <div style={{marginLeft:"auto",fontFamily:"'Cinzel',serif",fontSize:"20px",color:"var(--gold)"}}>{flatHorses.length}</div>
              </div>

              {/* Search box */}
              <div style={{position:"relative",marginBottom:"14px"}}>
                <span style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"16px",pointerEvents:"none"}}>🔍</span>
                <input
                  type="text"
                  placeholder="Дугаар, морины нэр, уяач, уралдаанч хайх..."
                  value={expSearch}
                  onChange={e=>setExpSearch(e.target.value)}
                  style={{paddingLeft:"40px",background:"rgba(15,33,112,.6)",border:"1px solid var(--border-gold)"}}
                />
                {expSearch && (
                  <button onClick={()=>setExpSearch("")}
                    style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--white-dim)",fontSize:"18px",cursor:"pointer",lineHeight:1}}>×</button>
                )}
              </div>

              <div className="filter-bar">
                <button className={`chip ${expFilter==="all"?"active":""}`} onClick={()=>setExpFilter("all")}>Бүгд ({flatHorses.length})</button>
                {AGE_GROUPS.filter(ag=>(allReg[ag.id]||[]).length>0).map(ag=>(
                  <button key={ag.id} className={`chip ${expFilter===ag.id?"active":""}`} onClick={()=>setExpFilter(ag.id)}>
                    {ag.name} ({(allReg[ag.id]||[]).length})
                  </button>
                ))}
              </div>

              {flatHorses.length===0
                ? <div className="empty-state"><div className="big">📋</div><div>Одоохондоо бүртгэлтэй морь байхгүй байна</div></div>
                : <div className="horse-grid">
                    {flatHorses
                      .filter(h=>{
                        const ageOk = expFilter==="all" || h.ageGroupId===expFilter;
                        if (!expSearch.trim()) return ageOk;
                        const q = expSearch.trim().toLowerCase();
                        return ageOk && (
                          String(h.number).includes(q) ||
                          (h.horseName||"").toLowerCase().includes(q) ||
                          (h.uyaachName||"").toLowerCase().includes(q) ||
                          (h.riderName||"").toLowerCase().includes(q) ||
                          (h.ownerName||"").toLowerCase().includes(q) ||
                          (h.ageGroupName||"").toLowerCase().includes(q)
                        );
                      })
                      .sort((a,b)=>a.number-b.number)
                      .map(h=>(
                        <div key={h.id} className="exp-card" onClick={()=>setExpHorse(h)}>
                          <div className="exp-img">
                            {h.horseImage?<img src={h.horseImage} alt={h.horseName} style={{width:"100%",height:"100%",objectFit:"contain",background:"rgba(0,0,0,0.2)"}}/>:<span style={{fontSize:'32px',opacity:.5}}>🐴</span>}
                            <span className="num-badge">{h.number}</span>
                          </div>
                          <div className="exp-body">
                            <div className="exp-name">{h.horseName}</div>
                            <div className="exp-meta">
                              <span className="tag">{h.ageGroupName}</span><br/>
                              Эзэн: {h.ownerName}<br/>
                              Уяач: {h.uyaachName||"—"} · Уралдаанч: {h.riderName}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
              }
              {flatHorses.length>0 && expSearch.trim() && flatHorses.filter(h=>{
                const ageOk=expFilter==="all"||h.ageGroupId===expFilter;
                const q=expSearch.trim().toLowerCase();
                return ageOk&&(String(h.number).includes(q)||(h.horseName||"").toLowerCase().includes(q)||(h.uyaachName||"").toLowerCase().includes(q)||(h.riderName||"").toLowerCase().includes(q)||(h.ownerName||"").toLowerCase().includes(q));
              }).length===0 && (
                <div className="empty-state" style={{padding:"30px"}}>
                  <div style={{fontSize:"32px",marginBottom:"8px"}}>🔍</div>
                  <div>"{expSearch}" хайлтад тохирох морь олдсонгүй</div>
                </div>
              )}
            </div>
          )}

          {/* ══ ADMIN ══ */}
          {screen==="admin" && role==="admin" && (
            <div className="page">
              <div className="banner" style={{marginBottom:"18px"}}>
                <h2>🔐 Админы Самбар</h2>
                <p>Бүх бүртгэл, төлбөр, хэрэглэгчдийн мэдээллийг энд удирдана уу.</p>
                <div className="stats-row">
                  <div className="stat-card"><div className="stat-val">{flatHorses.length}</div><div className="stat-label">Нийт морь</div></div>
                  <div className="stat-card"><div className="stat-val">{paidHorses.filter(h=>h.needsPayment!==false).length}</div><div className="stat-label">Төлбөртэй морь</div></div>
                  <div className="stat-card"><div className="stat-val">{pendCount}</div><div className="stat-label">Хүлээгдэж буй</div></div>
                  <div className="stat-card"><div className="stat-val">{(paidHorses.filter(h=>h.needsPayment!==false).length*30000).toLocaleString()}₮</div><div className="stat-label">Нийт орлого</div></div>
                </div>
              </div>

              {/* Pending notification banner */}
              {adminPendingCount>0 && (
                <div style={{background:"rgba(192,57,43,.15)",border:"1px solid rgba(192,57,43,.4)",borderRadius:"12px",padding:"12px 16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"12px"}}>
                  <span style={{fontSize:"22px"}}>🔔</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:"#ff8a80",fontSize:"14px"}}>{adminPendingCount} бүртгэл баталгаажуулах хүлээгдэж байна!</div>
                    <div style={{fontSize:"12px",color:"rgba(255,255,255,.55)",marginTop:"2px"}}>Банкны апп шалгаад "✓ Зөвшөөрөх" дарна уу</div>
                  </div>
                  <button onClick={()=>setAdminTab("horses")} style={{background:"rgba(192,57,43,.3)",border:"1px solid rgba(192,57,43,.5)",borderRadius:"8px",padding:"7px 14px",color:"#ff8a80",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:"13px",cursor:"pointer",whiteSpace:"nowrap"}}>
                    Харах →
                  </button>
                </div>
              )}

                            {/* Pending notification banner */}
              {adminPendingCount>0 && (
                <div style={{background:"rgba(192,57,43,.15)",border:"1px solid rgba(192,57,43,.4)",borderRadius:"12px",padding:"12px 16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"12px"}}>
                  <span style={{fontSize:"22px"}}>🔔</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:"#ff8a80",fontSize:"14px"}}>{adminPendingCount} бүртгэл баталгаажуулах хүлээгдэж байна!</div>
                    <div style={{fontSize:"12px",color:"rgba(255,255,255,.55)",marginTop:"2px"}}>Банкны апп шалгаад "✓ Зөвшөөрөх" дарна уу</div>
                  </div>
                  <button onClick={()=>setAdminTab("horses")} style={{background:"rgba(192,57,43,.3)",border:"1px solid rgba(192,57,43,.5)",borderRadius:"8px",padding:"7px 14px",color:"#ff8a80",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:"13px",cursor:"pointer",whiteSpace:"nowrap"}}>
                    Харах →
                  </button>
                </div>
              )}
              <div className="admin-tabs">
                {[["overview","📊 Ерөнхий"],["horses"," Бүртгэлүүд"],["byage","📋 Насны ангилал"],["export","📥 Экспорт"],["settings","⚙️ Тохиргоо"]].map(([k,l])=>(
                  <button key={k} className={`adm-tab ${adminTab===k?"active":""}`} onClick={()=>setAdminTab(k)}>{l}</button>
                ))}
              </div>

              {/* Overview */}
              {adminTab==="overview" && (
                <>
                  <div className="sec-title">Насны ангиллаар</div>
                  {AGE_GROUPS.map(ag=>{
                    const cnt=(allReg[ag.id]||[]).length;
                    const paid=(allReg[ag.id]||[]).filter(h=>h.paid).length;
                    return (
                      <div key={ag.id} className="adm-card" style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"8px"}}>
                        <span style={{fontFamily:"'Cinzel',serif",fontSize:"20px",color:"var(--gold)",minWidth:"28px"}}>#{ag.id}</span>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:"14px",color:"var(--gold)"}}>{ag.name}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:"18px",color:"var(--gold)"}}>{cnt}</div>
                          <div style={{fontSize:"11px",color:"var(--white-dim)"}}>{paid} төлсөн</div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* All Horses */}
              {adminTab==="horses" && (
                <>
                  <div className="sec-title">Бүх Бүртгэлүүд ({flatHorses.length})</div>
                  {flatHorses.length===0
                    ? <div className="empty-state"><div className="big">📋</div><div>Бүртгэл байхгүй байна</div></div>
                    : flatHorses.sort((a,b)=>a.number-b.number).map(h=>(
                      <div key={h.id} className="horse-item" onClick={()=>setAdminHorse(h)}>
                        <div className="horse-num">{h.number}</div>
                        <div>
                          <div className="horse-name">{h.horseName} <span className="tag">{h.ageGroupName}</span></div>
                          <div className="horse-meta">Эзэн: {h.ownerName} · Уяач: {h.uyaachName||"—"} · Уралдаанч: {h.riderName}</div>
                        </div>
                        {h.paid?<span className="status-paid">✓ Төлсөн</span>:<span className="status-pend">⏳ Хүлээгдэж буй</span>}
                      </div>
                    ))
                  }
                </>
              )}

              {/* By Age Group */}
              {adminTab==="byage" && (
                <>
                  {AGE_GROUPS.map(ag=>{
                    const horses=allReg[ag.id]||[];
                    if(horses.length===0)return null;
                    return (
                      <div key={ag.id} style={{marginBottom:"20px"}}>
                        <div className="sec-title">{ag.name}</div>
                        {horses.map(h=>(
                          <div key={h.id} className="horse-item" onClick={()=>setAdminHorse(h)}>
                            <div className="horse-num">{h.number}</div>
                            <div><div className="horse-name">{h.horseName}</div><div className="horse-meta">Эзэн: {h.ownerName} · Уяач: {h.uyaachName||"—"} · Уралдаанч: {h.riderName}</div></div>
                            <div style={{display:"flex",flexDirection:"column",gap:"4px",alignItems:"flex-end",marginLeft:"auto"}}>
                              {h.paid?<span className="status-paid">✓ Төлсөн</span>:<span className="status-pend">⏳ Хүлээгдэж буй</span>}
                              {!h.approved&&h.paid&&<button className="btn-gold" style={{padding:"4px 10px",fontSize:"11px",marginTop:"0",width:"auto"}} onClick={e=>{e.stopPropagation();adminApprove(h);}}>Зөвшөөрөх</button>}
                              {h.approved&&<span style={{fontSize:"11px",color:"var(--green-t)"}}>✓ Зөвшөөрсөн</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  {flatHorses.length===0&&<div className="empty-state"><div className="big">📋</div><div>Бүртгэл байхгүй байна</div></div>}
                </>
              )}

              {/* Export */}
              {adminTab==="export" && (
                <div>
                  <div className="sec-title">CSV / Excel экспорт</div>

                  {/* Full export */}
                  <div className="adm-card" style={{marginBottom:"12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:"15px",marginBottom:"4px"}}>📥 Бүх бүртгэл</div>
                        <div style={{fontSize:"13px",color:"var(--white-dim)"}}>Нийт {flatHorses.length} морь · Бүх насны ангилал</div>
                      </div>
                      <button onClick={exportCSV}
                        style={{background:"linear-gradient(135deg,var(--gold3),var(--gold))",border:"none",borderRadius:"10px",padding:"11px 22px",color:"var(--navy2)",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:"14px",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px"}}>
                        📥 CSV татаж авах
                      </button>
                    </div>
                  </div>

                  {/* Export by age group */}
                  <div className="sec-title">Насны ангиллаар тусад нь</div>
                  <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                    {AGE_GROUPS.map(ag=>{
                      const cnt = flatHorses.filter(h=>h.ageGroupId===ag.id).length;
                      return (
                        <div key={ag.id} className="adm-card" style={{padding:"12px 16px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
                            <div>
                              <span style={{fontWeight:700,fontSize:"14px"}}>{ag.name}</span>
                              <span style={{fontSize:"12px",color:"var(--white-dim)",marginLeft:"10px"}}>{cnt} морь</span>
                            </div>
                            {cnt > 0 ? (
                              <button onClick={()=>exportByAge(ag.id)}
                                style={{background:"var(--gold-bg)",border:"1px solid var(--border-gold)",borderRadius:"8px",padding:"7px 16px",color:"var(--gold)",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:"12px",cursor:"pointer"}}>
                                📥 CSV
                              </button>
                            ) : (
                              <span style={{fontSize:"12px",color:"rgba(255,255,255,.3)"}}>Бүртгэл байхгүй</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{marginTop:"16px",padding:"12px 14px",background:"rgba(232,192,96,.06)",border:"1px solid var(--border-gold)",borderRadius:"10px",fontSize:"12px",color:"var(--white-dim)",lineHeight:1.6}}>
                    💡 CSV файлыг Excel-д нээхдээ: Excel → Data → From Text/CSV → UTF-8 encoding сонгоно уу. Эсвэл Google Sheets-д шууд upload хийж болно.
                  </div>
                </div>
              )}

              {/* Settings */}
              {adminTab==="settings" && (
                <div className="adm-card">
                  <h3 style={{fontFamily:"'Cinzel',serif",color:"var(--gold)",marginBottom:"14px",paddingBottom:"10px",borderBottom:"1px solid var(--border-gold)"}}>Системийн тохиргоо</h3>
                  {[
                    ["Тайлбарлагчийн нэвтрэх код","tailbar2026"],
                    ["Төлбөрийн систем","Банкны шилжүүлэг (ХХБ)"],
                    ["Нийт боломжит дугаар","1 – 1,500"],
                    ["Бүртгэлийн хураамж","30,000₮ / морь"],
                    ["Системийн хувилбар","Үндэсний их баяр наадам v1.0"],
                  ].map(([l,v])=>(
                    <div key={l} className="adm-row">
                      <span className="adm-label">{l}</span>
                      <span style={{fontFamily:"'Cinzel',serif",color:"var(--gold)",fontSize:"14px"}}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>

        {/* ── EXPLAINER HORSE MODAL ── */}
        {expHorse && (
          <div className="overlay" onClick={()=>setExpHorse(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-title">
                <span> #{expHorse.number} · {expHorse.horseName}</span>
                <button className="modal-close" onClick={()=>setExpHorse(null)}>×</button>
              </div>
              {expHorse.horseImage&&<img src={expHorse.horseImage} style={{width:"100%",maxHeight:"260px",objectFit:"contain",background:"rgba(0,0,0,0.2)",borderRadius:"9px",marginBottom:"14px"}} alt="horse"/>}
              {[
                ["Дугаар",expHorse.number],
                ["Насны ангилал",expHorse.ageGroupName],
                ["Морины нэр",expHorse.horseName],
                ["Өнгө",expHorse.horseColor||"—"],
                ["Эзний нэр",expHorse.ownerName],
                ["Эзний цол",expHorse.ownerTitle||"—"],
                ["Уяачийн нэр",expHorse.uyaachName||"—"],

                ["Уралдаанч хүүхдийн нэр",expHorse.riderName],
                ["Уралдаанч хүүхдийн нас",expHorse.riderAge||(expHorse.riderReg&&expHorse.riderReg.length===10?`~${2026-parseInt(expHorse.riderReg.slice(2,4)<=26?2000+parseInt(expHorse.riderReg.slice(2,4)):1900+parseInt(expHorse.riderReg.slice(2,4)))} нас`:"—")||"—"],
                ["Өмнөх амжилт/ түүх",expHorse.history||"—"],
              ].map(([l,v])=>(
                <div key={l} className="detail-row"><span className="detail-lbl">{l}</span><span>{v}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* ── ADMIN HORSE MODAL ── */}
        {adminHorse && (
          <div className="overlay" onClick={()=>setAdminHorse(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-title">
                <span> #{adminHorse.number} · {adminHorse.horseName}</span>
                <button className="modal-close" onClick={()=>setAdminHorse(null)}>×</button>
              </div>
              {adminHorse.horseImage&&<img src={adminHorse.horseImage} style={{width:"100%",maxHeight:"260px",objectFit:"contain",background:"rgba(0,0,0,0.2)",borderRadius:"9px",marginBottom:"14px"}} alt="horse"/>}
              {/* Payment verification box */}
              <div style={{
                background: adminHorse.approved
                  ? "rgba(39,174,96,.12)"
                  : adminHorse.paid
                    ? "rgba(232,192,96,.1)"
                    : "rgba(192,57,43,.1)",
                border: `1px solid ${adminHorse.approved ? "rgba(39,174,96,.4)" : adminHorse.paid ? "var(--border-gold)" : "rgba(192,57,43,.35)"}`,
                borderRadius:"12px", padding:"14px 16px", marginBottom:"16px"
              }}>
                <div style={{fontSize:"12px",color:"var(--white-dim)",marginBottom:"8px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px"}}>
                  {adminHorse.approved ? "✅ Баталгаажсан" : adminHorse.paid ? "⏳ Баталгаажуулах хүлээгдэж байна" : "❌ Төлбөр хийгдээгүй"}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                  <div>
                    <div style={{fontSize:"11px",color:"var(--white-dim)"}}>Бүртгэлийн дугаар</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:"24px",color:"var(--gold)",fontWeight:700}}>{adminHorse.number}</div>
                  </div>
                  <div>
                    <div style={{fontSize:"11px",color:"var(--white-dim)"}}>Төлбөрийн дүн</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:"18px",color:adminHorse.needsPayment===false?"#2ecc71":"var(--gold)",fontWeight:700}}>
                      {adminHorse.needsPayment===false ? "Үнэгүй" : "30,000₮"}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:"11px",color:"var(--white-dim)"}}>Эзний утас</div>
                    <div style={{fontSize:"14px",fontWeight:700}}>{adminHorse.ownerPhone||"—"}</div>
                  </div>
                  <div>
                    <div style={{fontSize:"11px",color:"var(--white-dim)"}}>Даатгалын дугаар</div>
                    <div style={{fontSize:"14px",fontWeight:700}}>***{adminHorse.insurance||"—"}</div>
                  </div>
                </div>
                {!adminHorse.approved && adminHorse.paid && (
                  <div style={{marginTop:"10px",fontSize:"12px",color:"#f5d882",lineHeight:1.6,padding:"8px 10px",background:"rgba(232,192,96,.08)",borderRadius:"8px"}}>
                    💡 Банкны апп дээр гүйлгээний утгад <strong>{adminHorse.number}</strong> гэж байвал зөвшөөрнө үү.
                  </div>
                )}
              </div>

              {[
                ["Морины нэр",adminHorse.horseName],
                ["Насны ангилал",adminHorse.ageGroupName],
                ["Өнгө",adminHorse.horseColor||"—"],
                ["Эзний нэр",adminHorse.ownerName],
                ["Эзний цол",adminHorse.ownerTitle||"—"],
                ["Уяачийн нэр",adminHorse.uyaachName||"—"],
                ["Уралдаанч хүүхдийн овог",adminHorse.riderSurname||"—"],["Уралдаанч хүүхдийн нэр",adminHorse.riderName],["Уралдаанчийн сургууль",adminHorse.riderSchool||"—"],
                ["Уралдаанчийн нас",adminHorse.riderAge||"—"],
                ["Өмнөх амжилт/ түүх",adminHorse.history||"—"],
              ].map(([l,v])=>(
                <div key={l} className="detail-row"><span className="detail-lbl">{l}</span><span>{v}</span></div>
              ))}

              <div style={{display:"flex",gap:"8px",marginTop:"16px"}}>
                {!adminHorse.approved&&adminHorse.paid&&(
                  <button className="btn-gold" style={{flex:1,marginTop:0}} onClick={()=>{adminApprove(adminHorse);setAdminHorse(h=>({...h,approved:true}));}}>
                    ✓ Зөвшөөрөх
                  </button>
                )}
                {adminHorse.approved&&(
                  <div style={{flex:1,textAlign:"center",padding:"12px",background:"rgba(39,174,96,.12)",border:"1px solid rgba(39,174,96,.3)",borderRadius:"10px",color:"#2ecc71",fontWeight:700,fontSize:"14px"}}>
                    ✅ Баталгаажсан
                  </div>
                )}
                <button style={{flex:1,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:"10px",padding:"12px",color:"rgba(255,255,255,.4)",fontFamily:"'Nunito',sans-serif",fontSize:"13px",cursor:"pointer"}} onClick={()=>setAdminHorse(null)}>Хаах</button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

// ── EYE TOGGLE PASSWORD INPUT ───────────────────────────────────────────────
function EyeInput({id, placeholder, style={}}) {
  const [show, setShow] = useState(false);
  return (
    <div className="pass-wrap">
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        style={{letterSpacing: show ? "normal" : "4px", ...style}}
      />
      <button
        type="button"
        className="eye-btn"
        onClick={()=>setShow(s=>!s)}
        tabIndex={-1}
      >
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}

// ── PHONE INPUT GRID COMPONENT ──────────────────────────────────────────────
function PhoneGrid({id}){
  const [digits, setDigits] = useState(["","","","","","","",""]);
  const refs = Array.from({length:8},()=>useRef());

  const handleChange=(i,v)=>{
    const d=v.replace(/\D/g,"").slice(0,1);
    const next=[...digits]; next[i]=d; setDigits(next);
    // Write combined value to hidden input
    const combined=next.join("");
    const hidden=document.getElementById(id);
    if(hidden) hidden.value=combined;
    if(d && i<7) refs[i+1].current?.focus();
  };

  const handleKey=(i,e)=>{
    if(e.key==="Backspace"&&!digits[i]&&i>0){
      const next=[...digits]; next[i-1]=""; setDigits(next);
      const combined=next.join("");
      const hidden=document.getElementById(id);
      if(hidden) hidden.value=combined;
      refs[i-1].current?.focus();
    }
    if(e.key==="Enter"){
      // trigger the nearest button
      const btn=e.target.closest("form,div")?.querySelector(".btn-gold");
      btn?.click();
    }
  };

  const handlePaste=(e)=>{
    e.preventDefault();
    const pasted=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,8);
    const next=Array.from({length:8},(_,i)=>pasted[i]||"");
    setDigits(next);
    const hidden=document.getElementById(id);
    if(hidden) hidden.value=next.join("");
    const lastFilled=Math.min(pasted.length,7);
    refs[lastFilled].current?.focus();
  };

  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:"6px",margin:"4px 0 2px"}}>
      {digits.map((d,i)=>(
        <input key={i} ref={refs[i]}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e=>handleChange(i,e.target.value)}
          onKeyDown={e=>handleKey(i,e)}
          onPaste={handlePaste}
          style={{
            height:"48px",textAlign:"center",fontSize:"20px",fontWeight:700,
            background:d?"rgba(232,192,96,.15)":"var(--white-faint)",
            border:`2px solid ${d?"var(--gold)":"var(--border-white)"}`,
            borderRadius:"10px",color:"var(--white)",outline:"none",
            fontFamily:"'Cinzel',serif",transition:"all .2s",padding:0,width:"100%"
          }}
        />
      ))}
    </div>
  );
}

// ── PHONE INPUT GRID COMPONENT ──────────────────────────────────────────────

// ── USER AUTH SUB-COMPONENT ─────────────────────────────────────────────────
function UserAuth({doRegister,doLogin}){
  const [mode,setMode]=useState("register");
  const [rs,setRs]=useState(""); const [rn,setRn]=useState("");
  const [ls,setLs]=useState(""); const [ln,setLn]=useState("");
  const [latinWarn,setLatinWarn]=useState(false);
  const warnTimer=useState(null);

  const filterCyril=(v,setter)=>{
    if(/[A-Za-zÀ-ɏ]/.test(v)){
      setLatinWarn(true);
      clearTimeout(warnTimer[0]);
      warnTimer[0]=setTimeout(()=>setLatinWarn(false),3000);
    }
    return v.replace(/[^\u0400-\u04FF\s]/gu,"");
  };

  return (
    <>
      <div style={{display:"flex",gap:"6px",marginBottom:"16px"}}>
        <button className={`tab-btn ${mode==="register"?"active":""}`} style={{fontSize:"12px"}} onClick={()=>setMode("register")}>Бүртгүүлэх</button>
        <button className={`tab-btn ${mode==="login"?"active":""}`} style={{fontSize:"12px"}} onClick={()=>setMode("login")}>Нэвтрэх</button>
      </div>

      {latinWarn && (
        <div style={{background:"rgba(192,57,43,.15)",border:"1px solid rgba(192,57,43,.4)",
          borderRadius:"10px",padding:"10px 14px",marginBottom:"10px",
          fontSize:"13px",color:"#ff8a80",display:"flex",gap:"8px",alignItems:"center"}}>
          <span>⚠️</span> Та зөвхөн Монгол кирилл үсгээр бичнэ үү
        </div>
      )}

      {mode==="register" ? <>
        <label>Овог:</label>
        <input type="text" placeholder="Овог" maxLength={40} value={rs}
          onChange={e=>{const v=filterCyril(e.target.value,setRs);setRs(v);}}/>
        <input id="rs" type="hidden" value={rs} readOnly/>
        <label>Нэр:</label>
        <input type="text" placeholder="Нэр" maxLength={40} value={rn}
          onChange={e=>{const v=filterCyril(e.target.value,setRn);setRn(v);}}/>
        <input id="rn" type="hidden" value={rn} readOnly/>
        <label>Гар утасны дугаар:</label>
        <PhoneGrid id="rp"/>
        <input id="rp" type="hidden"/>
        <button className="btn-gold" onClick={doRegister}>Нэвтрэх →</button>
      </> : <>
        <div style={{background:"rgba(232,192,96,.08)",border:"1px solid var(--border-gold)",borderRadius:"10px",padding:"12px 14px",marginBottom:"4px",fontSize:"13px",color:"rgba(255,255,255,.7)",lineHeight:1.6}}>
          📱 Бүртгүүлэхдээ ашигласан <strong style={{color:"var(--gold)"}}>утасны дугаараа</strong> оруулна уу
        </div>
        <label>Гар утасны дугаар:</label>
        <PhoneGrid id="lp"/>
        <input id="lp" type="hidden"/>
        <button className="btn-gold" onClick={doLogin}>Нэвтрэх →</button>
      </>}
    </>
  );
}
