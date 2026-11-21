let currentUser = null;
let currentStudentId = "guest";
let authMode = "login";
let captchaToken = "";
let appState = null;
let diagnosticQuestions = [];
let currentQuestion = null;
let selectedOption = null;
let chatTTSEnabled = true;

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function init() {
  await checkSavedSession();
  await refreshState();
  initLectureStudio();
  renderAllVisualizers(Boolean(currentUser));

  if (!appState.student.diagnostic_completed) {
    await loadDiagnostic();
  } else {
    document.getElementById("diagnostic-panel").classList.add("hidden");
    await loadNextQuestion();
  }
}

// ============================================================================
// AUTHENTICATION & CAPTCHA VERIFICATION
// ============================================================================
async function checkSavedSession() {
  const token = localStorage.getItem("pm_token");
  if (!token) {
    updateAuthUI(null);
    return;
  }
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.authenticated && data.user) {
      updateAuthUI(data.user);
    } else {
      localStorage.removeItem("pm_token");
      updateAuthUI(null);
    }
  } catch (_) {
    updateAuthUI(null);
  }
}

function updateAuthUI(user) {
  currentUser = user;
  currentStudentId = user && user.role === "student" ? user.id : user ? "student_1" : "guest";

  const guestBar = document.getElementById("auth-header-guest");
  const userBar = document.getElementById("auth-header-user");
  const badge = document.getElementById("header-user-badge");
  const vizBadge = document.getElementById("viz-tier-badge");
  const zoomName = document.getElementById("zoom-student-name");

  if (user) {
    guestBar.classList.add("hidden");
    userBar.classList.remove("hidden");
    badge.textContent = `✓ ${user.name} (${user.role.toUpperCase()})`;
    if (vizBadge) {
      vizBadge.textContent = "Member Tier (8/8 Labs Unlocked)";
      vizBadge.className = "text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-medium";
    }
    if (zoomName) zoomName.textContent = user.name;
  } else {
    guestBar.classList.remove("hidden");
    userBar.classList.add("hidden");
    if (vizBadge) {
      vizBadge.textContent = "Free Guest Tier (4/8 Labs Unlocked)";
      vizBadge.className = "text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-medium";
    }
    if (zoomName) zoomName.textContent = "Guest Learner";
  }

  renderAllVisualizers(Boolean(user));
}

async function openAuthModal(mode = "login") {
  setAuthMode(mode);
  document.getElementById("auth-error-box").classList.add("hidden");
  document.getElementById("auth-modal").classList.remove("hidden");
  await refreshCaptcha();
}

function closeAuthModal() {
  document.getElementById("auth-modal").classList.add("hidden");
}

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === "signup";
  document.getElementById("auth-name-group").classList.toggle("hidden", !isSignup);
  document.getElementById("auth-role-group").classList.toggle("hidden", !isSignup);
  document.getElementById("auth-submit-btn").textContent = isSignup
    ? "Verify CAPTCHA & Create Account"
    : "Verify CAPTCHA & Login";

  document.getElementById("auth-mode-login").className = isSignup
    ? "py-2 rounded-lg text-slate-400"
    : "py-2 rounded-lg bg-indigo-600 text-white";
  document.getElementById("auth-mode-signup").className = isSignup
    ? "py-2 rounded-lg bg-indigo-600 text-white"
    : "py-2 rounded-lg text-slate-400";
}

async function refreshCaptcha() {
  const res = await fetch("/api/auth/captcha");
  const data = await res.json();
  captchaToken = data.captcha_token;
  document.getElementById("captcha-img").src = data.captcha_image;
  document.getElementById("captcha-answer").value = "";
}

async function submitAuthForm(e) {
  e.preventDefault();
  const errBox = document.getElementById("auth-error-box");
  errBox.classList.add("hidden");

  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const captchaAnswer = document.getElementById("captcha-answer").value.trim();

  const endpoint = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
  const body =
    authMode === "signup"
      ? {
          name: document.getElementById("auth-name").value.trim(),
          email,
          password,
          role: document.getElementById("auth-role").value,
          captcha_token: captchaToken,
          captcha_answer: captchaAnswer,
        }
      : {
          email,
          password,
          captcha_token: captchaToken,
          captcha_answer: captchaAnswer,
        };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok) {
    errBox.textContent = data.detail || "Authentication failed.";
    errBox.classList.remove("hidden");
    await refreshCaptcha();
    return;
  }

  localStorage.setItem("pm_token", data.token);
  updateAuthUI(data.user);
  closeAuthModal();
  await refreshState();
  if (data.user.role === "teacher") {
    switchTab("teacher");
  }
}

async function loginDemo(role) {
  const res = await fetch("/api/auth/demo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  localStorage.setItem("pm_token", data.token);
  updateAuthUI(data.user);
  closeAuthModal();
  await refreshState();
  if (role === "teacher") {
    switchTab("teacher");
  } else {
    await loadNextQuestion();
  }
}

function logoutUser() {
  localStorage.removeItem("pm_token");
  updateAuthUI(null);
  refreshState();
}

// ============================================================================
// NAVIGATION & LEARNER STATE
// ============================================================================
function switchTab(tabName) {
  const scrollToHow = tabName === "how";
  const resolvedTab = scrollToHow ? "home" : tabName;

  ["home", "tutor", "graph", "visualizer", "classroom", "teacher"].forEach((t) => {
    const viewEl = document.getElementById(`view-${t}`);
    const tabEl = document.getElementById(`tab-${t}`);
    if (viewEl) viewEl.classList.toggle("hidden", t !== resolvedTab);
    if (tabEl) tabEl.classList.toggle("active", t === resolvedTab);
  });

  const backHomeBtn = document.getElementById("btn-back-home");
  if (backHomeBtn) backHomeBtn.classList.toggle("hidden", resolvedTab === "home");

  if (resolvedTab === "teacher") loadTeacherDashboard();
  if (resolvedTab === "visualizer") renderAllVisualizers(Boolean(currentUser));
  if (scrollToHow) {
    const howEl = document.getElementById("how-it-works-section");
    if (howEl) howEl.scrollIntoView({ behavior: "smooth" });
  }
}

async function refreshState() {
  const res = await fetch(`/api/state/${currentStudentId}`);
  appState = await res.json();
  renderStatsAndSidebars();
  renderConceptGraph();
  renderSM2Table();
}

function renderStatsAndSidebars() {
  const concepts = appState.student.concepts;
  const nodes = appState.graph.nodes;
  const dueSet = new Set(appState.due_concepts);

  const masteries = Object.values(concepts).map((c) => c.mastery);
  const avg = Math.round((masteries.reduce((a, b) => a + b, 0) / masteries.length) * 100);

  let activeMiscCount = 0;
  Object.values(concepts).forEach((c) => {
    activeMiscCount += c.misconceptions.filter((m) => !m.resolved).length;
  });

  document.getElementById("stat-overall-mastery").textContent = `${avg}%`;
  document.getElementById("stat-due-count").textContent = `${dueSet.size} Concepts`;
  document.getElementById("stat-misc-count").textContent = `${activeMiscCount} Detected`;
  document.getElementById("stat-clock-offset").textContent = `+${appState.student.sim_offset_hours || 0} hrs`;

  document.getElementById("sidebar-mastery-list").innerHTML = nodes
    .map((n) => {
      const c = concepts[n.id];
      const pct = Math.round(c.mastery * 100);
      const color = pct >= 75 ? "bg-emerald-500" : pct >= 45 ? "bg-amber-400" : "bg-rose-500";
      const isDue = dueSet.has(n.id);
      return `
        <div onclick="loadNextQuestion('${n.id}')" class="p-2.5 rounded-xl bg-slate-950/75 border border-slate-800 hover:border-indigo-500/60 cursor-pointer transition">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="font-medium text-slate-200 truncate pr-2">${escapeHtml(n.id)}: ${escapeHtml(n.name)}</span>
            <span class="font-mono text-slate-300">${pct}%</span>
          </div>
          <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div class="${color} h-full" style="width: ${pct}%"></div>
          </div>
          ${isDue ? `<div class="text-[10px] text-amber-400 mt-1">⏰ Due for SM-2 review</div>` : ""}
        </div>`;
    })
    .join("");

  const histEl = document.getElementById("sidebar-history-list");
  const history = appState.student.history || [];
  histEl.innerHTML =
    history.length === 0
      ? `<p class="text-slate-500">No answers logged yet. Complete the diagnostic or answer a question above.</p>`
      : history
          .slice(0, 8)
          .map((h) => {
            const badge =
              h.is_correct && !h.reasoning_flawed
                ? `<span class="text-emerald-400 font-semibold">✓ Verified</span>`
                : `<span class="text-rose-400 font-semibold">⚠ Gap Flagged</span>`;
            return `
              <div class="p-2.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-1">
                <div class="flex justify-between">
                  <span class="font-semibold text-slate-300">${escapeHtml(h.concept_id)}</span>
                  ${badge}
                </div>
                ${h.misconception_label ? `<div class="text-rose-300 text-[11px]">Flaw: ${escapeHtml(h.misconception_label)}</div>` : ""}
                <div class="text-slate-500 text-[11px]">BKT: ${Math.round(h.mastery_before * 100)}% → ${Math.round(h.mastery_after * 100)}%</div>
              </div>`;
          })
          .join("");
}

// ============================================================================
// DIAGNOSTIC & ADAPTIVE PRACTICE
// ============================================================================
async function loadDiagnostic() {
  const res = await fetch("/api/diagnostic");
  const data = await res.json();
  diagnosticQuestions = data.questions;
  document.getElementById("diagnostic-panel").classList.remove("hidden");
  document.getElementById("diagnostic-questions-container").innerHTML = diagnosticQuestions
    .map(
      (q, idx) => `
      <div class="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
        <div class="text-xs font-semibold text-indigo-400">Item ${idx + 1} of ${diagnosticQuestions.length} • Concept ${escapeHtml(q.concept_id)}</div>
        <p class="text-sm font-medium text-white">${escapeHtml(q.prompt)}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${q.options
            .map(
              (opt) => `
              <label class="flex items-center gap-2 p-2.5 rounded-lg border border-slate-800 hover:border-indigo-500/50 cursor-pointer text-xs">
                <input type="radio" name="diag_${q.id}" value="${escapeHtml(opt)}" class="accent-indigo-500" />
                <span>${escapeHtml(opt)}</span>
              </label>`
            )
            .join("")}
        </div>
        <input type="text" id="diag_reason_${q.id}" placeholder="Explain why (sign convention, formula, or rule)..." class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200" />
      </div>`
    )
    .join("");
}

function skipDiagnostic() {
  document.getElementById("diagnostic-panel").classList.add("hidden");
  loadNextQuestion();
}

async function submitDiagnostic() {
  const answers = diagnosticQuestions.map((q) => {
    const checked = document.querySelector(`input[name="diag_${q.id}"]:checked`);
    return {
      question_id: q.id,
      concept_id: q.concept_id,
      prompt: q.prompt,
      selected_option: checked ? checked.value : "",
      correct_option: q.correct_option,
      reasoning: document.getElementById(`diag_reason_${q.id}`).value,
    };
  });

  const res = await fetch("/api/diagnostic/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: currentStudentId, answers }),
  });
  const data = await res.json();
  appState = data.state;
  document.getElementById("diagnostic-panel").classList.add("hidden");
  renderDiagnosticSummary(data.results || []);
  renderStatsAndSidebars();
  renderConceptGraph();
  renderSM2Table();
  await loadNextQuestion();
}

async function loadNextQuestion(conceptId = null, difficultyOverride = "") {
  selectedOption = null;
  document.getElementById("feedback-box").classList.add("hidden");
  document.getElementById("q-reasoning").value = "";
  document.getElementById("btn-submit-answer").disabled = false;

  const diffVal = difficultyOverride || (document.getElementById("q-difficulty-override")?.value || "");
  const fmtVal = document.getElementById("q-format-override")?.value || "mixed";
  const params = new URLSearchParams();
  if (conceptId) params.set("concept_id", conceptId);
  if (diffVal) params.set("difficulty", diffVal);
  if (fmtVal) params.set("format", fmtVal);
  const queryStr = params.toString();
  const url = queryStr
    ? `/api/next-question/${currentStudentId}?${queryStr}`
    : `/api/next-question/${currentStudentId}`;
  const res = await fetch(url);
  const data = await res.json();
  currentQuestion = data.question;
  const rec = data.recommendation_reason;

  document.getElementById("q-concept-badge").textContent = `${currentQuestion.concept_id} • ${currentQuestion.concept_name}`;
  document.getElementById("q-difficulty-badge").textContent = currentQuestion.difficulty.toUpperCase();
  document.getElementById("q-due-badge").classList.toggle("hidden", !rec.is_spaced_repetition_due);
  document.getElementById("q-prompt").textContent = currentQuestion.prompt;
  document.getElementById("q-source-label").textContent = `Engine: ${currentQuestion.source} • Current Mastery: ${Math.round(rec.current_mastery * 100)}%`;
  const reasonEl = document.getElementById("q-selection-reason");
  if (reasonEl) reasonEl.textContent = `🎯 Target Reason: ${rec.selection_reason || "Weakest Ready Concept"}`;

  const remBanner = document.getElementById("q-remediation-banner");
  if (rec.target_misconception) {
    remBanner.classList.remove("hidden");
    document.getElementById("q-remediation-text").textContent = rec.target_misconception;
  } else {
    remBanner.classList.add("hidden");
  }

  const isSubj = currentQuestion.question_type === "subjective";
  document.getElementById("q-difficulty-badge").textContent =
    `${currentQuestion.difficulty.toUpperCase()} • ${isSubj ? "SUBJECTIVE" : "MCQ"}`;
  const subjGuide = document.getElementById("q-subjective-guide");
  if (subjGuide) subjGuide.classList.toggle("hidden", !isSubj);

  const optionsContainer = document.getElementById("q-options");
  if (isSubj) {
    optionsContainer.innerHTML = "";
    optionsContainer.classList.add("hidden");
  } else {
    optionsContainer.classList.remove("hidden");
  }

  optionsContainer.innerHTML = isSubj ? "" : currentQuestion.options
    .map(
      (opt, idx) => `
      <div onclick="selectOption(${idx})" id="opt-card-${idx}" role="radio" aria-checked="false" tabindex="0"
           onkeydown="if(event.key==='Enter'||event.key===' ') selectOption(${idx})"
           class="option-card p-3.5 rounded-xl border border-slate-800 bg-slate-950/75 cursor-pointer flex items-center gap-3">
        <span class="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center text-xs font-semibold text-slate-300">
          ${String.fromCharCode(65 + idx)}
        </span>
        <span class="text-sm text-slate-100">${escapeHtml(opt)}</span>
      </div>`
    )
    .join("");
}

function selectOption(idx) {
  selectedOption = currentQuestion.options[idx];
  currentQuestion.options.forEach((_, i) => {
    const card = document.getElementById(`opt-card-${i}`);
    card.classList.toggle("selected", i === idx);
    card.setAttribute("aria-checked", i === idx ? "true" : "false");
  });
}

async function submitPracticeAnswer() {
  const isSubj = currentQuestion.question_type === "subjective";
  if (!isSubj && !selectedOption) {
    alert("Please select an answer option first.");
    return;
  }
  const reasoning = document.getElementById("q-reasoning").value.trim();
  if (!reasoning) {
    alert("Please write your step-by-step reasoning so the tutor can verify your conceptual understanding.");
    return;
  }

  const btn = document.getElementById("btn-submit-answer");
  btn.disabled = true;
  btn.textContent = "Analyzing Reasoning...";

  const res = await fetch("/api/submit-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: currentStudentId,
      question_id: currentQuestion.id,
      concept_id: currentQuestion.concept_id,
      difficulty: currentQuestion.difficulty,
      prompt: currentQuestion.prompt,
      question_type: currentQuestion.question_type || "mcq",
      expected_keywords: currentQuestion.expected_keywords || [],
      selected_option: isSubj ? reasoning : selectedOption,
      correct_option: currentQuestion.correct_option,
      reasoning,
    }),
  });
  const result = await res.json();
  btn.textContent = "Submit Answer & Reasoning";

  appState = result.state;
  renderStatsAndSidebars();
  renderConceptGraph();
  renderSM2Table();

  const fbBox = document.getElementById("feedback-box");
  fbBox.classList.remove(
    "hidden",
    "bg-emerald-950/50",
    "border-emerald-500/40",
    "bg-amber-950/50",
    "border-amber-500/40",
    "bg-rose-950/50",
    "border-rose-500/40"
  );

  if (result.is_correct && !result.reasoning_flawed) {
    fbBox.classList.add("bg-emerald-950/50", "border-emerald-500/40");
    document.getElementById("fb-status").textContent = "✓ Correct Answer & Sound Reasoning";
    document.getElementById("fb-status").className = "font-bold text-base text-emerald-400";
  } else if (result.is_correct && result.reasoning_flawed) {
    fbBox.classList.add("bg-amber-950/50", "border-amber-500/40");
    document.getElementById("fb-status").textContent = "⚠ Right Option, Flawed/Incomplete Reasoning";
    document.getElementById("fb-status").className = "font-bold text-base text-amber-300";
  } else {
    fbBox.classList.add("bg-rose-950/50", "border-rose-500/40");
    document.getElementById("fb-status").textContent = `✗ Incorrect (Correct: ${result.correct_option})`;
    document.getElementById("fb-status").className = "font-bold text-base text-rose-400";
  }

  document.getElementById("fb-mastery-delta").textContent =
    `BKT: ${Math.round(result.mastery_before * 100)}% → ${Math.round(result.mastery_after * 100)}% • Review in ${result.next_review_days}d`;

  const miscPill = document.getElementById("fb-misconception-pill");
  if (result.misconception_label) {
    miscPill.classList.remove("hidden");
    document.getElementById("fb-misconception-text").textContent = result.misconception_label;
  } else {
    miscPill.classList.add("hidden");
  }

  const solBox = document.getElementById("fb-model-solution-box");
  if (solBox) {
    if (result.model_solution) {
      solBox.classList.remove("hidden");
      solBox.textContent = "📘 Board-Exam Model Solution:\n" + result.model_solution;
    } else {
      solBox.classList.add("hidden");
    }
  }
  document.getElementById("fb-explanation").textContent = result.diagnosis_explanation;
  document.getElementById("fb-hint").textContent = `Socratic Check: ${result.socratic_hint}`;
}

// ============================================================================
// CONCEPT GRAPH, SM-2 & TEACHER DASHBOARD
// ============================================================================
function renderConceptGraph() {
  const svg = document.getElementById("concept-graph-svg");
  const nodes = appState.graph.nodes;
  const edges = appState.graph.edges;
  const concepts = appState.student.concepts;
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  let svgContent = `
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
      </marker>
    </defs>`;

  edges.forEach((e) => {
    const src = nodeMap[e.from];
    const dst = nodeMap[e.to];
    if (!src || !dst) return;
    if (src.x === dst.x) {
      svgContent += `<line x1="${src.x}" y1="${src.y + 34}" x2="${dst.x}" y2="${dst.y - 36}" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />`;
    } else if (src.y === dst.y && Math.abs(dst.x - src.x) > 260) {
      const midX = (src.x + dst.x) / 2;
      svgContent += `<path d="M ${src.x + 60} ${src.y - 34} Q ${midX} ${src.y - 72} ${dst.x - 60} ${dst.y - 36}" fill="none" stroke="#64748b" stroke-width="1.8" stroke-dasharray="4 3" marker-end="url(#arrow)" />`;
    } else {
      svgContent += `<line x1="${src.x + 75}" y1="${src.y}" x2="${dst.x - 78}" y2="${dst.y}" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />`;
    }
  });

  nodes.forEach((n) => {
    const pct = Math.round(concepts[n.id].mastery * 100);
    const stroke = pct >= 75 ? "#34d399" : pct >= 45 ? "#fbbf24" : "#f43f5e";
    const fill = pct >= 75 ? "#064e3b" : pct >= 45 ? "#451a03" : "#4c0519";
    svgContent += `
      <g class="graph-node" onclick="inspectConceptNode('${n.id}')">
        <rect x="${n.x - 75}" y="${n.y - 34}" width="150" height="68" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="2" />
        <text x="${n.x}" y="${n.y - 12}" text-anchor="middle" fill="#cbd5e1" font-size="10" font-weight="bold">${n.id} • ${n.unit}</text>
        <text x="${n.x}" y="${n.y + 4}" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="600">
          ${n.name.length > 20 ? n.name.slice(0, 19) + "…" : n.name}
        </text>
        <text x="${n.x}" y="${n.y + 22}" text-anchor="middle" fill="${stroke}" font-size="11" font-weight="bold">Mastery: ${pct}%</text>
      </g>`;
  });

  svg.innerHTML = svgContent;
}

function renderSM2Table() {
  const dueSet = new Set(appState.due_concepts);
  document.getElementById("sm2-table-body").innerHTML = appState.graph.nodes
    .map((n) => {
      const c = appState.student.concepts[n.id];
      const pct = Math.round(c.mastery * 100);
      const isDue = dueSet.has(n.id);
      const statusBadge =
        c.attempts === 0
          ? `<span class="text-xs text-slate-400">Not started</span>`
          : isDue
          ? `<span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Due Now</span>`
          : `<span class="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">Scheduled</span>`;
      return `
        <tr>
          <td class="py-3 px-3 font-medium text-white">${escapeHtml(n.id)}: ${escapeHtml(n.name)}</td>
          <td class="py-3 px-3 font-mono">${pct}%</td>
          <td class="py-3 px-3 font-mono">${c.ef.toFixed(2)}</td>
          <td class="py-3 px-3">${c.interval_days} days</td>
          <td class="py-3 px-3">${statusBadge}</td>
          <td class="py-3 px-3">
            <button onclick="inspectConceptNode('${n.id}')" class="text-xs text-indigo-400 hover:underline">Practice</button>
          </td>
        </tr>`;
    })
    .join("");
}

async function simulateTime(hours) {
  const res = await fetch("/api/simulate-time", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: currentStudentId, hours }),
  });
  appState = await res.json();
  renderStatsAndSidebars();
  renderSM2Table();
}

async function resetStudent() {
  await fetch(`/api/reset/${currentStudentId}`, { method: "POST" });
  await refreshState();
  await loadDiagnostic();
}

let cachedTeacherData = null;
async function loadTeacherDashboard() {
  const res = await fetch("/api/teacher/dashboard");
  const data = await res.json();
  cachedTeacherData = data;

  const unitEl = document.getElementById("teacher-unit-cards");
  if (unitEl && data.unit_summary) {
    unitEl.innerHTML = data.unit_summary.map((u) => {
      const upct = Math.round(u.avg_mastery * 100);
      const uColor = upct >= 70 ? "text-emerald-400" : upct >= 55 ? "text-amber-400" : "text-rose-400";
      return `
        <div class="glass-card rounded-2xl p-4 space-y-1">
          <div class="text-xs text-slate-400 uppercase tracking-wider">Syllabus Unit: ${escapeHtml(u.unit)}</div>
          <div class="text-2xl font-extrabold ${uColor}">${upct}% Class Avg</div>
          <div class="text-[11px] text-slate-300">Bottleneck: ${escapeHtml(u.bottleneck_concept)}</div>
        </div>`;
    }).join("");
  }

  document.getElementById("teacher-gaps-list").innerHTML = data.concept_gaps
    .map((g) => {
      const pct = Math.round(g.avg_mastery * 100);
      const barColor = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-rose-500";
      return `
        <div class="space-y-1.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span class="font-medium text-slate-200">${escapeHtml(g.concept_id)} • ${escapeHtml(g.name)}</span>
            <div class="flex items-center gap-2">
              <span class="text-slate-400">${pct}% avg (${g.struggling_count}/${g.total_students} <60%)</span>
              <button onclick="launchClassRemediation('${g.concept_id}', 'tutor')" class="text-[11px] bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 px-2 py-0.5 rounded">
                🎯 Assign Drill
              </button>
              <button onclick="launchClassRemediation('${g.concept_id}', 'lecture')" class="text-[11px] bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-200 border border-cyan-500/40 px-2 py-0.5 rounded">
                👩‍🏫 Re-Teach
              </button>
            </div>
          </div>
          <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div class="${barColor} h-full" style="width: ${pct}%"></div>
          </div>
        </div>`;
    })
    .join("");

  const miscEl = document.getElementById("teacher-misconceptions-list");
  miscEl.innerHTML =
    data.top_misconceptions.length === 0
      ? `<p class="text-xs text-slate-500">No active misconceptions detected across the cohort.</p>`
      : data.top_misconceptions
          .map(
            (m) => `
            <div class="p-3.5 rounded-xl bg-slate-950/90 border border-rose-500/30 space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-rose-300">${escapeHtml(m.label)}</span>
                <span class="text-[11px] bg-rose-500/20 text-rose-200 px-2 py-0.5 rounded-full whitespace-nowrap">${m.count} student(s)</span>
              </div>
              <div class="text-[11px] text-slate-400">Concept: ${escapeHtml(m.concept_id)} (${escapeHtml(m.concept_name)})</div>
              <div class="text-xs italic text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                Sample student reasoning: "${escapeHtml(m.sample_reasoning)}"
              </div>
            </div>`
          )
          .join("");

  document.getElementById("teacher-roster-body").innerHTML = data.roster
    .map((s) => {
      const pct = Math.round(s.avg_mastery * 100);
      const status =
        pct < 55 || s.active_misconceptions >= 2
          ? `<span class="text-xs bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full">Needs 1:1 Support</span>`
          : `<span class="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full">On Track</span>`;
      return `
        <tr>
          <td class="py-3 px-3 font-medium text-white">${escapeHtml(s.name)}</td>
          <td class="py-3 px-3 font-mono">${pct}%</td>
          <td class="py-3 px-3 text-slate-300">${escapeHtml(s.weakest_concept)} (${Math.round(s.weakest_score * 100)}%)</td>
          <td class="py-3 px-3">${s.active_misconceptions}</td>
          <td class="py-3 px-3">${status}</td>
        </tr>`;
    })
    .join("");
}

function exportTeacherCSV() {
  if (!cachedTeacherData) return;
  const rows = [["Student", "Avg Mastery (%)", "Weakest Concept", "Active Misconceptions"]];
  cachedTeacherData.roster.forEach((s) => {
    rows.push([s.name, Math.round(s.avg_mastery * 100), s.weakest_concept, s.active_misconceptions]);
  });
  const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "class10_physics_cohort_gaps.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// ============================================================================
// PERSONAL GENAI CHATBOT & UNIVERSAL VOICE QUERY ENGINE
// ============================================================================
function toggleChatbotDrawer() {
  document.getElementById("chatbot-drawer").classList.toggle("hidden");
}

function toggleChatTTS() {
  chatTTSEnabled = !chatTTSEnabled;
  document.getElementById("btn-chat-tts").textContent = chatTTSEnabled ? "🔊" : "🔇";
}

function appendChatMessage(sender, text, isAI = false) {
  const box = document.getElementById("chatbot-messages");
  const div = document.createElement("div");
  div.className = isAI
    ? "p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-indigo-100 whitespace-pre-line"
    : "p-3 rounded-xl bg-slate-800 text-white ml-6";
  div.innerHTML = `<div class="text-[10px] font-bold mb-0.5 ${isAI ? "text-indigo-300" : "text-emerald-300"}">${escapeHtml(sender)}</div>${escapeHtml(text)}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function sendChatbotQuery(overrideQuery = null) {
  const input = document.getElementById("chatbot-input");
  const query = (overrideQuery !== null ? overrideQuery : input.value).trim();
  if (!query) return;
  if (overrideQuery === null) input.value = "";

  document.getElementById("chatbot-drawer").classList.remove("hidden");
  appendChatMessage("You", query, false);

  const res = await fetch("/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: currentStudentId, query }),
  });
  const data = await res.json();
  appendChatMessage("PHYX AI", data.reply, true);



  if (data.action) {
    if (data.action.type === "switch_tab") switchTab(data.action.tab);
    if (data.action.type === "open_auth") openAuthModal("login");
    if (data.action.type === "simulate_time") simulateTime(data.action.hours || 24);
    if (data.action.type === "reset_demo") resetStudent();
    if (data.action.type === "practice_concept") {
      switchTab("tutor");
      loadNextQuestion(data.action.concept_id);
    }
  }
}

let isVoiceListening = false;
let activeRecognition = null;
let activeMicStream = null;
let activeAudioCtx = null;
let activeProcessor = null;
let recordedChunks = [];
let recordedSampleRate = 16000;
let silenceFrames = 0;
let voiceTargetInputId = null;
let voiceAutoSubmit = true;

function encodeNormalizedWav16k(chunks, inputSampleRate) {
  let totalLen = 0;
  for (const c of chunks) totalLen += c.length;
  const merged = new Float32Array(totalLen);
  let offset = 0;
  let peak = 0.001;
  for (const c of chunks) {
    for (let i = 0; i < c.length; i++) {
      const abs = Math.abs(c[i]);
      if (abs > peak) peak = abs;
    }
    merged.set(c, offset);
    offset += c.length;
  }

  // Normalize quiet laptop microphones to 0.85 peak amplitude for accurate transcription
  const gain = Math.min(8.0, 0.85 / peak);
  const targetRate = 16000;
  const ratio = inputSampleRate / targetRate;
  const outLen = Math.floor(merged.length / ratio);
  const samples = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const idx = Math.floor(i * ratio);
    const s = Math.max(-1, Math.min(1, (merged[idx] || 0) * gain));
    samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (pos, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(pos + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let byteOffset = 44;
  for (let i = 0; i < samples.length; i++, byteOffset += 2) {
    view.setInt16(byteOffset, samples[i], true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function stopAllVoiceCapture() {
  isVoiceListening = false;
  if (activeRecognition) {
    try { activeRecognition.abort(); } catch (_) {}
    activeRecognition = null;
  }
  if (activeProcessor) {
    try { activeProcessor.disconnect(); } catch (_) {}
    activeProcessor = null;
  }
  if (activeAudioCtx) {
    try { activeAudioCtx.close(); } catch (_) {}
    activeAudioCtx = null;
  }
  if (activeMicStream) {
    activeMicStream.getTracks().forEach((t) => t.stop());
    activeMicStream = null;
  }
  recordedChunks = [];
  silenceFrames = 0;

  const micBtn = document.getElementById("btn-global-voice");
  if (micBtn) {
    micBtn.classList.remove("mic-listening");
    micBtn.innerHTML = `<span>🎙️</span> <span class="hidden sm:inline">Voice Query</span>`;
  }
  const dictateBtn = document.getElementById("btn-dictate-reasoning");
  if (dictateBtn) {
    dictateBtn.classList.remove("mic-listening");
    dictateBtn.textContent = "🎙️ Dictate Reasoning";
  }
}

function applyUserTranscript(transcript) {
  const clean = (transcript || "").trim();
  if (!clean) return;

  const statusBar = document.getElementById("voice-status-bar");
  const statusText = document.getElementById("voice-status-text");
  statusBar.classList.remove("hidden");
  statusText.textContent = `🗣️ Voice Input: "${clean}"`;

  if (voiceTargetInputId) {
    const el = document.getElementById(voiceTargetInputId);
    if (el) {
      el.value = (el.value ? el.value.trim() + " " : "") + clean;
      el.focus();
      if (voiceAutoSubmit) {
        if (voiceTargetInputId === "chatbot-input") sendChatbotQuery();
        else if (voiceTargetInputId === "lecture-doubt-input" && typeof askProfAriaDoubt === "function") askProfAriaDoubt();
      }
      return;
    }
  }

  const chatInput = document.getElementById("chatbot-input");
  if (chatInput) chatInput.value = clean;
  sendChatbotQuery(clean);
}

async function finishWavRecordingAndTranscribe() {
  const chunks = recordedChunks.slice();
  const rate = recordedSampleRate;
  stopAllVoiceCapture();

  const statusBar = document.getElementById("voice-status-bar");
  const statusText = document.getElementById("voice-status-text");
  statusBar.classList.remove("hidden");
  statusText.textContent = "⏳ Converting your voice to text...";

  try {
    const wavBlob = encodeNormalizedWav16k(chunks, rate);
    const res = await fetch("/api/voice-transcribe", {
      method: "POST",
      headers: { "Content-Type": "audio/wav" },
      body: wavBlob,
    });
    const data = await res.json();
    if (data.success && data.transcript) {
      applyUserTranscript(data.transcript);
    } else {
      statusText.innerHTML = `⚠️ ${escapeHtml(data.error || "Could not catch speech.")} — Type directly: <input type="text" placeholder="Type & press Enter..." onkeydown="if(event.key==='Enter'){ applyUserTranscript(this.value); }" class="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white ml-1 w-64" />`;
    }
  } catch (err) {
    statusText.textContent = `⚠️ Voice transcription error: ${err.message}`;
  }
}

async function startLocalMicRecorder() {
  const statusBar = document.getElementById("voice-status-bar");
  const statusText = document.getElementById("voice-status-text");
  statusBar.classList.remove("hidden");

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    stopAllVoiceCapture();
    statusText.innerHTML = `⚠️ This embedded webview blocks microphone hardware. Open <a href="http://127.0.0.1:8000" target="_blank" class="underline text-cyan-300 font-bold">http://127.0.0.1:8000</a> in Chrome/Edge for live mic, or type here: <input type="text" placeholder="Type & press Enter..." onkeydown="if(event.key==='Enter'){ applyUserTranscript(this.value); }" class="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white ml-1 w-64" />`;
    return;
  }

  try {
    activeMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    activeAudioCtx = new AudioCtx();
    recordedSampleRate = activeAudioCtx.sampleRate;
    recordedChunks = [];
    silenceFrames = 0;

    const source = activeAudioCtx.createMediaStreamSource(activeMicStream);
    activeProcessor = activeAudioCtx.createScriptProcessor(4096, 1, 1);

    let heardSpeech = false;
    activeProcessor.onaudioprocess = (e) => {
      if (!isVoiceListening) return;
      const input = e.inputBuffer.getChannelData(0);
      recordedChunks.push(new Float32Array(input));

      let sum = 0;
      for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
      const rms = Math.sqrt(sum / input.length);
      const levelBar = document.getElementById("voice-live-meter");
      if (levelBar) {
        const pct = Math.min(100, Math.round(rms * 600));
        levelBar.style.width = `${Math.max(8, pct)}%`;
      }

      if (rms > 0.012) {
        heardSpeech = true;
        silenceFrames = 0;
      } else if (heardSpeech) {
        silenceFrames++;
        if (silenceFrames > 6) {
          finishWavRecordingAndTranscribe();
        }
      }
      if (recordedChunks.length * 4096 > recordedSampleRate * 10) {
        finishWavRecordingAndTranscribe();
      }
    };

    source.connect(activeProcessor);
    activeProcessor.connect(activeAudioCtx.destination);

    statusText.innerHTML = `
      <div class="flex flex-wrap items-center gap-3">
        <span class="font-semibold text-rose-300">🔴 Recording Mic... Speak now!</span>
        <div class="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div id="voice-live-meter" class="h-full bg-emerald-400 transition-all" style="width: 10%"></div>
        </div>
        <button onclick="finishWavRecordingAndTranscribe()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-0.5 rounded-lg">
          ✓ Transcribe Now
        </button>
      </div>
    `;
  } catch (err) {
    stopAllVoiceCapture();
    statusText.innerHTML = `⚠️ Mic blocked inside VS Code webview (${escapeHtml(err.name)}). Open <a href="http://127.0.0.1:8000" target="_blank" class="underline text-cyan-300 font-bold">http://127.0.0.1:8000</a> in Chrome/Edge for mic access, or type here: <input type="text" placeholder="Type & press Enter..." onkeydown="if(event.key==='Enter'){ applyUserTranscript(this.value); }" class="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white ml-1 w-60" />`;
  }
}

function toggleUserVoiceInput(targetInputId = null, autoSubmit = true) {
  if (isVoiceListening) {
    if (recordedChunks.length > 0) {
      finishWavRecordingAndTranscribe();
    } else {
      stopAllVoiceCapture();
      document.getElementById("voice-status-bar").classList.add("hidden");
    }
    return;
  }

  voiceTargetInputId = targetInputId;
  voiceAutoSubmit = autoSubmit;
  isVoiceListening = true;

  const micBtn = document.getElementById("btn-global-voice");
  if (micBtn) {
    micBtn.classList.add("mic-listening");
    micBtn.innerHTML = `<span>⏹</span> <span class="hidden sm:inline">Done Speaking</span>`;
  }
  if (targetInputId === "q-reasoning") {
    const dictateBtn = document.getElementById("btn-dictate-reasoning");
    if (dictateBtn) {
      dictateBtn.classList.add("mic-listening");
      dictateBtn.textContent = "⏹ Done Dictating";
    }
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const statusBar = document.getElementById("voice-status-bar");
  const statusText = document.getElementById("voice-status-text");

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    activeRecognition = recognition;
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    statusBar.classList.remove("hidden");
    statusText.textContent = "🎙️ Listening... Speak now (live speech-to-text active).";

    let finalTranscript = "";
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const txt = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += txt;
        else interim += txt;
      }
      const liveText = (finalTranscript || interim).trim();
      statusText.textContent = `🗣️ Hearing: "${liveText}"`;
      if (voiceTargetInputId && document.getElementById(voiceTargetInputId)) {
        document.getElementById(voiceTargetInputId).value = liveText;
      } else if (document.getElementById("chatbot-input")) {
        document.getElementById("chatbot-input").value = liveText;
      }
    };

    recognition.onerror = () => {
      if (isVoiceListening) {
        activeRecognition = null;
        startLocalMicRecorder();
      }
    };

    recognition.onend = () => {
      if (activeRecognition && isVoiceListening) {
        stopAllVoiceCapture();
        if (finalTranscript.trim()) {
          applyUserTranscript(finalTranscript.trim());
        }
      }
    };

    try {
      recognition.start();
      return;
    } catch (_) {
      activeRecognition = null;
    }
  }

  startLocalMicRecorder();
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAuthModal();
  }
});

init();

// ============================================================================
// INTERACTIVE HOME PAGE LIVE PHYSICS FIELD ANIMATION
// ============================================================================
function initHomeHeroCanvas() {
  const canvas = document.getElementById("home-hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const LABELS = [
    "1/f = 1/v + 1/u",
    "V = I·R",
    "n₁ sin i = n₂ sin r",
    "F = B·I·L sin θ",
    "P = V²/R",
    "BKT P(L)",
    "SM-2 EF",
    "220V AC",
  ];

  let width = 0;
  let height = 0;
  const mouse = { x: -9999, y: -9999 };
  const ripples = [];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = Math.max(320, Math.floor(rect.width));
    height = canvas.height = Math.max(380, Math.floor(rect.height));
  }
  resize();
  window.addEventListener("resize", resize);

  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener("pointerleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    ripples.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      r: 8,
      alpha: 0.85,
    });
  });

  const nodes = Array.from({ length: 26 }, (_, i) => ({
    x: Math.random() * 900,
    y: Math.random() * 420,
    vx: (Math.random() - 0.5) * 0.65,
    vy: (Math.random() - 0.5) * 0.65,
    radius: i % 4 === 0 ? 4.2 : 2.5,
    color: ["#818cf8", "#38bdf8", "#34d399", "#fbbf24"][i % 4],
    label: i < LABELS.length ? LABELS[i] : null,
  }));

  let phase = 0;
  function animate() {
    const homeView = document.getElementById("view-home");
    if (homeView && !homeView.classList.contains("hidden")) {
      ctx.clearRect(0, 0, width, height);
      phase += 0.022;

      // Subtle animated electromagnetic wave ribbons in background
      for (let w = 0; w < 2; w++) {
        ctx.beginPath();
        ctx.strokeStyle = w === 0 ? "rgba(99, 102, 241, 0.16)" : "rgba(56, 189, 248, 0.12)";
        ctx.lineWidth = 2;
        for (let x = 0; x <= width; x += 14) {
          const y =
            height * (0.35 + w * 0.3) +
            Math.sin(x * 0.012 + phase + w * 1.4) * 28 +
            Math.cos(x * 0.006 - phase * 0.7) * 14;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Interactive click ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 3.2;
        rp.alpha -= 0.018;
        if (rp.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${rp.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Update & draw physics concept nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 10 || n.x > width - 10) n.vx *= -1;
        if (n.y < 10 || n.y > height - 10) n.vy *= -1;

        // Gentle magnetic pull toward cursor
        const dxm = mouse.x - n.x;
        const dym = mouse.y - n.y;
        const distM = Math.hypot(dxm, dym);
        if (distM < 160 && distM > 1) {
          n.x += (dxm / distM) * 0.7;
          n.y += (dym / distM) * 0.7;
        }

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < 135) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(129, 140, 248, ${(1 - d / 135) * 0.28})`;
            ctx.lineWidth = 1;
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        // Connect to cursor
        if (distM < 175) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(52, 211, 153, ${(1 - distM / 175) * 0.45})`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        if (n.label) {
          ctx.font = "11px monospace";
          ctx.fillStyle = "rgba(226, 232, 240, 0.55)";
          ctx.fillText(n.label, n.x + 8, n.y + 4);
        }
      }
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
