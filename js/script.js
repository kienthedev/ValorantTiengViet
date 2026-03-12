// ================================
// CONFIG
// ================================

const SHEET_URL =
  "https://opensheet.elk.sh/1AZCBokCGdVuIuzhG0Gb3BPqaEoYEhS4UFillUxDRYzs/Sheet1";

let matchesData = [];

// ================================
// CASTERS DATA (HARDCODE)
// ================================

const castersData = [
  {
    name: "Fox",
    avatar: "assets/casters/fox-caster.png",
    description: "Phắc cọc",
  },
  {
    name: "Kẹo",
    avatar: "assets/casters/keo-caster.jpg",
    description: "Cộn lèo",
  },
  {
    name: "Tom",
    avatar: "assets/casters/tom-caster.jpg",
    description: "Tôn lồm",
  },
  {
    name: "Đậu",
    avatar: "assets/casters/dau-caster.jpg",
    description: "Đạy gâu",
  },
  {
    name: "Tẩy",
    avatar: "assets/casters/tay-caster.jpg",
    description: "Tổn lầy",
  },
  {
    name: "ALong",
    avatar: "assets/casters/along-caster.jpg",
    description: "Lăng cọc",
  },
  {
    name: "Bún",
    avatar: "assets/casters/bun-caster.jpg",
    description: "Bốn lùn",
  },
];

// ================================
// INIT APP
// ================================

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  await loadNavbar();

  await loadMatches();

  if (exists("matches-container")) {
    showDay("today");
  }

  if (exists("hero-carousel")) {
    initHero();
  }

  if (exists("casters-container")) {
    renderCasters();
  }

  await loadFooter();
}

// ================================
// HELPERS
// ================================

function exists(id) {
  return document.getElementById(id);
}

// ================================
// NAVBAR
// ================================

async function loadNavbar() {
  const res = await fetch("components/navbar.html");

  const html = await res.text();

  const container = document.getElementById("navbar");

  if (!container) return;

  container.innerHTML = html;

  setActiveNav();
}

function setActiveNav() {
  const page = window.location.pathname.split("/").pop().replace(".html", "");

  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.dataset.page === page) {
      link.classList.add("active");
    }
  });
}

// ================================
// FETCH MATCHES
// ================================

async function loadMatches() {
  try {
    const res = await fetch(SHEET_URL);

    matchesData = await res.json();
  } catch (err) {
    console.error("Fetch matches error:", err);
  }
}

// ================================
// MATCH STATUS
// ================================

function getMatchStatus(date, time) {
  const now = new Date();

  const matchTime = new Date(`${date} ${time}`);

  const diff = (now - matchTime) / 60000;

  if (diff >= 0 && diff <= 150) return "live";

  if (diff < 0) return "upcoming";

  return "ended";
}

// ================================
// SCHEDULE PAGE
// ================================

function renderMatches(targetDate) {
  const container = document.getElementById("matches-container");

  if (!container) return;

  container.innerHTML = "";

  const list = matchesData
    .filter((m) => m.Date === targetDate)
    .sort((a, b) => {
      const statusA = getMatchStatus(a.Date, a.Time);
      const statusB = getMatchStatus(b.Date, b.Time);

      const order = { live: 0, upcoming: 1, ended: 2 };

      return order[statusA] - order[statusB];
    });

  if (list.length === 0) {
    container.innerHTML = `<p class="text-muted">Không có trận đấu</p>`;

    return;
  }

  list.forEach((match) => {
    const status = getMatchStatus(match.Date, match.Time);

    const card = document.createElement("div");

    card.className = "match-card";
    if (match.Livestream) {
      card.style.cursor = "pointer";

      card.onclick = () => {
        window.open(match.Livestream, "_blank");
      };
    }
    card.innerHTML = `
    
<div class="match-time">${match.Time}</div>

<div class="match-teams">

<div class="team team-left">
<span class="team-name">${match.Team1}</span>
<div class="team-logo-box">
<img src="${match.Logo1}" class="team-logo">
</div>



</div>

<div class="vs">VS</div>

<div class="team team-right">



<div class="team-logo-box">
<img src="${match.Logo2}" class="team-logo">
</div>
<span class="team-name">${match.Team2}</span>

</div>

</div>

<div class="match-event">
${match.Event}
</div>

<div class="match-blv">
🎙 ${match.BLV}
</div>

<div class="status-${status}">
${status.toUpperCase()}
</div>
`;

    container.appendChild(card);
  });
}

function showDay(day) {
  const date = new Date();

  if (day === "tomorrow") {
    date.setDate(date.getDate() + 1);
  }

  const targetDate = getLocalDate(date);

  renderMatches(targetDate);
}

if (exists("matches-container")) {
  setInterval(() => {
    showDay("today");
  }, 60000);
}

// ================================
// HERO BANNER (CAROUSEL)
// ================================

let heroIndex = 0;
let heroSlides = [];

function initHero() {
  const container = document.getElementById("hero-carousel");
  if (!container) return;

  const matches = matchesData
    .filter((m) => getMatchStatus(m.Date, m.Time) !== "ended")
    .sort((a, b) => {
      const sa = getMatchStatus(a.Date, a.Time);
      const sb = getMatchStatus(b.Date, b.Time);

      if (sa === "live") return -1;
      if (sb === "live") return 1;

      return new Date(`${a.Date} ${a.Time}`) - new Date(`${b.Date} ${b.Time}`);
    })
    .slice(0, 5);

  if (matches.length === 0) {
    setHeroChannel();
    return;
  }

  container.innerHTML = "";

  matches.forEach((match, i) => {
    const slide = document.createElement("div");

    slide.className = "hero-slide";
    if (i === 0) slide.classList.add("active");

    const status = getMatchStatus(match.Date, match.Time);
    const bg = match.Background || "assets/hero-bg.jpg";
    const matchDate = new Date(`${match.Date} ${match.Time}`);

    const dateStr = matchDate.toLocaleDateString("vi-VN");
    const timeStr = matchDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    slide.style.backgroundImage = `url(${bg})`;

    slide.innerHTML = `

<div class="hero-overlay"></div>

<div class="hero-content">
<h1>VALORANT TIẾNG VIỆT</h1>

<div class="hero-status">
${status === "live" ? "🔴 ĐANG TRỰC TIẾP" : "TRẬN TIẾP THEO"}
</div>

<div class="hero-datetime">
${dateStr} • ${timeStr}
</div>

<div class="hero-match">

<div class="hero-team">
<img src="${match.Logo1}" class="hero-logo">
<span class="hero-team-name">${match.Team1}</span>
</div>

<div class="hero-vs">VS</div>

<div class="hero-team">
<img src="${match.Logo2}" class="hero-logo">
<span class="hero-team-name">${match.Team2}</span>
</div>
</div>
</div>

<a href="${match.Livestream || "#"}" class="hero-watch-btn" target="_blank">
 <i class="bi bi-play-btn-fill"></i> XEM NGAY
</a>

<div class="hero-progress">
<div class="hero-progress-bar"></div>
</div>

`;

    if (match.Livestream) {
      slide.style.cursor = "pointer";
      slide.onclick = () => window.open(match.Livestream, "_blank");
    }

    container.appendChild(slide);

    if (status === "upcoming") {
      startSlideCountdown(match, `countdown-${i}`);
    }
  });

  heroSlides = document.querySelectorAll(".hero-slide");

  startHeroSlider();

  const nextBtn = document.getElementById("hero-next");
  const prevBtn = document.getElementById("hero-prev");

  if (nextBtn) {
    nextBtn.onclick = () => changeHeroSlide(1);
  }

  if (prevBtn) {
    prevBtn.onclick = () => changeHeroSlide(-1);
  }
}

let heroTimer = null;

function startHeroSlider() {
  if (heroSlides.length <= 1) return;

  const bars = document.querySelectorAll(".hero-progress-bar");

  heroTimer = setInterval(() => {
    heroSlides[heroIndex].classList.remove("active");

    heroIndex++;

    if (heroIndex >= heroSlides.length) heroIndex = 0;

    heroSlides[heroIndex].classList.add("active");

    bars.forEach((bar) => (bar.style.width = "0%"));

    let progress = 0;

    const progressTimer = setInterval(() => {
      progress += 2;
      bars[heroIndex].style.width = progress + "%";

      if (progress >= 100) clearInterval(progressTimer);
    }, 100);
  }, 5000);
}

function changeHeroSlide(dir) {
  if (heroSlides.length === 0) return;

  heroSlides[heroIndex].classList.remove("active");

  heroIndex += dir;

  if (heroIndex < 0) {
    heroIndex = heroSlides.length - 1;
  }

  if (heroIndex >= heroSlides.length) {
    heroIndex = 0;
  }

  heroSlides[heroIndex].classList.add("active");
}

function startSlideCountdown(match, elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  setInterval(() => {
    const now = new Date();
    const matchTime = new Date(`${match.Date} ${match.Time}`);

    const diff = matchTime - now;

    if (diff < 0) return;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerText = `Starts in ${h}h ${m}m ${s}s`;
  }, 1000);
}

function setHeroChannel() {
  const container = document.getElementById("hero-carousel");

  if (!container) return;

  container.innerHTML = `
  
<div class="hero-slide active" style="background-image:url('assets/hero-bg.jpg')">

<div class="hero-overlay"></div>

<div class="hero-content">

<h1>VALORANT TIẾNG VIỆT</h1>

<p>Kênh bình luận Valorant</p>

</div>

</div>
`;
}

// ================================
// DOM UTIL
// ================================

function setText(id, text) {
  const el = document.getElementById(id);

  if (el) el.innerText = text;
}

function getLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

// ================================
// CASTERS SECTION
// ================================

function renderCasters() {
  const container = document.getElementById("casters-container");

  if (!container) return;

  container.innerHTML = "";

  castersData.forEach((caster) => {
    const card = document.createElement("div");

    card.className = "caster-card";

    card.innerHTML = `

<img src="${caster.avatar}" class="caster-avatar">

<h3 class="caster-name">${caster.name}</h3>

<p class="caster-desc">
${caster.description}
</p>

`;

    container.appendChild(card);
  });
}

async function loadFooter() {
  const res = await fetch("components/footer.html");

  const html = await res.text();

  const container = document.getElementById("footer");

  if (!container) return;

  container.innerHTML = html;
}

function setScheduleTab(btn, day) {
  document
    .querySelectorAll(".schedule-tab")
    .forEach((t) => t.classList.remove("active"));

  btn.classList.add("active");

  showDay(day);
}

fetch("agents.json", { cache: "force-cache" })
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("agents");

    data.forEach((agent) => {
      container.innerHTML += `
<div class="agent-card">
  <img loading="lazy" src="${agent.image}" alt="${agent.name}">
  <h3>${agent.name}</h3>
  <p>${agent.role}</p>
</div>
`;
    });
  });
