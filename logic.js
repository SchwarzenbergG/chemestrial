/* Funkelnde Moleküle — molecule table and plug rules. No DOM. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    if (require.main === module) {
      const errors = api.selfCheck();
      if (errors.length) {
        console.error(errors.join("\n"));
        process.exit(1);
      }
      console.log("chemestrial logic ok (" + api.molecules.length + " molecules)");
    }
  }
  root.CM = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const VALENCE = { H: 1, C: 4, N: 3, O: 2, S: 2, Cl: 1 };
  const MAX_MISTAKES = 4;
  const CELEBRATIONS = ["h2", "o2", "n2", "hcl", "water", "co2", "h2s", "nh3", "ch4", "h2o2", "propane", "vinegar"];

  const molecules = [
    {
      id: "h2",
      formula: "H₂",
      band: "funken",
      celebrate: "h2",
      atoms: [
        { id: "a", el: "H", x: -0.46, y: 0 },
        { id: "b", el: "H", x: 0.46, y: 0 }
      ],
      bonds: [{ a: "a", b: "b", order: 1 }]
    },
    {
      id: "o2",
      formula: "O₂",
      band: "funken",
      celebrate: "o2",
      atoms: [
        { id: "a", el: "O", x: -0.4, y: 0 },
        { id: "b", el: "O", x: 0.4, y: 0 }
      ],
      bonds: [{ a: "a", b: "b", order: 2 }]
    },
    {
      id: "n2",
      formula: "N₂",
      band: "funken",
      celebrate: "n2",
      atoms: [
        { id: "a", el: "N", x: -0.36, y: 0 },
        { id: "b", el: "N", x: 0.36, y: 0 }
      ],
      bonds: [{ a: "a", b: "b", order: 3 }]
    },
    {
      id: "hcl",
      formula: "HCl",
      band: "funken",
      celebrate: "hcl",
      placed: ["cl"],
      atoms: [
        { id: "h", el: "H", x: -0.48, y: 0 },
        { id: "cl", el: "Cl", x: 0.32, y: 0 }
      ],
      bonds: [{ a: "h", b: "cl", order: 1 }]
    },
    {
      id: "h2o",
      formula: "H₂O",
      band: "tropfen",
      celebrate: "water",
      placed: ["o"],
      atoms: [
        { id: "o", el: "O", x: 0, y: -0.12 },
        { id: "h1", el: "H", x: -0.5, y: 0.42 },
        { id: "h2", el: "H", x: 0.5, y: 0.42 }
      ],
      bonds: [
        { a: "o", b: "h1", order: 1 },
        { a: "o", b: "h2", order: 1 }
      ]
    },
    {
      id: "co2",
      formula: "CO₂",
      band: "tropfen",
      celebrate: "co2",
      placed: ["c"],
      atoms: [
        { id: "o1", el: "O", x: -0.72, y: 0 },
        { id: "c", el: "C", x: 0, y: 0 },
        { id: "o2", el: "O", x: 0.72, y: 0 }
      ],
      bonds: [
        { a: "o1", b: "c", order: 2 },
        { a: "c", b: "o2", order: 2 }
      ]
    },
    {
      id: "h2s",
      formula: "H₂S",
      band: "tropfen",
      celebrate: "h2s",
      placed: ["s"],
      distractors: ["O"],
      atoms: [
        { id: "s", el: "S", x: 0, y: -0.12 },
        { id: "h1", el: "H", x: -0.5, y: 0.42 },
        { id: "h2", el: "H", x: 0.5, y: 0.42 }
      ],
      bonds: [
        { a: "s", b: "h1", order: 1 },
        { a: "s", b: "h2", order: 1 }
      ]
    },
    {
      id: "nh3",
      formula: "NH₃",
      band: "tropfen",
      celebrate: "nh3",
      placed: ["n"],
      distractors: ["O"],
      atoms: [
        { id: "n", el: "N", x: 0, y: 0 },
        { id: "h1", el: "H", x: 0, y: 0.68 },
        { id: "h2", el: "H", x: -0.62, y: -0.28 },
        { id: "h3", el: "H", x: 0.62, y: -0.28 }
      ],
      bonds: [
        { a: "n", b: "h1", order: 1 },
        { a: "n", b: "h2", order: 1 },
        { a: "n", b: "h3", order: 1 }
      ]
    },
    {
      id: "ch4",
      formula: "CH₄",
      band: "feuer",
      celebrate: "ch4",
      placed: ["c"],
      distractors: ["O"],
      atoms: [
        { id: "c", el: "C", x: 0, y: 0 },
        { id: "h1", el: "H", x: 0, y: -0.68 },
        { id: "h2", el: "H", x: 0, y: 0.68 },
        { id: "h3", el: "H", x: -0.68, y: 0 },
        { id: "h4", el: "H", x: 0.68, y: 0 }
      ],
      bonds: [
        { a: "c", b: "h1", order: 1 },
        { a: "c", b: "h2", order: 1 },
        { a: "c", b: "h3", order: 1 },
        { a: "c", b: "h4", order: 1 }
      ]
    },
    {
      id: "h2o2",
      formula: "H₂O₂",
      band: "feuer",
      celebrate: "h2o2",
      distractors: ["N"],
      atoms: [
        { id: "o1", el: "O", x: -0.28, y: -0.22 },
        { id: "o2", el: "O", x: 0.28, y: 0.22 },
        { id: "h1", el: "H", x: -0.78, y: -0.55 },
        { id: "h2", el: "H", x: 0.78, y: 0.55 }
      ],
      bonds: [
        { a: "o1", b: "o2", order: 1 },
        { a: "o1", b: "h1", order: 1 },
        { a: "o2", b: "h2", order: 1 }
      ]
    },
    {
      id: "c3h8",
      formula: "C₃H₈",
      band: "feuer",
      celebrate: "propane",
      placed: ["c1", "c2", "c3"],
      distractors: ["O", "N"],
      atoms: [
        { id: "c1", el: "C", x: -0.5, y: 0 },
        { id: "c2", el: "C", x: 0, y: 0 },
        { id: "c3", el: "C", x: 0.5, y: 0 },
        { id: "h1a", el: "H", x: -1.0, y: 0 },
        { id: "h1b", el: "H", x: -0.74, y: -0.46 },
        { id: "h1c", el: "H", x: -0.74, y: 0.46 },
        { id: "h2a", el: "H", x: 0, y: -0.58 },
        { id: "h2b", el: "H", x: 0, y: 0.58 },
        { id: "h3a", el: "H", x: 1.0, y: 0 },
        { id: "h3b", el: "H", x: 0.74, y: -0.46 },
        { id: "h3c", el: "H", x: 0.74, y: 0.46 }
      ],
      bonds: [
        { a: "c1", b: "c2", order: 1 },
        { a: "c2", b: "c3", order: 1 },
        { a: "c1", b: "h1a", order: 1 },
        { a: "c1", b: "h1b", order: 1 },
        { a: "c1", b: "h1c", order: 1 },
        { a: "c2", b: "h2a", order: 1 },
        { a: "c2", b: "h2b", order: 1 },
        { a: "c3", b: "h3a", order: 1 },
        { a: "c3", b: "h3b", order: 1 },
        { a: "c3", b: "h3c", order: 1 }
      ]
    },
    {
      id: "acetic",
      formula: "CH₃COOH",
      band: "perle",
      celebrate: "vinegar",
      placed: ["c1", "c2"],
      distractors: ["N", "Cl"],
      atoms: [
        { id: "c1", el: "C", x: -0.42, y: 0.1 },
        { id: "c2", el: "C", x: 0.12, y: 0.1 },
        { id: "h1", el: "H", x: -0.78, y: -0.32 },
        { id: "h2", el: "H", x: -0.78, y: 0.5 },
        { id: "h3", el: "H", x: -0.2, y: -0.38 },
        { id: "od", el: "O", x: 0.52, y: -0.38 },
        { id: "os", el: "O", x: 0.5, y: 0.58 },
        { id: "ho", el: "H", x: 0.98, y: 0.78 }
      ],
      bonds: [
        { a: "c1", b: "c2", order: 1 },
        { a: "c1", b: "h1", order: 1 },
        { a: "c1", b: "h2", order: 1 },
        { a: "c1", b: "h3", order: 1 },
        { a: "c2", b: "od", order: 2 },
        { a: "c2", b: "os", order: 1 },
        { a: "os", b: "ho", order: 1 }
      ]
    }
  ].map(normalize);

  const bands = [
    { id: "funken", levelIds: ["h2", "o2", "n2", "hcl"], preview: "o2" },
    { id: "tropfen", levelIds: ["h2o", "co2", "h2s", "nh3"], preview: "h2o" },
    { id: "feuer", levelIds: ["ch4", "h2o2", "c3h8"], preview: "ch4" },
    { id: "perle", levelIds: ["acetic"], preview: "acetic", finale: true }
  ];

  function normalize(mol) {
    mol.placed = mol.placed || [];
    mol.distractors = mol.distractors || [];
    mol.showNames = mol.band === "funken" || mol.band === "tropfen";
    mol.showFormula = mol.showNames;
    mol.ghostShape = mol.id === "acetic";
    return mol;
  }

  function byId(id) {
    for (let i = 0; i < molecules.length; i++) {
      if (molecules[i].id === id) return molecules[i];
    }
    return null;
  }

  function indexOf(id) {
    for (let i = 0; i < molecules.length; i++) {
      if (molecules[i].id === id) return i;
    }
    return -1;
  }

  function pairKey(a, b) {
    return a < b ? a + "\0" + b : b + "\0" + a;
  }

  function addOrder(bonds, a, b, n) {
    for (let i = 0; i < bonds.length; i++) {
      const bond = bonds[i];
      if ((bond.a === a && bond.b === b) || (bond.a === b && bond.b === a)) {
        bond.order += n;
        return bond;
      }
    }
    const created = { a: a, b: b, order: n, fixed: false };
    bonds.push(created);
    return created;
  }

  function degree(bonds, id) {
    let total = 0;
    for (let i = 0; i < bonds.length; i++) {
      const bond = bonds[i];
      if (bond.a === id || bond.b === id) total += bond.order;
    }
    return total;
  }

  function freeSockets(bonds, node) {
    return (VALENCE[node.el] || 0) - degree(bonds, node.id);
  }

  /* Player graph must be a piece of the real molecule. Identical atoms may swap. */
  function findAssignment(molecule, nodes, bonds) {
    const used = new Set();
    const assign = new Map();
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node.recipeId) continue;
      if (used.has(node.recipeId)) return null;
      let atom = null;
      for (let k = 0; k < molecule.atoms.length; k++) {
        if (molecule.atoms[k].id === node.recipeId) atom = molecule.atoms[k];
      }
      if (!atom || atom.el !== node.el) return null;
      used.add(node.recipeId);
      assign.set(node.id, node.recipeId);
    }
    const free = [];
    for (let i = 0; i < nodes.length; i++) {
      if (!nodes[i].recipeId) free.push(nodes[i]);
    }
    const recipeBond = new Map();
    for (let i = 0; i < molecule.bonds.length; i++) {
      const bond = molecule.bonds[i];
      recipeBond.set(pairKey(bond.a, bond.b), bond.order);
    }
    function bondsOk() {
      for (let i = 0; i < bonds.length; i++) {
        const bond = bonds[i];
        const left = assign.get(bond.a);
        const right = assign.get(bond.b);
        if (!left || !right) return false;
        const allowed = recipeBond.get(pairKey(left, right)) || 0;
        if (bond.order > allowed) return false;
      }
      return true;
    }
    function search(index) {
      if (index === free.length) return bondsOk();
      const node = free[index];
      for (let k = 0; k < molecule.atoms.length; k++) {
        const atom = molecule.atoms[k];
        if (atom.el !== node.el || used.has(atom.id)) continue;
        used.add(atom.id);
        assign.set(node.id, atom.id);
        if (search(index + 1)) return true;
        assign.delete(node.id);
        used.delete(atom.id);
      }
      return false;
    }
    if (!search(0)) return null;
    return assign;
  }

  function allows(molecule, nodes, bonds, move) {
    const nextNodes = nodes.map(function (node) {
      return { id: node.id, el: node.el, recipeId: node.recipeId || null };
    });
    const nextBonds = bonds.map(function (bond) {
      return { a: bond.a, b: bond.b, order: bond.order };
    });
    if (move.type === "place") {
      if (nextNodes.length > 0 || !VALENCE[move.el]) return false;
      nextNodes.push({ id: move.id, el: move.el, recipeId: null });
    } else if (move.type === "plug") {
      const target = nextNodes.find(function (node) { return node.id === move.targetId; });
      if (!target || !VALENCE[move.el] || freeSockets(nextBonds, target) < 1) return false;
      nextNodes.push({ id: move.id, el: move.el, recipeId: null });
      addOrder(nextBonds, move.id, move.targetId, 1);
    } else if (move.type === "order") {
      const a = nextNodes.find(function (node) { return node.id === move.a; });
      const b = nextNodes.find(function (node) { return node.id === move.b; });
      if (!a || !b || a.id === b.id) return false;
      if (freeSockets(nextBonds, a) < 1 || freeSockets(nextBonds, b) < 1) return false;
      addOrder(nextBonds, a.id, b.id, 1);
    } else {
      return false;
    }
    return !!findAssignment(molecule, nextNodes, nextBonds);
  }

  function isComplete(molecule, nodes, bonds) {
    if (nodes.length !== molecule.atoms.length) return false;
    const assign = findAssignment(molecule, nodes, bonds);
    if (!assign || assign.size !== molecule.atoms.length) return false;
    const player = new Map();
    for (let i = 0; i < bonds.length; i++) {
      const bond = bonds[i];
      const left = assign.get(bond.a);
      const right = assign.get(bond.b);
      if (!left || !right) return false;
      player.set(pairKey(left, right), bond.order);
    }
    if (player.size !== molecule.bonds.length) return false;
    for (let i = 0; i < molecule.bonds.length; i++) {
      const bond = molecule.bonds[i];
      if (player.get(pairKey(bond.a, bond.b)) !== bond.order) return false;
    }
    return true;
  }

  function fresh(molecule) {
    const nodes = [];
    const bonds = [];
    const recipeToInstance = {};
    molecule.atoms.forEach(function (atom) {
      if (molecule.placed.indexOf(atom.id) < 0) return;
      const id = "f-" + atom.id;
      recipeToInstance[atom.id] = id;
      nodes.push({
        id: id,
        el: atom.el,
        recipeId: atom.id,
        fixed: true,
        x: atom.x,
        y: atom.y
      });
    });
    molecule.bonds.forEach(function (bond) {
      const a = recipeToInstance[bond.a];
      const b = recipeToInstance[bond.b];
      if (a && b) bonds.push({ a: a, b: b, order: bond.order, fixed: true });
    });
    const tray = [];
    let t = 0;
    molecule.atoms.forEach(function (atom) {
      if (recipeToInstance[atom.id]) return;
      tray.push({ id: "t" + t++, el: atom.el });
    });
    molecule.distractors.forEach(function (el) {
      tray.push({ id: "t" + t++, el: el, distractor: true });
    });
    return { nodes: nodes, bonds: bonds, tray: tray };
  }

  function nextHint(molecule, nodes, bonds, tray) {
    if (nodes.length === 0) {
      for (let i = 0; i < tray.length; i++) {
        const bead = tray[i];
        if (allows(molecule, nodes, bonds, { type: "place", el: bead.el, id: "hint-new" })) {
          return { type: "place", el: bead.el, trayId: bead.id };
        }
      }
      return null;
    }
    for (let i = 0; i < tray.length; i++) {
      const bead = tray[i];
      for (let j = 0; j < nodes.length; j++) {
        const move = { type: "plug", el: bead.el, id: "hint-new", targetId: nodes[j].id };
        if (allows(molecule, nodes, bonds, move)) {
          return { type: "plug", el: bead.el, trayId: bead.id, targetId: nodes[j].id };
        }
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const move = { type: "order", a: nodes[i].id, b: nodes[j].id };
        if (allows(molecule, nodes, bonds, move)) return move;
      }
    }
    return null;
  }

  function starsPossible(mistakes, hints, stopped) {
    if (stopped) return 0;
    return Math.max(1, 3 - mistakes - hints);
  }

  function starsEarned(mistakes, hints) {
    return Math.max(1, 3 - mistakes - hints);
  }

  function unlocked(stars, id, unlockAll) {
    if (unlockAll) return true;
    const index = indexOf(id);
    if (index <= 0) return true;
    return !!(stars && stars[index - 1] > 0);
  }

  function commit(state, move) {
    if (move.type === "place") {
      state.nodes.push({ id: move.id, el: move.el, recipeId: null });
    } else if (move.type === "plug") {
      state.nodes.push({ id: move.id, el: move.el, recipeId: null });
      addOrder(state.bonds, move.id, move.targetId, 1);
    } else if (move.type === "order") {
      addOrder(state.bonds, move.a, move.b, 1);
    }
  }

  function solve(molecule) {
    const state = fresh(molecule);
    let steps = 0;
    while (!isComplete(molecule, state.nodes, state.bonds)) {
      const hint = nextHint(molecule, state.nodes, state.bonds, state.tray);
      if (!hint) return { error: "stuck " + molecule.id + " after " + steps, state: state };
      const move = {
        type: hint.type,
        el: hint.el,
        id: "s" + steps,
        targetId: hint.targetId,
        a: hint.a,
        b: hint.b
      };
      if (!allows(molecule, state.nodes, state.bonds, move)) {
        return { error: "hint refused " + molecule.id, state: state };
      }
      commit(state, move);
      if (hint.trayId) state.tray = state.tray.filter(function (bead) { return bead.id !== hint.trayId; });
      steps += 1;
      if (steps > 40) return { error: "too long " + molecule.id, state: state };
    }
    return { error: null, state: state, steps: steps };
  }

  function layoutIssue(molecule) {
    const by = {};
    molecule.atoms.forEach(function (atom) { by[atom.id] = atom; });
    const deg = {};
    molecule.atoms.forEach(function (atom) { deg[atom.id] = 0; });
    for (let i = 0; i < molecule.bonds.length; i++) {
      const bond = molecule.bonds[i];
      const left = by[bond.a];
      const right = by[bond.b];
      const dist = Math.hypot(left.x - right.x, left.y - right.y);
      if (dist < 0.45 || dist > 1.05) {
        return molecule.id + " " + bond.a + "-" + bond.b + " dist " + dist.toFixed(3);
      }
      deg[bond.a] += bond.order;
      deg[bond.b] += bond.order;
    }
    for (let i = 0; i < molecule.atoms.length; i++) {
      const atom = molecule.atoms[i];
      if (Math.abs(atom.x) > 1.15 || Math.abs(atom.y) > 1.05) return molecule.id + " " + atom.id + " out of frame";
      if (deg[atom.id] !== VALENCE[atom.el]) {
        return molecule.id + " " + atom.id + " valence " + deg[atom.id];
      }
    }
    return null;
  }

  function selfCheck() {
    const errors = [];
    function assert(cond, msg) {
      if (!cond) errors.push(msg);
    }
    assert(molecules.length === 12, "expected 12 molecules");
    molecules.forEach(function (molecule) {
      const layout = layoutIssue(molecule);
      if (layout) errors.push(layout);
      if (CELEBRATIONS.indexOf(molecule.celebrate) < 0) errors.push("celebration " + molecule.id);
      const solved = solve(molecule);
      if (solved.error) errors.push(solved.error);
      else {
        assert(isComplete(molecule, solved.state.nodes, solved.state.bonds), molecule.id + " complete");
        const leftovers = solved.state.tray.filter(function (bead) { return !bead.distractor; });
        assert(leftovers.length === 0, molecule.id + " left real atoms in the tray");
        assert(solved.state.tray.length === molecule.distractors.length, molecule.id + " distractor count");
      }
      const start = fresh(molecule);
      solved && start.nodes.length < molecule.atoms.length && assert(
        !isComplete(molecule, start.nodes, start.bonds),
        molecule.id + " should not start complete"
      );
      start.tray.filter(function (bead) { return bead.distractor; }).forEach(function (bead) {
        if (start.nodes.length === 0) {
          assert(!allows(molecule, start.nodes, start.bonds, { type: "place", el: bead.el, id: "bad" }), molecule.id + " placed distractor");
        } else {
          assert(
            !allows(molecule, start.nodes, start.bonds, { type: "plug", el: bead.el, id: "bad", targetId: start.nodes[0].id }),
            molecule.id + " plugged distractor"
          );
        }
      });
    });

    const water = byId("h2o");
    const wet = fresh(water);
    const oxygen = wet.nodes[0];
    assert(allows(water, wet.nodes, wet.bonds, { type: "plug", el: "H", id: "ha", targetId: oxygen.id }), "H on O");
    commit(wet, { type: "plug", el: "H", id: "ha", targetId: oxygen.id });
    assert(!allows(water, wet.nodes, wet.bonds, { type: "plug", el: "H", id: "hb", targetId: "ha" }), "water H-H refused");
    assert(allows(water, wet.nodes, wet.bonds, { type: "plug", el: "H", id: "hb", targetId: oxygen.id }), "second H");
    commit(wet, { type: "plug", el: "H", id: "hb", targetId: oxygen.id });
    assert(isComplete(water, wet.nodes, wet.bonds), "water either order");

    const dioxygen = byId("o2");
    const air = fresh(dioxygen);
    assert(allows(dioxygen, air.nodes, air.bonds, { type: "place", el: "O", id: "oa" }), "place O");
    commit(air, { type: "place", el: "O", id: "oa" });
    assert(allows(dioxygen, air.nodes, air.bonds, { type: "plug", el: "O", id: "ob", targetId: "oa" }), "first O-O");
    commit(air, { type: "plug", el: "O", id: "ob", targetId: "oa" });
    assert(!isComplete(dioxygen, air.nodes, air.bonds), "single bond is not oxygen gas");
    assert(allows(dioxygen, air.nodes, air.bonds, { type: "order", a: "oa", b: "ob" }), "double bond");
    commit(air, { type: "order", a: "oa", b: "ob" });
    assert(isComplete(dioxygen, air.nodes, air.bonds), "O2 done");
    assert(!allows(dioxygen, air.nodes, air.bonds, { type: "order", a: "oa", b: "ob" }), "third bond refused");

    const methane = byId("ch4");
    const fire = fresh(methane);
    assert(
      !allows(methane, fire.nodes, fire.bonds, { type: "plug", el: "O", id: "bad", targetId: fire.nodes[0].id }),
      "methane refuses oxygen"
    );

    const vinegar = byId("acetic");
    const nodes = vinegar.atoms.map(function (atom) {
      return { id: atom.id, el: atom.el, recipeId: atom.id };
    });
    const bonds = vinegar.bonds.map(function (bond) {
      return { a: bond.a, b: bond.b, order: bond.order };
    });
    assert(isComplete(vinegar, nodes, bonds), "vinegar full");
    const carbonyl = bonds.find(function (bond) {
      return bond.a === "od" || bond.b === "od";
    });
    carbonyl.order = 1;
    assert(!isComplete(vinegar, nodes, bonds), "vinegar needs the double oxygen");
    carbonyl.order = 2;
    assert(isComplete(vinegar, nodes, bonds), "vinegar double restored");

    const propane = fresh(byId("c3h8"));
    assert(!isComplete(byId("c3h8"), propane.nodes, propane.bonds), "propane chain is not finished");
    assert(propane.nodes.length === 3, "propane starts with three carbons");

    assert(starsEarned(0, 0) === 3, "clean stars");
    assert(starsEarned(1, 1) === 1, "one star floor");
    assert(starsEarned(3, 0) === 1, "finish still stars");
    assert(starsPossible(2, 0, false) === 1, "possible");
    assert(starsPossible(0, 0, true) === 0, "stopped");
    const zeros = molecules.map(function () { return 0; });
    assert(unlocked(zeros, "h2", false), "first open");
    assert(!unlocked(zeros, "o2", false), "second shut");
    zeros[0] = 1;
    assert(unlocked(zeros, "o2", false), "second opens");
    assert(!unlocked(zeros, "acetic", false), "finale shut");
    assert(unlocked(zeros, "acetic", true), "alle opens finale");
    return errors;
  }

  return {
    VALENCE: VALENCE,
    MAX_MISTAKES: MAX_MISTAKES,
    molecules: molecules,
    bands: bands,
    byId: byId,
    indexOf: indexOf,
    fresh: fresh,
    allows: allows,
    isComplete: isComplete,
    nextHint: nextHint,
    findAssignment: findAssignment,
    addOrder: addOrder,
    freeSockets: freeSockets,
    degree: degree,
    starsPossible: starsPossible,
    starsEarned: starsEarned,
    unlocked: unlocked,
    selfCheck: selfCheck
  };
});
