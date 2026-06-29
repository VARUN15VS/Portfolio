/* ===== BULLION.JS ===== */

// Year
document.getElementById('yr').textContent = new Date().getFullYear();

// Mobile nav
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
navToggle.addEventListener('click', () => navMobile.classList.toggle('open'));

// Scroll reveal
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== COUNTER: scan count =====
function animateCounter(el, target, duration) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}
const scanCountEl = document.getElementById('scanCount');
const counterObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    animateCounter(scanCountEl, 48, 1800);
    counterObs.disconnect();
  }
}, { threshold: 0.3 });
counterObs.observe(scanCountEl);

// ===== CANDLESTICK CHART ANIMATION =====
const chartCanvas = document.getElementById('chartCanvas');
const signalOverlay = document.getElementById('signalOverlay');
const tradeLevels = document.getElementById('tradeLevels');
const scanLog = document.getElementById('scanLog');
const termStatus = document.getElementById('termStatus');
const tlBuy = document.getElementById('tlBuy');
const tlSL = document.getElementById('tlSL');
const tlTgt = document.getElementById('tlTgt');

// Generate realistic-ish OHLC data
function generateCandles(n) {
  const candles = [];
  let price = 2840;
  for (let i = 0; i < n; i++) {
    const move = (Math.random() - 0.48) * 35;
    const open = price;
    const close = price + move;
    const high = Math.max(open, close) + Math.random() * 18;
    const low  = Math.min(open, close) - Math.random() * 18;
    candles.push({ open, close, high, low });
    price = close;
  }
  return candles;
}

// Last candle is Shooting Star: small body near bottom, long upper wick
function makeShootingStar(prevClose) {
  const open  = prevClose + 8;
  const close = open + 4;       // tiny body
  const high  = open + 60;      // very long upper wick
  const low   = open - 5;
  return { open, close, high, low, signal: true };
}

function renderChart(candles) {
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 1;
  const H = 130; // chart height px

  chartCanvas.innerHTML = '';

  candles.forEach((c, i) => {
    const isUp = c.close >= c.open;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `display:flex;flex-direction:column;align-items:center;flex:1;position:relative;height:${H}px;`;

    const topWick  = document.createElement('div');
    const body     = document.createElement('div');
    const botWick  = document.createElement('div');

    const topGap   = ((maxP - c.high)  / range) * H;
    const wickTop  = ((c.high - Math.max(c.open, c.close)) / range) * H;
    const bodyH    = (Math.abs(c.close - c.open) / range) * H || 3;
    const wickBot  = ((Math.min(c.open, c.close) - c.low) / range) * H;

    topWick.style.cssText = `height:${topGap + wickTop}px;width:1px;background:rgba(255,255,255,0.2);flex-shrink:0;`;
    body.style.cssText    = `width:80%;height:${bodyH}px;border-radius:2px;background:${isUp ? '#22c55e' : '#ef4444'};flex-shrink:0;${c.signal ? 'box-shadow:0 0 10px #d4af37;background:#d4af37;' : ''}`;
    botWick.style.cssText = `height:${wickBot}px;width:1px;background:rgba(255,255,255,0.2);flex-shrink:0;`;

    wrapper.appendChild(topWick);
    wrapper.appendChild(body);
    wrapper.appendChild(botWick);
    wrapper.style.justifyContent = 'flex-start';
    wrapper.style.paddingTop = '0';

    // delay each candle
    wrapper.style.opacity = '0';
    wrapper.style.transition = `opacity 0.25s ease ${i * 55}ms`;
    chartCanvas.appendChild(wrapper);
    setTimeout(() => { wrapper.style.opacity = '1'; }, 20 + i * 55);
  });
}

// Scan log lines
const stocks = ['RELIANCE','HDFC','TCS','INFY','WIPRO','ICICIBANK','BAJFINANCE','SBIN','LT','MARUTI','NIFTY50','ONGC','ADANI','HUL','ITC'];
let logLines = 0;
function addLog(text, cls) {
  if (logLines > 4) scanLog.removeChild(scanLog.firstChild);
  const line = document.createElement('div');
  line.className = `log-line ${cls}`;
  line.textContent = text;
  scanLog.appendChild(line);
  logLines++;
}

// Main animation sequence
let animationDone = false;

function runScanAnimation() {
  if (animationDone) return;
  animationDone = true;

  const candles = generateCandles(17);
  const star = makeShootingStar(candles[candles.length - 1].close);
  candles.push(star);

  renderChart(candles);
  termStatus.textContent = '● SCANNING';
  termStatus.style.color = '#22c55e';

  // Scan log simulation
  const scanStocks = [...stocks].sort(() => Math.random() - 0.5).slice(0, 10);
  let idx = 0;
  const logInterval = setInterval(() => {
    if (idx < scanStocks.length - 1) {
      addLog(`[SCAN] ${scanStocks[idx].padEnd(12)} → no match`, 'skip');
    } else {
      addLog(`[MATCH] RELIANCE → Shooting Star confirmed ✓`, 'match');
      clearInterval(logInterval);

      // After scan, show signal overlay
      setTimeout(() => {
        signalOverlay.style.display = 'flex';
        termStatus.textContent = '● SIGNAL';
        termStatus.style.color = '#d4af37';

        // Reveal trade levels
        setTimeout(() => {
          tlBuy.textContent = '₹2,872';
          tlSL.textContent  = '₹2,835';
          tlTgt.textContent = '₹2,958';
          tradeLevels.style.opacity = '1';
        }, 600);

        // After showing, reset after 5s
        setTimeout(() => {
          signalOverlay.style.display = 'none';
          tradeLevels.style.opacity = '0';
          tlBuy.textContent = '—';
          tlSL.textContent  = '—';
          tlTgt.textContent = '—';
          termStatus.textContent = '● SCANNING';
          termStatus.style.color = '#22c55e';
          scanLog.innerHTML = '';
          logLines = 0;
          animationDone = false;
          setTimeout(runScanAnimation, 800);
        }, 4500);

      }, 500);
    }
    idx++;
  }, 260);
}

// Trigger when terminal enters view
const termObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    setTimeout(runScanAnimation, 600);
    termObs.disconnect();
  }
}, { threshold: 0.3 });
termObs.observe(document.getElementById('heroTerminal'));