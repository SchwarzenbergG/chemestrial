/* Funkelnde Moleküle — one full-screen painter per molecule. */
(function (root) {
  const THEME = {
    h2: "#f3e2a8",
    o2: "#8fd0e8",
    n2: "#b9c6ea",
    hcl: "#f0d56a",
    water: "#7ec8e3",
    co2: "#c5ebe4",
    h2s: "#9dce8a",
    nh3: "#8fce73",
    ch4: "#f0a35a",
    h2o2: "#e7f6ff",
    propane: "#f2b56a",
    vinegar: "#e6c56a"
  };

  function rgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
  }

  function wash(ctx, w, h, hex, alpha) {
    ctx.fillStyle = rgba(hex, alpha);
    ctx.fillRect(0, 0, w, h);
  }

  function balloons(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    wash(ctx, w, h, "#2a1840", 0.28);
    for (let i = 0; i < 8; i++) {
      const x = (w * (i + 0.5)) / 8 + Math.sin(t * 0.6 + i) * 18;
      const y = h + 40 - ((t * 46 + i * 80) % (h + 120));
      ctx.fillStyle = i % 2 ? "rgba(255, 228, 170, 0.88)" : "rgba(255, 250, 242, 0.82)";
      ctx.beginPath();
      ctx.ellipse(x, y, 26, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 236, 190, 0.8)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y + 34);
      ctx.quadraticCurveTo(x + 12, y + 78, x - 4, y + 120);
      ctx.stroke();
    }
    for (let i = 0; i < 28; i++) {
      const x = (i * 131 + t * 20) % w;
      const y = (i * 77 + t * 36) % h;
      ctx.fillStyle = "rgba(255, 220, 140, 0.85)";
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function ribbons(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    wash(ctx, w, h, "#063044", 0.42);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const y0 = h * (0.18 + i * 0.15);
      for (let x = 0; x <= w; x += 12) {
        const y = y0 + Math.sin(x * 0.012 + t * 0.8 + i) * 22 + Math.sin(t * 0.4 + i) * 10;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(170, 230, 245," + (0.28 + i * 0.06) + ")";
      ctx.lineWidth = 16 - i;
      ctx.stroke();
    }
  }

  function night(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    wash(ctx, w, h, "#0b1430", 0.55);
    for (let i = 0; i < 60; i++) {
      const x = (i * 97) % w;
      const y = (i * 53) % h;
      const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.8 + i));
      ctx.fillStyle = "rgba(230, 236, 255," + twinkle + ")";
      ctx.beginPath();
      ctx.arc(x, y, i % 7 === 0 ? 2.4 : 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function lemon(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    wash(ctx, w, h, "#f0d56a", 0.22);
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < 3; i++) {
      const radius = ((t * 80 + i * 90) % 280) + 20;
      ctx.strokeStyle = "rgba(255, 226, 120," + (1 - radius / 320) + ")";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 18; i++) {
      const angle = i * 0.9 + t * 0.4;
      const dist = 40 + (i * 17 + t * 28) % 180;
      ctx.fillStyle = "rgba(255, 214, 80, 0.85)";
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist * 0.6, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function water(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    wash(ctx, w, h, "#08304a", 0.38);
    for (let i = 0; i < 4; i++) {
      const y = h * (0.2 + i * 0.16) + Math.sin(t * 0.7 + i) * 16;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 18) {
        const yy = y + Math.sin(x * 0.02 + t * 1.1 + i) * 12;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.strokeStyle = "rgba(190, 240, 255, 0.2)";
      ctx.lineWidth = 22;
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(232, 248, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = 0; i < 80; i++) {
      const x = (i * 89) % w;
      const speed = 160 + (i % 5) * 36;
      const y = ((i * 47) + t * speed) % (h + 30) - 16;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 0.6, y + 16);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(110, 196, 226, 0.38)";
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 14) {
      const y = h - 78 - Math.sin(x * 0.018 + t * 1.3) * 16 - Math.sin(x * 0.007 - t * 0.6) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  function bubbles(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    wash(ctx, w, h, "#d8fff4", 0.16);
    for (let i = 0; i < 36; i++) {
      const x = (i * 113) % w;
      const radius = 8 + (i % 6) * 6;
      const y = h + 20 - ((t * (40 + (i % 4) * 18) + i * 40) % (h + 80));
      ctx.strokeStyle = "rgba(220, 255, 248, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fill();
    }
    leaf(ctx, w * 0.72, h * 0.62, t);
  }

  function leaf(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.6) * 0.08);
    ctx.fillStyle = "rgba(120, 190, 110, 0.85)";
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.quadraticCurveTo(46, -10, 0, -48);
    ctx.quadraticCurveTo(-46, -10, 0, 20);
    ctx.fill();
    ctx.restore();
  }

  function cloud(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    wash(ctx, w, h, "#1d3a22", 0.35);
    for (let i = 0; i < 5; i++) {
      const x = ((t * 28 + i * w / 4) % (w + 180)) - 90;
      const y = h * (0.25 + (i % 3) * 0.18);
      const pop = (t + i) % 4;
      const scale = pop > 3.2 ? 1 - (pop - 3.2) / 0.8 : 1;
      ctx.fillStyle = "rgba(170, 220, 140," + (0.35 * scale) + ")";
      ctx.beginPath();
      ctx.ellipse(x, y, 70 * scale, 36 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 40, y + 6, 48 * scale, 28 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      if (pop > 3.2) {
        ctx.fillStyle = "rgba(255, 244, 210, 0.9)";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function garden(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w / 2, 0, 20, w / 2, h * 0.3, h * 0.7);
    glow.addColorStop(0, "rgba(210, 245, 170, 0.45)");
    glow.addColorStop(1, "rgba(20, 50, 24, 0.35)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) {
      leaf(ctx, (w * (i + 0.4)) / 9, h * 0.72 + Math.sin(t + i) * 8, t + i);
    }
  }

  function campfire(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    wash(ctx, w, h, "#2a1208", 0.45);
    ctx.fillStyle = "rgba(255, 140, 50, 0.35)";
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) {
      const flame = 90 + Math.sin(x * 0.04 + t * 2) * 24 + Math.sin(x * 0.01 + t) * 30;
      ctx.lineTo(x, h - flame);
    }
    ctx.lineTo(w, h);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 210, 120, 0.45)";
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) {
      const flame = 46 + Math.sin(x * 0.05 + t * 2.4) * 12;
      ctx.lineTo(x, h - flame);
    }
    ctx.lineTo(w, h);
    ctx.fill();
    for (let i = 0; i < 22; i++) {
      const x = (i * 127) % w;
      const y = h - ((t * 36 + i * 28) % (h * 0.7));
      ctx.fillStyle = "rgba(255, 170, 70, 0.8)";
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function fizz(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    wash(ctx, w, h, "#d7f1ff", 0.2);
    for (let i = 0; i < 70; i++) {
      const x = (i * 73 + Math.sin(t + i) * 8) % w;
      const y = h - ((t * (50 + (i % 5) * 20) + i * 19) % (h + 10));
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath();
      ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function lantern(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    const pulse = 0.72 + Math.sin(t * 1.2) * 0.08;
    const glow = ctx.createRadialGradient(w / 2, h * 0.62, 10, w / 2, h * 0.62, Math.min(w, h) * 0.55);
    glow.addColorStop(0, "rgba(255, 214, 140," + (0.85 * pulse) + ")");
    glow.addColorStop(0.45, "rgba(240, 140, 60, 0.35)");
    glow.addColorStop(1, "rgba(40, 16, 8, 0.45)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255, 228, 180, 0.9)";
    ctx.lineWidth = 3;
    ctx.strokeRect(w / 2 - 28, h * 0.58, 56, 72);
    ctx.fillStyle = "rgba(255, 196, 90, 0.85)";
    ctx.fillRect(w / 2 - 16, h * 0.58 + 16, 32, 40);
  }

  function kitchen(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    wash(ctx, w, h, "#4a3010", 0.28);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const y0 = h * (0.3 + i * 0.14);
      for (let x = 0; x <= w; x += 10) {
        const y = y0 + Math.sin(x * 0.02 + t * 0.9 + i) * 14;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = i % 2 ? "rgba(230, 190, 80, 0.55)" : "rgba(255, 236, 190, 0.4)";
      ctx.lineWidth = 10;
      ctx.stroke();
    }
    for (let i = 0; i < 16; i++) {
      const x = (i * 109 + t * 12) % w;
      const y = (i * 61 + Math.sin(t + i) * 20) % h;
      ctx.fillStyle = "rgba(140, 200, 110, 0.8)";
      ctx.fillRect(x, y, 7, 7);
    }
  }

  const PAINT = {
    h2: balloons,
    o2: ribbons,
    n2: night,
    hcl: lemon,
    water: water,
    co2: bubbles,
    h2s: cloud,
    nh3: garden,
    ch4: campfire,
    h2o2: fizz,
    propane: lantern,
    vinegar: kitchen
  };

  function fit(canvas) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function still(ctx, w, h, hex) {
    ctx.clearRect(0, 0, w, h);
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, rgba(hex, 0.18));
    gradient.addColorStop(1, rgba(hex, 0.55));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  function play(canvas, id, reduced, onDone) {
    let finished = false;
    let raf = 0;
    let timer = 0;
    const theme = THEME[id] || THEME.water;
    const paint = PAINT[id] || water;
    canvas.classList.add("on");

    function wipe() {
      const ctx = canvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.remove("on");
    }

    function finish() {
      if (finished) return;
      finished = true;
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
      wipe();
      onDone();
    }

    const box = fit(canvas);
    if (reduced) {
      still(box.ctx, box.w, box.h, theme);
      timer = setTimeout(finish, 1500);
    } else {
      const t0 = performance.now();
      const frame = function (now) {
        if (finished) return;
        const t = (now - t0) / 1000;
        if (t >= 5) {
          finish();
          return;
        }
        const live = fit(canvas);
        paint(live.ctx, live.w, live.h, t);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    return {
      stop: function (silent) {
        if (silent) {
          finished = true;
          if (raf) cancelAnimationFrame(raf);
          if (timer) clearTimeout(timer);
          wipe();
          return;
        }
        finish();
      }
    };
  }

  root.CX = { play: play, THEME: THEME };
})(typeof globalThis !== "undefined" ? globalThis : this);
