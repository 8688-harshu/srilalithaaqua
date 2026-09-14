(function () {
  'use strict';

  const preloader = document.getElementById('preloader');
  const preloaderCounter = document.getElementById('preloaderCounter');
  const preloaderBarFill = document.getElementById('preloaderBarFill');
  const preloaderStatusText = document.getElementById('preloaderStatusText');

  const statusMessages = [
    'INITIALIZING HYDRODYNAMICS',
    'CALIBRATING OXYGEN DISSOLUTION',
    'ALIGNING TURBINE GEOMETRY',
    'SYSTEM ONLINE'
  ];

  function runPreloader() {
    if (!preloader) {
      triggerLandingSequence();
      return;
    }

    let progress = 0;
    const duration = 1200; 
    const startTime = performance.now();

    function updateLoader(currentTime) {
      const elapsed = currentTime - startTime;
      progress = Math.min(Math.floor((elapsed / duration) * 100), 100);

      if (preloaderCounter) preloaderCounter.textContent = `${progress}%`;
      if (preloaderBarFill) preloaderBarFill.style.width = `${progress}%`;

      if (preloaderStatusText) {
        if (progress < 30) preloaderStatusText.textContent = statusMessages[0];
        else if (progress < 65) preloaderStatusText.textContent = statusMessages[1];
        else if (progress < 95) preloaderStatusText.textContent = statusMessages[2];
        else preloaderStatusText.textContent = statusMessages[3];
      }

      if (progress < 100) {
        requestAnimationFrame(updateLoader);
      } else {
        setTimeout(() => {
          preloader.classList.add('fade-out');
          triggerLandingSequence();
        }, 150);
      }
    }

    requestAnimationFrame(updateLoader);
  }

  function triggerLandingSequence() {
    document.body.classList.add('landing-active');

    animateMetricCounters();

    setTimeout(() => {
      document.body.classList.add('landing-settled');
    }, 1200);
  }

  function animateMetricCounters() {
    const counterElements = document.querySelectorAll('.stat-number[data-target]');
    counterElements.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-target'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1600;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeVal = 1 - (1 - progress) * (1 - progress);
        const currentVal = (target * easeVal).toFixed(decimals);

        if (decimals === 0 && target >= 1000) {
          el.textContent = `${Math.floor(target * easeVal).toLocaleString()}${suffix}`;
        } else {
          el.textContent = `${currentVal}${suffix}`;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          if (decimals === 0 && target >= 1000) {
            el.textContent = `${target.toLocaleString()}${suffix}`;
          } else {
            el.textContent = `${target.toFixed(decimals)}${suffix}`;
          }
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPreloader);
  } else {
    runPreloader();
  }

  const canvas = document.getElementById('heroWaveCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let step = 0;
    let mouseWaveAmp = 0;
    let targetMouseAmp = 0;

    function resizeCanvas() {
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = 130;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const heroSection = canvas.closest('.hero-section');
    if (heroSection) {
      heroSection.addEventListener('mousemove', () => {
        targetMouseAmp = 8;
      });
      heroSection.addEventListener('mouseleave', () => {
        targetMouseAmp = 0;
      });
    }

    function drawWave() {
      ctx.clearRect(0, 0, width, height);

      mouseWaveAmp += (targetMouseAmp - mouseWaveAmp) * 0.05;

      ctx.beginPath();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = 'rgba(0, 122, 255, 0.15)';
      ctx.fillStyle = 'rgba(0, 122, 255, 0.035)';

      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 10) {
        const y =
          Math.sin(x * 0.005 + step) * (14 + mouseWaveAmp) +
          Math.cos(x * 0.002 + step * 0.5) * 8 +
          height * 0.55;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.1)';
      ctx.fillStyle = 'rgba(14, 165, 233, 0.02)';

      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 10) {
        const y =
          Math.cos(x * 0.004 - step * 0.7) * (12 + mouseWaveAmp * 0.5) +
          Math.sin(x * 0.003 + step * 0.4) * 6 +
          height * 0.65;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      step += 0.014;
      requestAnimationFrame(drawWave);
    }
    drawWave();
  }

  const tiltCards = document.querySelectorAll('.hero-product-card, .product-card');

  tiltCards.forEach((card) => {
    let isHovering = false;

    card.addEventListener('mouseenter', () => {
      isHovering = true;
      card.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease';
    });

    card.addEventListener('mousemove', (e) => {
      if (!isHovering) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const maxTilt = 6; 
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      card.style.transition = 'transform 0.6s var(--ease-smooth), box-shadow 0.4s ease';
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  const fadeElements = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window && fadeElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    fadeElements.forEach((el) => observer.observe(el));
  } else {
    fadeElements.forEach((el) => el.classList.add('visible'));
  }

  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNavMenu = document.getElementById('mobileNavMenu');

  if (hamburgerBtn && mobileNavMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = hamburgerBtn.classList.toggle('open');
      mobileNavMenu.classList.toggle('open', isOpen);
    });

    mobileNavMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('open');
        mobileNavMenu.classList.remove('open');
      });
    });
  }

  const modal = document.getElementById('inquiryModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalProductInput = document.getElementById('modalProduct');
  const inquiryTriggers = document.querySelectorAll('.trigger-inquiry-btn');

  function openModal(productTitle = 'Aquaculture Engineering System') {
    if (!modal) return;
    if (modalProductInput) modalProductInput.value = productTitle;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  inquiryTriggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.getAttribute('data-product') || 'Aquaculture Equipment';
      openModal(product);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  const forms = document.querySelectorAll('form[data-ajax-form]');
  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';

      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="fas fa-check"></i> Request Received!';
          submitBtn.style.backgroundColor = 'var(--accent-green)';
        }
        form.reset();

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = '';
          }
          closeModal();
        }, 2000);
      }, 800);
    });
  });
})();
