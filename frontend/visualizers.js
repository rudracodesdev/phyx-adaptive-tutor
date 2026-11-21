// PHYX — 8 Interactive 60fps HTML5 Canvas Physics Simulation Labs (4 Free + 4 Member-Unlocked)

function renderAllVisualizers(isUnlocked) {
  ["viz-lock-5", "viz-lock-6", "viz-lock-7", "viz-lock-8"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", Boolean(isUnlocked));
  });
  drawOpticsLab();
  drawEyeLab();
  drawCircuitLab();
  drawSolenoidLab();
  drawRefractionLab();
  drawPrismLab();
  drawBulbPowerLab();
  drawMagnetismLab();
}

// 1. FREE LAB (Ch 9 Light): Spherical Mirror & Convex Lens Ray Tracer
function drawOpticsLab() {
  const canvas = document.getElementById("canvas-optics");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const mode = document.getElementById("opt-type").value;
  const fMag = Number(document.getElementById("opt-f").value);
  const uMag = Number(document.getElementById("opt-u").value);
  document.getElementById("opt-f-val").textContent = `${fMag} cm`;
  document.getElementById("opt-u-val").textContent = `-${uMag} cm`;

  const cx = W / 2, cy = H / 2, scale = 4.2;

  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  for (let x = 20; x < W; x += 25) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(15, cy); ctx.lineTo(W - 15, cy); ctx.stroke();

  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  if (mode === "concave_mirror") {
    ctx.beginPath();
    ctx.arc(cx - 120, cy, 135, -0.55, 0.55);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 10, 78, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56, 189, 248, 0.18)";
    ctx.fill();
    ctx.stroke();
  }

  const drawPoint = (px, label) => {
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = "11px monospace";
    ctx.fillText(label, px - 8, cy + 16);
  };
  drawPoint(cx - fMag * scale, "F");
  drawPoint(cx - 2 * fMag * scale, "2F");
  if (mode === "convex_lens") {
    drawPoint(cx + fMag * scale, "F'");
    drawPoint(cx + 2 * fMag * scale, "2F'");
  }

  const objX = cx - uMag * scale;
  const objH = 38;
  ctx.strokeStyle = "#34d399";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(objX, cy); ctx.lineTo(objX, cy - objH); ctx.stroke();
  ctx.fillStyle = "#34d399";
  ctx.fillText("Object", objX - 18, cy - objH - 8);

  const u = -uMag;
  let v, m;
  if (mode === "concave_mirror") {
    const f = -fMag;
    v = Math.abs(u - f) < 0.1 ? Infinity : (f * u) / (u - f);
    m = isFinite(v) ? -v / u : Infinity;
  } else {
    const f = fMag;
    v = Math.abs(u + f) < 0.1 ? Infinity : (f * u) / (u + f);
    m = isFinite(v) ? v / u : Infinity;
  }

  const readoutEl = document.getElementById("opt-readout");
  if (!isFinite(v)) {
    readoutEl.textContent = "Image formed at INFINITY (parallel reflected/refracted rays)";
    return;
  }

  const imgX = cx + v * scale;
  const imgH = Math.max(-95, Math.min(95, objH * m));

  ctx.strokeStyle = "#f43f5e";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(objX, cy - objH); ctx.lineTo(cx, cy - objH); ctx.lineTo(imgX, cy - imgH); ctx.stroke();

  ctx.strokeStyle = "#a855f7";
  ctx.beginPath(); ctx.moveTo(objX, cy - objH); ctx.lineTo(cx, cy); ctx.lineTo(imgX, cy - imgH); ctx.stroke();

  if (imgX > 10 && imgX < W - 10) {
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(imgX, cy); ctx.lineTo(imgX, cy - imgH); ctx.stroke();
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("Image", imgX - 16, imgH < 0 ? cy - imgH + 14 : cy - imgH - 8);
  }

  const nature = m < 0 ? "Real & Inverted" : "Virtual & Erect";
  readoutEl.textContent = `v = ${v.toFixed(1)} cm | m = ${m.toFixed(2)}× | ${nature}`;
}

// 2. FREE LAB (Ch 10 Human Eye): Myopia & Hypermetropia Corrective Lens Lab
function drawEyeLab() {
  const canvas = document.getElementById("canvas-eye");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cond = document.getElementById("eye-cond").value;
  const distVal = Number(document.getElementById("eye-dist").value);
  const useLens = document.getElementById("eye-corr").checked;
  document.getElementById("eye-dist-val").textContent = `${distVal} cm`;

  const cy = H / 2;
  const eyeCenterX = 330;
  const eyeRadius = 68;
  const retinaX = eyeCenterX + eyeRadius;
  const eyeLensX = eyeCenterX - eyeRadius + 14;
  const specX = eyeLensX - 42;

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(eyeCenterX, cy, eyeRadius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(30, 41, 59, 0.5)";
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#34d399";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(eyeCenterX, cy, eyeRadius - 1, -0.55, 0.55);
  ctx.stroke();
  ctx.fillStyle = "#34d399";
  ctx.font = "11px monospace";
  ctx.fillText("Retina", retinaX + 8, cy + 4);

  ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(eyeLensX, cy, 8, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (useLens) {
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2.5;
    if (cond === "myopia") {
      ctx.beginPath();
      ctx.moveTo(specX - 5, cy - 34); ctx.lineTo(specX + 5, cy - 34);
      ctx.quadraticCurveTo(specX, cy, specX + 5, cy + 34);
      ctx.lineTo(specX - 5, cy + 34);
      ctx.quadraticCurveTo(specX, cy, specX - 5, cy - 34);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(specX, cy, 6, 34, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const focusX = useLens
    ? retinaX
    : cond === "myopia"
    ? retinaX - 38
    : retinaX + 42;

  ctx.strokeStyle = useLens ? "#34d399" : "#f43f5e";
  ctx.lineWidth = 2;
  [-18, 18].forEach((offsetY) => {
    ctx.beginPath();
    if (cond === "myopia") {
      ctx.moveTo(25, cy + offsetY);
      ctx.lineTo(useLens ? specX : eyeLensX, cy + offsetY);
      if (useLens) ctx.lineTo(eyeLensX, cy + offsetY * 1.25);
    } else {
      ctx.moveTo(95, cy);
      ctx.lineTo(useLens ? specX : eyeLensX, cy + offsetY);
      if (useLens) ctx.lineTo(eyeLensX, cy + offsetY * 0.85);
    }
    ctx.lineTo(focusX, cy);
    ctx.stroke();
  });

  ctx.fillStyle = useLens ? "#34d399" : "#f43f5e";
  ctx.beginPath(); ctx.arc(focusX, cy, 4.5, 0, Math.PI * 2); ctx.fill();

  const readout = document.getElementById("eye-readout");
  if (cond === "myopia") {
    const fMeters = -(distVal / 100);
    const powerD = 1 / fMeters;
    readout.textContent = useLens
      ? `Corrected! Concave Lens: f = -${distVal} cm | Power P = ${powerD.toFixed(2)} D (Focus on Retina)`
      : `Uncorrected Myopia: Image forms IN FRONT of retina | Needs Concave Lens (${powerD.toFixed(2)} D)`;
  } else {
    const fCm = (25 * distVal) / (distVal - 25);
    const powerD = 100 / fCm;
    readout.textContent = useLens
      ? `Corrected! Convex Lens: f = +${fCm.toFixed(1)} cm | Power P = +${powerD.toFixed(2)} D (Focus on Retina)`
      : `Uncorrected Hypermetropia: Image forms BEHIND retina | Needs Convex Lens (+${powerD.toFixed(2)} D)`;
  }
}

// 3. FREE LAB (Ch 11 Electricity): Ohm's Law & Series/Parallel Circuit Lab
let circuitPhase = 0;
function drawCircuitLab() {
  const canvas = document.getElementById("canvas-circuit");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const topo = document.getElementById("cir-topo").value;
  const V = Number(document.getElementById("cir-v").value);
  const R1 = Number(document.getElementById("cir-r1").value);
  const R2 = Number(document.getElementById("cir-r2").value);

  document.getElementById("cir-v-val").textContent = `${V} V`;
  document.getElementById("cir-r1-val").textContent = `${R1} Ω`;
  document.getElementById("cir-r2-val").textContent = `${R2} Ω`;

  const req = topo === "series" ? R1 + R2 : (R1 * R2) / (R1 + R2);
  const current = V / req;
  const power = V * current;

  document.getElementById("cir-readout").textContent =
    `R_eq = ${req.toFixed(2)} Ω | Total I = ${current.toFixed(2)} A | Power = ${power.toFixed(1)} W`;

  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.strokeRect(70, 45, W - 140, H - 90);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(55, 85, 30, 50);
  ctx.strokeStyle = "#38bdf8";
  ctx.beginPath(); ctx.moveTo(58, 102); ctx.lineTo(82, 102); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(64, 116); ctx.lineTo(76, 116); ctx.stroke();
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 11px monospace";
  ctx.fillText(`${V}V`, 24, 114);

  const drawResistorBox = (x, y, label) => {
    ctx.fillStyle = "#1e1b4b";
    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 2;
    ctx.fillRect(x - 36, y - 14, 72, 28);
    ctx.strokeRect(x - 36, y - 14, 72, 28);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "11px monospace";
    ctx.fillText(label, x - 26, y + 4);
  };

  if (topo === "series") {
    drawResistorBox(W * 0.38, 45, `R1:${R1}Ω`);
    drawResistorBox(W * 0.68, 45, `R2:${R2}Ω`);
  } else {
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(W * 0.32, 25, W * 0.36, 40);
    drawResistorBox(W * 0.5, 25, `R1:${R1}Ω`);
    drawResistorBox(W * 0.5, 65, `R2:${R2}Ω`);
  }

  circuitPhase = (circuitPhase + Math.min(4, current * 0.6)) % 40;
  ctx.fillStyle = "#fbbf24";
  for (let x = 70 + circuitPhase; x < W - 70; x += 40) {
    ctx.beginPath(); ctx.arc(x, H - 45, 3.5, 0, Math.PI * 2); ctx.fill();
  }
}

// 4. FREE LAB (Ch 12 Magnetism): Right-Hand Thumb Rule & Solenoid Field Lab
function drawSolenoidLab() {
  const canvas = document.getElementById("canvas-solenoid");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const curr = Number(document.getElementById("sol-i").value);
  const turns = Number(document.getElementById("sol-n").value);
  const dir = document.getElementById("sol-dir").value;

  document.getElementById("sol-i-val").textContent = `${curr} A`;
  document.getElementById("sol-n-val").textContent = `${turns} turns`;

  const cy = H / 2;
  const startX = 110, endX = 370;

  const density = Math.max(2, Math.round((curr * turns) / 25));
  const spacing = Math.max(10, Math.floor(64 / density));
  ctx.strokeStyle = "#34d399";
  ctx.lineWidth = 1.8;

  for (let offset = -28; offset <= 28; offset += spacing) {
    const y = cy + offset;
    ctx.beginPath();
    ctx.moveTo(startX - 45, y);
    ctx.lineTo(endX + 45, y);
    ctx.stroke();

    const midX = W / 2;
    const arrowDir = dir === "right" ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(midX, y);
    ctx.lineTo(midX - 6 * arrowDir, y - 4);
    ctx.moveTo(midX, y);
    ctx.lineTo(midX - 6 * arrowDir, y + 4);
    ctx.stroke();
  }

  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 3;
  const step = (endX - startX) / turns;
  for (let i = 0; i <= turns; i++) {
    const lx = startX + i * step;
    ctx.beginPath();
    ctx.ellipse(lx, cy, 7, 38, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const leftPole = dir === "right" ? "S" : "N";
  const rightPole = dir === "right" ? "N" : "S";
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = leftPole === "N" ? "#f43f5e" : "#38bdf8";
  ctx.fillText(leftPole, startX - 72, cy + 5);
  ctx.fillStyle = rightPole === "N" ? "#f43f5e" : "#38bdf8";
  ctx.fillText(rightPole, endX + 58, cy + 5);

  const bRel = (curr * turns * 0.04).toFixed(2);
  document.getElementById("sol-readout").textContent =
    `Uniform Internal Field B ∝ n·I = ${bRel} mT | Left Pole: ${leftPole} | Right Pole: ${rightPole}`;
}

// 5. MEMBER LAB (Ch 9 Light): Snell's Law & Total Internal Reflection
function drawRefractionLab() {
  const canvas = document.getElementById("canvas-refraction");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const n1 = Number(document.getElementById("ref-n1").value);
  const n2 = Number(document.getElementById("ref-n2").value);
  const incDeg = Number(document.getElementById("ref-angle").value);

  document.getElementById("ref-n1-val").textContent = n1.toFixed(2);
  document.getElementById("ref-n2-val").textContent = n2.toFixed(2);
  document.getElementById("ref-angle-val").textContent = `${incDeg}°`;

  const cx = W / 2, cy = H / 2;
  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.fillRect(0, 0, W, cy);
  ctx.fillStyle = "rgba(14, 165, 233, 0.16)";
  ctx.fillRect(0, cy, W, cy);

  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();

  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "#94a3b8";
  ctx.beginPath(); ctx.moveTo(cx, 10); ctx.lineTo(cx, H - 10); ctx.stroke();
  ctx.setLineDash([]);

  const rad1 = (incDeg * Math.PI) / 180;
  const rayLen = 95;
  ctx.strokeStyle = "#34d399";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - rayLen * Math.sin(rad1), cy - rayLen * Math.cos(rad1));
  ctx.lineTo(cx, cy);
  ctx.stroke();

  const sinR = (n1 / n2) * Math.sin(rad1);
  const readout = document.getElementById("ref-readout");

  if (sinR > 1.0) {
    ctx.strokeStyle = "#f43f5e";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + rayLen * Math.sin(rad1), cy - rayLen * Math.cos(rad1));
    ctx.stroke();
    const critDeg = (Math.asin(n2 / n1) * 180) / Math.PI;
    readout.textContent = `TOTAL INTERNAL REFLECTION! (i = ${incDeg}° > θ_c = ${critDeg.toFixed(1)}°)`;
  } else {
    const rad2 = Math.asin(sinR);
    const refDeg = (rad2 * 180) / Math.PI;
    ctx.strokeStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + rayLen * Math.sin(rad2), cy + rayLen * Math.cos(rad2));
    ctx.stroke();
    const bendDir = n2 > n1 ? "towards normal" : (n2 < n1 ? "away from normal" : "undeviated");
    readout.textContent = `Angle of Refraction r = ${refDeg.toFixed(1)}° (Bends ${bendDir})`;
  }
}

// 6. MEMBER LAB (Ch 10 Human Eye): Triangular Glass Prism Dispersion (VIBGYOR)
function drawPrismLab() {
  const canvas = document.getElementById("canvas-prism");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const incAngle = Number(document.getElementById("prism-angle").value);
  const dispFactor = Number(document.getElementById("prism-disp").value);
  document.getElementById("prism-angle-val").textContent = `${incAngle}°`;
  document.getElementById("prism-disp-val").textContent = dispFactor.toFixed(1);

  const top = { x: 230, y: 38 };
  const left = { x: 150, y: 185 };
  const right = { x: 310, y: 185 };

  ctx.fillStyle = "rgba(56, 189, 248, 0.14)";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(left.x, left.y);
  ctx.lineTo(right.x, right.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const entryX = 186, entryY = 118;
  const startY = entryY + (incAngle - 35) * 0.9;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(45, startY);
  ctx.lineTo(entryX, entryY);
  ctx.stroke();
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "11px monospace";
  ctx.fillText("White Light", 35, startY - 8);

  const spectrum = [
    { color: "#ef4444", spread: 0 },
    { color: "#f97316", spread: 1 },
    { color: "#eab308", spread: 2 },
    { color: "#22c55e", spread: 3 },
    { color: "#3b82f6", spread: 4 },
    { color: "#6366f1", spread: 5 },
    { color: "#a855f7", spread: 6 },
  ];

  spectrum.forEach((band) => {
    const exitX = 272 + band.spread * 1.1;
    const exitY = 114 + band.spread * 3.5;
    const screenY = exitY + 18 + band.spread * 7.5 * dispFactor;

    ctx.strokeStyle = band.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(entryX, entryY);
    ctx.lineTo(exitX, exitY);
    ctx.lineTo(445, Math.min(H - 10, screenY));
    ctx.stroke();
  });

  const devRed = (28 + (incAngle - 35) * 0.35 * dispFactor).toFixed(1);
  const devViolet = (34 + (incAngle - 35) * 0.45 * dispFactor + 4 * dispFactor).toFixed(1);
  document.getElementById("prism-readout").textContent =
    `Deviation δ_Red = ${devRed}° (Least) | δ_Violet = ${devViolet}° (Most) — VIBGYOR Spectrum`;
}

// 7. MEMBER LAB (Ch 11 Electricity): Bulb Brightness & Joule Power Lab
function drawBulbPowerLab() {
  const canvas = document.getElementById("canvas-bulbs");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const mode = document.getElementById("bulb-mode").value;
  const supplyV = Number(document.getElementById("bulb-v").value);
  document.getElementById("bulb-v-val").textContent = `${supplyV} V`;

  const r100 = (220 * 220) / 100;
  const r60 = (220 * 220) / 60;

  let p100, p60;
  if (mode === "parallel") {
    p100 = (supplyV * supplyV) / r100;
    p60 = (supplyV * supplyV) / r60;
  } else {
    const iSeries = supplyV / (r100 + r60);
    p100 = iSeries * iSeries * r100;
    p60 = iSeries * iSeries * r60;
  }

  const drawBulb = (x, y, label, actualW, rVal) => {
    const glow = Math.min(1, actualW / 90);
    if (glow > 0.05) {
      const grad = ctx.createRadialGradient(x, y, 6, x, y, 52);
      grad.addColorStop(0, `rgba(250, 204, 21, ${0.85 * glow})`);
      grad.addColorStop(1, "rgba(250, 204, 21, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, 52, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = glow > 0.25 ? "#fef08a" : "#334155";
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 11px monospace";
    ctx.fillText(label, x - 34, y + 38);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`R=${rVal.toFixed(0)}Ω | ${actualW.toFixed(1)}W`, x - 44, y + 53);
  };

  drawBulb(155, 95, "100W Rated", p100, r100);
  drawBulb(325, 95, "60W Rated", p60, r60);

  const brighter = p100 > p60 ? "100 W Bulb Glows Brighter (P = V²/R)" : "60 W Bulb Glows Brighter (P = I²R)";
  document.getElementById("bulb-readout").textContent =
    `${brighter} | Actual: 100W→${p100.toFixed(1)}W, 60W→${p60.toFixed(1)}W`;
}

// 8. MEMBER LAB (Ch 12 Magnetism): Fleming's Left-Hand Lorentz Force Lab
function drawMagnetismLab() {
  const canvas = document.getElementById("canvas-magnetism");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const curr = Number(document.getElementById("mag-i").value);
  const bField = Number(document.getElementById("mag-b").value);
  const angle = Number(document.getElementById("mag-theta").value);

  document.getElementById("mag-i-val").textContent = `${curr} A`;
  document.getElementById("mag-b-val").textContent = `${bField.toFixed(1)} T`;
  document.getElementById("mag-theta-val").textContent = `${angle}°`;

  ctx.fillStyle = "#991b1b";
  ctx.fillRect(15, 55, 38, 110);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("N", 28, 115);

  ctx.fillStyle = "#1e3a8a";
  ctx.fillRect(W - 53, 55, 38, 110);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("S", W - 40, 115);

  ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
  ctx.lineWidth = 1.5;
  for (let y = 70; y <= 150; y += 20) {
    ctx.beginPath(); ctx.moveTo(58, y); ctx.lineTo(W - 58, y); ctx.stroke();
  }

  const cx = W / 2, cy = H / 2;
  const rad = (angle * Math.PI) / 180;
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx - 45 * Math.cos(rad), cy + 45 * Math.sin(rad));
  ctx.lineTo(cx + 45 * Math.cos(rad), cy - 45 * Math.sin(rad));
  ctx.stroke();

  const force = bField * curr * 0.5 * Math.sin(rad);
  const vecLen = Math.min(75, force * 14);
  if (vecLen > 2) {
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - vecLen); ctx.stroke();
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`Force F = ${force.toFixed(2)} N`, cx + 10, cy - vecLen + 8);
  }

  document.getElementById("mag-readout").textContent =
    `F = B·I·L·sin(${angle}°) = ${force.toFixed(2)} N ${force < 0.05 ? "(Zero force when parallel!)" : "(Upwards via Fleming's Left-Hand Rule)"}`;
}

setInterval(() => {
  const vizSection = document.getElementById("view-visualizer");
  if (vizSection && !vizSection.classList.contains("hidden")) {
    drawCircuitLab();
  }
}, 60);
