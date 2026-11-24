/* আকাশ — interactive night sky */

(() => {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0;
  let h = 0;
  let dpr = 1;
  const stars = [];
  const shooting = [];
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

  const rand = (min, max) => min + Math.random() * (max - min);

  function makeStars() {
    stars.length = 0;
    const count = Math.round(Math.min(260, (w * h) / 5200));
    for (let i = 0; i < count; i++) {
      const depth = rand(0.25, 1);
      stars.push({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.35, 1.4) * depth + 0.2,
        depth,
        phase: rand(0, Math.PI * 2),
        speed: rand(0.4, 1.5),
        gold: Math.random() < 0.14,
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
  }

  function spawnShootingStar() {
    const fromLeft = Math.random() > 0.5;
    shooting.push({
      x: fromLeft ? rand(-80, w * 0.35) : rand(w * 0.65, w + 80),
      y: rand(-40, h * 0.45),
      vx: fromLeft ? rand(3.4, 6) : rand(-6, -3.4),
      vy: rand(1.6, 3.2),
      life: 1,
      len: rand(70, 150),
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;

    for (const s of stars) {
      const twinkle = reduceMotion ? 0.85 : 0.62 + 0.38 * Math.sin(t * 0.0011 * s.speed + s.phase);

      const dx = mouse.x - s.x;
      const dy = mouse.y - s.y;
      const dist = Math.hypot(dx, dy);
      let ox = 0;
      let oy = 0;
      if (dist < 340 && dist > 0.5) {
        const pull = (1 - dist / 340) * 26 * s.depth;
        ox = (dx / dist) * pull;
        oy = (dy / dist) * pull;
      }

      const px = s.x + ox + (mouse.x / w - 0.5) * -18 * s.depth;
      const py = s.y + oy + (mouse.y / h - 0.5) * -18 * s.depth;
      const alpha = Math.min(1, 0.26 + s.depth * 0.78) * twinkle;

      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold
        ? "rgba(232, 195, 122, " + alpha + ")"
        : "rgba(226, 233, 255, " + alpha + ")";
      ctx.fill();

      if (s.r > 1.1) {
        const g = ctx.createRadialGradient(px, py, 0, px, py, s.r * 7);
        g.addColorStop(0, s.gold
          ? "rgba(232,195,122," + alpha * 0.4 + ")"
          : "rgba(200,215,255," + alpha * 0.32 + ")");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, s.r * 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!reduceMotion) {
      if (Math.random() < 0.0035 && shooting.length < 3) spawnShootingStar();

      for (let i = shooting.length - 1; i >= 0; i--) {
        const m = shooting[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.012;
        const tail = m.len / 6;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
        grad.addColorStop(0, "rgba(255,255,255," + Math.max(0, m.life) * 0.9 + ")");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
        ctx.stroke();
        if (m.life <= 0 || m.x < -200 || m.x > w + 200 || m.y > h + 200) shooting.splice(i, 1);
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouse.tx = e.clientX;
    mouse.ty = e.clientY;
  });
  window.addEventListener("mouseleave", () => {
    mouse.tx = -9999;
    mouse.ty = -9999;
  });
  window.addEventListener("touchmove", (e) => {
    const p = e.touches[0];
    if (p) {
      mouse.tx = p.clientX;
      mouse.ty = p.clientY;
    }
  }, { passive: true });

  resize();
  requestAnimationFrame(draw);

  /* ---------- moon phase ---------- */

  const SYNODIC = 29.530588853;
  const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

  function moonPhase(date) {
    const days = (date.getTime() - NEW_MOON) / 86400000;
    const age = ((days % SYNODIC) + SYNODIC) % SYNODIC;
    return { age, phase: age / SYNODIC };
  }

  const PHASES = [
    { max: 0.03, name: "অমাবস্যা", text: "চাঁদ আজ প্রায় অদৃশ্য — আকাশে শুধু তারা। অন্ধকার যত গাঢ়, তারা তত উজ্জ্বল দেখায়।" },
    { max: 0.22, name: "কৃষ্ণপক্ষের ফালি চাঁদ", text: "পাতলা এক ফালি চাঁদ পশ্চিম আকাশে — সূর্য ডোবার অল্প পরেই ডুবে যায়।" },
    { max: 0.28, name: "প্রথম চতুর্থাংশ", text: "অর্ধেক চাঁদ, সোজা উপরে। দুপুর বেলা ওঠে, মধ্যরাতে পশ্চিমে হেলে পড়ে।" },
    { max: 0.47, name: "বর্ধমান চাঁদ", text: "চাঁদ এখন মোটা হয়ে আসছে — সন্ধ্যার আকাশে উজ্জ্বল, গভীর রাত পর্যন্ত থাকে।" },
    { max: 0.53, name: "পূর্ণিমা", text: "আজ পূর্ণিমা। সূর্যাস্তের সাথে সাথেই পূর্ব দিকে ওঠে, সারারাত আকাশ ভরে রাখে।" },
    { max: 0.72, name: "ক্ষীয়মাণ চাঁদ", text: "পূর্ণিমা পেরিয়ে চাঁদ ধীরে ধীরে কমছে — এখন রাতের শেষ ভাগে ওঠে।" },
    { max: 0.78, name: "শেষ চতুর্থাংশ", text: "আবার অর্ধেক চাঁদ, তবে এবার বাঁ দিক আলোকিত। মধ্যরাতের পর ওঠে।" },
    { max: 0.97, name: "কৃষ্ণপক্ষের শেষ ফালি", text: "ভোরের আকাশে এক সরু ফালি — সূর্য ওঠার ঠিক আগে দেখা মেলে।" },
    { max: 1.01, name: "অমাবস্যা", text: "চাঁদ প্রায় হারিয়ে গেছে। সবচেয়ে অন্ধকার রাত — তারার সংখ্যা সবচেয়ে বেশি দেখায়।" },
  ];

  const moonDisc = document.getElementById("moon-disc");

  function renderMoon(phase) {
    const r = 50;
    const waxing = phase <= 0.5;
    const q = waxing ? phase : 1 - phase; // mirrored waxing-equivalent phase
    const rx = Math.abs(Math.cos(q * Math.PI * 2)) * r;
    const sweep = q < 0.25 ? 0 : 1;
    const d = "M 0 " + -r + " A " + r + " " + r + " 0 0 1 0 " + r +
              " A " + rx + " " + r + " 0 0 " + sweep + " 0 " + -r;
    const flip = waxing ? 1 : -1;

    const craters = [
      [-16, -18, 9, 0.1], [14, -6, 6, 0.09], [-4, 20, 7, 0.08],
      [24, 22, 4.5, 0.07], [-26, 12, 4, 0.07], [6, -32, 3.5, 0.06],
    ].map(([cx, cy, cr, op]) =>
      `<circle cx="${cx}" cy="${cy}" r="${cr}" fill="rgba(90,72,42,${op})"/>`
    ).join("");

    moonDisc.innerHTML = `
      <svg viewBox="-52 -52 104 104" width="100%" height="100%" aria-hidden="true">
        <defs>
          <radialGradient id="litGrad" cx="36%" cy="30%" r="80%">
            <stop offset="0%" stop-color="#fdf6e3"/>
            <stop offset="55%" stop-color="#ecdfc2"/>
            <stop offset="100%" stop-color="#bda98a"/>
          </radialGradient>
          <filter id="soften"><feGaussianBlur stdDeviation="0.4"/></filter>
          <clipPath id="litClip"><path d="${d}" transform="scale(${flip} 1)"/></clipPath>
        </defs>
        <circle cx="0" cy="0" r="50" fill="#0c1022"/>
        <g transform="scale(${flip} 1)" filter="url(#soften)">
          <path d="${d}" fill="url(#litGrad)"/>
        </g>
        <g clip-path="url(#litClip)" transform="scale(${flip} 1)">${craters}</g>
        <circle cx="0" cy="0" r="50" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="0.8"/>
      </svg>`;
  }

  function paintMoon() {
    const now = new Date();
    const { age, phase } = moonPhase(now);
    const info = PHASES.find((p) => phase <= p.max) || PHASES[PHASES.length - 1];

    document.getElementById("phase-name").textContent = info.name;
    document.getElementById("phase-text").textContent = info.text;
    document.getElementById("age").textContent = age.toFixed(1) + " দিন";
    document.getElementById("illum").textContent =
      Math.round(((1 - Math.cos(phase * Math.PI * 2)) / 2) * 100) + "%";
    document.getElementById("today").textContent = now.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    renderMoon(phase);
  }

  paintMoon();

  /* ---------- constellation art ---------- */

  const SHAPES = {
    saptarshi: [[12, 46], [27, 34], [42, 40], [57, 28], [72, 36], [85, 26], [95, 14]],
    kalpurush: [[50, 10], [46, 26], [54, 26], [40, 42], [60, 42], [36, 62], [64, 62], [30, 80], [70, 80]],
    kassiopia: [[14, 58], [32, 30], [50, 52], [68, 28], [86, 54]],
  };

  const LINES = {
    saptarshi: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    kalpurush: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8], [1, 2], [3, 4]],
    kassiopia: [[0, 1], [1, 2], [2, 3], [3, 4]],
  };

  function shapeUrl(key) {
    const pts = SHAPES[key];
    const lines = LINES[key].map(([a, b]) =>
      '<line x1="' + pts[a][0] + '" y1="' + pts[a][1] + '" x2="' + pts[b][0] + '" y2="' + pts[b][1] +
      '" stroke="rgba(232,195,122,0.5)" stroke-width="0.7"/>'
    ).join("");
    const dots = pts.map(([x, y], i) =>
      '<circle cx="' + x + '" cy="' + y + '" r="' + (i === 0 ? 2.1 : 1.4) + '" fill="#fdf6e3"/>'
    ).join("");
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 95">' + lines + dots + '</svg>';
    return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
  }

  document.querySelectorAll(".card-art").forEach((el) => {
    el.style.backgroundImage = shapeUrl(el.dataset.shape);
  });

  /* ---------- reveal on scroll ---------- */

  const revealables = document.querySelectorAll(".panel, .constellations, .note, .card");
  revealables.forEach((el) => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  revealables.forEach((el) => io.observe(el));

  /* ---------- clock ---------- */

  function tick() {
    const now = new Date();
    document.getElementById("clock").textContent = now.toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Dhaka",
    });
    document.getElementById("year").textContent = now.getFullYear();
  }

  tick();
  setInterval(tick, 20000);
})();
