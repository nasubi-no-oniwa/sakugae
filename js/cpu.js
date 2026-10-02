// =============================================
//  CPU（よわい／ふつう／つよい）
// =============================================
(function () {
  const C = SK.CONFIG, L = C.LANES, R = C.ROWS;
  const LV = {
    easy:   { think: 3.2, block: 0.25, trap: 0,    smart: 0.3, reserve: 0, swapWait: 8, maxFence: 4 },
    normal: { think: 2.0, block: 0.6,  trap: 0.25, smart: 0.7, reserve: 1, swapWait: 4, maxFence: 6 },
    hard:   { think: 1.2, block: 0.9, trap: 0.6,  smart: 1,   reserve: 2, swapWait: 2, maxFence: 8 }
  };
  class Cpu {
    constructor(game, owner, level) { this.g = game; this.me = owner; this.L = LV[level] || LV.normal; this.t = 1 + Math.random(); this.swapSeen = 0; }
    update(dt) {
      const g = this.g; if (g.over) return;
      this.t -= dt;
      if (this.t > 0) return;
      this.t = this.L.think * (0.7 + Math.random() * 0.6);
      this.act();
    }
    act() {
      const g = this.g, me = this.me, opp = 1 - me, Lv = this.L;
      // 1) 入れかえ：相手の柵が多い列をもらい、自分の柵が少ない列をわたす
      if (g.canSwap(me) && !g.pending) {
        this.swapSeen += Lv.think;
        if (this.swapSeen >= Lv.swapWait) {
          let bo = 0, bm = 0;
          for (let i = 1; i < 5; i++) { if (g.bandCount(opp, i) > g.bandCount(opp, bo)) bo = i; if (g.bandCount(me, i) < g.bandCount(me, bm)) bm = i; }
          if (g.bandCount(opp, bo) - g.bandCount(me, bm) >= 1) { g.swap(me, bm, bo); return; }
        }
      } else this.swapSeen = 0;
      // 2) 守り：自分の陣地に入ってきた敵の、すぐ前に柵を置く
      const foes = g.soldiers.filter(s => s.owner === opp && g.mineRow(me, s.y));
      foes.sort((a, b) => (me === 0 ? b.y - a.y : a.y - b.y));
      for (const s of foes) {
        if (g.coins[me] < 1 || g.fenceCount(me) >= Lv.maxFence) break;
        const k = s.owner === 0 ? s.y : s.y + 1;
        if (!g.H[k][s.x]) {
          if (g.mineH(me, k) && Math.random() < Lv.block) { g.toggleFence(me, 'H', k, s.x); return; }
        } else if (Math.random() < Lv.trap) {
          // 前をふさいだ敵の、横もふさいで立ち往生させる
          for (const dx of [-1, 1]) {
            const kk = dx < 0 ? s.x : s.x + 1;
            if (kk >= 1 && kk < L && !g.V[s.y][kk] && g.coins[me] >= 1) { g.toggleFence(me, 'V', s.y, kk); return; }
          }
        }
      }
      // 3) もらった柵は、こわしてコインにする（敵のすぐ前のものは残す）
      if (g.refundable(me) && (g.coins[me] < 3 || Math.random() < 0.5)) {
        const cand = [];
        for (let k = 0; k <= R; k++) if (g.mineH(me, k)) for (let x = 0; x < L; x++) if (g.H[k][x] === 2 && !foes.some(s => s.x === x)) cand.push(['H', k, x]);
        for (let y = 0; y < R; y++) if (g.mineRow(me, y)) for (let k = 1; k < L; k++) if (g.V[y][k] === 2 && !foes.some(s => s.y === y)) cand.push(['V', y, k]);
        if (cand.length) { const c = cand[Math.floor(Math.random() * cand.length)]; g.toggleFence(me, c[0], c[1], c[2]); return; }
      }
      if (g.coins[me] < 1) return;
      // 4) 攻め：通れるレーンから兵士を出す
      if (g.coins[me] > (foes.length ? Lv.reserve : 0)) {
        const lens = []; for (let x = 0; x < L; x++) lens.push(g.pathLen(me, x));
        const open = lens.map((v, x) => [v, x]).filter(a => a[0] < Infinity);
        let x;
        if (open.length && Math.random() < Lv.smart) {
          const best = Math.min(...open.map(a => a[0]));
          const bs = open.filter(a => a[0] <= best + 1); x = bs[Math.floor(Math.random() * bs.length)][1];
        } else if (open.length || Math.random() < 0.3) x = Math.floor(Math.random() * L);
        if (x != null) g.spawn(me, x);
      }
    }
  }
  SK.Cpu = Cpu;
})();
