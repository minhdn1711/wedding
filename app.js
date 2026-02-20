// ============================
// CONFIG - sửa nhanh tại đây
// ============================
const WEDDING_DATE_ISO = "2026-06-08T18:00:00+07:00"; // giờ VN (UTC+7)
const DATE_TEXT = "08.06.2026";
// ============================

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

// ---------- Safe setters ----------
(function initStaticText() {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const dateEl = $("#dateText");
  if (dateEl) dateEl.textContent = DATE_TEXT;
})();

// ---------- Mobile drawer ----------
(function initMobileDrawer() {
  const drawer = $("#drawer");
  const menuBtn = $("#menuBtn");
  if (!drawer || !menuBtn) return;

  menuBtn.addEventListener("click", () => {
    drawer.classList.toggle("show");
    drawer.setAttribute("aria-hidden", drawer.classList.contains("show") ? "false" : "true");
  });

  $$(".mobile-drawer a").forEach((a) =>
    a.addEventListener("click", () => {
      drawer.classList.remove("show");
      drawer.setAttribute("aria-hidden", "true");
    })
  );
})();

// ---------- Reveal on scroll ----------
(function initReveal() {
  const els = $$(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const delay = e.target.getAttribute("data-delay");
        if (delay) e.target.style.transitionDelay = `${delay}ms`;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
})();

// ---------- Countdown ----------
(function initCountdown() {
  const dd = $("#dd"),
    hh = $("#hh"),
    mm = $("#mm"),
    ss = $("#ss");
  if (!dd || !hh || !mm || !ss) return;

  const target = new Date(WEDDING_DATE_ISO).getTime();
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const now = Date.now();
    let diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);

    const secs = Math.floor(diff / 1000);

    dd.textContent = pad(days);
    hh.textContent = pad(hours);
    mm.textContent = pad(mins);
    ss.textContent = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
})();

// ---------- Gallery lightbox ----------
(function initLightbox() {
  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbClose = $("#lbClose");
  if (!lightbox || !lbImg || !lbClose) return;

  function openLB(src) {
    lbImg.src = src;
    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLB() {
    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");
    lbImg.src = "";
  }

  $$(".g-item").forEach((btn) =>
    btn.addEventListener("click", () => {
      const src = btn.dataset.src;
      if (src) openLB(src);
    })
  );

  lbClose.addEventListener("click", closeLB);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLB();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLB();
  });
})();

// ---------- RSVP demo (localStorage) ----------
(function initRSVP() {
  const form = $("#rsvpForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.createdAt = new Date().toISOString();

    const key = "wedding_rsvp_list";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.push(payload);
    localStorage.setItem(key, JSON.stringify(list));

    form.reset();
    alert("Đã gửi RSVP! Cảm ơn bạn ❤️");
  });
})();

// ---------- MUSIC (autoplay best-effort) ----------
(function initMusic() {
  const bgm = $("#bgm");
  const musicBtn = $("#musicBtn");
  const MUSIC_KEY = "wedding_music_on";
  if (!bgm || !musicBtn) {
    console.warn("Missing #bgm or #musicBtn in HTML");
    return;
  }

  const iconEl = musicBtn.querySelector(".icon");

  function setMusicUI(isSoundOn) {
    // isSoundOn = true nghĩa là đang bật tiếng (unmuted)
    musicBtn.classList.toggle("on", isSoundOn);
    musicBtn.title = isSoundOn ? "Tắt nhạc" : "Bật nhạc";
    musicBtn.setAttribute("aria-label", isSoundOn ? "Tắt nhạc" : "Bật nhạc");
    if (iconEl) iconEl.textContent = isSoundOn ? "❚❚" : "♪";
  }

  async function ensurePlaying() {
    // đảm bảo audio đang play (dù muted)
    try {
      await bgm.play();
      return true;
    } catch (e) {
      console.warn("Audio play blocked:", e);
      return false;
    }
  }

  // 1) cố autoplay khi load (thường chỉ chạy được nếu muted)
  (async () => {
    bgm.volume = 0.9;
    const ok = await ensurePlaying();
    // UI theo trạng thái bật tiếng (không phải đang play)
    setMusicUI(!bgm.muted && ok);
  })();

  // 2) gesture đầu tiên -> unmute + play
  async function enableSoundOnFirstGesture() {
    try {
      bgm.muted = false;
      bgm.volume = 0.9;
      await bgm.play();
      localStorage.setItem(MUSIC_KEY, "1");
      setMusicUI(true);
    } catch (e) {
      console.warn("Enable sound failed:", e);
      setMusicUI(false);
    }
  }

  // Nếu user đã bật trước đó, ta cố “bật tiếng” ngay khi có gesture
  // Nếu chưa bật, vẫn bật tiếng ở gesture đầu tiên để cảm giác “auto”
  window.addEventListener("pointerdown", enableSoundOnFirstGesture, { once: true });
  window.addEventListener("touchstart", enableSoundOnFirstGesture, { once: true });
  window.addEventListener("keydown", enableSoundOnFirstGesture, { once: true });

  // 3) Nút nhạc: toggle mute/unmute
  musicBtn.addEventListener("click", async () => {
    // nếu chưa play được, thử play trước
    if (bgm.paused) await ensurePlaying();

    if (!bgm.muted) {
      bgm.muted = true;
      localStorage.setItem(MUSIC_KEY, "0");
      setMusicUI(false);
    } else {
      try {
        bgm.muted = false;
        bgm.volume = 0.9;
        await bgm.play();
        localStorage.setItem(MUSIC_KEY, "1");
        setMusicUI(true);
      } catch (e) {
        console.warn("Unmute/play failed:", e);
        setMusicUI(false);
      }
    }
  });

  // trạng thái UI ban đầu (dựa trên localStorage + muted)
  const saved = localStorage.getItem(MUSIC_KEY);
  if (saved === "1") {
    // sẽ bật tiếng ở gesture đầu tiên
    setMusicUI(false);
  } else {
    setMusicUI(false);
  }
})();

// ---------- Optional: subtle parallax on hero image ----------
(function initParallax() {
  const heroImg = document.querySelector(".hero-image");
  if (!heroImg) return;

  window.addEventListener("mousemove", (e) => {
    const r = heroImg.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / r.width;
    const dy = (e.clientY - cy) / r.height;
    heroImg.style.transform = `scale(1.02) translate(${dx * 10}px, ${dy * 10}px)`;
  });

  window.addEventListener("mouseleave", () => {
    heroImg.style.transform = "scale(1)";
  });
})();