// =============================================
//  さくがえ  画面と操作
// =============================================
(function () {
  const C = SK.CONFIG, L = C.LANES, R = C.ROWS;
  const $ = id => document.getElementById(id);
  const cv = $('board'), g2 = cv.getContext('2d');
  let game = null, cpu = null, level = 'normal', cs = 40, ox = 0, oy = 0, HW = 0, CH = 0, dpr = 1;
  let selMine = -1, selOpp = -1, fx = [], floats = [], shake = 0, flashRows = null, swapAnim = null, lastCoins = [0, 0], aim = -1, aimDown = false;
  const GOLD = '#f5b800';
  const lineOf = row => row >= C.HALF ? row + 1 : row;
  const BLUE = '#3b82f6', RED = '#ef4444', INK = '#3b2a20', WOOD = '#a86a32', WOOD_L = '#d9a066';

  function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); }
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.tm); toast.tm = setTimeout(() => el.classList.remove('show'), 1400); }

  // ---------- 音 ----------
  let actx = null;
  function beep(f, d, type = 'triangle', v = 0.07, delay = 0, f2) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const t = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + 0.02);
    } catch (e) {}
  }
  const snd = { spawn: () => beep(520, 0.08, 'triangle', 0.06, 0, 760), place: () => beep(300, 0.07, 'square', 0.05), brk: () => beep(420, 0.1, 'square', 0.05, 0, 200), clash: () => beep(900, 0.12, 'sine', 0.07, 0, 300),
    hit: () => { beep(160, 0.3, 'sawtooth', 0.09, 0, 60); }, hurt: () => { beep(120, 0.4, 'sawtooth', 0.11, 0, 40); }, swap: () => [392, 523, 659].forEach((f, i) => beep(f, 0.14, 'triangle', 0.07, i * 0.07)),
    turn: () => [784, 988].forEach((f, i) => beep(f, 0.12, 'sine', 0.06, i * 0.1)), no: () => beep(180, 0.12, 'square', 0.05),
    win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.22, 'triangle', 0.08, i * 0.11)), lose: () => [392, 330, 262].forEach((f, i) => beep(f, 0.3, 'triangle', 0.08, i * 0.16)) };

  // ---------- 大きさ ----------
  function layout() {
    const wrap = cv.parentElement, w = Math.min(wrap.clientWidth, 620), h = wrap.clientHeight;
    cs = Math.max(24, Math.floor(Math.min(w / (L + 1.25), h / (R + 2.1))));
    HW = Math.round(cs * 1.15); CH = Math.round(cs * 1.0);
    const W = cs * L + HW + 6, H = cs * R + CH * 2;
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ox = 3; oy = CH;
  }
  window.addEventListener('resize', () => { if (game) layout(); });

  // ---------- はじめる ----------
  function start(lv) {
    level = lv; game = new SK.Game(); cpu = new SK.Cpu(game, 1, lv);
    $('name1').textContent = 'CPU（' + { easy: 'よわい', normal: 'ふつう', hard: 'つよい' }[lv] + '）';
    selMine = selOpp = -1; fx = []; floats = []; swapAnim = null; flashRows = null; aim = -1; aimDown = false; shake = 0; lastCoins = [C.COINS, C.COINS];
    $('ov-result').classList.remove('show');
    show('game'); layout(); hud();
  }
  document.querySelectorAll('.btn.lv').forEach(b => b.addEventListener('click', () => start(b.dataset.level)));
  $('btn-again').onclick = () => start(level);
  $('btn-title').onclick = () => { game = null; $('ov-result').classList.remove('show'); show('title'); };
  $('btn-quit').onclick = () => { game = null; show('title'); };
  $('btn-howto').onclick = () => $('ov-howto').classList.add('show');
  $('btn-howto-close').onclick = () => $('ov-howto').classList.remove('show');

  function hud() {
    for (const p of [0, 1]) {
      const el = $('hp' + p);
      if (el.children.length !== C.HP) { el.innerHTML = ''; for (let i = 0; i < C.HP; i++) el.appendChild(document.createElement('i')); }
      [...el.children].forEach((d, i) => d.classList.toggle('on', i < game.hp[p]));
      const c = $('coin' + p);
      if (game.coins[p] !== lastCoins[p]) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); lastCoins[p] = game.coins[p]; }
      c.textContent = game.coins[p];
    }
    const st = $('status'), t = game.swapTurn;
    if (game.pending) {
      const left = Math.max(1, Math.ceil(game.pending.at - game.time));
      st.textContent = `${game.pending.owner === 0 ? 'あなた' : '相手'}の入れかえ！ 光る2列が あと${left}秒で入れかわる`;
      st.className = 'status ' + (game.pending.owner === 0 ? 'mine' : 'theirs');
    } else if (game.canSwap(0)) {
      const left = Math.ceil(t.until - game.time);
      st.textContent = (selMine < 0 && selOpp < 0 ? '入れかえできる！ 自分の列と相手の列をタップ' : selMine < 0 ? '自分の列をえらんでね' : selOpp < 0 ? '相手の列をえらんでね' : '') + `（あと${left}秒）`;
      st.className = 'status mine';
    } else if (t && t.owner === 1 && !t.used) { st.textContent = '相手が、入れかえをねらっている…'; st.className = 'status theirs'; }
    else { const left = Math.max(0, Math.ceil(game.nextSwapAt - game.time)); st.textContent = left <= 3 ? `まもなく ${game.swapOwner === 0 ? 'あなた' : '相手'}の入れかえの番！ あと${left}秒` : `つぎの入れかえまで ${left}秒（${game.swapOwner === 0 ? 'あなた' : '相手'}の番）`; st.className = 'status' + (left <= 3 ? ' soon' : ''); }
  }

  // ---------- 操作 ----------
  cv.addEventListener('contextmenu', e => e.preventDefault());
  function pos(e) { const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; return { px, py, gx: (px - ox) / cs, gy: (py - oy) / cs }; }
  function laneAt(p) { const x = Math.floor(p.gx); return p.gy >= R && x >= 0 && x < L ? x : -1; }
  function pickRow(y) {
    if (y < 0 || y >= R) return;
    if (!game.canSwap(0)) { snd.no(); toast(game.pending ? '入れかえの準備中…' : 'いまは入れかえできません'); return; }
    if (y >= C.HALF) selMine = selMine === R - 1 - y ? -1 : R - 1 - y; else selOpp = selOpp === y ? -1 : y;
    beep(660, 0.05);
    if (selMine >= 0 && selOpp >= 0) { game.swap(0, selMine, selOpp); selMine = selOpp = -1; }
  }
  cv.addEventListener('pointerdown', e => {
    if (!game || game.over) return;
    e.preventDefault();
    const p = pos(e), { px, gx, gy } = p;
    // 右はしの ⇄ ：入れかえる列をえらぶ
    if (px > ox + cs * L) { pickRow(Math.floor(gy)); return; }
    // 下の城：押しているあいだ道すじが見えて、はなすと兵士が出る
    if (gy >= R) { aim = laneAt(p); aimDown = aim >= 0; if (aimDown) try { cv.setPointerCapture(e.pointerId); } catch (er) {} return; }
    if (gy < 0) return;
    const swapOn = game.canSwap(0);
    // 入れかえの番：相手の陣地はどこを押しても列えらび
    if (swapOn && gy < C.HALF) { pickRow(Math.floor(gy)); return; }
    // 線の近く：柵を置く／こわす
    const kx = Math.round(gx), ky = Math.round(gy), dx = Math.abs(gx - kx), dy = Math.abs(gy - ky);
    const th = swapOn ? 0.27 : 0.36;
    let type, a, b;
    if (dy <= dx) { type = 'H'; a = ky; b = Math.floor(gx); if (dy > th) { if (swapOn) pickRow(Math.floor(gy)); return; } }
    else { type = 'V'; a = Math.floor(gy); b = kx; if (dx > th) { if (swapOn) pickRow(Math.floor(gy)); return; } }
    if (b < 0 || (type === 'H' && b >= L)) return;
    if (!game.canEdit(0, type, a, b)) { if (swapOn && type === 'V') { pickRow(Math.floor(gy)); return; } if (gy < C.HALF) { snd.no(); toast('柵を置けるのは、自分の陣地（下半分）だけ'); } return; }
    game.toggleFence(0, type, a, b);
  });
  cv.addEventListener('pointermove', e => { if (!game || game.over) return; if (aimDown || e.pointerType === 'mouse') aim = laneAt(pos(e)); });
  cv.addEventListener('pointerup', e => {
    if (!game || !aimDown) return; aimDown = false;
    const x = laneAt(pos(e)); if (x >= 0 && !game.over) game.spawn(0, x);
    if (e.pointerType !== 'mouse') aim = -1;
  });
  cv.addEventListener('pointercancel', () => { aimDown = false; aim = -1; });
  cv.addEventListener('pointerleave', e => { if (!aimDown) aim = -1; });
  // キーボード：1〜6で兵士
  window.addEventListener('keydown', e => { if (game && !game.over && $('game').classList.contains('active') && e.key >= '1' && e.key <= String(L)) game.spawn(0, +e.key - 1); });

  // ---------- 出来事 ----------
  function handle(e) {
    const cx = x => ox + (x + 0.5) * cs, cy = y => oy + (y + 0.5) * cs;
    if (e.type === 'spawn') { if (e.owner === 0) snd.spawn(); }
    else if (e.type === 'place') { if (e.owner === 0) snd.place(); }
    else if (e.type === 'break') {
      if (e.owner === 0) { snd.brk(); if (e.coin) { const fxp = e.ft === 'H' ? [ox + (e.b + 0.5) * cs, oy + e.a * cs] : [ox + e.b * cs, oy + (e.a + 0.5) * cs]; float(fxp[0], fxp[1], '+1', GOLD); } }
    }
    else if (e.type === 'full') { if (e.owner === 0) { snd.no(); toast('1列まるごとは ふさげない（1マスはあける）'); } }
    else if (e.type === 'smash') { beep(240, 0.16, 'square', 0.07, 0, 90); burst(cx(e.x), oy + e.k * cs, WOOD_L, 10); }
    else if (e.type === 'rescue') { if (e.owner === 0) { float(cx(2.5), oy + R * cs - 6, 'おたすけ +1コイン', GOLD); beep(880, 0.1, 'sine', 0.05); } }
    else if (e.type === 'swapPlan') { snd.turn(); if (e.owner === 1) toast('相手が入れかえを予告！'); }
    else if (e.type === 'nocoin') { if (e.owner === 0) { snd.no(); toast('コインがたりない'); } }
    else if (e.type === 'clash') { snd.clash(); burst(cx(e.x), cy(e.y), '#fff3b0', 12); float(cx(e.x), cy(e.y), '+1', GOLD); }
    else if (e.type === 'hit') {
      const y = e.owner === 0 ? oy - CH / 2 : oy + R * cs + CH / 2;
      burst(cx(e.x), y, e.owner === 0 ? BLUE : RED, 18); shake = 1;
      e.owner === 0 ? snd.hit() : snd.hurt();
      float(cx(e.x), y, e.owner === 0 ? 'ヒット！' : '-1  +2コイン', e.owner === 0 ? BLUE : RED);
    } else if (e.type === 'swap') { snd.swap(); flashRows = { rows: e.rows, t: 0.9 }; swapAnim = { rows: e.rows, t: 0.6 }; }
    else if (e.type === 'swapTurn') { if (e.owner === 0) snd.turn(); }
    else if (e.type === 'over') {
      setTimeout(() => {
        if (!game) return;
        const w = e.winner, t = $('res-title');
        t.textContent = w === 0 ? 'かち！' : w === 1 ? 'まけ…' : 'ひきわけ'; t.className = w === 0 ? 'win' : 'lose';
        $('res-sub').textContent = `のこりHP　あなた ${Math.max(0, game.hp[0])} － ${Math.max(0, game.hp[1])} 相手　（${Math.round(game.time)}秒）`;
        if (w === 0) { let n = 0; try { n = (+localStorage.getItem('sk_win_' + level) || 0) + 1; localStorage.setItem('sk_win_' + level, n); } catch (er) {} if (n) $('res-sub').textContent += `\nこの強さに ${n}勝目`; }
        $('ov-result').classList.add('show'); w === 0 ? snd.win() : snd.lose();
      }, 700);
    }
  }
  function float(x, y, text, color) { floats.push({ x, y, text, color, t: 1 }); }
  function burst(x, y, color, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 40 + Math.random() * 120; fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0.45, color }); } }

  // ---------- 絵 ----------
  function rr(x, y, w, h, r) { g2.beginPath(); g2.moveTo(x + r, y); g2.arcTo(x + w, y, x + w, y + h, r); g2.arcTo(x + w, y + h, x, y + h, r); g2.arcTo(x, y + h, x, y, r); g2.arcTo(x, y, x + w, y, r); g2.closePath(); }
  function draw(dt) {
    const W = cv.width / dpr, Hh = cv.height / dpr, g = g2;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, Hh);
    g.save();
    if (shake > 0) { g.translate((Math.random() - 0.5) * shake * 8, (Math.random() - 0.5) * shake * 8); shake = Math.max(0, shake - dt * 3); }
    const bw = cs * L, bh = cs * R;
    // 城
    for (const p of [1, 0]) {
      const y = p === 1 ? 0 : oy + bh;
      g.fillStyle = p === 1 ? '#f9c5c5' : '#c5dcfb'; rr(ox, y + 2, bw, CH - 4, 12); g.fill();
      g.strokeStyle = INK; g.lineWidth = 3; rr(ox, y + 2, bw, CH - 4, 12); g.stroke();
      for (let x = 0; x < L; x++) {
        const cxp = ox + (x + 0.5) * cs, cyp = y + CH / 2;
        if (p === 0) {
          // 出撃ボタン
          const can = game.coins[0] > 0;
          g.fillStyle = !can ? '#a9b8cf' : aim === x ? '#1d4ed8' : BLUE; rr(ox + x * cs + 4, y + 6, cs - 8, CH - 12, 9); g.fill();
          g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cxp, cyp - cs * 0.2); g.lineTo(cxp + cs * 0.2, cyp + cs * 0.14); g.lineTo(cxp - cs * 0.2, cyp + cs * 0.14); g.closePath(); g.fill();
        } else { g.fillStyle = RED; g.beginPath(); g.moveTo(cxp, cyp + cs * 0.16); g.lineTo(cxp + cs * 0.15, cyp - cs * 0.1); g.lineTo(cxp - cs * 0.15, cyp - cs * 0.1); g.closePath(); g.fill(); }
      }
    }
    // 盤
    for (let y = 0; y < R; y++) for (let x = 0; x < L; x++) {
      const top = y < C.HALF, alt = (x + y) % 2;
      g.fillStyle = top ? (alt ? '#fde2e0' : '#fbeceb') : (alt ? '#dce9fb' : '#eaf2fd');
      g.fillRect(ox + x * cs, oy + y * cs, cs, cs);
    }
    // 入れかえでえらんだ列・入れかわった列
    const hi = (row, col) => { g.fillStyle = col; g.fillRect(ox, oy + row * cs, bw, cs); };
    if (selMine >= 0) hi(R - 1 - selMine, 'rgba(245,184,0,.35)');
    if (selOpp >= 0) hi(selOpp, 'rgba(245,184,0,.35)');
    if (game.pending) { const a = 0.25 + 0.2 * Math.sin(performance.now() / 110); for (const r of game.pending.rows) hi(r, `rgba(245,184,0,${a})`); }
    if (flashRows) { flashRows.t -= dt; for (const r of flashRows.rows) hi(r, `rgba(255,255,255,${Math.max(0, flashRows.t) * 1.2})`); if (flashRows.t <= 0) flashRows = null; }
    // まん中の線と外わく
    g.strokeStyle = 'rgba(59,42,32,.35)'; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(ox, oy + C.HALF * cs); g.lineTo(ox + bw, oy + C.HALF * cs); g.stroke(); g.setLineDash([]);
    g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(ox, oy, bw, bh);
    // 置ける場所のしるし（自分の陣地の線）
    g.fillStyle = 'rgba(59,42,32,.16)';
    for (let k = C.HALF + 1; k <= R; k++) for (let x = 0; x < L; x++) if (!game.H[k][x]) { g.beginPath(); g.arc(ox + (x + 0.5) * cs, oy + k * cs, 2.2, 0, 7); g.fill(); }
    for (let y = C.HALF; y < R; y++) for (let k = 1; k < L; k++) if (!game.V[y][k]) { g.beginPath(); g.arc(ox + k * cs, oy + (y + 0.5) * cs, 2.2, 0, 7); g.fill(); }
    // 柵
    const fence = (x, y, w, h, v) => { g.fillStyle = v === 2 ? '#c98a1b' : WOOD; rr(x, y, w, h, 4); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; rr(x, y, w, h, 4); g.stroke(); g.fillStyle = v === 2 ? '#ffe08a' : WOOD_L; rr(x + 2, y + 2, Math.max(2, w - 4), Math.max(2, h * 0.35), 2); g.fill(); if (v === 2) { g.fillStyle = GOLD; g.beginPath(); g.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.42, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke(); } };
    const th = Math.max(7, cs * 0.2);
    // 入れかえた直後は、柵が元の列からすべってくる
    let offH = () => 0, offV = () => 0;
    if (swapAnim) {
      swapAnim.t -= dt; const q = Math.max(0, swapAnim.t / 0.6), p = q * q * (3 - 2 * q), [ra, rb] = swapAnim.rows;
      offH = k => k === lineOf(ra) ? (lineOf(rb) - lineOf(ra)) * cs * p : k === lineOf(rb) ? (lineOf(ra) - lineOf(rb)) * cs * p : 0;
      offV = y => y === ra ? (rb - ra) * cs * p : y === rb ? (ra - rb) * cs * p : 0;
      if (swapAnim.t <= 0) swapAnim = null;
    }
    for (let k = 0; k <= R; k++) for (let x = 0; x < L; x++) if (game.H[k][x]) fence(ox + x * cs + cs * 0.06, oy + k * cs - th / 2 + offH(k), cs * 0.88, th, game.H[k][x]);
    for (let y = 0; y < R; y++) for (let k = 1; k < L; k++) if (game.V[y][k]) { const yy = oy + (y + 0.5) * cs + offV(y); g.save(); g.translate(ox + k * cs, yy); g.rotate(Math.PI / 2); g.translate(-(ox + k * cs), -yy); fence(ox + k * cs - cs * 0.44, yy - th / 2, cs * 0.88, th, game.V[y][k]); g.restore(); }
    // 兵士の道すじ（▲を押しているあいだ）
    if (aim >= 0 && !game.over) {
      const tr = game.trace(0, aim), P = tr.pts.map(q => [ox + (q[0] + 0.5) * cs, oy + (Math.max(-0.5, Math.min(R, q[1])) + 0.5) * cs]);
      g.strokeStyle = 'rgba(37,99,235,.75)'; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([2, 10]); g.lineDashOffset = -performance.now() / 40;
      g.beginPath(); P.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke(); g.setLineDash([]);
      const e2 = P[P.length - 1], mark = tr.end === 'castle' ? '★' : tr.end === 'fork' ? '？' : '✕';
      g.fillStyle = '#fff'; g.beginPath(); g.arc(e2[0], e2[1], cs * 0.24, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
      g.fillStyle = tr.end === 'castle' ? GOLD : tr.end === 'fork' ? INK : RED; g.font = `900 ${Math.round(cs * 0.32)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(mark, e2[0], e2[1] + 1); g.textBaseline = 'alphabetic';
    }
    // 兵士
    const t = Math.min(1, game.acc / C.STEP), e = t * t * (3 - 2 * t);
    const cells = {};
    for (const s of game.soldiers) {
      const key = s.x + ',' + s.y + ',' + s.owner; cells[key] = (cells[key] || 0) + 1; const n = cells[key] - 1;
      let x = s.px + (s.x - s.px) * e, y = s.py + (s.y - s.py) * e;
      let sx = ox + (x + 0.5) * cs + (n % 3 - (n ? 1 : 0)) * cs * 0.16, sy = oy + (y + 0.5) * cs - Math.floor(n / 3) * cs * 0.14;
      if (s.stuck) sx += Math.sin(performance.now() / 90 + s.id) * 1.6;
      const rad = cs * 0.27, hop = s.stuck ? 0 : Math.abs(Math.sin(t * Math.PI)) * cs * 0.07;
      g.fillStyle = 'rgba(59,42,32,.18)'; g.beginPath(); g.ellipse(sx, sy + rad * 0.9, rad * 0.8, rad * 0.3, 0, 0, 7); g.fill();
      g.fillStyle = s.owner === 0 ? BLUE : RED; g.beginPath(); g.arc(sx, sy - hop, rad, 0, 7); g.fill();
      g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke();
      const ey = sy - hop + (s.owner === 0 ? -rad * 0.2 : rad * 0.15);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(sx - rad * 0.36, ey, rad * 0.24, 0, 7); g.arc(sx + rad * 0.36, ey, rad * 0.24, 0, 7); g.fill();
      g.fillStyle = INK; const pd = s.owner === 0 ? -1 : 1; g.beginPath(); g.arc(sx - rad * 0.36, ey + pd * rad * 0.08, rad * 0.11, 0, 7); g.arc(sx + rad * 0.36, ey + pd * rad * 0.08, rad * 0.11, 0, 7); g.fill();
      if (s.stuck) { g.fillStyle = INK; g.font = `900 ${Math.round(cs * 0.3)}px sans-serif`; g.textAlign = 'center'; g.fillText('?', sx + rad * 0.9, sy - rad * 0.9); }
    }
    // 右はしの ⇄
    const can = game.canSwap(0);
    for (let y = 0; y < R; y++) {
      const mine = y >= C.HALF, sel = mine ? selMine === R - 1 - y : selOpp === y;
      const bx = ox + bw + 5, by = oy + y * cs + 4, w2 = HW - 4, h2 = cs - 8;
      g.fillStyle = sel ? '#f5b800' : can ? '#fff' : 'rgba(255,255,255,.35)'; rr(bx, by, w2, h2, 8); g.fill();
      g.strokeStyle = can ? INK : 'rgba(59,42,32,.25)'; g.lineWidth = 2; rr(bx, by, w2, h2, 8); g.stroke();
      g.fillStyle = can ? (mine ? BLUE : RED) : 'rgba(59,42,32,.3)'; g.font = `900 ${Math.round(cs * 0.42)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('⇄', bx + w2 / 2, by + h2 / 2 + 1); g.textBaseline = 'alphabetic';
    }
    // 火花
    for (const p of fx) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; g.globalAlpha = Math.max(0, p.t / 0.45); g.fillStyle = p.color; g.beginPath(); g.arc(p.x, p.y, 3.5, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); }
    g.globalAlpha = 1; fx = fx.filter(p => p.t > 0);
    for (const f of floats) { f.t -= dt * 1.1; f.y -= dt * 34; g.globalAlpha = Math.max(0, Math.min(1, f.t * 2)); g.font = `900 ${Math.round(cs * 0.36)}px "M PLUS Rounded 1c", sans-serif`; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#fff'; const fxx = Math.max(ox + 50, Math.min(ox + bw - 50, f.x)); g.strokeText(f.text, fxx, f.y); g.fillStyle = f.color; g.fillText(f.text, fxx, f.y); }
    g.globalAlpha = 1; floats = floats.filter(f => f.t > 0);
    g.restore();
  }

  // ---------- 毎フレーム ----------
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!game) return;
    if (!game.over) { cpu.update(dt); game.step(dt); }
    if (!game.canSwap(0)) selMine = selOpp = -1;
    const evs = game.events; game.events = [];
    for (const e of evs) handle(e);
    hud(); draw(dt);
  }
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { last = performance.now(); });
  try { document.fonts.ready.then(() => { if (game) layout(); }); } catch (e) {}
  SK._debug = { get game() { return game; }, start, geom: () => ({ cs, ox, oy, HW, CH }) };
})();
