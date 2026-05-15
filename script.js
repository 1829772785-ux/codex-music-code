const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function imageLoads(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });
}

function setupHeaderAndNavigation() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelectorAll(".site-nav a, .hero-directory a, .brand");
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".site-nav a")];

  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  toggle?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
  );

  sections.forEach((section) => navObserver.observe(section));
}

function setupRevealAnimation() {
  const revealItems = document.querySelectorAll(".reveal");

  revealItems.forEach((item) => {
    const delay = item.dataset.delay;
    if (delay) item.style.setProperty("--delay", `${delay}ms`);
  });

  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

async function setupMediaFallbacks() {
  const imageBlocks = document.querySelectorAll("[data-media='image']");

  imageBlocks.forEach(async (block) => {
    const src = block.dataset.src;
    if (!src || !(await imageLoads(src))) {
      block.classList.add("missing");
    }
  });

  const audio = document.querySelector("audio[data-audio-candidates]");
  if (audio) {
    const candidates = audio.dataset.audioCandidates.split(",").map((item) => item.trim());
    let index = 0;

    function tryAudio() {
      if (index >= candidates.length) {
        audio.parentElement?.classList.add("is-missing");
        return;
      }
      audio.src = candidates[index];
      audio.load();
      index += 1;
    }

    audio.addEventListener("loadedmetadata", () => {
      audio.parentElement?.classList.remove("is-missing");
    });
    audio.addEventListener("error", tryAudio);
    tryAudio();
  }

  const video = document.querySelector("video[data-video-src]");
  if (video) {
    const videoSrc = video.dataset.videoSrc;
    const posterSrc = video.dataset.posterSrc;

    if (posterSrc && (await imageLoads(posterSrc))) {
      video.poster = posterSrc;
    }

    video.addEventListener("loadedmetadata", () => {
      video.parentElement?.classList.add("has-video");
      video.parentElement?.classList.remove("is-missing");
    });
    video.addEventListener("error", () => {
      video.parentElement?.classList.add("is-missing");
    });

    if (videoSrc) {
      video.src = videoSrc;
      video.load();
    } else {
      video.parentElement?.classList.add("is-missing");
    }
  }
}

function setupParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let animationFrame;
  const particles = [];

  function resize() {
    width = canvas.width = Math.floor(window.innerWidth * window.devicePixelRatio);
    height = canvas.height = Math.floor(window.innerHeight * window.devicePixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: (Math.random() * 2 + 0.6) * window.devicePixelRatio,
      speedX: (Math.random() - 0.5) * 0.2 * window.devicePixelRatio,
      speedY: (Math.random() * -0.24 - 0.04) * window.devicePixelRatio,
      alpha: Math.random() * 0.28 + 0.14
    };
  }

  function resetParticles() {
    particles.length = 0;
    const count = Math.min(82, Math.floor(window.innerWidth / 18));
    for (let index = 0; index < count; index += 1) {
      particles.push(createParticle());
    }
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.y < -16 || particle.x < -16 || particle.x > width + 16) {
        particles[index] = createParticle();
        particles[index].y = height + 12;
      }

      const gradient = context.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius * 5
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.alpha})`);
      gradient.addColorStop(0.58, `rgba(246, 223, 232, ${particle.alpha * 0.42})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius * 5, 0, Math.PI * 2);
      context.fill();
    });

    animationFrame = requestAnimationFrame(draw);
  }

  resize();
  resetParticles();
  draw();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resize();
    resetParticles();
    draw();
  });
}

setupHeaderAndNavigation();
setupRevealAnimation();
setupMediaFallbacks();
setupParticles();
