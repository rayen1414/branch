// --- ICON VARIABLES ---
const ICONS = {
    logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v12"/><path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M15 6a9 9 0 0 1-9 9"/></svg>`,
    search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
    explore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect width="12" height="10" x="2" y="7" rx="2"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`
};

function initIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
        const iconKey = el.getAttribute('data-icon');
        if (ICONS[iconKey]) {
            el.insertAdjacentHTML('afterbegin', ICONS[iconKey]);
        }
    });
}
initIcons();

function toggleinterface() {
    document.body.classList.toggle('interface-hidden');
}

function togglebar() {
    document.querySelector('.sidebar').classList.toggle('sidebar-collapsed');
}

function toggleMenu(menuId) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu.id !== menuId) menu.classList.remove('active');
    });
    document.getElementById(menuId).classList.toggle('active');
}

window.addEventListener('click', (e) => {
    if (!e.target.closest('.action-item')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
    }
});

const zone = document.querySelector('.draggable-zone');
const items = document.querySelectorAll('.sidebar-item[draggable="true"]');

items.forEach(item => {
    item.addEventListener('dragstart', () => item.classList.add('dragging'));
    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        saveOrder();
    });
});

zone.addEventListener('dragover', e => {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(zone, e.clientY);
    if (afterElement == null) {
        zone.appendChild(draggingItem);
    } else {
        zone.insertBefore(draggingItem, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sidebar-item[draggable="true"]:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveOrder() {
    const newOrder = [...document.querySelectorAll('.sidebar-item[draggable="true"]')]
                    .map(item => item.getAttribute('data-id'));
    console.log("Order saved:", newOrder);
}

// ═══════════════════════════════════════
// BRANCH FEED — POST SYSTEM
// ═══════════════════════════════════════

const USERS = [
  { name:'Alex_Indie', initial:'A', color:'#c8ff00', textColor:'#000' },
  { name:'jade_x',     initial:'J', color:'#a78bfa', textColor:'#fff' },
  { name:'m4rk',       initial:'M', color:'#34d399', textColor:'#000' },
  { name:'nova_',      initial:'N', color:'#60a5fa', textColor:'#fff' },
  { name:'ryu77',      initial:'R', color:'#f9a8d4', textColor:'#000' },
];

const SEED_POSTS = [
  { user: USERS[1], text: "Just shipped a new version of my design system. The token architecture finally makes sense. Took 3 iterations but here we are.", time: "2m ago", branches: 4 },
  { user: USERS[2], text: "Hot take: most 'minimalist' UI is just lazy. Real minimalism is knowing exactly what to remove and why.", time: "11m ago", branches: 12 },
  { user: USERS[3], text: "Working on something with generative audio. You give it a mood board and it generates a matching ambient loop. Still rough but it works.", time: "34m ago", branches: 7 },
  { user: USERS[4], text: "Reminder that 'move fast and break things' was always a bad philosophy. You break things that real people depend on.", time: "1h ago", branches: 23 },
];

const SEED_BRANCH_REPLIES = {
  0: [
    { user: USERS[2], text: "What token naming convention did you end up with? Semantic or primitive first?", time: "1m ago" },
    { user: USERS[1], text: "Semantic. Primitive tokens exist but they're never used directly in components.", time: "just now" },
  ],
  1: [
    { user: USERS[0], text: "Agree. Dieter Rams had 10 principles, not just 'fewer elements'.", time: "8m ago" },
    { user: USERS[4], text: "The hard part is clients asking for 'clean' but meaning 'empty'.", time: "5m ago" },
    { user: USERS[3], text: "This. There's a difference between restrained and absent.", time: "2m ago" },
  ],
};

let hiddenUsers = {};
let posts = [];
let activeBranchPostId = null;
let branchReplies = {};

document.addEventListener('DOMContentLoaded', () => {
  SEED_POSTS.forEach((p, i) => {
    posts.push({ id: i, ...p, hidden: false });
    branchReplies[i] = SEED_BRANCH_REPLIES[i] || [];
  });
  renderFeed();
  renderExploreFeed();
  renderMediaFeed();
});

function renderFeed() {
  const feed = document.getElementById('feed');
  if (!feed) return;
  feed.innerHTML = '';
  posts.forEach(post => {
    if (post.hidden) return;
    feed.appendChild(buildPostCard(post));
  });
}

function buildPostCard(post) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.id = 'post-' + post.id;

  const isActiveBranch = activeBranchPostId === post.id;
  const replyCount = (branchReplies[post.id] || []).length;
  const totalBranches = post.branches + replyCount;

  card.innerHTML = `
    <div class="post-header">
      <div class="post-avatar" style="background:${post.user.color};color:${post.user.textColor};">${post.user.initial}</div>
      <div class="post-meta">
        <div class="post-username">${post.user.name}</div>
        <div class="post-time">${post.time}</div>
      </div>
      <button class="post-menu-btn" onclick="toggleHide(${post.id})" title="Hide post">···</button>
    </div>
    <div class="post-text">${escapeHtml(post.text)}</div>
    <div class="post-actions">
      <button class="action-btn branch-btn ${isActiveBranch ? 'active' : ''}"
              onclick="openBranchPanel(${post.id})">
        ⬡ Branch ${totalBranches > 0 ? `<span class="branch-count">${totalBranches}</span>` : ''}
      </button>
      <button class="action-btn hide-btn" onclick="hideUser(${post.id})">
        Hide
      </button>
    </div>
  `;
  return card;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function createPost() {
  const input = document.getElementById('composer-input');
  const text = input.value.trim();
  if (!text) return;

  const post = {
    id: Date.now(),
    user: USERS[0],
    text,
    time: 'just now',
    branches: 0,
    hidden: false
  };

  posts.unshift(post);
  branchReplies[post.id] = [];
  input.value = '';
  renderFeed();
}

function hideUser(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const username = post.user.name;
  let count = 0;
  let hiding = false;
  posts.forEach(p => {
    if (p.id === postId) { hiding = true; return; }
    if (hiding && p.user.name === username && count < 5) { p.hidden = true; count++; }
  });
  post.hidden = true;
  renderFeed();
}

function toggleHide(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  post.hidden = true;
  renderFeed();
}

function openBranchPanel(postId) {
  activeBranchPostId = postId;
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const panel = document.getElementById('branch-panel');
  const bpFeed = document.getElementById('bp-feed');
  const bpSub  = document.getElementById('bp-post-preview');

  bpSub.textContent = post.user.name + ': ' + post.text.substring(0, 80) + (post.text.length > 80 ? '…' : '');

  bpFeed.innerHTML = '';
  (branchReplies[postId] || []).forEach(reply => {
    bpFeed.appendChild(buildBranchReply(reply));
  });

  panel.classList.remove('hidden');
  document.querySelector('.main-container').classList.add('panel-open');
  renderFeed();
}

function closeBranchPanel() {
  activeBranchPostId = null;
  document.getElementById('branch-panel').classList.add('hidden');
  document.querySelector('.main-container').classList.remove('panel-open');
  renderFeed();
}

function buildBranchReply(reply) {
  const el = document.createElement('div');
  el.className = 'bp-reply';
  el.innerHTML = `
    <div class="bp-reply-header">
      <div class="bp-reply-avatar" style="background:${reply.user.color};color:${reply.user.textColor};">${reply.user.initial}</div>
      <div class="bp-reply-name">${reply.user.name}</div>
      <div class="bp-reply-time">${reply.time}</div>
    </div>
    <div class="bp-reply-text">${escapeHtml(reply.text)}</div>
  `;
  return el;
}

function addBranchReply() {
  const input = document.getElementById('bp-input');
  const text = input.value.trim();
  if (!text || activeBranchPostId === null) return;

  const reply = { user: USERS[0], text, time: 'just now' };

  if (!branchReplies[activeBranchPostId]) branchReplies[activeBranchPostId] = [];
  branchReplies[activeBranchPostId].push(reply);

  const bpFeed = document.getElementById('bp-feed');
  bpFeed.appendChild(buildBranchReply(reply));
  bpFeed.scrollTop = bpFeed.scrollHeight;
  input.value = '';
  renderFeed();
}

const EXPLORE_DATA = [
  { icon:'🎨', color:'#ff6b3522', textColor:'#ff6b35', name:'Design Systems in 2025', server:'Design Lab', members:'1.2k replies', desc:'The shift from component libraries to token-first architecture.' },
  { icon:'⚡', color:'#c8ff0022', textColor:'#c8ff00', name:'WebGPU is here', server:'Dev Zone', members:'3.4k replies', desc:'Finally shipping in all major browsers. What does this mean for the web?' },
  { icon:'🎵', color:'#a78bfa22', textColor:'#a78bfa', name:'Generative audio tools', server:'Lofi Lounge', members:'890 replies', desc:'AI tools for music composition that actually sound good.' },
  { icon:'🤖', color:'#60a5fa22', textColor:'#60a5fa', name:'LLM agents in prod', server:'AI Space', members:'2.1k replies', desc:'What it actually takes to run reliable autonomous agents.' },
];

function renderExploreFeed() {
  const el = document.getElementById('explore-feed');
  if (!el) return;
  el.innerHTML = EXPLORE_DATA.map(p => `
    <div class="explore-post">
      <div class="ep-icon" style="background:${p.color};">${p.icon}</div>
      <div>
        <div class="ep-name">${p.name}</div>
        <div class="ep-desc">${p.desc}</div>
        <div class="ep-meta">${p.server} · ${p.members}</div>
      </div>
    </div>
  `).join('');
}

const MEDIA_DATA = [
  { emoji:'🖼', bg:'#1a1a2e', name:'brand_v4_final.png', size:'2.1 MB' },
  { emoji:'🎬', bg:'#0d1f0d', name:'prototype_demo.mp4', size:'48 MB' },
  { emoji:'🎨', bg:'#1f0d0d', name:'moodboard_oct.jpg',  size:'5.7 MB' },
  { emoji:'✦',  bg:'#1a1510', name:'icons_set_v2.svg',   size:'128 KB' },
  { emoji:'📄', bg:'#0d0d1f', name:'brief_oct.pdf',       size:'340 KB' },
  { emoji:'🖼', bg:'#1a0d1f', name:'cover_art.png',       size:'3.4 MB' },
];

function renderMediaFeed() {
  const el = document.getElementById('media-feed');
  if (!el) return;
  el.innerHTML = `<div class="media-post-grid">` +
    MEDIA_DATA.map(f => `
      <div class="media-post-card">
        <div class="media-thumb-box" style="background:${f.bg};">${f.emoji}</div>
        <div class="media-post-info">
          <div class="media-post-name">${f.name}</div>
          <div class="media-post-size">${f.size}</div>
        </div>
      </div>
    `).join('') + `</div>`;
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('etag')) {
    e.target.closest('.explore-tags').querySelectorAll('.etag').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
  }
});
