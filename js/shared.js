/* ============================================================
   HONEY. — SHARED JS UTILITIES
   Lenis smooth scroll + GSAP + SplitType orchestration
   ============================================================ */

/* --- Lenis + GSAP integration --- */
function initLenis() {
  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    syncTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/* --- Nav scroll behavior --- */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  ScrollTrigger.create({
    start: '80px top',
    onEnter: () => nav.classList.add('is-scrolled'),
    onLeaveBack: () => nav.classList.remove('is-scrolled'),
  });
}

/* --- SplitType word reveals (Sugar's data-scroll-animation="words") --- */
function initTextReveals() {
  const splitEls = document.querySelectorAll('[data-split]');
  if (!splitEls.length || typeof SplitType === 'undefined') return;

  splitEls.forEach((el) => {
    const type  = el.dataset.split  || 'words';
    const delay = parseFloat(el.dataset.splitDelay || 0);
    const stag  = parseFloat(el.dataset.splitStagger || 0.055);

    const split = new SplitType(el, { types: type });
    const targets = type === 'chars' ? split.chars : split.words;

    gsap.set(targets, { yPercent: 115, rotate: 0.001, opacity: 0 });

    ScrollTrigger.create({
      trigger: el,
      start: '0% 82%',
      once: true,
      onEnter() {
        gsap.to(targets, {
          yPercent: 0,
          rotate: 0.001,
          opacity: 1,
          ease: 'expo.out',
          duration: 0.9,
          stagger: stag,
          delay,
          clearProps: 'yPercent,rotate',
        });
      },
    });
  });
}

/* --- Fade / slide reveals --- */
function initRevealAnimations() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  els.forEach((el) => {
    const delay = parseFloat(el.dataset.revealDelay || 0);
    const dur   = parseFloat(el.dataset.revealDur   || 0.75);

    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter() {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          ease: 'expo.out',
          duration: dur,
          delay,
          onComplete() {
            // Remove the attribute so CSS initial-state rules (opacity:0,
            // translateY etc.) can never re-apply after animation.
            el.removeAttribute('data-reveal');
            gsap.set(el, { clearProps: 'all' });
          },
        });
      },
    });
  });
}

/* --- Parallax (Sugar's data-parallax-strength) --- */
function initParallax() {
  const els = document.querySelectorAll('[data-parallax]');
  if (!els.length) return;

  els.forEach((el) => {
    const strength = parseFloat(el.dataset.parallax || 25);

    gsap.to(el, {
      yPercent: strength,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement || el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/* --- 3D mouse tilt (Sugar's data-3d-card-effect) --- */
function initTilt() {
  const cards = document.querySelectorAll('[data-tilt]');
  if (!cards.length) return;

  const isMobile = window.innerWidth < 768;
  if (isMobile) return;

  cards.forEach((card) => {
    const intensity = parseFloat(card.dataset.tiltIntensity || 15);
    // Track current values for smooth tween-back
    const state = { rx: 0, ry: 0 };

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      state.rx   = ((e.clientY - cy) / (rect.height / 2)) * -intensity;
      state.ry   = ((e.clientX - cx) / (rect.width  / 2)) *  intensity;
      card.style.setProperty('--rx', `${state.rx}deg`);
      card.style.setProperty('--ry', `${state.ry}deg`);
    });

    card.addEventListener('mouseleave', () => {
      // Use gsap tween on a plain object + onUpdate to avoid CSS-var string issues
      gsap.to(state, {
        rx: 0,
        ry: 0,
        duration: 0.7,
        ease: 'expo.out',
        onUpdate() {
          card.style.setProperty('--rx', `${state.rx}deg`);
          card.style.setProperty('--ry', `${state.ry}deg`);
        },
      });
    });
  });
}

/* --- Infinite ticker: wrap both copies in .ticker-track so one animation drives the loop --- */
function initTicker() {
  document.querySelectorAll('.ticker-inner').forEach((inner) => {
    const wrap = inner.parentElement; // .ticker-wrap

    // Create a track container that will be animated
    const track = document.createElement('div');
    track.className = 'ticker-track';

    // Move the original inner into the track, then add an identical clone beside it
    wrap.appendChild(track);
    track.appendChild(inner);
    track.appendChild(inner.cloneNode(true));
  });
}

/* --- Floating pill idle float animation --- */
function initFloatingPills() {
  const pills = document.querySelectorAll('[data-float]');
  pills.forEach((pill, i) => {
    const amplitude = parseFloat(pill.dataset.float || 8);
    const delay     = i * 0.3;

    gsap.to(pill, {
      y: -amplitude,
      duration: 1.8 + i * 0.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay,
    });
  });
}

/* --- Quiz logic (shared across concepts) --- */
function initQuiz() {
  const quiz = document.querySelector('[data-quiz]');
  if (!quiz) return;

  const questions  = quiz.querySelectorAll('.quiz-question');
  const resultEl   = quiz.querySelector('.quiz-result');
  const resultTier = quiz.querySelector('.quiz-result-tier');
  const resultText = quiz.querySelector('.quiz-result-text');
  const resultRingScore = quiz.querySelector('.ring-score');
  const resultRingFill  = quiz.querySelector('.ring-fill');
  const restartBtn      = quiz.querySelector('[data-quiz-restart]');

  const tiers = [
    { name: 'Raw Honey', emoji: '🐝', text: "You're at the start — and that's exactly the right place to be." },
    { name: 'Golden',    emoji: '🌟', text: "You've got the intention. What's been missing is the right people watching." },
    { name: 'Dripping',  emoji: '🍯', text: "You're closer than you think." },
    { name: 'Pure Gold', emoji: '👑', text: 'You already live it. Now make it visible.' },
  ];

  let score       = 0;
  let currentQ    = 0;
  const maxScore  = 5; // Q1: 0-2, Q2: 0-2, Q3: 0-1 → max 5

  function selectAnswer(btn) {
    const val = parseInt(btn.dataset.value || 0);
    score += val;
    currentQ++;

    // Hide current, show next
    const current = questions[currentQ - 1];
    current.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);

    gsap.to(current, { opacity: 0, y: -20, duration: 0.35, ease: 'expo.in', onComplete() {
      current.style.display = 'none';

      if (currentQ < questions.length) {
        const next = questions[currentQ];
        next.style.display = 'flex';
        gsap.fromTo(next, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' });
      } else {
        showResult();
      }
    }});
  }

  function showResult() {
    const idx   = Math.min(Math.floor(score / (maxScore + 0.01) * tiers.length), tiers.length - 1);
    const tier  = tiers[idx];

    resultTier.textContent = tier.name;
    resultText.textContent = tier.text;

    // Animate score ring
    const scorePct = Math.round(score / maxScore * 100);
    const circumference = 326.7; // 2 * π * 52

    if (resultRingFill) {
      const offset = circumference * (1 - scorePct / 100);
      gsap.fromTo(resultRingFill,
        { strokeDashoffset: circumference },
        { strokeDashoffset: offset, duration: 1.4, ease: 'power2.out', delay: 0.25 }
      );
    }

    if (resultRingScore) {
      const counter = { val: 0 };
      gsap.to(counter, {
        val: scorePct,
        duration: 1.4,
        ease: 'power2.out',
        delay: 0.25,
        onUpdate() { resultRingScore.textContent = Math.round(counter.val); },
      });
    }

    resultEl.style.display = 'flex';
    gsap.fromTo(resultEl,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)' }
    );
  }

  quiz.querySelectorAll('.quiz-option').forEach((btn) => {
    btn.addEventListener('click', () => selectAnswer(btn));
  });

  // Email form submit
  const emailForm    = quiz.querySelector('.quiz-email-form');
  const emailSuccess = quiz.querySelector('.quiz-email-success');
  if (emailForm) {
    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = emailForm.querySelector('.quiz-email-input');
      if (!input || !input.value) return;

      gsap.to(emailForm, {
        opacity: 0, y: -8, duration: 0.3, ease: 'expo.in',
        onComplete() {
          emailForm.style.display = 'none';
          if (emailSuccess) {
            emailSuccess.style.display = 'flex';
            gsap.fromTo(emailSuccess,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }
            );
          }
        },
      });
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      score    = 0;
      currentQ = 0;
      resultEl.style.display = 'none';
      // Reset email form
      if (emailForm) { emailForm.style.display = 'flex'; gsap.set(emailForm, { opacity: 1, y: 0 }); emailForm.reset(); }
      if (emailSuccess) emailSuccess.style.display = 'none';
      questions.forEach((q, i) => {
        q.querySelectorAll('.quiz-option').forEach(b => b.disabled = false);
        q.style.display = i === 0 ? 'flex' : 'none';
        gsap.set(q, { opacity: 1, y: 0 });
      });
    });
  }

  // Init — show only first question
  questions.forEach((q, i) => {
    q.style.display = i === 0 ? 'flex' : 'none';
  });
}

/* --- Boot --- */
function bootShared() {
  gsap.registerPlugin(ScrollTrigger);

  initLenis();
  initNav();
  initTextReveals();
  initRevealAnimations();
  initParallax();
  initTilt();
  initTicker();
  initFloatingPills();
  initQuiz();
}

// Run after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootShared);
} else {
  bootShared();
}
