// GTA VI trophy guide and tracker. Loads app/data/trophies.json, renders the 55 trophies
// as a checklist, keeps progress in localStorage, and adds filters, a spoiler setting,
// export/import and a roadmap to the platinum. The whole app runs offline from app/ files.

const PROGRESS_KEY = 'gta6-trophy-guide-progress-v1';
const REVEALED_KEY = 'gta6-trophy-guide-revealed-v1';

// Source pages this guide actually read, with the databases they cross-checked.
// A name without a link is a database the launch-week guides cite by name.
const SOURCE_LINKS = {
  'Output Lag': 'https://outputlag.com/guides/gta-6-trophy-list/',
  'Sixshore': 'https://sixshore.com/gta-6/guides/trophies-and-achievements/',
  'GTA VI Vice City Hub': 'https://www.gtavicecityhub.com/achievements',
  'PowerPyx': 'https://www.powerpyx.com/grand-theft-auto-6-trophy-guide-roadmap/',
  'Push Square': 'https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap',
  'Insider Gaming': 'https://insider-gaming.com/gta-6-100-completion-a-long-road-trophy/',
};

const KIND_LABELS = {
  platinum: 'Platinum',
  story: 'Story',
  side: 'Side strand',
  collectible: 'Collectible',
  activity: 'Activity',
  robbery: 'Robbery',
  partner: 'Partner',
  exploration: 'Exploration',
  completion: '100% completion',
};

const listEl = document.getElementById('trophyList');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const hideEarnedEl = document.getElementById('hideEarned');
const spoilersEl = document.getElementById('spoilers');
const listCountEl = document.getElementById('listCount');
const emptyStateEl = document.getElementById('emptyState');

const doc = await fetchTrophyData();
const trophies = doc.trophies;
const params = new URLSearchParams(location.search);

let earned = readStoredSet(PROGRESS_KEY);
let revealed = readStoredSet(REVEALED_KEY);
let demoMode = false;

if (params.get('demo') === '1') seedDemoProgress();
if (params.get('filter')) kindEl.value = params.get('filter');
if (params.get('spoilers') === 'off') spoilersEl.checked = false;
if (params.get('grade')) gradeEl.value = params.get('grade');

renderRoadmapCounts();
renderSourceList();
renderTrophyList();
wireControls();

if (params.get('open')) openTrophyById(Number(params.get('open')));

async function fetchTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('trophies.json could not be loaded');
  return response.json();
}

function readStoredSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]'));
  } catch {
    return new Set();
  }
}

function storeProgress() {
  if (demoMode) return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
  localStorage.setItem(REVEALED_KEY, JSON.stringify([...revealed]));
}

// Preview mode: seeds a sample set of earned trophies in memory only, so a visitor
// can see the tracker with progress. It never writes to localStorage.
function seedDemoProgress() {
  demoMode = true;
  earned = new Set([2, 3, 4, 8, 15, 16, 19, 20, 21, 28, 35, 42, 53]);
  document.getElementById('progressNote').textContent =
    'Sample progress for preview — ticking boxes now does not save. Reload without ?demo=1 for your own checklist.';
}

function renderRoadmapCounts() {
  for (const stage of [1, 2, 3]) {
    const count = trophies.filter((t) => t.stage === stage).length;
    const el = document.getElementById(`stage${stage}Count`);
    if (el) el.textContent = `(${count} of the 55 trophies belong to this stage.)`;
  }
}

function renderSourceList() {
  const ul = document.getElementById('sourceList');
  const names = [...new Set(trophies.flatMap((t) => t.sources))].sort();
  for (const name of names) {
    const li = document.createElement('li');
    const url = SOURCE_LINKS[name];
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.rel = 'noopener';
      a.textContent = name;
      li.append(a);
    } else {
      li.textContent = name;
    }
    ul.append(li);
  }
}

function isSpoilerHidden(t) {
  return t.hidden && spoilersEl.checked && !earned.has(t.id) && !revealed.has(t.id);
}

function matchesFilters(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.id)) return false;
  switch (kindEl.value) {
    case 'all': return true;
    case 'missable': return t.missable === true;
    case 'online': return false;
    default: return t.kind === kindEl.value;
  }
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  document.getElementById('progressCount').textContent = `${done} of ${total} earned`;
  document.getElementById('progressMini').textContent = `${done} of ${total} earned`;
  document.getElementById('progressFill').style.width = `${Math.round((done / total) * 100)}%`;
  const earnedOf = (grade) => trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
  const totalOf = (grade) => trophies.filter((t) => t.grade === grade).length;
  document.getElementById('progressDetail').textContent =
    `Platinum ${earnedOf('platinum')}/${totalOf('platinum')} · Gold ${earnedOf('gold')}/${totalOf('gold')} · Silver ${earnedOf('silver')}/${totalOf('silver')} · Bronze ${earnedOf('bronze')}/${totalOf('bronze')}`;
}

function renderTrophyList() {
  renderProgress();
  listEl.replaceChildren();
  const shown = trophies.filter(matchesFilters);
  listCountEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
  if (kindEl.value === 'online') {
    emptyStateEl.hidden = false;
    emptyStateEl.textContent = 'No online trophies: every trophy is single-player. PowerPyx and Push Square both confirm none of the 55 needs online play.';
  } else if (shown.length === 0) {
    emptyStateEl.hidden = false;
    emptyStateEl.textContent = 'No trophies match these filters. Clear the search or pick another kind or grade.';
  } else {
    emptyStateEl.hidden = true;
  }
  for (const t of shown) listEl.append(buildTrophyCard(t));
}

function buildTrophyCard(t) {
  const li = document.createElement('li');
  li.className = `trophy-card grade-${t.grade}${earned.has(t.id) ? ' is-earned' : ''}`;
  li.dataset.trophyId = String(t.id);

  const head = document.createElement('div');
  head.className = 'trophy-head';

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    storeProgress();
    renderTrophyList();
  });
  head.append(box);

  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = t.grade;
  head.append(badge);

  const title = document.createElement('div');
  title.className = 'trophy-title';
  if (isSpoilerHidden(t)) {
    const hiddenName = document.createElement('strong');
    hiddenName.textContent = 'Hidden trophy';
    title.append(hiddenName);
    const hint = document.createElement('span');
    hint.className = 'trophy-kind';
    hint.textContent = `${KIND_LABELS[t.kind] ?? t.kind} · revealed when earned`;
    title.append(hint);
  } else {
    const name = document.createElement('strong');
    name.textContent = t.name;
    title.append(name);
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = t.description;
    title.append(desc);
    const meta = document.createElement('span');
    meta.className = 'trophy-meta';
    const parts = [KIND_LABELS[t.kind] ?? t.kind];
    if (t.chapter) parts.push(`Chapter ${t.chapter}`);
    if (t.count !== null && t.count !== undefined) parts.push(`Count: ${formatCount(t)}`);
    if (t.missable) parts.push('MISSABLE');
    if (t.unconfirmed) parts.push('Method unconfirmed at launch');
    meta.textContent = parts.join(' · ');
    title.append(meta);
  }
  head.append(title);

  const actions = document.createElement('div');
  actions.className = 'trophy-actions';
  if (isSpoilerHidden(t)) {
    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.textContent = 'Reveal';
    reveal.addEventListener('click', () => {
      revealed.add(t.id);
      storeProgress();
      renderTrophyList();
      openTrophyById(t.id);
    });
    actions.append(reveal);
  } else {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.textContent = 'Guide';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => toggleGuide(li, toggle));
    actions.append(toggle);
  }
  head.append(actions);
  li.append(head);

  const guide = document.createElement('div');
  guide.className = 'trophy-guide';
  guide.hidden = true;
  if (!isSpoilerHidden(t)) {
    if (t.warning) {
      const warn = document.createElement('p');
      warn.className = 'trophy-warning';
      warn.textContent = t.warning;
      guide.append(warn);
    }
    const text = document.createElement('p');
    text.textContent = t.guide;
    guide.append(text);
    const src = document.createElement('p');
    src.className = 'trophy-sources';
    src.textContent = `Sources: ${t.sources.join(', ')}.`;
    guide.append(src);
  }
  li.append(guide);
  return li;
}

function formatCount(t) {
  if (t.count >= 1000) return `$${t.count.toLocaleString('en-US')}`;
  return String(t.count);
}

function toggleGuide(li, button) {
  const guide = li.querySelector('.trophy-guide');
  const open = guide.hidden;
  guide.hidden = !open;
  button.setAttribute('aria-expanded', String(open));
  button.textContent = open ? 'Hide guide' : 'Guide';
}

function openTrophyById(id) {
  const li = listEl.querySelector(`[data-trophy-id="${id}"]`);
  if (!li) return;
  const button = li.querySelector('.guide-toggle');
  if (button) {
    const guide = li.querySelector('.trophy-guide');
    if (guide.hidden) toggleGuide(li, button);
  }
  li.scrollIntoView({ block: 'nearest' });
}

function wireControls() {
  for (const el of [searchEl, kindEl, gradeEl, hideEarnedEl, spoilersEl]) {
    el.addEventListener('input', renderTrophyList);
    el.addEventListener('change', renderTrophyList);
  }

  document.getElementById('export').addEventListener('click', exportProgress);
  document.getElementById('import').addEventListener('change', importProgress);
  document.getElementById('reset').addEventListener('click', () => {
    if (!confirm('Clear all earned ticks on this device?')) return;
    earned = new Set();
    revealed = new Set();
    storeProgress();
    renderTrophyList();
  });
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    exported_at: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    revealed: [...revealed].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('not a progress file');
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    if (Array.isArray(data.revealed)) revealed = new Set(data.revealed.filter((id) => valid.has(id)));
    storeProgress();
    renderTrophyList();
  } catch {
    alert('That file is not a trophy progress export from this guide.');
  }
  event.target.value = '';
}
