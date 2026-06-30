/* ===== VMEDIA.JS ===== */

// Smooth scroll for navbar links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Mobile nav
const navToggle = document.getElementById('vNavToggle');
const navMobile = document.getElementById('vNavMobile');
if (navToggle) navToggle.addEventListener('click', () => navMobile.classList.toggle('open'));

// ===== Scrubber interaction =====
const scrubberTrack = document.getElementById('vScrubberTrack');
const scrubberFill = document.getElementById('vScrubberFill');
const scrubberThumb = document.getElementById('vScrubberThumb');
const timeCurrent = document.getElementById('vTimeCurrent');
const playBtn = document.getElementById('vPlayBtn');

const TOTAL_SECONDS = 42 * 60 + 10; // 42:10
let currentSeconds = 14 * 60 + 32;  // 14:32 (saved point)
let playing = false;
let playInterval = null;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function updateScrubber(percent) {
  scrubberFill.style.width = percent + '%';
  scrubberThumb.style.left = percent + '%';
  timeCurrent.textContent = formatTime((percent / 100) * TOTAL_SECONDS);
}

// Initial position (38% ~ matches saved marker)
updateScrubber((currentSeconds / TOTAL_SECONDS) * 100);

if (scrubberTrack) {
  scrubberTrack.addEventListener('click', (e) => {
    const rect = scrubberTrack.getBoundingClientRect();
    const percent = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    currentSeconds = (percent / 100) * TOTAL_SECONDS;
    updateScrubber(percent);
  });
}

if (playBtn) {
  playBtn.addEventListener('click', () => {
    playing = !playing;
    if (playing) {
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
      playInterval = setInterval(() => {
        currentSeconds = Math.min(TOTAL_SECONDS, currentSeconds + 1);
        updateScrubber((currentSeconds / TOTAL_SECONDS) * 100);
        if (currentSeconds >= TOTAL_SECONDS) {
          clearInterval(playInterval);
          playing = false;
          playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        }
      }, 100);
    } else {
      clearInterval(playInterval);
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
  });
}

// ===== Scroll reveal =====
const revealTargets = document.querySelectorAll('.v-section, .v-feature-card, .v-stat-card, .v-screenshot-frame');
revealTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'none';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealTargets.forEach(el => revealObserver.observe(el));