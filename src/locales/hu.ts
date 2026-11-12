import type { LocaleSchema } from './types';

export const hu: LocaleSchema = {
  appTitle: 'CSILLAGFÉNY DEKÓDER',
  appSubtitle: 'INTERAKTÍV ÚTMUTATÓ AZ LLM SZÖVEGGENERÁLÁSI STRATÉGIÁKHOZ',
  promptPrefix: 'The astronaut looked out the window and saw',
  promptStage3Prefix: 'The astronaut looked out the window and saw a glowing',
  nav: {
    stages: {
      0: '00 BEVEZETŐ',
      1: '01 MOHÓ',
      2: '02 NYALÁB (BEAM)',
      3: '03 HŐMÉRSÉKLET',
      4: '04 TOP-P',
    },
    langToggle: 'EN / HU',
  },
  ui: {
    launchMission: 'ROBOTPILÓTA INDÍTÁSA → 01. SZEKTOR',
    missionGoal: 'KÜLDETÉS CÉLJA',
    missionComplete: 'KÜLDETÉS TELJESÍTVE — LLM MATEMATIKA FELOLDVA',
    showMath: 'LLM MATEMATIKA MUTATÁSA',
    hideMath: 'LLM MATEMATIKA ELREJTÉSE',
    nextStage: 'KÖVETKEZŐ SZEKTOR →',
    prevStage: '← ELŐZŐ SZEKTOR',
    stepAutopilot: 'ROBOTPILÓTA LÉPTETÉSE (MOHÓ)',
    reset: 'ÚTVONAL ALAPHELYZETBE',
    beamWidthLabel: 'NYALÁBSZÉLESSÉG (k)',
    stepLabel: 'UGRÁSI LÉPÉS',
    temperatureLabel: 'REAKTOR HŐMÉRSÉKLET (T)',
    topPLabel: 'NUKLEUSZ PAJZS (TOP-P)',
    fireProbe: '🎲 MINTAVÉTELI SZONDA KILÖVÉSE',
    sampledHistory: 'UTOLSÓ SZONDA LANDOLÁSOK:',
    noSamplesYet: 'Még nincs kilőtt szonda — kattints a gombra vagy egy oszlopra!',
    prunedStamp: 'LEVÁGVA',
    cutOffStamp: 'KIZÁRVA (0%)',
    nucleusZone: 'AKTÍV NUKLEUSZ (TOP-P)',
    liveTransmission: 'ÉLŐ ADÁS JEL:',
    sequenceProbability: 'TELJES ÚTVONAL VALÓSZÍNŰSÉG:',
    clickBarHint: 'Tipp: Lőj ki véletlen szondát, vagy kattints bármelyik aktív szó-oszlopra a teszteléshez.',
    bestRoute: 'Legjobb útvonal',
    activeBeam: 'Aktív nyaláb',
    rootLabel: 'GYÖKÉR',
    promptBadge: 'PROMPT',
    safeCategory: 'BIZTONSÁGOS',
    creativeCategory: '★ KREATÍV',
    tailCategory: '⚠ FAROK',
    probeLandedBadge: '🎯 SZONDA LANDOLT',
    activePoolLabel: 'Aktív készlet:',
    tokensUnit: 'token',
    cumulativeThresholdLabel: 'Kumulatív P ≤',
    tempFrozenHint: '0.1 (Fagyott / Mohó)',
    tempStandardHint: '1.0 (Alapértelmezett)',
    tempChaoticHint: '2.0 (Kaotikus)',
    topPStrictHint: '0.10 (Szigorú)',
    topPSweetSpotHint: '0.85 (Ideális)',
    topPNoFilterHint: '1.00 (Szűrés nélkül)',
    beamGreedyHint: 'k=1 (Mohó)',
    beamWideHint: 'k=5 (Széles)',
    summaryTitle: 'PUSKA: MIKOR MELYIK STRATÉGIÁT HASZNÁLD?',
    summaryItems: {
      greedy: 'Mohó keresés (k=1): Gyors, determinisztikus alap; jó egyszerű osztályozásra, de hajlamos szóismétlő hurkokba és lokális csapdákba esni.',
      beam: 'Nyalábkeresés (Beam Search, k=2..5): Ideális gépi fordításhoz, összefoglaláshoz és kódgeneráláshoz, ahol a teljes mondat valószínűsége számít.',
      temp: 'Hőmérséklet (T): Átformálja a logitokat a Softmax előtt; alacsony T (0.1–0.4) ténykérdésekhez, magasabb T (0.8–1.4) kreatív íráshoz.',
      topP: 'Top-P (Nukleusz): Levágja az értelmetlen szavak hosszú farkát, miközben dinamikusan alkalmazkodik a modell bizonytalanságához.',
    },
  },
  stages: {
    0: {
      badge: '00. SZEKTOR // KÜLDETÉS ELIGAZÍTÁS',
      title: 'Hogyan választják ki az AI modellek a következő szót?',
      metaphorScaffold:
        'Amikor a ChatGPT vagy egy lokális nagy nyelvi modell (LLM) leír egy mondatot, nem tervezi meg előre a teljes bekezdést. Ehelyett egy villámgyors navigációs játékot játszik: szigorúan egyszerre egyetlen szót (tokent) jósol meg úgy, hogy a szókincse minden eleméhez rendel egy valószínűségi pontszámot.',
      metaphorDetail:
        'Üdv a Csillagfény Dekóder fedélzetén! Egy mélyűrben járó űrhajós épp egy félbeszakadt rádiójelet küldött: "The astronaut looked out the window and saw..." A csillagtérképünkön minden szójelölt egy-egy csillagrendszer, a fényessége pedig a modell által becsült valószínűség. A 4 szektor során végigvezetheted a hajót a determinisztikus fakeresésen (Mohó és Nyalábkeresés) és a sztochasztikus mintavételezésen (Hőmérséklet és Top-P), hogy lásd, hogyan születik meg a szöveg.',
      goalText: 'Kattints a Robotpilóta Indítása gombra a Csillagtérkép megnyitásához és a 01. Szektor elindításához!',
      mathTitle: 'Autoregresszív Következő-Token Előrejelzés',
      mathFormula: 'P(y_1, ..., y_T) = ∏_{t=1..T} P(y_t | y_<t)',
      mathScaffold:
        'A valószínűségszámítás láncszabálya alapján egy teljes mondat valószínűsége az egyes tokenek feltételes valószínűségeinek szorzata a korábbi tokenek ismeretében. Mivel egy 100 000 szavas szókincs felett minden lehetséges mondat végigpróbálása exponenciálisan lehetetlen (V^T útvonal), az LLM-ek dekódolási algoritmusokkal navigálnak a fában.',
      mathTakeaways: [
        'A Transformer neurális háló egyetlen előrefelé számítási lépésben (forward pass) csak a közvetlenül következő token nyers pontszámait (logitjait) adja vissza.',
        'A dekódolási stratégia — nem pedig a háló súlyai — dönti el, hogyan válasszunk szót ebből a valószínűségi eloszlásból.',
      ],
    },
    1: {
      badge: '01. SZEKTOR // RÖVID TÁVÚ ROBOTPILÓTA',
      title: 'A Mohó Csapda (k = 1)',
      metaphorScaffold:
        'A hajónk alapértelmezett rövid távú robotpilótája türelmetlen: minden ugrókapunál csak egyetlen lépésre lát előre, és vakon arra a csillagra ugrik, amelyik abban a pillanatban a legfényesebb.',
      metaphorDetail:
        'Az 1. lépésben a "nothing" (P = 0.45) épphogy megelőzi az "a" (P = 0.40) csillagot. A mohó robotpilóta azonnal ráugrik a "nothing"-ra — csakhogy a 2. és 3. lépésben kiderül, hogy onnan már csak halvány aszteroidaövek nyílnak ("nothing at all.", összesített valószínűség P = 0.045), miközben az "a" csillag mögött egy ragyogó, 0.306-os sztráda várakozott!',
      goalText: 'Kattints 3-szor a Robotpilóta Léptetése gombra, és figyeld meg, ahogy a k = 1 mohó hajó belerepül a "nothing at all." zsákutcába!',
      mathTitle: 'A motorháztető alatt: Mohó (Greedy) dekódolás és lokális optimumok',
      mathFormula: 'y_t = argmax_{w ∈ V} P(w | y_<t)',
      mathScaffold:
        'A mohó dekódolás minden t lépésben kiválasztja a legnagyobb pillanatnyi valószínűségű tokent, és az összes többi lehetséges ágat végleg eldobja. Bár számításigénye minimális (lépésenként 1 előrefutás), a lokális döntést maximalizálja a globális mondatvalószínűség helyett.',
      mathTakeaways: [
        'Egy kezdetben magas valószínűségű kötőszó vagy általános kifejezés ("nothing": 0.45) alacsony összvalószínűségű zsákutcába kényszerítheti a mondatot (0.45 × 0.25 × 0.40 = 0.045).',
        'Hosszabb szövegek generálásakor a mohó keresés gyakran önismétlő hurkokba ragad, mert nincs visszalépési vagy párhuzamos összehasonlítási képessége.',
      ],
    },
    2: {
      badge: '02. SZEKTOR // PÁRHUZAMOS SZKENNER NYALÁBOK',
      title: 'Nyalábkeresés és Ritkítás (Beam Search, k = 1..5)',
      metaphorScaffold:
        'Hogyan kerülhetjük el a Mohó Csapdát anélkül, hogy az univerzum összes csillagát végigszámolnánk? Ahelyett, hogy azonnal egyetlen csillag mellett köteleződnénk el, kiszélesítjük a radart, és egyszerre k párhuzamos szkenner-nyalábot vetítünk ki!',
      metaphorDetail:
        'Ha a Nyalábszélességet k ≥ 2 értékre húzod, a hajó az 1. lépésben életben tartja a "nothing" (0.45) ÉS az "a" (0.40) ágat is. A 2. lépésben a szkenner összeszorozza a részútvonalak esélyeit: az "a glowing" 0.340-re (0.40 × 0.85) ugrik, lehagyva a "nothing at" (0.113) ágat! A 3. lépésre a Beam Search rálép az "a glowing nebula." (P = 0.306) főútra — ami közel 7-szer erősebb a mohó útvonalnál —, a gyengébb ágakat pedig levágja (PRUNED).',
      goalText: 'Húzd a Nyalábszélesség (k) csúszkát legalább 2-re a 3. lépésben az "a glowing nebula." (P = 0.306) útvonal felfedezéséhez!',
      mathTitle: 'A motorháztető alatt: Beam Search és Log-Valószínűségek',
      mathFormula: 'score(y_{1:t}) = ∑_{i=1..t} log P(y_i | y_<i)',
      mathScaffold:
        'Minden t lépésben a Beam Search kiterjeszti a k aktív részhipotézist a teljes szókincsre, kiszámítja a k × |V| jelölt kumulatív pontszámát, megtartja a legjobb k ágat, a többit pedig eldobja. A valódi LLM-ek a nyers valószínűségek szorzása helyett log-valószínűségeket adnak össze.',
      mathTakeaways: [
        'Miért logaritmus? Ha több tucat 1-nél kisebb tizedestörtet összeszorzunk, a lebegőpontos számábrázolás gyorsan 0.0-ra csordul alul (floating-point underflow). Mivel log(a × b) = log(a) + log(b) és a logaritmus szigorúan monoton nő, az összeadás pontosan megőrzi a sorrendet.',
        'Kompromisszum: A Beam Search k-szor több számításba és memóriába (KV-cache) kerül, és zárt feladatoknál (fordítás, összefoglalás) működik a legjobban.',
      ],
    },
    3: {
      badge: '03. SZEKTOR // TERMIKUS VÉLETLENSZERŰSÉG',
      title: 'Reaktor Hőmérséklet (T)',
      metaphorScaffold:
        'A Beam Search megtalálta a legtankönyvibb mondatot ("a glowing nebula."). De mi van, ha sci-fi regényt írunk, és azt szeretnénk, hogy az űrhajós valami váratlant lásson? Ilyenkor a #1 győztes fix kiválasztása helyett dobókockát vetünk — az esélyeket pedig a Reaktor Hőmérséklettel (T) szabályozzuk!',
      metaphorDetail:
        'Figyeld a jobb oldali 8 szó-oszlopot, miközben a Hőmérséklet csúszkát mozgatod! Fagyott reaktornál (T = 0.1) a "nebula" elviszi a valószínűség 99.3%-át — minden szonda ugyanazon a szón landol. Ahogy felfűtöd a reaktort (T ≥ 1.2), a magas oszlopok leolvadnak, és átadják a terepet az olyan ritka, költői szavaknak, mint a "leviathan", a "monolith" és a "cathedral"!',
      goalText: 'Fűtsd fel a Reaktor Hőmérsékletet T ≥ 1.2 értékre, és lőj ki mintavételi szondákat (vagy kattints egy aktív oszlopra), amíg el nem találsz egy ★ KREATÍV szót ("leviathan", "monolith" vagy "cathedral")!',
      mathTitle: 'A motorháztető alatt: Hőmérséklet-skálázott Softmax',
      mathFormula: 'P(w_i) = exp(z_i / T) / ∑_j exp(z_j / T)',
      mathScaffold:
        'Mielőtt a neurális háló nyers, normálatlan pontszámait (logitjait, z_i) a Softmax függvénnyel valószínűséggé alakítanánk, a dekóder minden logitot eloszt a T hőmérséklettel. Mivel az exponenciális függvény felnagyítja a különbségeket, a T-vel való osztás közvetlenül szabályozza az eloszlás Shannon-entrópiáját.',
      mathTakeaways: [
        'Alacsony hőmérséklet (T → 0): A logitok közti különbséget a végtelenbe nyújtja, így a vezető szó esélye ~100%-ra ugrik (visszaáll a determinisztikus mohó keresés).',
        'Magas hőmérséklet (T > 1): Összenyomja a logitok közti különbséget, kilapítja az eloszlást, így a kreatív szavak esélyt kapnak — ám ezzel együtt felébrednek a "banana" és "404_error" típusú értelmetlen farok-tokenek is.',
      ],
    },
    4: {
      badge: '04. SZEKTOR // BIZTONSÁGI MEZŐ',
      title: 'Top-P Nukleusz Mintavételezés',
      metaphorScaffold:
        'A felfűtött reaktor (T = 1.5) előhozta a "leviathan"-t — de nézz az alsó oszlopokra: a "banana" (6.0%) és a "404_error" (4.6%) is beszivárgott az ugrási zónába! Minden tizedik szonda teljes halandzsával rontaná el az adást.',
      metaphorDetail:
        'Hogy megtartsuk a kreativitást hallucinációk nélkül, bekapcsoljuk a Top-P Nukleusz Pajzsot (Nucleus Sampling). A pajzs a #1 legvalószínűbb szótól indulva lefelé halad, és addig összegzi a valószínűségeket, amíg el nem éri a p küszöböt. A "Nukleuszon" belüli szavak bent maradnak és 100%-ra újranormálódnak, a pajzson kívüli hosszú farok pedig KIZÁRVA (0%) pecsétet kap!',
      goalText: 'Tartsd a hőmérsékletet T ≥ 1.3 értéken, és hangold a Top-P csúszkát (p = 0.80–0.89 közé) úgy, hogy mindhárom ★ KREATÍV szó az aktív Nukleuszban maradjon, míg mindkét ⚠ FAROK token ("banana", "404_error") 100%-ban ki legyen zárva!',
      mathTitle: 'A motorháztető alatt: Top-P (Nukleusz) Csonkolás és Újranormálás',
      mathFormula: '∑_{w ∈ V^(p)} P(w) ≥ p   →   P′(w) = P(w) / ∑_{v ∈ V^(p)} P(v)',
      mathScaffold:
        'A Holtzman és társai (2020) által bevezetett Nucleus Sampling csökkenő valószínűségi sorrendbe rendezi a szókincset, majd kiválasztja a legkisebb V^(p) részhalmazt, amelynek kumulatív tömege eléri a p értéket. A V^(p)-n kívüli tokenek valószínűségét 0-ra állítja, a bent maradókat pedig elosztja az összegükkel.',
      mathTakeaways: [
        'Miért jobb a Top-P a fix Top-K-nál? Amikor a modell teljesen biztos a dolgában (pl. a "nebula" 90%), egy fix Top-K=10 még mindig beengedne 9 rossz szót, míg a Top-P=0.85 dinamikusan 1-etlen szóra szűkíti a készletet.',
        'Amikor viszont sok jó folytatás lehetséges (magas hőmérsékletnél), a Top-P automatikusan kitágítja a Nukleuszt a kreatív szavakra, miközben levágja a megbízhatatlan farkat.',
      ],
    },
  },
};
