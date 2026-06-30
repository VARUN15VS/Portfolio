/* ===== DB-SAVER.JS ===== */

// Mobile nav
const navToggle = document.getElementById('dNavToggle');
const navMobile = document.getElementById('dNavMobile');
if (navToggle) navToggle.addEventListener('click', () => navMobile.classList.toggle('open'));

// ===== Terminal backup sequence =====
const termBody = document.getElementById('dTermBody');
const pills = document.querySelectorAll('.d-pill');

const sequences = {
  MySQL: [
    { text: 'connecting to mysql://localhost:3306/app_db', type: 'info' },
    { text: 'authenticating user... done', type: 'ok' },
    { text: 'dumping tables: users, orders, sessions', type: '' },
    { text: 'compressing backup.sql → backup.sql.gz', type: '', bar: true },
    { text: 'verifying checksum... ✓ matched', type: 'ok' },
    { text: 'backup saved → /backups/mysql_2026-06-30.sql.gz', type: 'ok' },
  ],
  PostgreSQL: [
    { text: 'connecting to postgresql://localhost:5432/main', type: 'info' },
    { text: 'authenticating role "admin"... done', type: 'ok' },
    { text: 'running pg_dump --format=custom', type: '' },
    { text: 'compressing backup.dump', type: '', bar: true },
    { text: 'verifying checksum... ✓ matched', type: 'ok' },
    { text: 'backup saved → /backups/pg_2026-06-30.dump', type: 'ok' },
  ],
  SQLite: [
    { text: 'locating local database file app.db', type: 'info' },
    { text: 'acquiring read lock... done', type: 'ok' },
    { text: 'copying database file (4.2 MB)', type: '' },
    { text: 'compressing app.db → app.db.gz', type: '', bar: true },
    { text: 'verifying checksum... ✓ matched', type: 'ok' },
    { text: 'backup saved → /backups/sqlite_2026-06-30.db.gz', type: 'ok' },
  ],
  MongoDB: [
    { text: 'connecting to mongodb://localhost:27017', type: 'info' },
    { text: 'authenticating... done', type: 'ok' },
    { text: 'running mongodump on 6 collections', type: '' },
    { text: 'compressing dump → dump.archive.gz', type: '', bar: true },
    { text: 'verifying checksum... ✓ matched', type: 'ok' },
    { text: 'backup saved → /backups/mongo_2026-06-30.archive.gz', type: 'ok' },
  ],
};

const engineOrder = ['MySQL', 'PostgreSQL', 'SQLite', 'MongoDB'];
let engineIdx = 0;
let running = false;

function setActivePill(name) {
  pills.forEach(p => p.classList.toggle('active', p.dataset.engine === name));
}

function renderLine(line, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      const el = document.createElement('span');
      el.className = `d-line ${line.type || ''}`;

      if (line.bar) {
        el.innerHTML = `<span class="d-prompt">$</span>${line.text}<span class="d-bar-track"><span class="d-bar-fill"></span></span>`;
        termBody.appendChild(el);
        const fill = el.querySelector('.d-bar-fill');
        requestAnimationFrame(() => { fill.style.width = '100%'; });
      } else {
        el.innerHTML = `<span class="d-prompt">$</span>${line.text}`;
        termBody.appendChild(el);
      }

      termBody.scrollTop = termBody.scrollHeight;
      resolve();
    }, delay);
  });
}

async function runSequence() {
  if (running) return;
  running = true;

  const engineName = engineOrder[engineIdx % engineOrder.length];
  engineIdx++;

  setActivePill(engineName);
  termBody.innerHTML = '';

  const lines = sequences[engineName];
  for (let i = 0; i < lines.length; i++) {
    await renderLine(lines[i], i === 0 ? 100 : 450);
  }

  // hold, then move to next engine
  setTimeout(() => {
    running = false;
    runSequence();
  }, 2600);
}

const termObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    runSequence();
    termObserver.disconnect();
  }
}, { threshold: 0.3 });

const terminalEl = document.getElementById('dTerminal');
if (terminalEl) termObserver.observe(terminalEl);

// ===== Scroll reveal for sections =====
const revealTargets = document.querySelectorAll('.d-section, .d-feature-card, .d-engine-card, .d-stat-card');
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