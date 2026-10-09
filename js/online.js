// =============================================
//  さくがえ  あいことばオンライン対戦（Firebase Realtime Database）
//
//  0番の人（先に入った人）が試合を動かし、盤のようすを1秒に10回送る。
//  1番の人は、兵士・柵・入れかえの操作を送るだけ。3人目からは観戦。
//
//  データの形： sakugae/{あいことば}/
//    players/{0|1}  : { id, name }
//    watchers/{id}  : { name }
//    ready/{0|1}    : 何回戦をやりたいか（両方そろうと開始）
//    game           : { round, startAt }          0番の人が書く
//    st             : 盤のようす（文字列）          0番の人が書く
//    cmd/r{回戦}/{自動ID} : { t, a, b, c }      1番の人の操作
//    result/r{回戦} : { loser, why }             相手が抜けたとき
// =============================================
(function () {
  const C = SK.CONFIG, L = C.LANES, R = C.ROWS;
  const clean = s => String(s || '').replace(/[.#$\[\]\/\s]/g, '').slice(0, 20);
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  // ---------- 盤のようす ⇄ 文字列 ----------
  const r3 = v => Math.round(v * 1000) / 1000;
  function pack(g, round, evs) {
    return JSON.stringify({
      r: round,
      H: g.H.map(a => Array.from(a).join('')).join(''), V: g.V.map(a => Array.from(a).join('')).join(''),
      s: g.soldiers.map(s => [s.id, s.owner, s.x, s.y, s.px, s.py, s.side, s.stuck ? 1 : 0, s.wait]),
      c: g.coins, h: g.hp, t: r3(g.time), a: r3(g.acc), k: g.ticks,
      w: g.swapTurn ? [g.swapTurn.owner, r3(g.swapTurn.until), g.swapTurn.used ? 1 : 0] : null,
      n: r3(g.nextSwapAt), o: g.swapOwner,
      p: g.pending ? [g.pending.owner, g.pending.a.row, g.pending.a.line, g.pending.b.row, g.pending.b.line, r3(g.pending.at)] : null,
      x: g.over ? 1 : 0, wn: g.winner, e: evs
    });
  }
  // 相手から見た盤（上下を入れかえ、持ち主を入れかえる）
  const fy = y => R - 1 - y, fk = k => R - k, fo = o => (o === 0 || o === 1 ? 1 - o : o);
  function mirrorEvent(e) {
    const m = Object.assign({}, e);
    if ('owner' in m) m.owner = fo(m.owner);
    if (m.type === 'over') m.winner = fo(m.winner);
    if (m.rows) m.rows = m.rows.map(fy);
    if (m.type === 'place' || m.type === 'break') m.a = m.ft === 'H' ? fk(m.a) : fy(m.a);
    if (m.type === 'smash') m.k = fk(m.k);
    if (m.type === 'clash') m.y = fy(m.y);
    return m;
  }
  // 文字列 → 画面用の Game にそのまま書きこむ
  function unpack(g, str, flip) {
    const d = typeof str === 'string' ? JSON.parse(str) : str;
    for (let k = 0; k <= R; k++) for (let x = 0; x < L; x++) g.H[flip ? fk(k) : k][x] = +d.H[k * L + x];
    for (let y = 0; y < R; y++) for (let k = 0; k <= L; k++) g.V[flip ? fy(y) : y][k] = +d.V[y * (L + 1) + k];
    g.soldiers = d.s.map(([id, owner, x, y, px, py, side, stuck, wait]) => ({ id, owner: flip ? 1 - owner : owner, x, y: flip ? fy(y) : y, px, py: flip ? fy(py) : py, side, stuck: !!stuck, wait, dead: false }));
    g.coins = flip ? [d.c[1], d.c[0]] : d.c.slice(); g.hp = flip ? [d.h[1], d.h[0]] : d.h.slice();
    g.time = d.t; g.acc = d.a; g.ticks = d.k;
    g.swapTurn = d.w ? { owner: flip ? 1 - d.w[0] : d.w[0], until: d.w[1], used: !!d.w[2] } : null;
    g.nextSwapAt = d.n; g.swapOwner = flip ? 1 - d.o : d.o;
    if (d.p) {
      const [o, ar, al, br, bl, at] = d.p;
      const A = flip ? { row: fy(ar), line: fk(al) } : { row: ar, line: al }, B = flip ? { row: fy(br), line: fk(bl) } : { row: br, line: bl };
      g.pending = { owner: flip ? 1 - o : o, a: A, b: B, at, rows: [A.row, B.row] };
    } else g.pending = null;
    g.over = !!d.x; g.winner = flip ? fo(d.wn) : d.wn;
    return { round: d.r, events: (d.e || []).map(([id, e]) => [id, flip ? mirrorEvent(e) : e]) };
  }
  // 1番の人の操作（画面では自分が下＝0番として扱っている）→ 本当の盤の言葉に直す
  function toHost(cmd) {
    if (cmd.t === 'f') return { t: 'f', a: cmd.ft === 'H' ? fk(cmd.a) : fy(cmd.a), b: cmd.b, c: cmd.ft };
    return cmd;
  }
  // 0番の人：とどいた操作を本物の盤に入れる
  function applyCmd(g, m) {
    if (!m || g.over) return;
    if (m.t === 'f' && (m.c === 'H' || m.c === 'V')) g.toggleFence(1, m.c, m.a | 0, m.b | 0);
    else if (m.t === 's') g.spawn(1, m.a | 0);
    else if (m.t === 'w') g.swap(1, m.a | 0, m.b | 0);
  }

  class OnlineRoom {
    constructor(db, code, name, cb) {
      this.db = db; this.code = clean(code);
      this.name = (String(name || '').trim().slice(0, 8)) || 'ななし';
      this.cb = cb || {}; this.id = uid(); this.slot = -1;
      this.players = {}; this.watchers = {}; this.ready = {};
      this.game = null; this.round = 0; this.results = {};
      this.subs = []; this.evSubs = []; this.offset = 0;
      this.root = db.ref('sakugae/' + this.code); this.left = false;
    }
    call(n, ...a) { if (this.cb[n]) this.cb[n](...a); }
    now() { return Date.now() + this.offset; }
    on(ref, ev, fn) { ref.on(ev, fn); this.subs.push([ref, ev, fn]); }
    async join() {
      if (!this.code) throw new Error('あいことばを入れてください');
      this.on(this.db.ref('.info/serverTimeOffset'), 'value', s => { this.offset = s.val() || 0; });
      for (const s of [0, 1]) {
        const ref = this.root.child('players/' + s);
        const res = await ref.transaction(cur => (cur ? undefined : { id: this.id, name: this.name }));
        if (res.committed && res.snapshot.val() && res.snapshot.val().id === this.id) { this.slot = s; break; }
      }
      if (this.slot >= 0) {
        const s = this.slot;
        this.root.child('players/' + s).onDisconnect().remove();
        this.root.child('ready/' + s).onDisconnect().remove();
        const g0 = (await this.root.child('game').once('value')).val();
        this.joinRound = ((g0 && g0.round) || 0) + 1;
      } else {
        const w = this.root.child('watchers/' + this.id);
        await w.set({ name: this.name }); w.onDisconnect().remove();
      }
      this.on(this.root.child('players'), 'value', snap => {
        const prev = this.players; this.players = snap.val() || {};
        this.call('onPeople', this.people());
        if (this.slot >= 0 && this.game && !this.results['r' + this.round]) {
          const o = 1 - this.slot;
          if (prev[o] && !this.players[o]) this.report(o, 'left');
        }
        this.tryStart();
      });
      this.on(this.root.child('watchers'), 'value', snap => { this.watchers = snap.val() || {}; this.call('onPeople', this.people()); });
      this.on(this.root.child('ready'), 'value', snap => { this.ready = snap.val() || {}; this.tryStart(); });
      this.on(this.root.child('game'), 'value', snap => this.onGame(snap.val()));
      if (this.slot !== 0) this.on(this.root.child('st'), 'value', snap => { const v = snap.val(); if (v) this.call('onState', v); });
      if (this.slot >= 0) await this.root.child('ready/' + this.slot).set(this.joinRound);
      return { slot: this.slot, code: this.code };
    }
    people() { return { names: [0, 1].map(s => (this.players[s] ? this.players[s].name : null)), watchers: Object.keys(this.watchers).length, slot: this.slot }; }
    tryStart() {
      if (this.slot !== 0 || this.left || !this.joinRound) return;
      const r = this.ready || {}, next = (this.game ? this.game.round : 0) + 1;
      if (!this.players[0] || !this.players[1]) return;
      if (!(r[0] >= next && r[1] >= next)) return;
      if (this.starting === next) return;
      this.starting = next;
      this.root.child('game').set({ round: next, startAt: this.now() + 2500 });
      if (next > 2) { this.root.child('cmd/r' + (next - 2)).remove(); this.root.child('result/r' + (next - 2)).remove(); }
    }
    onGame(g) {
      if (!g || this.left) { this.game = g; return; }
      if (this.game && this.game.round === g.round) return;
      this.game = g;
      if (this.slot >= 0 && this.joinRound && g.round < this.joinRound) return;
      this.round = g.round;
      for (const [ref, ev, fn] of this.evSubs) ref.off(ev, fn);
      this.evSubs = [];
      const RK = 'r' + g.round;
      this.call('onStart', { round: g.round, slot: this.slot, wait: Math.max(0, g.startAt - this.now()), names: this.people().names });
      if (this.slot === 0) {
        const cref = this.root.child('cmd/' + RK), cfn = snap => this.call('onCmd', snap.val());
        cref.on('child_added', cfn); this.evSubs.push([cref, 'child_added', cfn]);
      }
      const rref = this.root.child('result/' + RK);
      const rfn = snap => { const v = snap.val(); if (!v || this.results[RK]) return; this.results[RK] = v; this.call('onResult', v); };
      rref.on('value', rfn); this.evSubs.push([rref, 'value', rfn]);
    }
    sendState(str) { if (this.slot === 0 && !this.left) this.root.child('st').set(str); }
    sendCmd(cmd) { if (this.slot === 1 && !this.left) this.root.child('cmd/r' + this.round).push(toHost(cmd)); }
    report(loser, why) { this.root.child('result/r' + this.round).transaction(cur => (cur ? undefined : { loser, why: why || 'left' })); }
    rematch() { if (this.slot >= 0) this.root.child('ready/' + this.slot).set(this.round + 1); }
    leave() {
      if (this.left) return;
      this.left = true;
      for (const [ref, ev, fn] of this.subs.concat(this.evSubs)) ref.off(ev, fn);
      this.subs = []; this.evSubs = [];
      if (this.slot >= 0) { this.root.child('players/' + this.slot).remove(); this.root.child('ready/' + this.slot).remove(); }
      else this.root.child('watchers/' + this.id).remove();
      if (this.slot === 0) this.root.child('st').remove();
    }
  }
  SK.OnlineRoom = OnlineRoom;
  SK.cleanCode = clean;
  SK.net = { pack, unpack, applyCmd, mirrorEvent };
})();
