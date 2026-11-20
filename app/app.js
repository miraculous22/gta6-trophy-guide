// Leonida Trophy Guide: offline tracker for the 55 GTA VI trophies.
// Loads data/trophies.json (the only fetch), keeps progress in localStorage,
// and renders the checklist, the roadmap and the missable list. No network
// beyond the app's own files, no libraries, no Rockstar artwork.

const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'leonida-trophy-guide-v1';

const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story', text: 'Chapters 1 to 4, the named story missions and the contacts’ final missions. Everything here unlocks by playing the story in order; do not grind anything else yet.' },
  { n: 2, title: 'Stage 2 — Activities and challenges', text: 'The shooting range, races, fishing, the arcade, bowling, stranger strands and the 50 challenges. One try at each activity type also clears Master of None.' },
  { n: 3, title: 'Stage 3 — Collectibles and exploration', text: 'Cards, WAiNK It spots, vehicles, garages, meditation spots and all 52 areas of Leonida. Work the map area by area so nothing is missed.' },
  { n: 4, title: 'Stage 4 — Cleanup and the platinum', text: 'Combat feats, money goals, the flagged missables and 100% completion. Check the missable flags before the final missions, then sweep what is left.' },
];

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
const KIND_LABEL = { story: 'Story', activity: 'Activity', collectible: 'Collectible', exploration: 'Exploration', combat: 'Combat', side: 'Side' };

let trophies = [];
let earned = new Set();
let selectedId = null;
let view = 'checklist';

const $ = (id) => document.getElementById(id);
const listEl = $('trophy-list');
const missableListEl = $('missable-list');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.earned)) earned = new Set(saved.earned.filter((id) => Number.isInteger(id)));
  } catch (e) { /* a damaged save is ignored; the checklist starts empty */ }
}

function saveProgress() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), savedAt: new Date().toISOString() }));
  } catch (e) { /* private mode or a full store: progress just does not persist */ }
}

function isRevealed(t) {
  return !t.hidden || earned.has(t.id) || !$('spoiler-toggle').checked;
}

function displayName(t) {
  return isRevealed(t) ? t.name : 'Hidden trophy';
}

function displayDesc(t) {
  return isRevealed(t) ? t.description : 'Earn this trophy to reveal its description.';
}

function currentFilters() {
  return {
    q: $('search').value.trim().toLowerCase(),
    grade: $('grade-filter').value,
    kind: $('kind-filter').value,
    missableOnly: $('missable-only').checked,
    earnedOnly: $('earned-only').checked,
  };
}

function visibleTrophies() {
  const f = currentFilters();
  return trophies.filter((t) => {
    if (f.grade !== 'all' && t.grade !== f.grade) return false;
    if (f.kind !== 'all' && t.kind !== f.kind) return false;
    if (f.missableOnly && !t.missable) return false;
    if (f.earnedOnly && !earned.has(t.id)) return false;
    if (f.q && !(t.name.toLowerCase().includes(f.q) || t.description.toLowerCase().includes(f.q))) return false;
    return true;
  });
}

function cardHtml(t) {
  const isEarned = earned.has(t.id);
  const tags = [`<span class="tag">${esc(KIND_LABEL[t.kind] || t.kind)}</span>`];
  if (t.hidden) tags.push('<span class="tag hidden-flag">Hidden</span>');
  if (t.missable) tags.push('<span class="tag missable">Missable</span>');
  if (t.target) tags.push(`<span class="tag">Target: ${esc(String(t.target))}</span>`);
  return `<li class="trophy-card${isEarned ? ' earned' : ''}${selectedId === t.id ? ' selected' : ''}" data-id="${t.id}" tabindex="0" role="button" aria-label="${esc(displayName(t))}">
    <span class="medal ${esc(t.grade)}" aria-hidden="true">${esc(GRADE_LETTER[t.grade])}</span>
    <span>
      <span class="trophy-name">${esc(displayName(t))}</span>
      <span class="trophy-desc">${esc(displayDesc(t))}</span>
      <span class="trophy-tags">${tags.join('')}</span>
    </span>
    <label class="trophy-check"><input type="checkbox" data-earn="${t.id}" ${isEarned ? 'checked' : ''}> Earned</label>
  </li>`;
}

function renderStats() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  $('earned-count').textContent = String(done);
  const bar = $('progress-bar');
  bar.setAttribute('aria-valuenow', String(done));
  $('progress-fill').style.width = total ? `${(done / total) * 100}%` : '0%';
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return `${GRADE_LABEL[g]} ${got}/${all}`;
  });
  $('grade-line').textContent = byGrade.join(' · ');
  $('missable-count').textContent = String(trophies.filter((t) => t.missable).length);
}

function renderList() {
  const shown = visibleTrophies();
  listEl.innerHTML = shown.map(cardHtml).join('');
  $('result-line').textContent = shown.length === trophies.length
    ? `Showing all ${trophies.length} trophies.`
    : `Showing ${shown.length} of ${trophies.length} trophies.`;
}

function renderMissables() {
  const miss = trophies.filter((t) => t.missable);
  missableListEl.innerHTML = miss.map(cardHtml).join('');
}

function renderRoadmap() {
  $('roadmap').innerHTML = STAGES.map((s) => {
    const inStage = trophies.filter((t) => t.stage === s.n);
    const done = inStage.filter((t) => earned.has(t.id)).length;
    const pct = inStage.length ? Math.round((done / inStage.length) * 100) : 0;
    return `<article class="stage">
      <h2>${esc(s.title)} — ${done}/${inStage.length} earned</h2>
      <div class="bar" role="progressbar" aria-label="${esc(s.title)} progress" aria-valuemin="0" aria-valuemax="${inStage.length}" aria-valuenow="${done}"><span style="width:${pct}%"></span></div>
      <p>${esc(s.text)}</p>
      <p class="small muted">${inStage.map((t) => esc(displayName(t))).join(' · ')}</p>
    </article>`;
  }).join('');
}

function renderDetail() {
  const pane = $('detail');
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) { pane.hidden = true; return; }
  pane.hidden = false;
  $('detail-grade').textContent = `${GRADE_LABEL[t.grade]} trophy`;
  $('detail-name').textContent = displayName(t);
  $('detail-desc').textContent = displayDesc(t);
  const bits = [`Kind: ${KIND_LABEL[t.kind] || t.kind}`, t.hidden ? 'Hidden on PlayStation until earned' : 'Shown on PlayStation', t.missable ? 'Missable — do it when the moment comes' : 'Not missable'];
  if (t.target) bits.push(`PSN count: ${t.target}`);
  $('detail-meta').textContent = bits.join(' · ');
  $('detail-guide').textContent = t.guide;
  $('detail-sources').textContent = `Sources: ${t.sources}`;
  $('detail-earned').checked = earned.has(t.id);
}

function renderAll() {
  renderStats();
  renderList();
  renderMissables();
  renderRoadmap();
  renderDetail();
}

function setView(next) {
  window.scrollTo(0, 0);
  view = next;
  for (const v of ['checklist', 'roadmap', 'missable']) {
    $(`view-${v}`).hidden = v !== next;
    $(`tab-${v}`).classList.toggle('active', v === next);
  }
  if (next !== 'checklist') { selectedId = null; renderDetail(); }
  if (location.hash !== `#${next}` && next !== 'checklist') history.replaceState(null, '', `#${next}`);
  if (next === 'checklist' && location.hash.startsWith('#trophy-')) history.replaceState(null, '', '#checklist');
}

function selectTrophy(id, pushHash) {
  selectedId = id;
  renderList();
  renderMissables();
  renderDetail();
  if (pushHash) history.replaceState(null, '', `#trophy-${id}`);
  $('detail').scrollIntoView({ block: 'nearest' });
}

function toggleEarned(id, on) {
  if (on) earned.add(id); else earned.delete(id);
  saveProgress();
  renderAll();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b), exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data.earned) ? data.earned : data;
      const valid = new Set(trophies.map((t) => t.id));
      const next = new Set(ids.filter((id) => valid.has(id)));
      earned = next;
      saveProgress();
      renderAll();
      $('result-line').textContent = `Imported progress: ${earned.size} trophies earned.`;
    } catch (e) {
      $('result-line').textContent = 'That file could not be read as a progress export.';
    }
  };
  reader.readAsText(file);
}

function bindEvents() {
  for (const v of ['checklist', 'roadmap', 'missable']) {
    $(`tab-${v}`).addEventListener('click', () => setView(v));
  }
  for (const id of ['search', 'grade-filter', 'kind-filter', 'spoiler-toggle', 'missable-only', 'earned-only']) {
    $(id).addEventListener('input', () => { renderList(); renderRoadmap(); renderDetail(); });
  }
  listEl.addEventListener('click', (ev) => {
    const box = ev.target.closest('input[data-earn]');
    if (box) { toggleEarned(Number(box.dataset.earn), box.checked); return; }
    const card = ev.target.closest('.trophy-card');
    if (card) selectTrophy(Number(card.dataset.id), true);
  });
  listEl.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const card = ev.target.closest('.trophy-card');
    if (card) { ev.preventDefault(); selectTrophy(Number(card.dataset.id), true); }
  });
  missableListEl.addEventListener('click', (ev) => {
    const box = ev.target.closest('input[data-earn]');
    if (box) { toggleEarned(Number(box.dataset.earn), box.checked); return; }
    const card = ev.target.closest('.trophy-card');
    if (card) selectTrophy(Number(card.dataset.id), true);
  });
  $('detail-close').addEventListener('click', () => { selectedId = null; renderList(); renderDetail(); });
  $('detail-earned').addEventListener('change', (ev) => toggleEarned(selectedId, ev.target.checked));
  $('export-btn').addEventListener('click', exportProgress);
  $('import-file').addEventListener('change', (ev) => { if (ev.target.files[0]) importProgress(ev.target.files[0]); ev.target.value = ''; });
  $('reset-btn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies? This cannot be undone.')) {
      earned = new Set();
      saveProgress();
      renderAll();
    }
  });
  window.addEventListener('hashchange', routeFromHash);
}

function routeFromHash() {
  const h = location.hash;
  if (h === '#roadmap') setView('roadmap');
  else if (h === '#missable') setView('missable');
  else if (h.startsWith('#trophy-')) {
    const id = Number(h.slice('#trophy-'.length));
    if (trophies.some((t) => t.id === id)) { setView('checklist'); selectTrophy(id, false); }
  } else setView('checklist');
}

async function boot() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Could not load ${DATA_URL}: ${res.status}`);
  const data = await res.json();
  trophies = Array.isArray(data) ? data : data.trophies;
  loadProgress();
  bindEvents();
  renderAll();
  routeFromHash();
}

boot().catch((err) => {
  listEl.innerHTML = `<li class="stage"><h2>Could not load the trophy list</h2><p>${esc(err.message)} — open this page from its own files (any static server with app/ at its root) so data/trophies.json loads.</p></li>`;
});
