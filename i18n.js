/* Funkelnde Moleküle — German and English copy. */
(function (root) {
  const PACKS = {
    de: {
      eyebrow: "Chemie · 11–13",
      appTitle: "Funkelnde Moleküle",
      lead: "Nimm Atome aus der Schale und stecke sie richtig zusammen.",
      how: "Tippe ein Atom an, es schwebt in die Schale. Das nächste bringst du nahe genug heran, dann steckt es sich fest.",
      reset: "Fortschritt löschen",
      resetConfirm: "Wirklich löschen?",
      fine: "Jeder Fehlversuch und jede Hilfe kostet einen Stern. Drei Sterne gibt es ohne Fehler und ohne Hilfe. Nach vier Fehlversuchen endet das Level.",
      pearls: "Perlen {n} / 36",
      summary: "{done} von {total} Leveln · {stars} von {max} Sternen",
      starsLabel: "{n} von 3 Sternen",
      lockedMeta: "Noch zu: {name} abschließen",
      choose: "Wähle ein Level",
      backHome: "Start",
      backLevels: "Level",
      coach: "Merksatz",
      coachTitle: "Zeigt den Merksatz. Kostet keinen Stern.",
      hint: "Hilfe",
      hintTitle: "Hebt den nächsten Schritt hervor. Kostet einen Stern.",
      undo: "Rückgängig",
      undoTitle: "Nimmt den letzten Stecker zurück.",
      socketOne: "{n} Steckstelle frei",
      socketMany: "{n} Steckstellen frei",
      nomatch: "Das passt hier nicht.",
      nosocket: "Hier ist keine Steckstelle mehr frei.",
      plugfirst: "Setz das Atom an eine leuchtende Steckstelle.",
      undoempty: "Es gibt nichts zum Zurücknehmen.",
      againBond: "Noch ein Faden. Tippe die beiden noch einmal an.",
      againBonds: "Noch {n} Fäden. Tippe die beiden noch einmal an.",
      closer: "Bring es näher an das andere Atom.",
      fits: "Passt.",
      hintPlace: "Tippe das leuchtende Atom an. Es schwebt dann in der Schale.",
      hintPlug: "Stecke das leuchtende Atom an die leuchtende Stelle.",
      hintOrder: "Diese beiden Atome brauchen noch einen Faden.",
      stoppedTitle: "Vier Versuche sind vorbei",
      stoppedBody: "Das Molekül wartet noch.",
      bestKept: "Dein bester Stand bleibt.",
      replay: "Nochmal",
      next: "Weiter",
      list: "Alle Level",
      skip: "Fertig",
      stats: "{m} Fehlversuche · {h} Hilfen",
      placeHere: "In die Schale legen",
      pickFirst: "Wähle zuerst ein Atom aus der Schale.",
      tray: "Atome",
      soundOn: "Ton an",
      soundOff: "Ton aus",
      kickerMode: "Band",
      kickerFinale: "Abschluss",
      elements: {
        H: "Wasserstoff",
        C: "Kohlenstoff",
        N: "Stickstoff",
        O: "Sauerstoff",
        S: "Schwefel",
        Cl: "Chlor"
      },
      bands: {
        funken: { title: "Erste Funken", lead: "Zwei Atome und die ersten Fäden." },
        tropfen: { title: "Helle Tropfen", lead: "Ein Atom in der Mitte, und manchmal ein Fremdling in der Schale." },
        feuer: { title: "Warmes Feuer", lead: "Die Formel steckt im Merksatz. Die Kette wird länger." },
        perle: { title: "Küchenperle", lead: "Essig. Das Gerüst steht, du setzt die saure Ecke." }
      },
      levels: {
        h2: {
          name: "Leichter Hauch",
          blurb: "Wasserstoff, das leichteste Gas",
          goal: "Baue Wasserstoff.",
          coach: "Wasserstoff hat eine Steckstelle. Zwei Atome teilen sie sich.",
          shape: "Ein Faden zwischen zwei Wasserstoffatomen.",
          fame: "Wasserstoff"
        },
        o2: {
          name: "Frische Luft",
          blurb: "Sauerstoff, die Luft zum Atmen",
          goal: "Baue Sauerstoff.",
          coach: "Zwei Steckstellen zwischen denselben Atomen sind eine Doppelbindung.",
          shape: "Eine Doppelbindung. So ist der Sauerstoff in der Luft.",
          fame: "Sauerstoff"
        },
        n2: {
          name: "Stiller Himmel",
          blurb: "Stickstoff, der größte Teil der Luft",
          goal: "Baue Stickstoff.",
          coach: "Drei Steckstellen zwischen denselben Atomen sind eine Dreifachbindung. Fast die ganze Luft ist dieses Molekül.",
          shape: "Eine Dreifachbindung. Der größte Teil der Luft.",
          fame: "Stickstoff"
        },
        hcl: {
          name: "Sauerperle",
          blurb: "Chlorwasserstoff, der saure Helfer im Magen",
          goal: "Baue Chlorwasserstoff.",
          coach: "Chlor hat hier auch eine Steckstelle. Chlorwasserstoff ist der saure Helfer im Magen. Wir bauen nur das Bild.",
          shape: "Ein Faden. Nur das Bild, kein Rezept.",
          fame: "Chlorwasserstoff"
        },
        h2o: {
          name: "Regenperle",
          blurb: "Wasser, zum Trinken und als Regen",
          goal: "Baue Wasser.",
          coach: "Sauerstoff sitzt in der Mitte und hat zwei Steckstellen. Wasser ist geknickt.",
          shape: "Wasser ist geknickt, nicht gerade.",
          fame: "Wasser"
        },
        co2: {
          name: "Sprudel",
          blurb: "Kohlendioxid, in der Limo und in der Atemluft",
          goal: "Baue Kohlendioxid.",
          coach: "Kohlenstoff hat vier Steckstellen. Hier werden daraus zwei Doppelbindungen, in einer geraden Linie.",
          shape: "Kohlendioxid ist eine gerade Linie.",
          fame: "Kohlendioxid"
        },
        h2s: {
          name: "Stilles Ei",
          blurb: "Schwefelwasserstoff, der Geruch fauler Eier",
          goal: "Baue Schwefelwasserstoff.",
          coach: "Schwefel hat hier zwei Steckstellen, wie Sauerstoff. Ja, so riechen faule Eier. Das Molekül bleibt im Spiel.",
          shape: "Geknickt wie Wasser. Und ja, faule Eier.",
          fame: "Schwefelwasserstoff"
        },
        nh3: {
          name: "Gartenhauch",
          blurb: "Ammoniak, Nahrung für Pflanzen",
          goal: "Baue Ammoniak.",
          coach: "Stickstoff hat drei Steckstellen.",
          shape: "Stickstoff in der Mitte, drei Wasserstoffe.",
          fame: "Ammoniak"
        },
        ch4: {
          name: "Lagerfeuer",
          blurb: "Methan, das Gas im Lagerfeuer und im Sumpf",
          goal: "Baue Methan.",
          coach: "Methan ist CH₄. Kohlenstoff hat vier Steckstellen und kann vier Wasserstoffe halten.",
          shape: "Kohlenstoff in der Mitte, vier Wasserstoffe.",
          fame: "Methan"
        },
        h2o2: {
          name: "Blasenbad",
          blurb: "Wasserstoffperoxid, das leise Blubbern",
          goal: "Baue Wasserstoffperoxid.",
          coach: "Wasserstoffperoxid ist H₂O₂. Jeder Sauerstoff behält eine Steckstelle für Wasserstoff und eine für den anderen Sauerstoff.",
          shape: "Eine Zickzack-Kette.",
          fame: "Wasserstoffperoxid"
        },
        c3h8: {
          name: "Zeltlicht",
          blurb: "Propan, das Gas im Campingkocher",
          goal: "Baue Propan.",
          coach: "Propan ist C₃H₈. In der Kette sind manche Steckstellen vom Kohlenstoff schon belegt.",
          shape: "Die Kette trägt ihre Wasserstoffe.",
          fame: "Propan"
        },
        acetic: {
          name: "Küchenperle",
          blurb: "Essigsäure, der saure Teil vom Essig",
          goal: "Baue Essigsäure.",
          coach: "Essigsäure ist CH₃COOH. Ein Kohlenstoff hält drei Wasserstoffe. Der andere hält einen Sauerstoff doppelt und eine OH-Gruppe. Das ist Essig.",
          shape: "Die saure Ecke macht den Essig.",
          fame: "Essigsäure"
        }
      }
    },
    en: {
      eyebrow: "Chemistry · ages 11–13",
      appTitle: "Shimmering Molecules",
      lead: "Take atoms from the tray and plug them together.",
      how: "Tap an atom and it floats into the dish. Bring the next one close and it plugs in.",
      reset: "Clear progress",
      resetConfirm: "Really clear it?",
      fine: "Each mistake and each hint costs a star. Three stars means no mistakes and no hints. Four mistakes end the level.",
      pearls: "Pearls {n} / 36",
      summary: "{done} of {total} levels · {stars} of {max} stars",
      starsLabel: "{n} of 3 stars",
      lockedMeta: "Still to do: finish {name}",
      choose: "Choose a level",
      backHome: "Home",
      backLevels: "Levels",
      coach: "Hint note",
      coachTitle: "Shows the note for this level. It does not cost a star.",
      hint: "Help",
      hintTitle: "Lights up the next step. It costs a star.",
      undo: "Undo",
      undoTitle: "Lifts the last plug.",
      socketOne: "{n} socket free",
      socketMany: "{n} sockets free",
      nomatch: "That does not fit here.",
      nosocket: "No socket left here.",
      plugfirst: "Plug the atom into a glowing socket.",
      undoempty: "Nothing to undo.",
      againBond: "One more thread. Tap the two atoms again.",
      againBonds: "{n} more threads. Tap the two atoms again.",
      closer: "Bring it closer to the other atom.",
      fits: "It fits.",
      hintPlace: "Tap the glowing atom. It then floats in the dish.",
      hintPlug: "Plug the glowing atom into the glowing socket.",
      hintOrder: "These two atoms need another thread.",
      stoppedTitle: "Four tries are used up",
      stoppedBody: "The molecule is still waiting.",
      bestKept: "Your best score stays.",
      replay: "Again",
      next: "Next",
      list: "All levels",
      skip: "Done",
      stats: "{m} mistakes · {h} hints",
      placeHere: "Place in the dish",
      pickFirst: "Pick an atom from the tray first.",
      tray: "Atoms",
      soundOn: "Sound on",
      soundOff: "Sound off",
      kickerMode: "Band",
      kickerFinale: "Finale",
      elements: {
        H: "Hydrogen",
        C: "Carbon",
        N: "Nitrogen",
        O: "Oxygen",
        S: "Sulfur",
        Cl: "Chlorine"
      },
      bands: {
        funken: { title: "First Sparks", lead: "Two atoms, and the first threads." },
        tropfen: { title: "Bright Drops", lead: "One atom in the middle, and sometimes a stranger in the tray." },
        feuer: { title: "Warm Fire", lead: "The formula hides in the note. The chain grows longer." },
        perle: { title: "Kitchen Pearl", lead: "Vinegar. The frame is set. You build the sour corner." }
      },
      levels: {
        h2: {
          name: "Light Breath",
          blurb: "Hydrogen, the lightest gas",
          goal: "Build hydrogen.",
          coach: "Hydrogen has one socket. Two atoms share it.",
          shape: "One thread between two hydrogen atoms.",
          fame: "Hydrogen"
        },
        o2: {
          name: "Fresh Air",
          blurb: "Oxygen, the air we breathe",
          goal: "Build oxygen.",
          coach: "Two sockets between the same atoms are a double bond.",
          shape: "A double bond. This is the oxygen in the air.",
          fame: "Oxygen"
        },
        n2: {
          name: "Quiet Sky",
          blurb: "Nitrogen, most of the air",
          goal: "Build nitrogen.",
          coach: "Three sockets between the same atoms are a triple bond. Almost all of the air is this molecule.",
          shape: "A triple bond. Most of the air.",
          fame: "Nitrogen"
        },
        hcl: {
          name: "Sour Pearl",
          blurb: "Hydrogen chloride, the sour helper in the stomach",
          goal: "Build hydrogen chloride.",
          coach: "Chlorine has one socket here too. Hydrogen chloride is the sour helper in the stomach. We only build the picture.",
          shape: "One thread. Only the picture, no recipe.",
          fame: "Hydrogen chloride"
        },
        h2o: {
          name: "Rain Pearl",
          blurb: "Water, for drinking and for rain",
          goal: "Build water.",
          coach: "Oxygen sits in the middle and has two sockets. Water is bent.",
          shape: "Water is bent, not straight.",
          fame: "Water"
        },
        co2: {
          name: "Fizz",
          blurb: "Carbon dioxide, in soda and in the air we breathe out",
          goal: "Build carbon dioxide.",
          coach: "Carbon has four sockets. Here they become two double bonds, in a straight line.",
          shape: "Carbon dioxide is a straight line.",
          fame: "Carbon dioxide"
        },
        h2s: {
          name: "Quiet Egg",
          blurb: "Hydrogen sulfide, the smell of rotten eggs",
          goal: "Build hydrogen sulfide.",
          coach: "Sulfur has two sockets here, like oxygen. Yes, that is how rotten eggs smell. The molecule stays in the game.",
          shape: "Bent, like water. And yes, rotten eggs.",
          fame: "Hydrogen sulfide"
        },
        nh3: {
          name: "Garden Breath",
          blurb: "Ammonia, food for plants",
          goal: "Build ammonia.",
          coach: "Nitrogen has three sockets.",
          shape: "Nitrogen in the middle, three hydrogens.",
          fame: "Ammonia"
        },
        ch4: {
          name: "Campfire",
          blurb: "Methane, the gas in a campfire and in a swamp",
          goal: "Build methane.",
          coach: "Methane is CH₄. Carbon has four sockets and can hold four hydrogens.",
          shape: "Carbon in the middle, four hydrogens.",
          fame: "Methane"
        },
        h2o2: {
          name: "Bubble Bath",
          blurb: "Hydrogen peroxide, the quiet fizz",
          goal: "Build hydrogen peroxide.",
          coach: "Hydrogen peroxide is H₂O₂. Each oxygen keeps one socket for hydrogen and one for the other oxygen.",
          shape: "A zigzag chain.",
          fame: "Hydrogen peroxide"
        },
        c3h8: {
          name: "Tent Light",
          blurb: "Propane, the gas in a camping stove",
          goal: "Build propane.",
          coach: "Propane is C₃H₈. In the chain, some of carbon’s sockets are already used.",
          shape: "The chain carries its hydrogens.",
          fame: "Propane"
        },
        acetic: {
          name: "Kitchen Pearl",
          blurb: "Acetic acid, the sour part of vinegar",
          goal: "Build acetic acid.",
          coach: "Acetic acid is CH₃COOH. One carbon holds three hydrogens. The other holds a double oxygen and an OH group. That is vinegar.",
          shape: "The sour corner makes the vinegar.",
          fame: "Acetic acid"
        }
      }
    }
  };

  function create(code) {
    const pack = PACKS[code] || PACKS.de;
    const fallback = PACKS.de;
    function t(key) {
      if (pack[key] != null) return pack[key];
      if (fallback[key] != null) return fallback[key];
      return key;
    }
    function fill(template, map) {
      return template.replace(/\{(\w+)\}/g, function (_m, key) {
        return map[key] != null ? String(map[key]) : "";
      });
    }
    return {
      code: pack === PACKS.en ? "en" : "de",
      t: t,
      level: function (id) {
        return (pack.levels && pack.levels[id]) || fallback.levels[id];
      },
      band: function (id) {
        return (pack.bands && pack.bands[id]) || fallback.bands[id];
      },
      el: function (symbol) {
        const table = pack.elements || fallback.elements;
        return table[symbol] || symbol;
      },
      pearls: function (n) { return fill(t("pearls"), { n: n }); },
      summary: function (done, total, stars, max) {
        return fill(t("summary"), { done: done, total: total, stars: stars, max: max });
      },
      starsLabel: function (n) { return fill(t("starsLabel"), { n: n }); },
      lockedMeta: function (name) { return fill(t("lockedMeta"), { name: name }); },
      sockets: function (n) {
        return fill(t(n === 1 ? "socketOne" : "socketMany"), { n: n });
      }
    };
  }

  function choose(raw) {
    return String(raw || "").toLowerCase().indexOf("en") === 0 ? "en" : "de";
  }

  root.CI = { create: create, choose: choose };
})(typeof globalThis !== "undefined" ? globalThis : this);
