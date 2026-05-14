const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupSmoothScroll() {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  navToggle?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId?.startsWith("#")) return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      navLinks?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });
}

function setupRevealAnimation() {
  const revealItems = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -70px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupActiveNav() {
  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...document.querySelectorAll(".nav-links a")];

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { threshold: 0.42 }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupMediaFallbacks() {
  document.querySelectorAll("[data-fallback-image]").forEach((image) => {
    if (image.complete && image.naturalWidth === 0) image.classList.add("is-missing");
    image.addEventListener("error", () => image.classList.add("is-missing"));
    image.addEventListener("load", () => image.classList.remove("is-missing"));
  });

  const audioCard = document.querySelector("[data-audio-player]");
  const audio = audioCard?.querySelector("audio");
  audio?.addEventListener("error", () => audioCard.classList.add("is-missing"));
  audio?.addEventListener("loadedmetadata", () => audioCard.classList.remove("is-missing"));

  const videoCard = document.querySelector("[data-video-player]");
  const video = videoCard?.querySelector("video");
  video?.addEventListener("error", () => video.classList.add("is-missing"));
  video?.addEventListener("loadedmetadata", () => video.classList.remove("is-missing"));
}

function setupParticles() {
  const canvas = document.getElementById("particle-canvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context || prefersReducedMotion) return;

  let width = 0;
  let height = 0;
  let particles = [];
  const palette = ["rgba(255, 196, 220, .72)", "rgba(182, 204, 232, .64)", "rgba(244, 223, 171, .54)", "rgba(255,255,255,.82)"];

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(78, Math.max(34, Math.floor(width / 18)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.4 + 0.7,
      speed: Math.random() * 0.28 + 0.08,
      drift: (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.55 + 0.18,
      color: palette[Math.floor(Math.random() * palette.length)],
    }));
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
      particle.y -= particle.speed;
      particle.x += particle.drift;

      if (particle.y < -10) particle.y = height + 10;
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;

      context.globalAlpha = particle.alpha;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = particle.color;
      context.shadowBlur = 12;
      context.shadowColor = particle.color;
      context.fill();
    });
    context.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
}

setupSmoothScroll();
setupRevealAnimation();
setupActiveNav();
setupMediaFallbacks();
setupParticles();
