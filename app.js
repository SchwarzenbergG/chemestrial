/* Funkelnde Moleküle — screens, plugging, stars, and sound. */
(function () {
  const STORE = "chemestrial-v1";
  const SVGNS = "http://www.w3.org/2000/svg";
  const HUE = { H: 206, C: 210, N: 222, O: 4, S: 48, Cl: 130 };
  const SIZE = { H: 64, C: 78, N: 72, O: 72, S: 76, Cl: 80 };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const unlockAll = new URLSearchParams(location.search).get("alle") === "1";

  const home = document.getElementById("home");
  const levelsScreen = document.getElementById("levels");
  const play = document.getElementById("play");
  const dialog = document.getElementById("done");
  const dish = document.getElementById("dish");
  const tray = document.getElementById("tray");
  const feedback = document.getElementById("feedback");
  const motesCanvas = document.getElementById("motes");
  const motesCtx = motesCanvas.getContext("2d");

  let save = load();
  let I = CI.create(save.lang);
  let game = null;
  let resetArmed = false;
  let closeAction = "levels";
  let ignoreClose = false;
  let drag = null;
  let suppressClick = false;
  let fx = null;
  let easeRaf = 0;
  let audioCtx = null;

  const motes = [];
  for (let i = 0; i < 36; i++) {
    motes.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.4,
      s: 0.004 + Math.random() * 0.01,
      w: 0.4 + Math.random(),
      p: Math.random() * 6,
      a: 0.15 + Math.random() * 0.35
    });
  }

  function load() {
    const fresh = { stars: CM.molecules.map(function () { return 0; }), sound: true, lang: CI.choose(navigator.language) };
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || "null");
      if (!raw || typeof raw !== "object") return fresh;
      const stars = fresh.stars.slice();
      if (Array.isArray(raw.stars)) {
        for (let i = 0; i < stars.length; i++) {
          const n = Number(raw.stars[i]);
          stars[i] = n === 1 || n === 2 || n === 3 ? n : 0;
        }
      }
      fresh.stars = stars;
      if (typeof raw.sound === "boolean") fresh.sound = raw.sound;
      if (raw.lang === "de" || raw.lang === "en") fresh.lang = raw.lang;
    } catch (err) {
      return fresh;
    }
    return fresh;
  }

  function persist() {
    localStorage.setItem(STORE, JSON.stringify({ stars: save.stars, sound: save.sound, lang: save.lang }));
  }

  function fill(template, map) {
    return String(template).replace(/\{(\w+)\}/g, function (_m, key) {
      return map[key] != null ? String(map[key]) : "";
    });
  }

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  function show(name) {
    home.hidden = name !== "home";
    levelsScreen.hidden = name !== "levels";
    play.hidden = name !== "play";
  }

  function go(path) {
    const next = "#" + path;
    if (location.hash === next) route();
    else location.hash = path;
  }

  function applyStatic() {
    document.documentElement.lang = I.code;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = I.t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.title = I.t(el.getAttribute("data-i18n-title"));
    });
    document.querySelectorAll("#langs button").forEach(function (btn) {
      btn.classList.toggle("on", btn.dataset.lang === I.code);
      btn.setAttribute("aria-pressed", btn.dataset.lang === I.code ? "true" : "false");
    });
    const resetBtn = document.getElementById("reset");
    resetBtn.textContent = resetArmed ? I.t("resetConfirm") : I.t("reset");
    updateSoundButton();
  }

  function appTitle() {
    return I.t("appTitle").replace(/\s+/g, " ");
  }

  function fitAppTitle() {
    const h1 = document.getElementById("app-title");
    if (!h1 || home.hidden) return;
    const wrap = h1.parentElement;
    const pad = parseFloat(getComputedStyle(wrap).paddingLeft) + parseFloat(getComputedStyle(wrap).paddingRight);
    const available = wrap.clientWidth - pad - 4;
    if (available < 8) return;
    h1.style.fontSize = "";
    let size = parseFloat(getComputedStyle(h1).fontSize);
    if (!size) return;
    const textWidth = function () {
      const range = document.createRange();
      range.selectNodeContents(h1);
      return range.getBoundingClientRect().width;
    };
    h1.style.fontSize = size + "px";
    for (let step = 0; step < 4 && textWidth() > available; step++) {
      size = Math.max(18, size * available / textWidth());
      h1.style.fontSize = size + "px";
    }
  }

  function starSVG(on) {
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", "star " + (on ? "on" : "off"));
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(SVGNS, "path");
    path.setAttribute("d", "M12 2.4 14.7 8.5 21.4 9.2 16.4 13.8 17.8 20.4 12 17.1 6.2 20.4 7.6 13.8 2.6 9.2 9.3 8.5Z");
    svg.appendChild(path);
    return svg;
  }

  function renderStars(host, lit, label, big) {
    host.replaceChildren();
    host.classList.toggle("big", !!big);
    host.setAttribute("role", "img");
    host.setAttribute("aria-label", label);
    for (let i = 0; i < 3; i++) host.appendChild(starSVG(i < lit));
  }

  function bandStats(band) {
    let done = 0;
    let stars = 0;
    band.levelIds.forEach(function (id) {
      const n = save.stars[CM.indexOf(id)] || 0;
      stars += n;
      if (n > 0) done += 1;
    });
    return { done: done, stars: stars, total: band.levelIds.length };
  }

  function pearlTotal() {
    return save.stars.reduce(function (sum, n) { return sum + n; }, 0);
  }

  function sheen() {
    const span = document.createElement("span");
    span.className = "sheen";
    return span;
  }

  function addPips(btn, free) {
    if (free <= 0) return;
    const pips = document.createElement("span");
    pips.className = "pips";
    pips.style.setProperty("--n", String(free));
    for (let i = 0; i < free; i++) {
      const pip = document.createElement("i");
      pip.style.setProperty("--i", String(i));
      pips.appendChild(pip);
    }
    btn.appendChild(pips);
  }

  function offsets(order) {
    if (order >= 3) return [-12, 0, 12];
    if (order === 2) return [-9, 9];
    return [0];
  }

  function strandPath(a, b, offset) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ox = (-dy / len) * offset;
    const oy = (dx / len) * offset;
    return "M " + (a.x + ox) + " " + (a.y + oy) + " L " + (b.x + ox) + " " + (b.y + oy);
  }

  function mini(host, id) {
    host.replaceChildren();
    const stage = document.createElement("span");
    stage.className = "mini-stage";
    const mol = CM.byId(id);
    const scale = mol.atoms.length > 6 ? 38 : 46;
    const origin = { x: 74, y: 62 };
    const at = function (atom) {
      return { x: origin.x + atom.x * scale, y: origin.y + atom.y * scale };
    };
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 148 124");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.style.inset = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    mol.bonds.forEach(function (bond) {
      const left = mol.atoms.find(function (atom) { return atom.id === bond.a; });
      const right = mol.atoms.find(function (atom) { return atom.id === bond.b; });
      offsets(bond.order).forEach(function (offset) {
        const path = document.createElementNS(SVGNS, "path");
        path.setAttribute("class", "thread");
        path.setAttribute("d", strandPath(at(left), at(right), offset * 0.45));
        svg.appendChild(path);
      });
    });
    stage.appendChild(svg);
    mol.atoms.forEach(function (atom) {
      const bead = document.createElement("span");
      bead.className = "bead mini el-" + atom.el;
      bead.style.setProperty("--hue", String(HUE[atom.el]));
      const p = at(atom);
      bead.style.left = p.x + "px";
      bead.style.top = p.y + "px";
      const face = document.createElement("span");
      face.className = "face";
      face.textContent = atom.el;
      bead.append(sheen(), face);
      stage.appendChild(bead);
    });
    host.appendChild(stage);
  }

  function renderHome() {
    document.title = appTitle();
    document.getElementById("pearls").textContent = I.pearls(pearlTotal());
    CM.bands.forEach(function (band) {
      const copy = I.band(band.id);
      const card = document.getElementById("open-" + band.id);
      const stats = bandStats(band);
      document.getElementById("kicker-" + band.id).textContent = I.t(band.finale ? "kickerFinale" : "kickerMode");
      document.getElementById("title-" + band.id).textContent = copy.title;
      document.getElementById("lead-" + band.id).textContent = copy.lead;
      const finaleOpen = !band.finale || unlockAll || (save.stars[CM.indexOf("c3h8")] || 0) > 0;
      card.disabled = !finaleOpen;
      card.classList.toggle("locked", !finaleOpen);
      card.classList.toggle("open", finaleOpen);
      document.getElementById("meta-" + band.id).textContent = finaleOpen
        ? I.summary(stats.done, stats.total, stats.stars, stats.total * 3)
        : I.lockedMeta(I.level("c3h8").name);
      mini(document.getElementById("preview-" + band.id), band.preview);
    });
    fitAppTitle();
  }

  function renderLevels(bandId) {
    const band = CM.bands.find(function (item) { return item.id === bandId; });
    const copy = I.band(bandId);
    document.getElementById("levels-kicker").textContent = I.t("choose");
    document.getElementById("levels-title").textContent = copy.title;
    document.getElementById("levels-lead").textContent = copy.lead;
    document.title = copy.title + " · " + appTitle();
    const list = document.getElementById("level-list");
    list.replaceChildren();
    let marked = false;
    band.levelIds.forEach(function (id) {
      const mol = CM.byId(id);
      const index = CM.indexOf(id);
      const level = I.level(id);
      const open = CM.unlocked(save.stars, id, unlockAll);
      const best = save.stars[index] || 0;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "level";
      btn.dataset.level = id;
      btn.disabled = !open;
      if (!open) btn.classList.add("locked");
      if (open && best === 0 && !marked) {
        btn.classList.add("next-up");
        marked = true;
      }
      const no = document.createElement("span");
      no.className = "lvl-no";
      no.textContent = String(index + 1);
      const name = document.createElement("span");
      name.className = "lvl-name";
      name.textContent = level.name;
      const blurb = document.createElement("span");
      blurb.className = "lvl-blurb";
      blurb.textContent = level.blurb + " · " + mol.formula;
      const stars = document.createElement("span");
      stars.className = "stars";
      renderStars(stars, best, I.starsLabel(best), false);
      btn.append(no, name, stars, blurb);
      list.appendChild(btn);
    });
  }

  function updateSoundButton() {
    const btn = document.getElementById("sound");
    btn.textContent = I.t(save.sound ? "soundOn" : "soundOff");
    btn.setAttribute("aria-pressed", save.sound ? "true" : "false");
  }

  function setNote(kind, key, cls) {
    if (!game) return;
    game.note = { kind: kind, key: key, cls: cls || "" };
    paintNote();
  }

  function paintNote() {
    if (!game || !game.note) {
      feedback.textContent = "";
      feedback.className = "";
      return;
    }
    const level = I.level(game.mol.id);
    if (game.note.kind === "coach") feedback.textContent = level.coach;
    else if (game.note.kind === "shape") feedback.textContent = level.shape;
    else if (game.note.kind === "again") {
      feedback.textContent = game.note.left === 1
        ? I.t("againBond")
        : fill(I.t("againBonds"), { n: game.note.left });
    } else feedback.textContent = game.note.key ? I.t(game.note.key) : "";
    feedback.className = game.note.cls || "";
  }

  function updateHud() {
    if (!game) return;
    const level = I.level(game.mol.id);
    document.getElementById("play-kicker").textContent = I.band(game.mol.band).title;
    document.getElementById("play-title").textContent = level.name;
    document.getElementById("goal").textContent = level.goal;
    const formula = document.getElementById("formula");
    formula.hidden = !(game.mol.showFormula || game.coachUsed);
    formula.textContent = game.mol.formula;
    const lit = game.done ? game.earned : CM.starsPossible(game.mistakes, game.hints, false);
    renderStars(document.getElementById("live-stars"), lit, I.starsLabel(lit), false);
    document.getElementById("coach").disabled = !!(game.done || game.coachUsed);
    document.getElementById("hint").disabled = !!(game.done || game.hints >= 2);
    document.getElementById("undo").disabled = !!(game.done || game.history.length === 0);
    tray.setAttribute("aria-label", I.t("tray"));
    document.title = level.name + " · " + appTitle();
    const warm = game.mol.id === "c3h8"
      ? game.nodes.filter(function (node) { return node.el === "H"; }).length / 8
      : 0;
    dish.style.setProperty("--warm", String(warm));
    updateSoundButton();
    paintNote();
  }

  function pointOf(x, y) {
    const w = dish.clientWidth || 1;
    const h = dish.clientHeight || 1;
    const scale = Math.min(w, h) * 0.33;
    return { x: w / 2 + x * scale, y: h / 2 + y * scale };
  }

  let floatX = 0;
  let floatY = 0;
  let floatT0 = 0;

  function clearFloat() {
    floatX = 0;
    floatY = 0;
    floatT0 = 0;
    const layer = document.getElementById("float");
    if (layer) layer.style.transform = "translate3d(0,0,0)";
  }

  function applyFloat(now) {
    const layer = document.getElementById("float");
    if (!layer) return;
    if (reduceMotion || !game || game.done || play.hidden) {
      if (floatX || floatY || floatT0) clearFloat();
      return;
    }
    if (!floatT0) floatT0 = now;
    const t = now - floatT0;
    const x = Math.sin(t / 1700) * 4.5;
    const y = (1 - Math.cos(t / 2200)) * 1.5;
    floatX = x;
    floatY = y;
    layer.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0)";
  }

  function recipeOrder(assign, aId, bId) {
    if (!assign) return 0;
    const left = assign.get(aId);
    const right = assign.get(bId);
    if (!left || !right) return 0;
    for (let i = 0; i < game.mol.bonds.length; i++) {
      const bond = game.mol.bonds[i];
      if ((bond.a === left && bond.b === right) || (bond.a === right && bond.b === left)) return bond.order;
    }
    return 0;
  }

  function drawLinks() {
    const group = document.getElementById("strands");
    group.replaceChildren();
    const w = dish.clientWidth || 1;
    const h = dish.clientHeight || 1;
    const svg = document.getElementById("links");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    if (game.mol.ghostShape) {
      game.mol.bonds.forEach(function (bond) {
        const left = game.mol.atoms.find(function (atom) { return atom.id === bond.a; });
        const right = game.mol.atoms.find(function (atom) { return atom.id === bond.b; });
        offsets(bond.order).forEach(function (offset) {
          const path = document.createElementNS(SVGNS, "path");
          path.setAttribute("class", "ghost-thread");
          path.setAttribute("d", strandPath(pointOf(left.x, left.y), pointOf(right.x, right.y), offset));
          group.appendChild(path);
        });
      });
    }
    const byId = {};
    game.nodes.forEach(function (node) { byId[node.id] = node; });
    game.bonds.forEach(function (bond) {
      const left = byId[bond.a];
      const right = byId[bond.b];
      if (!left || !right) return;
      const a = pointOf(left.x, left.y);
      const b = pointOf(right.x, right.y);
      const target = Math.max(bond.order, recipeOrder(game.assign, bond.a, bond.b));
      const slots = offsets(target);
      slots.forEach(function (offset, index) {
        const d = strandPath(a, b, offset);
        const ghost = index >= bond.order;
        const thread = document.createElementNS(SVGNS, "path");
        thread.setAttribute("class", ghost ? "ghost-thread" : "thread");
        thread.setAttribute("d", d);
        const pearls = document.createElementNS(SVGNS, "path");
        pearls.setAttribute("class", ghost ? "ghost-pearls" : "pearls");
        pearls.setAttribute("d", d);
        group.append(thread, pearls);
      });
    });
  }

  function placeBeads() {
    if (!game) return;
    game.nodes.forEach(function (node) {
      const el = dish.querySelector('[data-node="' + node.id + '"]');
      if (!el) return;
      const p = pointOf(node.x, node.y);
      el.style.left = p.x + "px";
      el.style.top = p.y + "px";
    });
    dish.querySelectorAll("[data-ghost]").forEach(function (el) {
      const p = pointOf(Number(el.dataset.x), Number(el.dataset.y));
      el.style.left = p.x + "px";
      el.style.top = p.y + "px";
    });
    drawLinks();
  }

  function renderMarks() {
    if (!game) return;
    tray.querySelectorAll("[data-tray]").forEach(function (btn) {
      const on = btn.dataset.tray === game.carry;
      btn.classList.toggle("carry", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    dish.querySelectorAll("[data-node]").forEach(function (btn) {
      const node = game.nodes.find(function (item) { return item.id === btn.dataset.node; });
      const free = node ? CM.freeSockets(game.bonds, node) > 0 : false;
      btn.classList.toggle("picked", btn.dataset.node === game.stagePick);
      btn.classList.toggle("armed", !!(game.carry && free));
    });
  }

  function beadButton(el, opts) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bead " + opts.kind + " el-" + el + (opts.just ? " just" : "");
    btn.style.setProperty("--hue", String(HUE[el] || 200));
    if (opts.kind === "stage") btn.style.setProperty("--size", (SIZE[el] || 70) + "px");
    const face = document.createElement("span");
    face.className = "face";
    face.textContent = el;
    btn.append(sheen(), face);
    if (opts.showName) {
      const name = document.createElement("span");
      name.className = "el-name";
      name.textContent = I.el(el);
      btn.appendChild(name);
    }
    addPips(btn, opts.free);
    btn.setAttribute("aria-label", I.el(el) + " " + el + ", " + I.sockets(Math.max(0, opts.free)));
    return btn;
  }

  function renderBoard() {
    if (!game) return;
    const ghosts = document.getElementById("ghosts");
    const beads = document.getElementById("beads");
    ghosts.replaceChildren();
    beads.replaceChildren();
    if (game.mol.ghostShape) {
      game.mol.atoms.forEach(function (atom) {
        if (game.mol.placed.indexOf(atom.id) >= 0) return;
        const ghost = document.createElement("span");
        ghost.className = "ghost-bead";
        ghost.dataset.ghost = atom.id;
        ghost.dataset.x = String(atom.x);
        ghost.dataset.y = String(atom.y);
        ghosts.appendChild(ghost);
      });
    }
    game.nodes.forEach(function (node) {
      const free = CM.freeSockets(game.bonds, node);
      const btn = beadButton(node.el, {
        kind: "stage",
        free: free,
        showName: false,
        just: node.just
      });
      btn.dataset.node = node.id;
      beads.appendChild(btn);
      node.just = false;
    });
    tray.replaceChildren();
    game.tray.forEach(function (bead) {
      const btn = beadButton(bead.el, {
        kind: "tray",
        free: CM.VALENCE[bead.el] || 0,
        showName: game.mol.showNames,
        just: false
      });
      btn.dataset.tray = bead.id;
      tray.appendChild(btn);
    });
    updateHud();
    renderMarks();
    game.assign = CM.findAssignment(game.mol, game.nodes, game.bonds);
    placeBeads();
  }

  function clearHint() {
    dish.classList.remove("hint");
    document.querySelectorAll(".hint").forEach(function (el) { el.classList.remove("hint"); });
  }

  function showHint(hint) {
    clearHint();
    if (!hint) return;
    if (hint.trayId) {
      const el = tray.querySelector('[data-tray="' + hint.trayId + '"]');
      if (el) el.classList.add("hint");
    }
    if (hint.type === "place") dish.classList.add("hint");
    ["targetId", "a", "b"].forEach(function (key) {
      if (!hint[key]) return;
      const el = dish.querySelector('[data-node="' + hint[key] + '"]');
      if (el) el.classList.add("hint");
    });
    const token = ++game.hintToken;
    window.setTimeout(function () {
      if (!game || game.hintToken !== token) return;
      clearHint();
    }, 2300);
  }

  function seat(target, el) {
    const neighbors = [];
    game.bonds.forEach(function (bond) {
      let other = null;
      if (bond.a === target.id) other = bond.b;
      else if (bond.b === target.id) other = bond.a;
      if (!other) return;
      const node = game.nodes.find(function (item) { return item.id === other; });
      if (node) neighbors.push(node);
    });
    let angle;
    if (!neighbors.length) angle = -Math.PI / 2;
    else {
      const angles = neighbors.map(function (node) {
        return Math.atan2(node.y - target.y, node.x - target.x);
      }).sort(function (a, b) { return a - b; });
      let bestGap = -1;
      let best = 0;
      for (let i = 0; i < angles.length; i++) {
        const a = angles[i];
        const b = i + 1 < angles.length ? angles[i + 1] : angles[0] + Math.PI * 2;
        const gap = b - a;
        if (gap > bestGap) {
          bestGap = gap;
          best = a + gap / 2;
        }
      }
      angle = best;
    }
    const dist = 0.92;
    return {
      x: Math.max(-1.05, Math.min(1.05, target.x + Math.cos(angle) * dist)),
      y: Math.max(-0.9, Math.min(0.9, target.y + Math.sin(angle) * dist))
    };
  }

  function dishPoint(clientX, clientY) {
    const rect = dish.getBoundingClientRect();
    const w = dish.clientWidth || 1;
    const h = dish.clientHeight || 1;
    const scale = Math.min(w, h) * 0.33;
    return {
      x: Math.max(-1, Math.min(1, (clientX - rect.left - w / 2) / scale)),
      y: Math.max(-0.85, Math.min(0.85, (clientY - rect.top - h / 2) / scale))
    };
  }

  function nodeClient(node) {
    const rect = dish.getBoundingClientRect();
    const p = pointOf(node.x, node.y);
    return { x: rect.left + p.x + floatX, y: rect.top + p.y + floatY };
  }

  function threadsLeft(aId, bId) {
    const assign = CM.findAssignment(game.mol, game.nodes, game.bonds);
    const wanted = recipeOrder(assign, aId, bId);
    let have = 0;
    for (let i = 0; i < game.bonds.length; i++) {
      const bond = game.bonds[i];
      if ((bond.a === aId && bond.b === bId) || (bond.a === bId && bond.b === aId)) have = bond.order;
    }
    return Math.max(0, wanted - have);
  }

  function mistake(el) {
    game.mistakes += 1;
    playBad();
    if (el) {
      el.classList.add("nope");
      window.setTimeout(function () { el.classList.remove("nope"); }, 460);
    }
    if (game.mistakes >= CM.MAX_MISTAKES) stopLevel();
    else updateHud();
  }

  function returnBead(el) {
    game.tray.push({ id: "r" + game.seq++, el: el });
  }

  function afterMove(pair) {
    playOk();
    const complete = CM.isComplete(game.mol, game.nodes, game.bonds);
    if (complete) game.done = true;
    if (!complete && pair) {
      const left = threadsLeft(pair[0], pair[1]);
      if (left > 0) {
        game.note = { kind: "again", left: left, cls: "coach" };
        paintNote();
      } else setNote("key", "fits", "info");
    } else if (!complete) setNote("key", "fits", "info");
    renderBoard();
    if (complete) finishLevel();
  }

  function fillBond(aId, bId) {
    let orders = 1;
    while (orders < 4 && CM.allows(game.mol, game.nodes, game.bonds, { type: "order", a: aId, b: bId })) {
      CM.addOrder(game.bonds, aId, bId, 1);
      orders += 1;
    }
    return orders;
  }

  function tryPlace(trayId, pos) {
    const bead = game.tray.find(function (item) { return item.id === trayId; });
    const button = tray.querySelector('[data-tray="' + trayId + '"]');
    if (!bead || !game || game.done) return;
    const move = { type: "place", el: bead.el, id: "n" + game.seq };
    if (!CM.allows(game.mol, game.nodes, game.bonds, move)) {
      setNote("key", "nomatch", "bad");
      mistake(button);
      return;
    }
    const spot = pos || { x: 0, y: 0 };
    game.seq += 1;
    game.nodes.push({ id: move.id, el: bead.el, recipeId: null, fixed: false, x: spot.x, y: spot.y, just: true });
    game.tray = game.tray.filter(function (item) { return item.id !== trayId; });
    game.history.push({ kind: "place", nodeId: move.id, el: bead.el });
    game.carry = null;
    game.stagePick = null;
    afterMove(null);
  }

  function tryPlug(trayId, targetId) {
    const bead = game.tray.find(function (item) { return item.id === trayId; });
    const target = game.nodes.find(function (node) { return node.id === targetId; });
    const button = tray.querySelector('[data-tray="' + trayId + '"]');
    if (!bead || !target || !game || game.done) return;
    if (CM.freeSockets(game.bonds, target) < 1) {
      setNote("key", "nosocket", "bad");
      mistake(button);
      return;
    }
    const move = { type: "plug", el: bead.el, id: "n" + game.seq, targetId: targetId };
    if (!CM.allows(game.mol, game.nodes, game.bonds, move)) {
      setNote("key", "nomatch", "bad");
      mistake(button);
      return;
    }
    const pos = seat(target, bead.el);
    game.seq += 1;
    game.nodes.push({
      id: move.id,
      el: bead.el,
      recipeId: null,
      fixed: false,
      x: pos.x,
      y: pos.y,
      just: true
    });
    CM.addOrder(game.bonds, move.id, targetId, 1);
    const orders = fillBond(move.id, targetId);
    game.tray = game.tray.filter(function (item) { return item.id !== trayId; });
    game.history.push({ kind: "plug", nodeId: move.id, el: bead.el, a: move.id, b: targetId, orders: orders });
    game.carry = null;
    game.stagePick = null;
    afterMove([move.id, targetId]);
  }

  function tryOrder(aId, bId) {
    const a = game.nodes.find(function (node) { return node.id === aId; });
    const b = game.nodes.find(function (node) { return node.id === bId; });
    const button = dish.querySelector('[data-node="' + bId + '"]');
    if (!a || !b || !game || game.done) return;
    if (CM.freeSockets(game.bonds, a) < 1 || CM.freeSockets(game.bonds, b) < 1) {
      setNote("key", "nosocket", "bad");
      mistake(button);
      return;
    }
    if (!CM.allows(game.mol, game.nodes, game.bonds, { type: "order", a: aId, b: bId })) {
      setNote("key", "nomatch", "bad");
      mistake(button);
      return;
    }
    CM.addOrder(game.bonds, aId, bId, 1);
    game.history.push({ kind: "order", a: aId, b: bId });
    game.stagePick = null;
    afterMove([aId, bId]);
  }

  function undo() {
    if (!game || game.done) return;
    const step = game.history.pop();
    if (!step) {
      setNote("key", "undoempty", "info");
      return;
    }
    if (step.kind === "place") {
      game.nodes = game.nodes.filter(function (node) { return node.id !== step.nodeId; });
      returnBead(step.el);
    } else {
      const bond = game.bonds.find(function (item) {
        return (item.a === step.a && item.b === step.b) || (item.a === step.b && item.b === step.a);
      });
      if (bond) {
        bond.order -= step.orders || 1;
        if (bond.order <= 0) game.bonds = game.bonds.filter(function (item) { return item !== bond; });
      }
      if (step.kind === "plug") {
        game.nodes = game.nodes.filter(function (node) { return node.id !== step.nodeId; });
        returnBead(step.el);
      }
    }
    game.carry = null;
    game.stagePick = null;
    game.note = null;
    renderBoard();
  }

  function giveCoach() {
    if (!game || game.done || game.coachUsed) return;
    game.coachUsed = true;
    setNote("coach", "", "coach");
    updateHud();
  }

  function giveHint() {
    if (!game || game.done || game.hints >= 2) return;
    const hint = CM.nextHint(game.mol, game.nodes, game.bonds, game.tray);
    if (!hint) return;
    game.hints += 1;
    playHint();
    const key = hint.type === "place" ? "hintPlace" : hint.type === "order" ? "hintOrder" : "hintPlug";
    setNote("key", key, "coach");
    updateHud();
    showHint(hint);
  }

  function stopLevel() {
    game.done = true;
    game.stopped = true;
    game.earned = 0;
    const fresh = CM.fresh(game.mol);
    shuffle(fresh.tray);
    game.nodes = fresh.nodes;
    game.bonds = fresh.bonds;
    game.tray = fresh.tray;
    game.history = [];
    game.carry = null;
    game.stagePick = null;
    setNote("key", "stoppedBody", "bad");
    renderBoard();
    openDialog();
  }

  function finishLevel() {
    clearFloat();
    const index = CM.indexOf(game.mol.id);
    game.earned = CM.starsEarned(game.mistakes, game.hints);
    game.prevStars = save.stars[index] || 0;
    save.stars[index] = Math.max(game.prevStars, game.earned);
    persist();
    setNote("shape", "", "coach");
    updateHud();
    easeToLayout(function () {
      playWin(game.mol.celebrate);
      beginShow();
    });
  }

  function easeToLayout(done) {
    const assign = CM.findAssignment(game.mol, game.nodes, game.bonds);
    if (!assign) {
      done();
      return;
    }
    const from = {};
    const to = {};
    game.nodes.forEach(function (node) {
      from[node.id] = { x: node.x, y: node.y };
      const recipeId = assign.get(node.id);
      const atom = game.mol.atoms.find(function (item) { return item.id === recipeId; });
      to[node.id] = atom ? { x: atom.x, y: atom.y } : from[node.id];
    });
    const t0 = performance.now();
    const dur = reduceMotion ? 0 : 800;
    const step = function (now) {
      const k = dur === 0 ? 1 : Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      game.nodes.forEach(function (node) {
        node.x = from[node.id].x + (to[node.id].x - from[node.id].x) * eased;
        node.y = from[node.id].y + (to[node.id].y - from[node.id].y) * eased;
      });
      placeBeads();
      if (k < 1) easeRaf = requestAnimationFrame(step);
      else done();
    };
    easeRaf = requestAnimationFrame(step);
  }

  function beginShow() {
    const level = I.level(game.mol.id);
    const name = document.getElementById("cele-name");
    name.hidden = false;
    name.replaceChildren();
    const fame = document.createElement("span");
    fame.className = "fame";
    fame.textContent = level.fame;
    const formula = document.createElement("span");
    formula.className = "fame-formula";
    formula.textContent = game.mol.formula;
    name.append(fame, formula);
    document.getElementById("skip").hidden = false;
    play.classList.add("celebrating");
    requestAnimationFrame(function () { placeBeads(); });
    fx = CX.play(document.getElementById("fx"), game.mol.celebrate, reduceMotion, function () {
      fx = null;
      endShow();
      openDialog();
    });
  }

  function wipeFx() {
    const canvas = document.getElementById("fx");
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.classList.remove("on");
  }

  function endShow() {
    play.classList.remove("celebrating");
    wipeFx();
    document.getElementById("cele-name").hidden = true;
    document.getElementById("skip").hidden = true;
    if (game) placeBeads();
  }

  function stopMotion() {
    clearFloat();
    if (easeRaf) cancelAnimationFrame(easeRaf);
    easeRaf = 0;
    if (fx) {
      fx.stop(true);
      fx = null;
    }
    endShow();
  }

  function openDialog() {
    if (!game) return;
    const already = dialog.open;
    const level = I.level(game.mol.id);
    document.getElementById("done-kicker").textContent = level.name;
    document.getElementById("done-replay").textContent = I.t("replay");
    document.getElementById("done-next").textContent = I.t("next");
    document.getElementById("done-list").textContent = I.t("list");
    if (game.stopped) {
      document.getElementById("done-title").textContent = I.t("stoppedTitle");
      document.getElementById("done-shape").textContent = I.t("stoppedBody");
      renderStars(document.getElementById("done-stars"), 0, I.starsLabel(0), true);
    } else {
      document.getElementById("done-title").textContent = level.fame;
      document.getElementById("done-shape").textContent = level.shape;
      renderStars(document.getElementById("done-stars"), game.earned, I.starsLabel(game.earned), true);
    }
    let stats = fill(I.t("stats"), { m: game.mistakes, h: game.hints });
    if (!game.stopped && game.prevStars > game.earned) stats += " " + I.t("bestKept");
    document.getElementById("done-stats").textContent = stats;
    const index = CM.indexOf(game.mol.id);
    const next = CM.molecules[index + 1];
    const nextBtn = document.getElementById("done-next");
    if (next && CM.unlocked(save.stars, next.id, unlockAll)) {
      nextBtn.hidden = false;
      game.nextId = next.id;
    } else {
      nextBtn.hidden = true;
      game.nextId = null;
    }
    closeAction = "levels";
    if (!already) dialog.showModal();
  }

  function startLevel(id) {
    stopMotion();
    const mol = CM.byId(id);
    const state = CM.fresh(mol);
    shuffle(state.tray);
    game = {
      mol: mol,
      nodes: state.nodes,
      bonds: state.bonds,
      tray: state.tray,
      seq: 1,
      mistakes: 0,
      hints: 0,
      coachUsed: false,
      done: false,
      stopped: false,
      earned: 0,
      prevStars: save.stars[CM.indexOf(id)] || 0,
      history: [],
      carry: null,
      stagePick: null,
      hintToken: 0,
      note: null,
      nextId: null
    };
    renderBoard();
  }

  function refreshView() {
    applyStatic();
    if (!home.hidden) renderHome();
    else if (!levelsScreen.hidden) {
      const parts = (location.hash.replace(/^#/, "") || "/").split("/").filter(Boolean);
      if (parts[0]) renderLevels(parts[0]);
    } else if (game) {
      renderBoard();
      if (!document.getElementById("cele-name").hidden) {
        const level = I.level(game.mol.id);
        const fame = document.querySelector("#cele-name .fame");
        if (fame) fame.textContent = level.fame;
      }
      if (dialog.open) openDialog();
    }
  }

  function route() {
    if (dialog.open) {
      ignoreClose = true;
      dialog.close();
    }
    stopMotion();
    const parts = (location.hash.replace(/^#/, "") || "/").split("/").filter(Boolean);
    if (parts[0] === "play" && CM.byId(parts[1])) {
      if (!CM.unlocked(save.stars, parts[1], unlockAll)) {
        go("/" + CM.byId(parts[1]).band);
        return;
      }
      show("play");
      startLevel(parts[1]);
      return;
    }
    game = null;
    if (CM.bands.some(function (band) { return band.id === parts[0]; })) {
      show("levels");
      renderLevels(parts[0]);
      return;
    }
    show("home");
    renderHome();
  }

  function ctx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, when, dur, type, gain) {
    if (!save.sound) return;
    const ac = ctx();
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, when);
    amp.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(amp);
    amp.connect(ac.destination);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  function playOk() {
    if (!save.sound) return;
    const t = ctx().currentTime;
    tone(620, t, 0.12, "sine", 0.04);
    tone(930, t + 0.07, 0.16, "sine", 0.035);
  }

  function playBad() {
    if (!save.sound) return;
    tone(196, ctx().currentTime, 0.18, "triangle", 0.03);
  }

  function playHint() {
    if (!save.sound) return;
    tone(740, ctx().currentTime, 0.2, "sine", 0.03);
  }

  function playWin(id) {
    if (!save.sound) return;
    const t = ctx().currentTime;
    const notes = id === "water" ? [523, 659, 784, 880, 1046] : [523, 659, 784, 1046];
    notes.forEach(function (freq, i) { tone(freq, t + i * 0.1, 0.28, "sine", 0.04); });
    if (id === "water") tone(1318, t + 0.55, 0.4, "triangle", 0.03);
  }

  function hitTest(x, y, ignore) {
    const prev = ignore.style.visibility;
    ignore.style.visibility = "hidden";
    const el = document.elementFromPoint(x, y);
    ignore.style.visibility = prev;
    if (!el) return {};
    const node = el.closest("[data-node]");
    if (node) return { nodeId: node.dataset.node };
    if (el.closest("#dish")) return { dish: true };
    return {};
  }

  function onTrayClick(id) {
    if (!game || game.done) return;
    if (game.nodes.length === 0) {
      tryPlace(id);
      return;
    }
    game.stagePick = null;
    game.carry = game.carry === id ? null : id;
    renderMarks();
  }

  function releaseNear(trayId, clientX, clientY, overDish) {
    const bead = game.tray.find(function (item) { return item.id === trayId; });
    if (!bead || !game || game.done) return;
    const near = [];
    game.nodes.forEach(function (node) {
      const at = nodeClient(node);
      near.push({ node: node, d: Math.hypot(clientX - at.x, clientY - at.y) });
    });
    near.sort(function (a, b) { return a.d - b.d; });
    const close = near.filter(function (item) { return item.d <= 108; });
    for (let i = 0; i < close.length; i++) {
      const target = close[i].node;
      if (CM.freeSockets(game.bonds, target) < 1) continue;
      const move = { type: "plug", el: bead.el, id: "n" + game.seq, targetId: target.id };
      if (CM.allows(game.mol, game.nodes, game.bonds, move)) {
        tryPlug(trayId, target.id);
        return;
      }
    }
    if (close.length) {
      const button = tray.querySelector('[data-tray="' + trayId + '"]');
      const blocked = CM.freeSockets(game.bonds, close[0].node) < 1;
      setNote("key", blocked ? "nosocket" : "nomatch", "bad");
      mistake(button);
      return;
    }
    if (overDish) setNote("key", "closer", "info");
  }

  function onStageClick(id) {
    if (!game || game.done) return;
    if (game.carry) {
      tryPlug(game.carry, id);
      return;
    }
    if (game.stagePick && game.stagePick !== id) {
      tryOrder(game.stagePick, id);
      return;
    }
    game.stagePick = game.stagePick === id ? null : id;
    renderMarks();
  }

  function liftGhost(info) {
    const rect = info.el.getBoundingClientRect();
    const ghost = info.el.cloneNode(true);
    ghost.classList.remove("carry");
    ghost.classList.add("drag-ghost");
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.position = "fixed";
    ghost.style.zIndex = "30";
    ghost.style.left = rect.left + "px";
    ghost.style.top = rect.top + "px";
    ghost.style.width = rect.width + "px";
    ghost.style.height = rect.height + "px";
    ghost.style.margin = "0";
    ghost.style.pointerEvents = "none";
    document.body.appendChild(ghost);
    info.el.classList.add("dragging-source");
    info.ghost = ghost;
    info.originLeft = rect.left;
    info.originTop = rect.top;
  }

  function moveGhost(info, clientX, clientY) {
    info.ghost.style.left = (info.originLeft + clientX - info.x) + "px";
    info.ghost.style.top = (info.originTop + clientY - info.y) + "px";
  }

  function clearGhost(info) {
    if (info.ghost) {
      info.ghost.remove();
      info.ghost = null;
    }
    if (info.el) info.el.classList.remove("dragging-source");
  }

  function finishDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const info = drag;
    drag = null;
    const moved = info.moved;
    clearGhost(info);
    if (!moved || !game || game.done) return;
    suppressClick = true;
    window.setTimeout(function () { suppressClick = false; }, 0);
    const hit = hitTest(event.clientX, event.clientY, info.el);
    if (hit.nodeId) tryPlug(info.id, hit.nodeId);
    else if (game.nodes.length === 0 && hit.dish) tryPlace(info.id, dishPoint(event.clientX, event.clientY));
    else releaseNear(info.id, event.clientX, event.clientY, !!hit.dish);
  }

  tray.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) return;
    const btn = event.target.closest("[data-tray]");
    if (!btn || !game || game.done) return;
    drag = {
      id: btn.dataset.tray,
      el: btn,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      pointerId: event.pointerId,
      ghost: null
    };
    btn.setPointerCapture(event.pointerId);
  });

  tray.addEventListener("pointermove", function (event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 8) return;
    drag.moved = true;
    if (!drag.ghost) liftGhost(drag);
    moveGhost(drag, event.clientX, event.clientY);
  });

  tray.addEventListener("pointerup", finishDrag);
  tray.addEventListener("pointercancel", finishDrag);

  tray.addEventListener("click", function (event) {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    const btn = event.target.closest("[data-tray]");
    if (!btn || !game || game.done) return;
    onTrayClick(btn.dataset.tray);
  });

  document.getElementById("beads").addEventListener("click", function (event) {
    const btn = event.target.closest("[data-node]");
    if (!btn) return;
    onStageClick(btn.dataset.node);
  });

  dish.addEventListener("click", function (event) {
    if (event.target.closest("[data-node]")) return;
    if (!game || game.done || !game.carry) return;
    if (game.nodes.length === 0) tryPlace(game.carry, dishPoint(event.clientX, event.clientY));
    else releaseNear(game.carry, event.clientX, event.clientY, true);
  });

  document.getElementById("coach").addEventListener("click", giveCoach);
  document.getElementById("hint").addEventListener("click", giveHint);
  document.getElementById("undo").addEventListener("click", undo);
  document.getElementById("back-home").addEventListener("click", function () { go("/"); });
  document.getElementById("back-levels").addEventListener("click", function () {
    if (game) go("/" + game.mol.band);
    else go("/");
  });
  CM.bands.forEach(function (band) {
    document.getElementById("open-" + band.id).addEventListener("click", function () {
      go("/" + band.id);
    });
  });
  document.getElementById("level-list").addEventListener("click", function (event) {
    const btn = event.target.closest("[data-level]");
    if (!btn || btn.disabled) return;
    go("/play/" + btn.dataset.level);
  });
  document.getElementById("langs").addEventListener("click", function (event) {
    const btn = event.target.closest("[data-lang]");
    if (!btn) return;
    save.lang = btn.dataset.lang;
    I = CI.create(save.lang);
    persist();
    refreshView();
  });
  document.getElementById("sound").addEventListener("click", function () {
    save.sound = !save.sound;
    persist();
    updateSoundButton();
    if (save.sound) playOk();
  });
  document.getElementById("reset").addEventListener("click", function () {
    const btn = document.getElementById("reset");
    if (!resetArmed) {
      resetArmed = true;
      btn.textContent = I.t("resetConfirm");
      window.setTimeout(function () {
        if (!resetArmed) return;
        resetArmed = false;
        btn.textContent = I.t("reset");
      }, 2500);
      return;
    }
    save.stars = CM.molecules.map(function () { return 0; });
    persist();
    resetArmed = false;
    btn.textContent = I.t("reset");
    renderHome();
  });
  document.getElementById("skip").addEventListener("click", function () {
    if (fx) fx.stop(false);
  });
  document.getElementById("fx").addEventListener("click", function () {
    if (fx) fx.stop(false);
  });
  document.getElementById("done-replay").addEventListener("click", function () {
    closeAction = "replay";
    dialog.close();
  });
  document.getElementById("done-next").addEventListener("click", function () {
    closeAction = "next";
    dialog.close();
  });
  document.getElementById("done-list").addEventListener("click", function () {
    closeAction = "levels";
    dialog.close();
  });
  dialog.addEventListener("close", function () {
    if (ignoreClose) {
      ignoreClose = false;
      return;
    }
    if (!game) return;
    if (closeAction === "replay") startLevel(game.mol.id);
    else if (closeAction === "next" && game.nextId) go("/play/" + game.nextId);
    else go("/" + game.mol.band);
  });
  window.addEventListener("hashchange", route);
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || dialog.open) return;
    if (fx) {
      fx.stop(false);
      return;
    }
    if (game && !play.hidden) go("/" + game.mol.band);
  });
  window.addEventListener("resize", function () {
    sizeMotes();
    fitAppTitle();
    if (game && !play.hidden) placeBeads();
  });
  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(function () {
      if (game && !play.hidden) placeBeads();
    });
    observer.observe(dish);
  }

  function sizeMotes() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    motesCanvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    motesCanvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    motesCanvas.style.width = window.innerWidth + "px";
    motesCanvas.style.height = window.innerHeight + "px";
  }

  function drawMotes(now) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = motesCanvas.clientWidth;
    const h = motesCanvas.clientHeight;
    motesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    motesCtx.clearRect(0, 0, w, h);
    if (reduceMotion) return;
    const t = now / 1000;
    motes.forEach(function (mote) {
      const x = ((mote.x + Math.sin(t * mote.w + mote.p) * 0.02) % 1) * w;
      const y = ((mote.y - t * mote.s) % 1 + 1) % 1 * h;
      motesCtx.beginPath();
      motesCtx.arc(x, y, mote.r, 0, Math.PI * 2);
      motesCtx.strokeStyle = "rgba(255,255,255," + mote.a + ")";
      motesCtx.lineWidth = 1.1;
      motesCtx.stroke();
    });
  }

  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    drawMotes(now);
    applyFloat(now);
  }

  applyStatic();
  sizeMotes();
  route();
  requestAnimationFrame(loop);
})();
