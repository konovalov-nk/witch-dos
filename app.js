/* WITCH-DOS 1.0 — client-side toy OS */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ─────────── storage (localStorage may be blocked) ─────────── */
  const mem = new Map();
  const store = {
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : v;
      } catch {
        return mem.has(key) ? mem.get(key) : fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, String(value)); } catch { mem.set(key, String(value)); }
    },
    del(key) {
      try { localStorage.removeItem(key); } catch { mem.delete(key); }
    }
  };
  const sget = (key, fallback = null) => {
    try {
      const v = sessionStorage.getItem(key);
      return v === null ? fallback : v;
    } catch { return fallback; }
  };
  const sset = (key, value) => {
    try { sessionStorage.setItem(key, String(value)); } catch { /* ignore */ }
  };

  const START = Date.now();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ─────────── pages ─────────── */
  const PAGES = {
    home:   { path: 'HOME',   title: 'WITCH-DOS 1.0 — @mentaIlyillgirl' },
    magic:  { path: 'MAGIC',  title: 'МАГИЯ — WITCH-DOS' },
    whoami: { path: 'WHOAMI', title: 'О СЕБЕ — WITCH-DOS' },
    diary:  { path: 'DIARY',  title: 'ЗАПИСКИ — WITCH-DOS' },
    guest:  { path: 'GUEST',  title: 'ГОСТЕВАЯ — WITCH-DOS' },
    links:  { path: 'LINKS',  title: 'ССЫЛКИ — WITCH-DOS' }
  };
  const PAGE_ALIASES = {
    home: 'home', главная: 'home', start: 'home',
    magic: 'magic', магия: 'magic', spell: 'magic', spells: 'magic',
    whoami: 'whoami', about: 'whoami', 'о-себе': 'whoami', обо_мне: 'whoami',
    diary: 'diary', blog: 'diary', notes: 'diary', записки: 'diary', дневник: 'diary',
    guest: 'guest', guestbook: 'guest', гости: 'guest', гостевая: 'guest',
    links: 'links', link: 'links', ссылки: 'links'
  };

  let currentPage = 'home';

  function go(page, opts = {}) {
    if (!PAGES[page]) page = 'home';
    currentPage = page;

    $$('.page').forEach((section) => {
      const on = section.dataset.page === page;
      section.hidden = !on;
      section.classList.toggle('is-active', on);
    });
    $$('.tab').forEach((tab) => {
      const on = tab.dataset.page === page;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    $('#promptPath').textContent = PAGES[page].path;
    document.title = PAGES[page].title;
    if (opts.scroll !== false) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  function navigate(page) {
    if (!PAGES[page] || page === currentPage) {
      if (PAGES[page]) go(page);
      return;
    }
    if (location.hash === '#' + page) go(page);
    else location.hash = page;
  }

  window.addEventListener('hashchange', () => {
    const p = location.hash.replace('#', '');
    go(PAGES[p] ? p : 'home');
  });

  const initial = PAGES[location.hash.replace('#', '')] ? location.hash.replace('#', '') : 'home';
  go(initial, { scroll: false });

  $$('button[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.page);
      beep(520, 0.02, 0.02);
    });
  });

  /* ─────────── boot ─────────── */
  const bootEl = $('#boot');
  const bootlog = $('#bootlog');
  const bootBar = $('#bootBar');
  const bootPct = $('#bootPct');
  const desktop = $('#desktop');

  const BOOT_LINES = [
    ['WITCH-BIOS v4.20 — (C) 2000-2026 br11k', 'dim'],
    ['', ''],
    ['Main Processor : Magical Girl @ 3.33 GHz', ''],
    ['Memory Test    : 666K OK', 'ok'],
    ['Detecting IDE drives ... C: D: B:(broom)', ''],
    ['', ''],
    ['Loading WITCH-DOS 1.0 ................ OK', ''],
    ['Mounting /dev/broom ................... OK', ''],
    ['Starting FAMILIAR.EXE ................. OK', 'pink'],
    ['Checking server ....................... ONLINE (пока что)', 'ok'],
    ['Summoning magical girls ............... 3 found', ''],
    ['Loading 2000s vibe .................... 87%', 'warn'],
    ['WARNING: cuteness overflow at 0x1A4F', 'warn'],
    ['Starting COMMAND.COM .................. OK', ''],
    ['', ''],
    ['        WITCH-DOS 1.0  —  HAHA, CLASSIC', 'pink']
  ];

  let bootActive = false;
  let bootTimer = null;
  let bootIndex = 0;

  function bootLine(text, cls) {
    const span = document.createElement('span');
    span.className = 'bl' + (cls ? ' ' + cls : '');
    span.textContent = text || '\u00a0';
    bootlog.appendChild(span);
  }

  function bootProgress() {
    const pct = Math.min(94, Math.round((bootIndex / BOOT_LINES.length) * 100));
    bootBar.style.width = pct + '%';
    bootPct.textContent = pct + '%';
  }

  function bootStep() {
    if (!bootActive) return;
    if (bootIndex >= BOOT_LINES.length) {
      bootBar.style.width = '100%';
      bootPct.textContent = '100%';
      bootTimer = setTimeout(revealBoot, reduceMotion ? 0 : 420);
      return;
    }
    const [text, cls] = BOOT_LINES[bootIndex];
    bootLine(text, cls);
    bootIndex += 1;
    bootProgress();
    const delay = reduceMotion ? 0 : 42 + Math.random() * 58;
    bootTimer = setTimeout(bootStep, delay);
  }

  function revealBoot() {
    if (!bootActive) {
      bootEl.hidden = true;
      desktop.hidden = false;
      return;
    }
    bootActive = false;
    clearTimeout(bootTimer);
    sset('wd_booted', '1');
    bootEl.classList.add('is-done');
    setTimeout(() => {
      bootEl.hidden = true;
      desktop.hidden = false;
    }, reduceMotion ? 0 : 200);
  }

  function startBoot() {
    desktop.hidden = true;
    bootEl.hidden = false;
    bootEl.classList.remove('is-done');
    bootlog.textContent = '';
    bootBar.style.width = '0%';
    bootPct.textContent = '0%';
    bootActive = true;
    bootIndex = 0;
    bootStep();
  }

  function instantBoot() {
    bootActive = false;
    clearTimeout(bootTimer);
    bootEl.hidden = true;
    desktop.hidden = false;
  }

  const params = new URLSearchParams(location.search);
  const skipBoot = params.has('noboot') || sget('wd_booted') === '1';
  if (skipBoot) instantBoot();
  else startBoot();

  $('#skipBoot').addEventListener('click', (e) => {
    e.stopPropagation();
    if (bootActive) revealBoot();
    else instantBoot();
  });
  bootEl.addEventListener('click', () => {
    if (bootActive) revealBoot();
  });
  document.addEventListener('keydown', (e) => {
    if (!bootActive) return;
    if (e.key === 'Tab') return;
    e.preventDefault();
    revealBoot();
  });

  /* ─────────── clock / uptime ─────────── */
  function pad(n) { return String(n).padStart(2, '0'); }
  function fmtUptime(ms) {
    const total = Math.floor(ms / 1000);
    return pad(Math.floor(total / 3600)) + ':' + pad(Math.floor((total % 3600) / 60)) + ':' + pad(total % 60);
  }
  function tickClock() {
    const el = $('#clock');
    if (el) el.textContent = new Date().toLocaleTimeString('ru-RU', { hour12: false });
  }
  tickClock();
  setInterval(tickClock, 1000);

  const uptimeEl = $('#uptime');
  setInterval(() => {
    if (uptimeEl) uptimeEl.textContent = fmtUptime(Date.now() - START);
  }, 1000);

  /* ─────────── CRT / sound ─────────── */
  let crtOn = store.get('wd_crt', '1') === '1';
  function applyCrt() {
    document.body.classList.toggle('crt', crtOn);
    const btn = $('#crtBtn');
    if (btn) btn.textContent = crtOn ? 'CRT ВКЛ' : 'CRT ВЫКЛ';
  }
  function toggleCrt() {
    crtOn = !crtOn;
    store.set('wd_crt', crtOn ? '1' : '0');
    applyCrt();
    beep(crtOn ? 740 : 300, 0.04);
    return crtOn;
  }
  applyCrt();
  $('#crtBtn').addEventListener('click', toggleCrt);

  let audioCtx = null;
  let soundOn = store.get('wd_sound', '0') === '1';

  function audio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function beep(freq = 660, dur = 0.06, vol = 0.035) {
    if (!soundOn) return;
    const ctx = audio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function applySound() {
    const btn = $('#soundBtn');
    if (btn) btn.textContent = soundOn ? '♪ ВКЛ' : '♪ ВЫКЛ';
  }
  function toggleSound(force) {
    soundOn = typeof force === 'boolean' ? force : !soundOn;
    store.set('wd_sound', soundOn ? '1' : '0');
    applySound();
    if (soundOn) beep(880, 0.08);
    return soundOn;
  }
  applySound();
  $('#soundBtn').addEventListener('click', () => toggleSound());

  function jingle() {
    if (!soundOn) toggleSound(true);
    [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25].forEach((f, i) => {
      setTimeout(() => beep(f, 0.09, 0.03), i * 95);
    });
  }
  $('#speakerBtn').addEventListener('click', jingle);

  /* ─────────── dialogs ─────────── */
  const dialog = $('#dialog');
  const dlgTitle = $('#dlgTitle');
  const dlgBody = $('#dlgBody');
  let dlgReturnFocus = null;

  function openDialog(title, html) {
    dlgTitle.textContent = title;
    dlgBody.innerHTML = html;
    dialog.hidden = false;
    dlgReturnFocus = document.activeElement;
    $('#dlgOk').focus();
    beep(300, 0.04);
  }
  function closeDialog() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    if (dlgReturnFocus && dlgReturnFocus.focus) dlgReturnFocus.focus();
    dlgReturnFocus = null;
  }
  $('#dlgOk').addEventListener('click', closeDialog);
  $('#dlgX').addEventListener('click', closeDialog);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeDialog();
  });

  const HELP_HTML =
    '<b>F1</b> помощь · <b>F2</b> магия · <b>F3</b> гостевая · <b>F4</b> ссылки · <b>F5</b> о себе · <b>F6</b> записки' +
    '<br><br>В командной строке: <b>help</b>, <b>cast</b>, <b>brew</b>, <b>pet</b>, <b>haha</b>, ' +
    '<b>neofetch</b>, <b>ping</b>, <b>reboot</b>.<br><br>' +
    '<span class="muted">Esc — закрыть / выйти из ввода. / — фокус в консоль.</span>';

  $$('[data-menu]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const menu = btn.dataset.menu;
      if (menu === 'file') {
        openDialog('ФАЙЛ', 'Все файлы уже удалены.\nНечего открывать.\n\n(серьёзно, тут одна демка)');
      } else if (menu === 'view') {
        const on = toggleCrt();
        openDialog('ВИД', 'CRT-эффект: <b>' + (on ? 'ВКЛ' : 'ВЫКЛ') + '</b>.\n\nОстальные настройки монитора потеряны в 2003-м.');
      } else {
        openDialog('СПРАВКА', HELP_HTML);
      }
    });
  });

  $$('[data-fkey="help"]').forEach((btn) => {
    btn.addEventListener('click', () => openDialog('СПРАВКА', HELP_HTML));
  });

  /* ─────────── terminal ─────────── */
  const term = $('#term');
  const termwin = $('.termwin');
  const cmdInput = $('#cmd');
  const cmdForm = $('#cmdform');

  function termLine(text, cls = '') {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    term.appendChild(div);
    while (term.children.length > 140) term.removeChild(term.firstChild);
    term.scrollTop = term.scrollHeight;
  }

  function echoCommand(text) {
    termLine('C:\\' + PAGES[currentPage].path + '> ' + text, 'cmd');
  }

  term.addEventListener('click', () => cmdInput.focus());

  document.addEventListener('keydown', (e) => {
    if (bootActive || e.defaultPrevented) return;
    const tag = document.activeElement ? document.activeElement.tagName : '';
    const typing = tag === 'INPUT' || tag === 'TEXTAREA';

    if (e.key === 'Escape') {
      if (!dialog.hidden) { closeDialog(); e.preventDefault(); return; }
      if (typing) { document.activeElement.blur(); return; }
    }
    if (e.key === 'F1') {
      e.preventDefault();
      openDialog('СПРАВКА', HELP_HTML);
      return;
    }
    const fkeyPages = { F2: 'magic', F3: 'guest', F4: 'links', F5: 'whoami', F6: 'diary' };
    if (fkeyPages[e.key]) {
      e.preventDefault();
      navigate(fkeyPages[e.key]);
      return;
    }
    if (!typing && e.key === '/') {
      e.preventDefault();
      cmdInput.focus();
    }
  });

  /* ─────────── magic ─────────── */
  const SPELLS = [
    { name: 'СНЯТИЕ ПРОКЛЯТИЯ NODE_MODULES', lvl: 3, cost: 15, effect: 'Удаляет папку. Вместе с ней — 400 МБ и веру в человечество.' },
    { name: 'ЩИТ ОТ МЕРДЖ-КОНФЛИКТОВ', lvl: 2, cost: 10, effect: 'Конфликты остаются, но теперь они не твоя проблема.' },
    { name: 'ИЛЛЮЗИЯ ПОНИМАНИЯ C++', lvl: 5, cost: 20, effect: 'Работает 30 секунд. Потом приходит шаблон.' },
    { name: 'ТЕЛЕПОРТ В ПЯТНИЦУ, 18:00', lvl: 4, cost: 20, effect: 'Безопасно только при выключенном CI.' },
    { name: 'ПРИЗЫВ МАГИЧЕСКОЙ ДЕВОЧКИ', lvl: 6, cost: 25, effect: 'Явится, посмотрит на код и молча уйдёт.' },
    { name: 'МАЛЫЙ ВЗРЫВ КРАСОТЫ', lvl: 1, cost: 5, effect: 'Добавляет градиент. Иногда — туда, куда не просили.' },
    { name: 'ЗАКЛИНАНИЕ ПЕРВОГО КОММИТА', lvl: 2, cost: 10, effect: 'Сообщение будет «fix», но хотя бы соберётся.' },
    { name: 'ОТМЕНА ДЕДЛАЙНА', lvl: 9, cost: 30, effect: 'Не работает. Но попытка засчитана.' }
  ];

  let mana = 100;
  const manaFill = $('#manaFill');
  const manaVal = $('#manaVal');
  const spellOut = $('#spellOut');
  const castBtn = $('#castBtn');

  function updateMana() {
    mana = clamp(mana, 0, 100);
    if (manaFill) manaFill.style.width = mana + '%';
    if (manaVal) manaVal.textContent = mana + '/100';
    const meta = $('#page-magic .win-meta');
    if (meta) meta.textContent = 'MANA ' + mana;
  }

  function castSpell(logToConsole = false) {
    const spell = pick(SPELLS);
    if (mana < spell.cost) {
      const msg = '[ НЕ ХВАТАЕТ МАНЫ ]\nнужно ' + spell.cost + ', есть ' + mana +
        '.\nсвари зелье: кнопка «+ СВАРИТЬ» или команда brew.';
      if (spellOut) spellOut.textContent = msg;
      if (logToConsole) termLine(msg, 'warn');
      beep(170, 0.09);
      return '';
    }

    mana -= spell.cost;
    updateMana();

    const d20 = 1 + Math.floor(Math.random() * 20);
    let verdict = 'УСПЕХ. вроде бы.';
    let extra = '';
    if (d20 === 20) {
      verdict = 'КРИТ! HAHA, CLASSIC.';
      extra = '\n    бонус: +1 к уверенности в себе.';
      beep(1046, 0.1);
    } else if (d20 === 1) {
      verdict = 'ФИАСКО. метла упала. (но красиво)';
      beep(155, 0.12);
    } else {
      beep(700, 0.07);
    }

    const text =
      '>>> ЗАКЛИНАНИЕ: ' + spell.name + '\n' +
      '    уровень: ' + spell.lvl + '   мана: -' + spell.cost + '   d20: ' + d20 + '\n' +
      '    эффект: ' + spell.effect + '\n' +
      '    результат: ' + verdict + extra;

    if (spellOut) {
      spellOut.textContent = text;
      spellOut.classList.remove('casting');
      void spellOut.offsetWidth;
      spellOut.classList.add('casting');
      setTimeout(() => spellOut.classList.remove('casting'), 600);
    }
    if (logToConsole) termLine(text, 'magic');
    return text;
  }

  if (castBtn) {
    castBtn.addEventListener('click', () => castSpell(false));
  }
  updateMana();
  setInterval(() => {
    if (mana < 100) {
      mana = Math.min(100, mana + 1);
      updateMana();
    }
  }, 1400);

  /* ─────────── potions ─────────── */
  let potions = parseInt(store.get('wd_potions', '0'), 10) || 0;

  function renderPotions() {
    const count = $('#potionCount');
    const blobs = $('#potionBlobs');
    if (count) count.textContent = potions;
    if (blobs) {
      const filled = Math.min(5, potions);
      blobs.textContent = '■'.repeat(filled) + '□'.repeat(5 - filled);
    }
  }

  function brewPotion(source = 'ui') {
    potions += 1;
    store.set('wd_potions', potions);
    mana = Math.min(100, mana + 25);
    updateMana();
    renderPotions();
    beep(520, 0.07);
    const msg = 'зелье сварено. +25 маны. всего: ' + potions + ' шт.';
    if (source === 'console') termLine(msg, 'ok');
    else termLine(msg, 'ok');
    return potions;
  }

  renderPotions();
  $('#brewBtn').addEventListener('click', () => brewPotion('ui'));

  /* ─────────── familiar ─────────── */
  const CAT_LINES = ['      /\\_/\\', '     ( o.o )', '      > ^ <', '     /|   |\\', '    (_|___|_)'];
  const CAT = CAT_LINES.join('\n');
  const PHRASES = [
    'мяу.',
    'HAHA, CLASSIC.',
    'ты забыла сохраниться.',
    'сервер уронила. случайно.',
    'метла заряжена на 87%.',
    'ещё одно заклинание?',
    'не трогай хвост.',
    'чай? зелье? ещё чай?',
    'в 2000-м было лучше.',
    'F5 обновит судьбу.',
    'я не толстая, я пушистая.'
  ];
  const catEl = $('#cat');
  const catSays = $('#catSays');
  let lastPhrase = -1;

  function drawCat(blink = false) {
    if (!catEl) return;
    catEl.textContent = blink ? CAT.replace('o.o', '-.-') : CAT;
  }
  drawCat();

  if (!reduceMotion) {
    setInterval(() => {
      drawCat(true);
      setTimeout(() => drawCat(false), 170);
    }, 4400);
  }

  function petCat() {
    let i = Math.floor(Math.random() * PHRASES.length);
    if (PHRASES.length > 1) {
      while (i === lastPhrase) i = Math.floor(Math.random() * PHRASES.length);
    }
    lastPhrase = i;
    catSays.textContent = PHRASES[i];
    catSays.classList.remove('pop');
    void catSays.offsetWidth;
    catSays.classList.add('pop');
    beep(600, 0.05);
    drawCat(false);
  }
  catEl.addEventListener('click', petCat);
  $('#petBtn').addEventListener('click', petCat);

  /* ─────────── oracle ─────────── */
  const ORACLE = [
    'да.',
    'нет.',
    'HAHA, CLASSIC.',
    'определённо да.',
    'не сегодня.',
    'метла говорит «да».',
    'спроси кота.',
    'попробуй в 3:33.',
    'ответ уже был. ты его проспала.',
    'звёзды за. я против.',
    'да, но тебе не понравится.',
    'а ты как думаешь?'
  ];
  let lastOracle = -1;
  function askOracle() {
    let i = Math.floor(Math.random() * ORACLE.length);
    if (ORACLE.length > 1) {
      while (i === lastOracle) i = Math.floor(Math.random() * ORACLE.length);
    }
    lastOracle = i;
    const answer = ORACLE[i];
    const el = $('#oracleAnswer');
    el.textContent = answer;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
    beep(i % 2 ? 620 : 880, 0.06);
    return answer;
  }
  $('#oracleBtn').addEventListener('click', askOracle);

  /* ─────────── guestbook ─────────── */
  const SEED_GUESTS = [
    { name: 'br11k', date: '18.11.2026', text: 'первый. демка одобрена. HAHA, CLASSIC.' },
    { name: 'фамильяр', date: '18.11.2026', text: 'мяу. сервер уронила. случайно.' },
    { name: 'архив 2000-х', date: '01.01.2000', text: 'тут был сайт. был красивый. не то что сейчас.' }
  ];

  let guestEntries = [];
  try {
    const raw = JSON.parse(store.get('wd_guest', '[]'));
    if (Array.isArray(raw)) {
      guestEntries = raw.filter((e) => e && typeof e.name === 'string' && typeof e.text === 'string');
    }
  } catch { guestEntries = []; }

  function guestNode(entry, seed = false) {
    const wrap = document.createElement('article');
    wrap.className = 'gb-entry' + (seed ? ' gb-seed' : '');
    const head = document.createElement('div');
    head.className = 'gb-head';
    const name = document.createElement('span');
    name.className = 'gb-name';
    name.textContent = entry.name;
    const date = document.createElement('span');
    date.className = 'gb-date';
    date.textContent = entry.date || '';
    head.append(name, date);
    const text = document.createElement('div');
    text.className = 'gb-text';
    text.textContent = entry.text;
    wrap.append(head, text);
    return wrap;
  }

  function renderGuest() {
    const list = $('#guestList');
    if (!list) return;
    list.textContent = '';
    guestEntries.forEach((e) => list.appendChild(guestNode(e, false)));
    SEED_GUESTS.forEach((e) => list.appendChild(guestNode(e, true)));
  }

  renderGuest();

  const guestForm = $('#guestForm');
  const guestStatus = $('#guestStatus');

  guestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = ($('#guestName').value.trim() || 'гость').slice(0, 24);
    const text = $('#guestText').value.trim();
    if (!text) {
      guestStatus.textContent = 'напиши хоть что-нибудь.';
      guestStatus.className = 'form-status err';
      return;
    }
    guestEntries.unshift({
      name,
      date: new Date().toLocaleDateString('ru-RU'),
      text: text.slice(0, 240)
    });
    guestEntries = guestEntries.slice(0, 30);
    store.set('wd_guest', JSON.stringify(guestEntries));
    renderGuest();
    guestForm.reset();
    guestStatus.textContent = 'записано. спасибо!';
    guestStatus.className = 'form-status';
    beep(780, 0.08);
  });

  $('#guestClear').addEventListener('click', () => {
    guestEntries = [];
    store.del('wd_guest');
    renderGuest();
    guestStatus.textContent = 'твои записи удалены.';
    guestStatus.className = 'form-status';
    beep(320, 0.07);
  });

  /* ─────────── visits ─────────── */
  let visits = parseInt(store.get('wd_visits', '0'), 10) || 0;
  visits += 1;
  store.set('wd_visits', visits);
  const visitLabel = String(41 + visits).padStart(6, '0');
  ['#visitNum', '#visitNum2'].forEach((sel) => {
    const el = $(sel);
    if (el) el.textContent = visitLabel;
  });

  /* ─────────── system monitor ─────────── */
  let magicPct = 76;
  let memPct = 83;
  let broomPct = 100;

  function meter(name, value) {
    const num = document.getElementById(name + 'Pct');
    const bar = document.getElementById(name + 'Bar');
    if (num) num.textContent = Math.round(value) + '%';
    if (bar) bar.style.width = clamp(value, 0, 100) + '%';
  }
  function renderMeters() {
    meter('magic', magicPct);
    meter('mem', memPct);
    meter('broom', broomPct);
  }
  renderMeters();

  setInterval(() => {
    magicPct = clamp(magicPct + (Math.random() * 8 - 4), 58, 97);
    memPct = clamp(memPct + (Math.random() * 5 - 2.5), 62, 94);
    broomPct = clamp(broomPct + (Math.random() * 3 - 1.5), 96, 100);
    renderMeters();
  }, 2300);

  const serverEl = $('#serverState');
  let serverDown = false;
  setInterval(() => {
    if (serverDown || !serverEl) return;
    if (Math.random() < 0.1) {
      serverDown = true;
      serverEl.textContent = '● перезагрузка';
      serverEl.classList.remove('status-on');
      serverEl.classList.add('status-off');
      setTimeout(() => {
        serverDown = false;
        serverEl.textContent = '● online';
        serverEl.classList.remove('status-off');
        serverEl.classList.add('status-on');
        termLine('сервер поднялся. фамильяр клянётся, что не при чём.', 'warn');
      }, reduceMotion ? 800 : 4200);
    }
  }, 30000);

  /* ─────────── console commands ─────────── */
  const COMMANDS = [
    'help', 'ls', 'cd', 'open', 'cast', 'brew', 'pet', 'oracle', 'haha', 'whoami',
    'date', 'uptime', 'neofetch', 'ping', 'curl', 'sudo', 'rm', 'clear',
    'reboot', 'sound', 'crt', 'exit', 'coffee', 'echo'
  ];
  const cmdHistory = [];
  let historyIndex = 0;

  function helpText() {
    const rows = [
      ['help', 'эта справка'],
      ['ls', 'список разделов'],
      ['cd <раздел>', 'перейти: home, magic, whoami, diary, guest, links'],
      ['cast', 'скастовать заклинание'],
      ['brew', 'сварить зелье (+25 маны)'],
      ['pet', 'погладить фамильяра'],
      ['oracle', 'спросить шар'],
      ['haha', 'секрет'],
      ['whoami', 'кто здесь'],
      ['date', 'дата и время'],
      ['uptime', 'время с загрузки'],
      ['neofetch', 'система и кот'],
      ['ping', 'проверить сервер'],
      ['crt', 'CRT вкл/выкл'],
      ['sound', 'звук вкл/выкл'],
      ['clear', 'очистить консоль'],
      ['reboot', 'перезагрузить WITCH-DOS'],
      ['exit', 'попытаться выйти']
    ];
    return 'ДОСТУПНЫЕ КОМАНДЫ\n' + rows.map(([cmd, desc]) => '  ' + cmd.padEnd(16) + desc).join('\n');
  }

  function neofetchText() {
    const art = [
      '      /\\_/\\',
      '     ( o.o )   OS: WITCH-DOS 1.0',
      '      > ^ <    HOST: github.io/witch-dos',
      '     /|   |\\   SHELL: /bin/wish',
      '    (_|___|_)  UPTIME: ' + fmtUptime(Date.now() - START),
      '               MANA: ' + mana + '/100',
      '               POTIONS: ' + potions,
      '               USER: @mentaIlyillgirl'
    ];
    return art.join('\n');
  }

  function hahaText() {
    return [
      '      /\\',
      '     /  \\   HAHA,',
      '    /____\\  CLASSIC.',
      '',
      '  (это была пасхалка)'
    ].join('\n');
  }

  function runCommand(raw) {
    const value = raw.trim();
    echoCommand(value);
    if (!value) return;

    cmdHistory.push(value);
    if (cmdHistory.length > 60) cmdHistory.shift();
    historyIndex = cmdHistory.length;

    const parts = value.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    switch (cmd) {
      case 'help':
        termLine(helpText());
        break;

      case 'ls':
      case 'dir':
        termLine('home      — главная\nmagic     — книга заклинаний\nwhoami    — о себе\ndiary     — записки\nguest     — гостевая\nlinks     — ссылки');
        break;

      case 'cd':
      case 'open':
      case 'go': {
        if (!arg) {
          termLine('куда? например: cd magic', 'warn');
          break;
        }
        const page = PAGE_ALIASES[arg];
        if (page) {
          navigate(page);
          termLine('переход: C:\\' + PAGES[page].path, 'ok');
        } else {
          termLine('нет такого раздела: ' + arg + '. введи ls.', 'err');
        }
        break;
      }

      case 'cast':
      case 'spell':
        castSpell(true);
        break;

      case 'brew':
      case 'potion':
        brewPotion('console');
        break;

      case 'pet':
      case 'cat':
        petCat();
        termLine('мур. (' + catSays.textContent + ')', 'magic');
        break;

      case 'oracle':
      case 'ball':
        termLine('шар: ' + askOracle(), 'magic');
        break;

      case 'haha':
        termLine(hahaText(), 'magic');
        beep(1046, 0.09);
        break;

      case 'whoami':
        termLine('@mentaIlyillgirl\nведьма / magical girl\n«я всего лишь человек.»', 'ok');
        break;

      case 'date':
        termLine(new Date().toLocaleString('ru-RU', { dateStyle: 'full', timeStyle: 'medium' }));
        break;

      case 'uptime':
        termLine('WITCH-DOS up ' + fmtUptime(Date.now() - START) + ', 1 пользователь, 1 кот');
        break;

      case 'neofetch':
        termLine(neofetchText());
        break;

      case 'ping':
        termLine('PING witch-dos (konovalov-nk.github.io): 56 data bytes\n' +
          '64 bytes from 127.0.0.1: time=42ms\n' +
          '64 bytes from 127.0.0.1: time=13ms\n' +
          '64 bytes from 127.0.0.1: time=7ms\n' +
          '--- 0% packet loss. сервер держится. ---', 'ok');
        break;

      case 'curl':
        termLine('curl: (6) не удалось разрешить хост «внешний мир». ты в локалке ведьмы.', 'err');
        break;

      case 'sudo':
        if (arg.includes('rm') || arg.includes('-rf')) {
          termLine('sudo: попытка удалить вселенную отклонена.\nфайловая система ведьмы защищена метлой.', 'err');
        } else {
          termLine('sudo: пароль ведьмы не найден. попробуй в 3:33.', 'err');
        }
        break;

      case 'rm':
        termLine('rm: отказано. /dev/метла занята.', 'err');
        break;

      case 'clear':
      case 'cls':
        term.textContent = '';
        break;

      case 'reboot':
        termLine('перезагрузка...', 'warn');
        setTimeout(startBoot, 350);
        break;

      case 'sound': {
        const on = toggleSound();
        termLine('звук: ' + (on ? 'ВКЛ' : 'ВЫКЛ'), on ? 'ok' : 'warn');
        break;
      }

      case 'crt': {
        const on = toggleCrt();
        termLine('CRT: ' + (on ? 'ВКЛ' : 'ВЫКЛ'), on ? 'ok' : 'warn');
        break;
      }

      case 'exit':
        openDialog('ВЫХОД', 'DOS не закрывается.\nDOS закрывает тебя.\n\n(нажми OK, чтобы остаться)');
        break;

      case 'coffee':
        termLine('кофе не найден. но есть зелье — введи brew.', 'warn');
        break;

      case 'echo':
        termLine(parts.slice(1).join(' '));
        break;

      default:
        termLine('«' + value.slice(0, 48) + '» не является внутренней или внешней командой. Введи help.', 'err');
        beep(180, 0.05);
    }
  }

  cmdForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = cmdInput.value;
    cmdInput.value = '';
    runCommand(value);
  });

  cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!cmdHistory.length) return;
      historyIndex = Math.max(0, historyIndex - 1);
      cmdInput.value = cmdHistory[historyIndex] || '';
      setTimeout(() => cmdInput.setSelectionRange(cmdInput.value.length, cmdInput.value.length), 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!cmdHistory.length) return;
      historyIndex = Math.min(cmdHistory.length, historyIndex + 1);
      cmdInput.value = cmdHistory[historyIndex] || '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const value = cmdInput.value.trim();
      if (!value) {
        cmdInput.value = 'help';
        return;
      }
      const match = COMMANDS.find((c) => c.startsWith(value.toLowerCase()));
      if (match) cmdInput.value = match;
    }
  });

  /* ─────────── misc actions ─────────── */
  $$('[data-action="brew"]').forEach((btn) => {
    btn.addEventListener('click', () => brewPotion('ui'));
  });
  $$('[data-action="haha"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openDialog('HAHA, CLASSIC', '<pre>' + hahaText().replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre>');
      beep(1046, 0.09);
    });
  });

  /* ─────────── welcome ─────────── */
  termLine('WITCH-DOS 1.0 [Version 2000.0.1]', 'magic');
  termLine('(C) 2000-2026 br11k. Все заклинания обратимы.', 'dim');
  termLine('Введи help, чтобы увидеть команды.', '');

  if (termwin) termwin.dataset.ready = '1';
})();
