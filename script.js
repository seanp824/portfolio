/* Scroll choreography. Everything degrades: without JS the page is
   fully readable, and prefers-reduced-motion disables all movement. */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.body.classList.add("is-ready");

  /* ---------- intro sequence ---------- */
  /* The overlay markup lives in index.html; an inline script there
     already removed it for repeat visits and reduced motion. Here we
     just lock scroll while it plays and tear it down when it ends. */

  const intro = document.getElementById("intro");

  if (intro) {
    document.body.classList.add("intro-lock");
    // The zoom hands off to the hero, so the page must be at the top.
    window.scrollTo(0, 0);

    const finishIntro = () => {
      if (!intro.isConnected) return;
      intro.remove();
      document.body.classList.remove("intro-lock");
      try {
        sessionStorage.setItem("introPlayed", "1");
      } catch (e) {
        /* private browsing: the intro will just replay next visit */
      }
    };

    intro.addEventListener("animationend", (e) => {
      if (e.target === intro) finishIntro();
    });

    intro.querySelector(".intro-skip").addEventListener("click", finishIntro);

    document.addEventListener("keydown", function onEsc(e) {
      if (e.key === "Escape") {
        finishIntro();
        document.removeEventListener("keydown", onEsc);
      }
    });

    // Dev helper: ?introat=2500 freezes the intro at that millisecond
    // so individual frames can be inspected and tuned.
    const scrubMs = Number(
      new URLSearchParams(location.search).get("introat")
    );
    if (scrubMs > 0) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          document.getAnimations().forEach((a) => {
            if (intro.contains(a.effect.target)) {
              a.pause();
              a.currentTime = scrubMs;
            }
          });
        })
      );
    }
  }

  /* ---------- reveal on scroll ---------- */

  const revealTargets = document.querySelectorAll(".reveal, .reveal-media");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  } else {
    // Stagger siblings that enter together: each .reveal inherits a small
    // delay based on its order within its parent.
    document
      .querySelectorAll(".study-narrative, .about-prose, .contact")
      .forEach((group) => {
        [...group.querySelectorAll(".reveal")].forEach((el, i) => {
          el.style.setProperty("--stagger", `${i * 110}ms`);
        });
      });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }

  /* ---------- nav border + scroll progress + hero drift ---------- */

  const nav = document.querySelector("[data-nav]");
  const progressBar = document.querySelector(".progress span");
  const heroLines = document.querySelectorAll(".hero-line");
  const heroPortrait = document.querySelector("[data-portrait]");
  const hero = document.querySelector("[data-hero]");

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const y = window.scrollY;

      nav.classList.toggle("is-scrolled", y > 24);

      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

      if (!reducedMotion && hero) {
        // The two hero lines part horizontally and lift as you scroll
        // away, handing the eye to the positioning line below.
        const progress = Math.min(y / window.innerHeight, 1);
        heroLines.forEach((line) => {
          const dir = Number(line.dataset.drift) || 1;
          line.style.transform = `translate3d(${dir * progress * 6}vw, ${
            -progress * 40
          }px, 0)`;
          line.style.opacity = String(1 - progress * 0.7);
        });

        if (heroPortrait) {
          // Lags the scroll slightly, straightening as it lifts away.
          // The leading translate matches the CSS centering offset.
          heroPortrait.style.transform = `translate(-50%, -54%) translate3d(0, ${
            progress * 70
          }px, 0) rotate(${-2 + progress * 2}deg)`;
          heroPortrait.style.opacity = String(1 - progress * 0.9);
        }
      }

      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- cursor-following glow in the hero ---------- */

  if (!reducedMotion && hero && window.matchMedia("(pointer: fine)").matches) {
    const glow = hero.querySelector("[data-cursor-glow]");
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let glowRaf = null;

    const lerpLoop = () => {
      pos.x += (target.x - pos.x) * 0.07;
      pos.y += (target.y - pos.y) * 0.07;
      glow.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      if (
        Math.abs(target.x - pos.x) > 0.5 ||
        Math.abs(target.y - pos.y) > 0.5
      ) {
        glowRaf = requestAnimationFrame(lerpLoop);
      } else {
        glowRaf = null;
      }
    };

    hero.addEventListener("pointermove", (e) => {
      const rect = hero.getBoundingClientRect();
      target.x = e.clientX - rect.left - glow.offsetWidth / 2;
      target.y = e.clientY - rect.top - glow.offsetHeight / 2;
      document.body.classList.add("has-pointer");
      if (glowRaf === null) glowRaf = requestAnimationFrame(lerpLoop);
    });

    hero.addEventListener("pointerleave", () => {
      document.body.classList.remove("has-pointer");
    });
  }
})();
