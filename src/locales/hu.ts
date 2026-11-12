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
    summaryTitle: 'PUSKA: MIKOR MELYIK STRATÉGIÁT HASZNÁLD?',
    summaryItems: {
      greedy: 'Mohó keresés (k=1): Gyors, determinisztikus alap; hajlamos lokális csapdákba esni.',
      beam: 'Nyalábkeresés (k=2..5): Ideális fordításhoz és összefoglaláshoz, ahol a teljes mondat valószínűsége számít.',
      temp: 'Hőmérséklet (T): Átformálja az eloszlást; alacsony T kódhoz/tényekhez, magas T kreatív íráshoz.',
      topP: 'Top-P (Nukleusz): Levágja az értelmetlen szavak hosszú farkát, miközben alkalmazkodik a modell bizonytalanságához.',
    },
  },
  stages: {
    0: {
      badge: '00. SZEKTOR // KÜLDETÉS ELIGAZÍTÁS',
      title: 'Hogyan választják ki az AI modellek a következő szót?',
      metaphorScaffold:
        '[Vázlat szöveg] Az LLM-ek egyszerre egy tokent generálnak a jelölt szavak valószínűségi pontozásával. A Csillagfény Dekóderben minden szó egy csillagrendszer: a feladatod végigvezetni az űrhajót a térképen az űrhajós üzenetének befejezéséhez.',
      goalText: 'Kattints a Robotpilóta Indítása gombra a Csillagtérkép megnyitásához!',
      mathTitle: 'Autoregresszív Következő-Token Előrejelzés',
      mathFormula: 'P(y_1, ..., y_T) = ∏ P(y_t | y_<t)',
      mathScaffold:
        '[Vázlat matematika] Minden t lépésben a Transformer nyers logit értékeket számol a szókincsre, majd feltételes valószínűségi eloszlássá alakítja őket.',
    },
    1: {
      badge: '01. SZEKTOR // RÖVID TÁVÚ ROBOTPILÓTA',
      title: 'A Mohó Csapda (k = 1)',
      metaphorScaffold:
        '[Vázlat szöveg] A rövid távú robotpilóta minden elágazásnál vakon a legfényesebb közvetlen csillagra ugrik, figyelmen kívül hagyva, mi vár rá két ugrássalarrébb.',
      goalText: 'Léptesd a mohó robotpilótát 3-szor, hogy lásd, hogyan repül bele egy alacsony valószínűségű zsákutcába!',
      mathTitle: 'A motorháztető alatt: Mohó (Greedy) dekódolás',
      mathFormula: 'y_t = argmax_w P(w | y_<t)',
      mathScaffold:
        '[Vázlat matematika] A mohó keresés minden lépésben a legnagyobb lokális valószínűséget választja (0.45), így a "nothing at all." zsákutcába ragad (0.045 összvalószínűség).',
    },
    2: {
      badge: '02. SZEKTOR // PÁRHUZAMOS SZKENNER NYALÁBOK',
      title: 'Nyalábkeresés és Ritkítás (k = 1..5)',
      metaphorScaffold:
        '[Vázlat szöveg] Ahelyett, hogy azonnal egyetlen csillag mellett döntenénk, a Beam Search k párhuzamos szkenner-nyalábot vetít ki, megtartva a k legerősebb teljes útvonalat és levágva a gyengéket.',
      goalText: 'Állítsd a Nyalábszélességet (k) legalább 2-re a 3. lépésben a 0.306-os "a glowing nebula." útvonal megtalálásához!',
      mathTitle: 'A motorháztető alatt: Beam Search pontozás',
      mathFormula: 'score(y_1..t) = ∑ log P(y_i | y_<i)',
      mathScaffold:
        '[Vázlat matematika] k=2 párhuzamos hipotézis megtartásával a modell életben tartja az "a" (0.40) ágat, és megtalálja az "a glowing nebula." (P = 0.306) megoldást. A valódi LLM-ek log-valószínűségeket összegeznek.',
    },
    3: {
      badge: '03. SZEKTOR // TERMIKUS VÉLETLENSZERŰSÉG',
      title: 'Reaktor Hőmérséklet (T)',
      metaphorScaffold:
        '[Vázlat szöveg] Ha mindig a #1 utat választjuk, a szöveg unalmas lesz. A Reaktor Hőmérséklet (T) növelése kilapítja a valószínűségi oszlopokat, így a szonda ritka, kreatív szavakon is landolhat.',
      goalText: 'Állítsd a hőmérsékletet T ≥ 1.2 értékre, és landolj egy kreatív szón ("leviathan", "monolith" vagy "cathedral")!',
      mathTitle: 'A motorháztető alatt: Hőmérséklet-skálázott Softmax',
      mathFormula: 'P(w_i) = exp(z_i / T) / ∑_j exp(z_j / T)',
      mathScaffold:
        '[Vázlat matematika] A nyers z_i logitok T-vel való osztása T < 1 esetén kiélezi az eloszlást, T > 1 esetén növeli az entrópiát és a kreativitást.',
    },
    4: {
      badge: '04. SZEKTOR // BIZTONSÁGI MEZŐ',
      title: 'Top-P Nukleusz Mintavételezés',
      metaphorScaffold:
        '[Vázlat szöveg] A magas hőmérséklet kreatív szavakat hozott, de beengedte a "banana" és "404_error" szemetet is! A Top-P pajZS a legvalószínűbb szótól lefelé haladva összegzi a valószínűséget p-ig, a farkat pedig levágja.',
      goalText: 'T ≥ 1.3 mellett állítsd be a Top-P csúszkát úgy, hogy mindhárom kreatív szó a Nukleuszban maradjon, de a "banana" és "404_error" ki legyen zárva!',
      mathTitle: 'A motorháztető alatt: Top-P (Nukleusz) Csonkolás',
      mathFormula: '∑_{w ∈ V^(p)} P(w) ≥ p',
      mathScaffold:
        '[Vázlat matematika] A Top-P megtartja a legkisebb V^(p) részhalmazt, amelynek kumulatív valószínűsége eléri a p értéket, a többit lenullázza, majd újranormálja az eloszlást.',
    },
  },
};

