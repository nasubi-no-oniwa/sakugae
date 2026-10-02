// =============================================
//  さくがえ（仮）  ルール本体（画面とは切りはなし）
//  プレイヤー0＝下（上へ進む）  プレイヤー1＝上（下へ進む）
//  横の柵 H[k][x]：段 k-1 と段 k のあいだ（k=0 は上の城の前、k=10 は下の城の前）
//  縦の柵 V[y][k]：段 y の、レーン k-1 と k のあいだ（k=1〜5）
// =============================================
window.SK = window.SK || {};
(function () {
  const C = SK.CONFIG = {
    LANES: 6, ROWS: 10, HALF: 5,
    HP: 10,
    COINS: 12,            // 最初のコイン（兵士も柵も1コイン）
    STEP: 1.5,            // 兵士が1マス進む時間（秒）
    SWAP_EVERY: 15,       // 入れかえの番がまわってくる間かく（秒）。交互
    HIT_ATTACKER: 0,      // 城に着いたとき、攻めた側がもらうコイン
    HIT_DEFENDER: 2,      // 城に着かれたとき、受けた側がもらうコイン
    CLASH_COIN: 1,        // 相殺したとき、おたがいがもらうコイン
    SWAP_DELAY: 3,        // 入れかえをえらんでから、実際に入れかわるまでの予告（秒）
    SMASH_STUCK: 3,       // 立ち往生がこの回数つづくと、目の前の柵をこわす
    SMASH_WANDER: 8,      // 前に進めないのがこの回数つづくと、目の前の柵をこわす
    RESCUE_EVERY: 5       // コインも兵士もないとき、この秒数ごとに1コインもらえる
  };
  const L = C.LANES, R = C.ROWS;

  class Game {
    constructor(rnd) {
      this.rnd = rnd || Math.random;
      this.H = Array.from({ length: R + 1 }, () => new Uint8Array(L));
      this.V = Array.from({ length: R }, () => new Uint8Array(L + 1));
      this.soldiers = []; this.nextId = 1;
      this.coins = [C.COINS, C.COINS]; this.hp = [C.HP, C.HP];
      this.time = 0; this.acc = 0; this.ticks = 0;
      this.swapTurn = null;                       // { owner, until, used }
      this.nextSwapAt = C.SWAP_EVERY; this.swapOwner = this.rnd() < 0.5 ? 0 : 1;
      this.over = false; this.winner = null; this.events = [];
      this.pending = null; this.rescue = [0, 0];
    }
    emit(e) { this.events.push(e); }

    // ---------- 柵 ----------
    mineH(owner, k) { return owner === 0 ? k >= C.HALF + 1 && k <= R : k >= 0 && k <= C.HALF - 1; }
    mineRow(owner, y) { return owner === 0 ? y >= C.HALF && y < R : y >= 0 && y < C.HALF; }
    canEdit(owner, type, a, b) {
      if (type === 'H') return a >= 0 && a <= R && b >= 0 && b < L && this.mineH(owner, a);
      return a >= 0 && a < R && b >= 1 && b < L && this.mineRow(owner, a);
    }
    has(type, a, b) { return type === 'H' ? this.H[a][b] : this.V[a][b]; }
    // 置く／こわす（こわすと1コインもどる）
    toggleFence(owner, type, a, b) {
      if (this.over || !this.canEdit(owner, type, a, b)) return false;
      const arr = type === 'H' ? this.H[a] : this.V[a];
      if (arr[b]) {
        // こわす：入れかえでもらった柵（2）だけ、1コインになる
        const got = arr[b] === 2; arr[b] = 0; if (got) this.coins[owner]++;
        this.emit({ type: 'break', owner, ft: type, a, b, coin: got }); return true;
      }
      if (this.coins[owner] < 1) { this.emit({ type: 'nocoin', owner }); return false; }
      if (type === 'H') { let n = 0; for (let x = 0; x < L; x++) if (arr[x]) n++; if (n >= L - 1) { this.emit({ type: 'full', owner }); return false; } }
      arr[b] = 1; this.coins[owner]--; this.emit({ type: 'place', owner, ft: type, a, b });
      return true;
    }
    fenceCount(owner) {
      let n = 0;
      for (let k = 0; k <= R; k++) if (this.mineH(owner, k)) for (let x = 0; x < L; x++) n += this.H[k][x] ? 1 : 0;
      for (let y = 0; y < R; y++) if (this.mineRow(owner, y)) for (let k = 1; k < L; k++) n += this.V[y][k] ? 1 : 0;
      return n;
    }
    // 城から数えて i 番目（0〜4）の「柵の列」：その段の縦の柵＋城がわの横の柵
    band(owner, i) { return owner === 0 ? { row: R - 1 - i, line: R - i } : { row: i, line: i }; }
    bandCount(owner, i) { const b = this.band(owner, i); let n = 0; for (let x = 0; x < L; x++) n += this.H[b.line][x] ? 1 : 0; for (let k = 1; k < L; k++) n += this.V[b.row][k] ? 1 : 0; return n; }

    // ---------- 入れかえ ----------
    canSwap(owner) { return !this.over && this.swapTurn && this.swapTurn.owner === owner && !this.swapTurn.used; }
    // えらぶと、相手にも見える予告が出て、数秒後に入れかわる
    swap(owner, myI, oppI) {
      if (!this.canSwap(owner) || this.pending || myI < 0 || myI > 4 || oppI < 0 || oppI > 4) return false;
      this.swapTurn.used = true;
      const a = this.band(owner, myI), b = this.band(1 - owner, oppI);
      this.pending = { owner, a, b, at: this.time + C.SWAP_DELAY, rows: [a.row, b.row] };
      this.emit({ type: 'swapPlan', owner, rows: [a.row, b.row] });
      return true;
    }
    doSwap() {
      const { owner, a, b } = this.pending; this.pending = null;
      const h = this.H[a.line]; this.H[a.line] = this.H[b.line]; this.H[b.line] = h;
      const v = this.V[a.row]; this.V[a.row] = this.V[b.row]; this.V[b.row] = v;
      // もらった柵は「こわすとコインになる柵」になる
      for (const arr of [this.H[a.line], this.H[b.line], this.V[a.row], this.V[b.row]]) for (let i = 0; i < arr.length; i++) if (arr[i]) arr[i] = 2;
      this.emit({ type: 'swap', owner, rows: [a.row, b.row] });
    }
    refundable(owner) {
      let n = 0;
      for (let k = 0; k <= R; k++) if (this.mineH(owner, k)) for (let x = 0; x < L; x++) if (this.H[k][x] === 2) n++;
      for (let y = 0; y < R; y++) if (this.mineRow(owner, y)) for (let k = 1; k < L; k++) if (this.V[y][k] === 2) n++;
      return n;
    }

    // ---------- 兵士 ----------
    spawn(owner, x) {
      if (this.over || x < 0 || x >= L) return null;
      if (this.coins[owner] < 1) { this.emit({ type: 'nocoin', owner }); return null; }
      this.coins[owner]--;
      const y = owner === 0 ? R - 1 : 0;
      const s = { id: this.nextId++, owner, x, y, px: x, py: owner === 0 ? R : -1, side: 0, dead: false, stuck: false, wait: 0 };
      this.soldiers.push(s);
      this.emit({ type: 'spawn', owner, x });
      this.collide();
      return s;
    }
    blockedForward(s) { const k = s.owner === 0 ? s.y : s.y + 1; return !!this.H[k][s.x]; }
    canSide(s, dx) { const nx = s.x + dx; if (nx < 0 || nx >= L) return false; return !this.V[s.y][dx < 0 ? s.x : s.x + 1]; }

    step(dt) {
      if (this.over) return;
      this.time += dt;
      if (this.swapTurn && this.time >= this.swapTurn.until) this.swapTurn = null;
      if (this.time >= this.nextSwapAt) {
        this.swapTurn = { owner: this.swapOwner, until: this.nextSwapAt + C.SWAP_EVERY, used: false };
        this.emit({ type: 'swapTurn', owner: this.swapOwner });
        this.swapOwner = 1 - this.swapOwner; this.nextSwapAt += C.SWAP_EVERY;
      }
      if (this.pending && this.time >= this.pending.at) this.doSwap();
      // コインも兵士も、こわしてコインになる柵もないとき：少しずつコインがもらえる（手づまり防止）
      for (const p of [0, 1]) {
        if (this.coins[p] < 1 && !this.soldiers.some(s => s.owner === p) && !this.refundable(p)) {
          this.rescue[p] += dt;
          if (this.rescue[p] >= C.RESCUE_EVERY) { this.rescue[p] = 0; this.coins[p]++; this.emit({ type: 'rescue', owner: p }); }
        } else this.rescue[p] = 0;
      }
      this.acc += dt;
      while (this.acc >= C.STEP && !this.over) { this.acc -= C.STEP; this.tick(); }
    }
    tick() {
      this.ticks++;
      const hits = [];
      for (const s of this.soldiers) {
        s.px = s.x; s.py = s.y; s.stuck = false;
        const d = s.owner === 0 ? -1 : 1;
        if (!this.blockedForward(s)) {
          const ny = s.y + d;
          if (ny < 0 || ny >= R) { hits.push(s); continue; }
          s.y = ny; s.side = 0; s.wait = 0;
        } else {
          s.wait++;
          // 行き止まり：横へ1レーン。両方あいていたらランダム（いちど決めた向きは、ふさがるまで続ける）
          const l = this.canSide(s, -1), r = this.canSide(s, 1);
          let dx = 0;
          if (s.side && this.canSide(s, s.side)) dx = s.side;
          else if (l && r) dx = this.rnd() < 0.5 ? -1 : 1;
          else if (l) dx = -1; else if (r) dx = 1;
          if (dx) { s.x += dx; s.side = dx; } else { s.stuck = true; s.side = 0; }
          // 進めないままだと、目の前の柵をたたいてこわす
          if ((s.stuck && s.wait >= C.SMASH_STUCK) || s.wait >= C.SMASH_WANDER) {
            const k = s.owner === 0 ? s.y : s.y + 1;
            if (this.H[k][s.x]) { this.H[k][s.x] = 0; s.wait = 0; this.emit({ type: 'smash', owner: s.owner, k, x: s.x }); }
          }
        }
      }
      // 城に着いた
      for (const s of hits) {
        s.dead = true; const def = 1 - s.owner;
        this.hp[def]--; this.coins[s.owner] += C.HIT_ATTACKER; this.coins[def] += C.HIT_DEFENDER;
        this.emit({ type: 'hit', owner: s.owner, x: s.x });
      }
      this.collide();
      this.soldiers = this.soldiers.filter(s => !s.dead);
      if (this.hp[0] <= 0 || this.hp[1] <= 0) {
        this.over = true;
        this.winner = this.hp[0] <= 0 && this.hp[1] <= 0 ? -1 : this.hp[0] <= 0 ? 1 : 0;
        this.emit({ type: 'over', winner: this.winner });
      }
    }
    // 敵どうしが同じマス、またはすれちがい → 相殺
    collide() {
      const S = this.soldiers;
      for (let i = 0; i < S.length; i++) {
        const a = S[i]; if (a.dead) continue;
        for (let j = i + 1; j < S.length; j++) {
          const b = S[j]; if (b.dead || a.owner === b.owner) continue;
          const same = a.x === b.x && a.y === b.y;
          const cross = a.x === b.px && a.y === b.py && b.x === a.px && b.y === a.py;
          if (same || cross) {
            a.dead = b.dead = true;
            this.coins[0] += C.CLASH_COIN; this.coins[1] += C.CLASH_COIN;
            this.emit({ type: 'clash', x: same ? a.x : (a.x + b.x) / 2, y: same ? a.y : (a.y + b.y) / 2 });
            break;
          }
        }
      }
      this.soldiers = S.filter(s => !s.dead);
    }

    // そのレーンから出した兵士が、相手の城まで行けるか（行けるなら歩数）。CPUと表示用
    pathLen(owner, x0) {
      const d = owner === 0 ? -1 : 1, start = owner === 0 ? R - 1 : 0;
      const seen = new Set(); let q = [[x0, start, 0]];
      while (q.length) {
        const [x, y, n] = q.shift(); const key = x + ',' + y; if (seen.has(key)) continue; seen.add(key);
        const k = owner === 0 ? y : y + 1;
        if (!this.H[k][x]) { const ny = y + d; if (ny < 0 || ny >= R) return n + 1; q.push([x, ny, n + 1]); }
        else {
          if (x > 0 && !this.V[y][x]) q.push([x - 1, y, n + 1]);
          if (x < L - 1 && !this.V[y][x + 1]) q.push([x + 1, y, n + 1]);
        }
      }
      return Infinity;
    }
  }
  // 兵士を出したときの道すじ（表示用）。分かれ道で止まる
  Game.prototype.trace = function (owner, x0) {
    const d = owner === 0 ? -1 : 1; let x = x0, y = owner === 0 ? R - 1 : 0, side = 0;
    const pts = [[x, owner === 0 ? R : -1], [x, y]]; let end = 'stuck';
    for (let n = 0; n < 60; n++) {
      const k = owner === 0 ? y : y + 1;
      if (!this.H[k][x]) { y += d; side = 0; if (y < 0 || y >= R) { pts.push([x, y]); end = 'castle'; break; } pts.push([x, y]); continue; }
      const l = x > 0 && !this.V[y][x], r = x < L - 1 && !this.V[y][x + 1];
      let dx = 0;
      if (side && (side < 0 ? l : r)) dx = side; else if (l && r) { end = 'fork'; break; } else if (l) dx = -1; else if (r) dx = 1;
      if (!dx) { end = 'stuck'; break; }
      if (side && dx === -side) { end = 'stuck'; break; }
      x += dx; side = dx; pts.push([x, y]);
    }
    return { pts, end };
  };
  SK.Game = Game;
})();
