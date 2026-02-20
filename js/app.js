document.documentElement.classList.add("js");

// ===== Footer year =====
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Safe email link (prevents simple bot scraping) =====
(() => {
  const emailBtn = document.getElementById("emailBtn");
  if (!emailBtn) return;

  const user = "Mikeebrownn";
  const domain = "hotmail.com";
  const email = `${user}@${domain}`;

  emailBtn.href = `mailto:${email}`;
})();

// ===== Matrix (Hero + Photo overlay) =====
(() => {
  const heroCanvas = document.getElementById("Matrix");
  const photoCanvas = document.getElementById("MatrixPhoto");

  if (!heroCanvas && !photoCanvas) return;

  const katakana =
    "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ";
  const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const alphabet = katakana + latin + nums;

  const fontSize = 16;
  const targets = [];

  function createTarget(canvasEl, sizeFromEl) {
    const ctx = canvasEl.getContext("2d", { alpha: true });

    const state = {
      canvas: canvasEl,
      ctx,
      columns: 0,
      drops: [],
      w: 0,
      h: 0,
      sizeFromEl,
    };

    function resize() {
      const rect = (sizeFromEl || canvasEl).getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));

      const dpr = window.devicePixelRatio || 1;
      canvasEl.width = Math.floor(w * dpr);
      canvasEl.height = Math.floor(h * dpr);
      canvasEl.style.width = w + "px";
      canvasEl.style.height = h + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      state.w = w;
      state.h = h;
      state.columns = Math.max(1, Math.floor(w / fontSize));
      state.drops = Array(state.columns).fill(1);
    }

    resize();
    state.resize = resize;
    return state;
  }

  if (heroCanvas) {
    const heroEl = document.querySelector(".hero");
    targets.push(createTarget(heroCanvas, heroEl || heroCanvas));
  }

  if (photoCanvas) {
    const photoBox = photoCanvas.parentElement || photoCanvas;
    targets.push(createTarget(photoCanvas, photoBox));
  }

  window.addEventListener("resize", () => {
    targets.forEach((t) => t.resize());
  });

  let last = 0;
  const fps = 28;
  const frameDelay = 1000 / fps;

  function draw(now) {
    if (now - last < frameDelay) {
      requestAnimationFrame(draw);
      return;
    }
    last = now;

    for (const t of targets) {
      const { ctx, w, h, drops, columns } = t;

      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "rgba(255, 91, 74, 0.85)";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < columns; i++) {
        const char = alphabet.charAt(
          Math.floor(Math.random() * alphabet.length)
        );
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();

// ===== Scroll reveal (sections + blocks + staggered grids) =====
(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // 1) Simple reveal for non-grid reveal blocks
  const revealEls = document.querySelectorAll(".reveal:not(.grid)");
  if (revealEls.length) {
    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      revealEls.forEach((el) => io.observe(el));
    }
  }

  // 2) Staggered cards for .grid.reveal
  const revealGrids = document.querySelectorAll(".grid.reveal");
  if (revealGrids.length) {
    if (prefersReducedMotion) {
      revealGrids.forEach((grid) => {
        grid.classList.add("revealed");
        grid.querySelectorAll(".card").forEach((c) => c.classList.add("active"));
      });
    } else {
      const gridIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;

            const grid = e.target;
            grid.classList.add("revealed");

            const cards = Array.from(grid.querySelectorAll(".card"));
            cards.forEach((card, idx) => {
              setTimeout(() => card.classList.add("active"), 90 * idx);
            });

            gridIO.unobserve(grid);
          });
        },
        { threshold: 0.15 }
      );

      revealGrids.forEach((grid) => gridIO.observe(grid));
    }
  }
})();
