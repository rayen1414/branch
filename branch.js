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
        if (ICONS[iconKey]) el.insertAdjacentHTML('afterbegin', ICONS[iconKey]);
    });
}
initIcons();

function toggleinterface() { document.body.classList.toggle('interface-hidden'); }
function togglebar() { document.querySelector('.sidebar').classList.toggle('sidebar-collapsed'); }

function toggleMenu(menuId) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu.id !== menuId) menu.classList.remove('active');
    });
    document.getElementById(menuId).classList.toggle('active');
}

window.addEventListener('click', (e) => {
    if (!e.target.closest('.action-item'))
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
});

const zone = document.querySelector('.draggable-zone');
document.querySelectorAll('.sidebar-item[draggable="true"]').forEach(item => {
    item.addEventListener('dragstart', () => item.classList.add('dragging'));
    item.addEventListener('dragend', () => { item.classList.remove('dragging'); saveOrder(); });
});
zone.addEventListener('dragover', e => {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    const after = getDragAfterElement(zone, e.clientY);
    after == null ? zone.appendChild(dragging) : zone.insertBefore(dragging, after);
});
function getDragAfterElement(container, y) {
    return [...container.querySelectorAll('.sidebar-item[draggable="true"]:not(.dragging)')]
        .reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
}
function saveOrder() {
    console.log("Order saved:", [...document.querySelectorAll('.sidebar-item[draggable="true"]')].map(i => i.getAttribute('data-id')));
}

// ═══════════════════════════════════════
// BRANCH FEED
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

  // ── FIX 2: Close friend panel when clicking main content area ──
  const mainContainer = document.getElementById('main-container');
  if (mainContainer) {
    mainContainer.addEventListener('click', function() {
      const panel = document.getElementById('friend-panel');
      if (panel && !panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
        const backdrop = document.getElementById('friend-panel-backdrop');
        if (backdrop) backdrop.classList.add('hidden');
        // Also exit fullscreen profile if active
        if (document.body.classList.contains('profile-fullscreen-active')) {
          document.body.classList.remove('profile-fullscreen-active');
          const overlay = document.getElementById('fpp-fullscreen-overlay');
          if (overlay) overlay.classList.add('hidden');
        }
      }
    });
  }
});

function renderFeed() {
  const feed = document.getElementById('feed');
  if (!feed) return;
  feed.innerHTML = '';
  posts.forEach(post => { if (!post.hidden) feed.appendChild(buildPostCard(post)); });
}

function buildPostCard(post) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.id = 'post-' + post.id;
  const isActive = activeBranchPostId === post.id;
  const total = post.branches + (branchReplies[post.id] || []).length;
  card.innerHTML = `
    <div class="post-header">
      <div class="post-avatar" style="background:${post.user.color};color:${post.user.textColor};" onclick="openUserProfile('${post.user.name}')" title="View ${post.user.name}'s profile">${post.user.initial}</div>
      <div class="post-meta">
        <div class="post-username" onclick="openUserProfile('${post.user.name}')" title="View ${post.user.name}'s profile">${post.user.name}</div>
        <div class="post-time">${post.time}</div>
      </div>
      <button class="post-menu-btn" onclick="toggleHide(${post.id})" title="Hide post">···</button>
    </div>
    <div class="post-text">${escapeHtml(post.text)}</div>
    <div class="post-actions">
      <button class="action-btn branch-btn ${isActive?'active':''}" onclick="openBranchPanel(${post.id})">
        ⬡ Branch ${total>0?`<span class="branch-count">${total}</span>`:''}
      </button>
      <button class="action-btn hide-btn" onclick="hideUser(${post.id})">Hide</button>
    </div>`;
  return card;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function createPost() {
  const input = document.getElementById('composer-input');
  const text = input.value.trim();
  if (!text) return;
  const post = { id: Date.now(), user: USERS[0], text, time: 'just now', branches: 0, hidden: false };
  posts.unshift(post);
  branchReplies[post.id] = [];
  input.value = '';
  renderFeed();
}

function hideUser(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const uname = post.user.name;
  let count = 0, hiding = false;
  posts.forEach(p => {
    if (p.id === postId) { hiding = true; return; }
    if (hiding && p.user.name === uname && count < 5) { p.hidden = true; count++; }
  });
  post.hidden = true;
  renderFeed();
}

function toggleHide(postId) {
  const post = posts.find(p => p.id === postId);
  if (post) { post.hidden = true; renderFeed(); }
}

function openBranchPanel(postId) {
  activeBranchPostId = postId;
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const panel = document.getElementById('branch-panel');
  document.getElementById('bp-post-preview').textContent = post.user.name + ': ' + post.text.substring(0,80) + (post.text.length>80?'…':'');
  const bpFeed = document.getElementById('bp-feed');
  bpFeed.innerHTML = '';
  (branchReplies[postId]||[]).forEach(r => bpFeed.appendChild(buildBranchReply(r)));
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
      <div class="bp-reply-avatar" style="background:${reply.user.color};color:${reply.user.textColor};cursor:pointer;" onclick="openUserProfile('${reply.user.name}')">${reply.user.initial}</div>
      <div class="bp-reply-name" onclick="openUserProfile('${reply.user.name}')" style="cursor:pointer;">${reply.user.name}</div>
      <div class="bp-reply-time">${reply.time}</div>
    </div>
    <div class="bp-reply-text">${escapeHtml(reply.text)}</div>`;
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
      <div><div class="ep-name">${p.name}</div><div class="ep-desc">${p.desc}</div><div class="ep-meta">${p.server} · ${p.members}</div></div>
    </div>`).join('');
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
    MEDIA_DATA.map(f => `<div class="media-post-card"><div class="media-thumb-box" style="background:${f.bg};">${f.emoji}</div><div class="media-post-info"><div class="media-post-name">${f.name}</div><div class="media-post-size">${f.size}</div></div></div>`).join('') + `</div>`;
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('etag')) {
    e.target.closest('.explore-tags').querySelectorAll('.etag').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
  }
});

// ═══════════════════════════════════════
// FRIENDS
// ═══════════════════════════════════════

const FRIENDS_DATA = [
  { name:'jade_x',   initial:'J', color:'#a78bfa', textColor:'#fff', status:'online',  sub:'In a Branch · Design Lab' },
  { name:'m4rk',     initial:'M', color:'#34d399', textColor:'#000', status:'online',  sub:'Online' },
  { name:'nova_',    initial:'N', color:'#60a5fa', textColor:'#fff', status:'away',    sub:'Away · 10m' },
  { name:'ryu77',    initial:'R', color:'#f9a8d4', textColor:'#000', status:'offline', sub:'Last seen 2h ago' },
  { name:'pixel99',  initial:'P', color:'#ff6b35', textColor:'#fff', status:'online',  sub:'Online' },
];

const REQUESTS_DATA = [
  { name:'synthwave_', initial:'S', color:'#00f5d4', textColor:'#000', sub:'Wants to connect' },
  { name:'loop44',     initial:'L', color:'#f59e0b', textColor:'#000', sub:'Wants to connect' },
];

let fpActiveTab = 'friends';
let fpFriendsList = [...FRIENDS_DATA];
let fpRequestsList = [...REQUESTS_DATA];

const MY_USERNAME = 'Alex_Indie';

function _buildDefaultProfile(user) {
  const presets = {
    'jade_x':    { bannerMode:'gradient', profileBgMode:'darker', bio:'Design systems. Tokens. Vibes.',          accentColor:'#a78bfa', accentText:'#fff' },
    'm4rk':      { bannerMode:'grid',     profileBgMode:'dark',   bio:'Hot takes and cold brew.',               accentColor:'#34d399', accentText:'#000' },
    'nova_':     { bannerMode:'dots',     profileBgMode:'accent', bio:'Generative audio & ambient loops.',      accentColor:'#60a5fa', accentText:'#fff' },
    'ryu77':     { bannerMode:'solid',    profileBgMode:'darker', bio:'Moving slow and fixing things.',         accentColor:'#f9a8d4', accentText:'#000' },
    'pixel99':   { bannerMode:'gradient', profileBgMode:'light',  bio:'Pixels. Purpose. Persistence.',          accentColor:'#ff6b35', accentText:'#fff' },
    'synthwave_':{ bannerMode:'gradient', profileBgMode:'darker', bio:'Connecting.',                            accentColor:'#00f5d4', accentText:'#000' },
    'loop44':    { bannerMode:'dots',     profileBgMode:'dark',   bio:'',                                       accentColor:'#f59e0b', accentText:'#000' },
  };
  const d = presets[user.name] || { bannerMode:'solid', profileBgMode:'dark', bio:'', accentColor: user.color || '#a78bfa', accentText: user.textColor || '#fff' };

  const userPosts = [];
  SEED_POSTS.filter(p => p.user.name === user.name).forEach(p => userPosts.push({ time: p.time, text: p.text }));
  Object.values(SEED_BRANCH_REPLIES).forEach(replies =>
    replies.filter(r => r.user.name === user.name).forEach(r => userPosts.push({ time: r.time, text: r.text }))
  );

  return {
    displayName:   user.name,
    bio:           d.bio,
    accentColor:   d.accentColor,
    accentText:    d.accentText,
    bannerMode:    d.bannerMode,
    bannerImgUrl:  null,
    profileBgMode: d.profileBgMode,
    profileBgUrl:  null,
    fontSize:      14,
    fontFamily:    "'Inter',system-ui,sans-serif",
    avatarUrl:     null,
    cssCode:       '',
    posts:         userPosts,
    friendCount:   Math.floor(Math.random() * 200 + 20),
    serverCount:   Math.floor(Math.random() * 12 + 1),
  };
}

const USER_PROFILES = {};

USER_PROFILES[MY_USERNAME] = {
  displayName:'Alex_Indie', bio:'Indie dev. Building things that matter.',
  accentColor:'#c8ff00', accentText:'#000',
  bannerMode:'solid', bannerImgUrl:null,
  profileBgMode:'dark', profileBgUrl:null,
  fontSize:14, fontFamily:"'Inter',system-ui,sans-serif",
  avatarUrl:null, cssCode:'',
  posts:[
    { time:'2h ago',  text:'Just shipped a new version of my design system. Token architecture finally clicks.' },
    { time:'1d ago',  text:'Working late on a generative audio experiment. The results are actually wild.' },
  ],
  friendCount:142, serverCount:8,
};

[...USERS.slice(1), ...FRIENDS_DATA, ...REQUESTS_DATA].forEach(u => {
  if (!USER_PROFILES[u.name]) USER_PROFILES[u.name] = _buildDefaultProfile(u);
});

function _getProfile(username) {
  if (!USER_PROFILES[username]) {
    const colors = ['#a78bfa','#60a5fa','#34d399','#ff6b35','#f9a8d4','#00f5d4'];
    const c = colors[Math.floor(Math.random() * colors.length)];
    USER_PROFILES[username] = _buildDefaultProfile({ name:username, initial:username[0].toUpperCase(), color:c, textColor:'#fff' });
  }
  return USER_PROFILES[username];
}

function _findBase(username) {
  return [...USERS, ...FRIENDS_DATA, ...REQUESTS_DATA].find(u => u.name === username) || null;
}

// ═══════════════════════════════════════
// PROFILE PANEL STATE
// ═══════════════════════════════════════

let fppViewingUsername = null;

let fppAccentColor   = '#c8ff00';
let fppAccentText    = '#000';
let fppBannerMode    = 'solid';
let fppBannerImgUrl  = null;
let fppProfileBgMode = 'dark';
let fppProfileBgUrl  = null;
let fppFontSize      = 14;
let fppFontFamily    = "'Inter',system-ui,sans-serif";
let fppAvatarUrl     = null;
let fppPendingMedia  = null;
let fppPosts         = USER_PROFILES[MY_USERNAME].posts;
let fppCssActive     = false;
let fppCssCode       = '';
let fppIsFullscreen  = false;

function _syncMyState() {
  const p = USER_PROFILES[MY_USERNAME];
  p.accentColor=fppAccentColor; p.accentText=fppAccentText;
  p.bannerMode=fppBannerMode; p.bannerImgUrl=fppBannerImgUrl;
  p.profileBgMode=fppProfileBgMode; p.profileBgUrl=fppProfileBgUrl;
  p.fontSize=fppFontSize; p.fontFamily=fppFontFamily;
  p.avatarUrl=fppAvatarUrl; p.cssCode=fppCssCode;
  p.posts=fppPosts;
  const nameEl=document.getElementById('fpp-display-name');
  const bioEl=document.getElementById('fpp-bio');
  if (nameEl && fppViewingUsername===null) p.displayName=nameEl.textContent.trim();
  if (bioEl  && fppViewingUsername===null) p.bio=bioEl.textContent.trim();
}

// ═══════════════════════════════════════
// FRIEND PANEL
// ═══════════════════════════════════════

function openFriendPanel() {
  document.getElementById('fp-view-friends').style.display = 'flex';
  document.getElementById('fp-view-profile').style.display = 'none';
  fpSetTab('friends', document.getElementById('fp-tab-friends'));
  document.getElementById('friend-search').value = '';
  fpRenderAll();
  document.getElementById('friend-panel').classList.remove('hidden');
  document.getElementById('friend-panel-backdrop').classList.remove('hidden');
}

function closeFriendPanel() {
  document.getElementById('friend-panel').classList.add('hidden');
  document.getElementById('friend-panel-backdrop').classList.add('hidden');
}

function fpSetTab(tab, btn) {
  fpActiveTab = tab;
  document.querySelectorAll('.fp-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('fp-friends-list').style.display  = tab==='friends' ? 'block' : 'none';
  document.getElementById('fp-requests-list').style.display = tab==='requests' ? 'block' : 'none';
}

function fpRenderAll() {
  fpRenderFriends(fpFriendsList);
  fpRenderRequests(fpRequestsList);
  document.getElementById('fp-friends-count').textContent = fpFriendsList.length;
  document.getElementById('fp-req-count').textContent     = fpRequestsList.length;
}

function fpRenderFriends(list) {
  const el = document.getElementById('fp-friends-list');
  const online=list.filter(f=>f.status==='online'), away=list.filter(f=>f.status==='away'), offline=list.filter(f=>f.status==='offline');
  let html='';
  if (online.length)  html+=`<div class="fp-section">Online — ${online.length}</div>`+online.map(fpFriendItem).join('');
  if (away.length)    html+=`<div class="fp-section">Away</div>`+away.map(fpFriendItem).join('');
  if (offline.length) html+=`<div class="fp-section">Offline</div>`+offline.map(fpFriendItem).join('');
  if (!list.length)   html=`<div class="fp-section" style="text-align:center;padding:30px 0;opacity:.4;">No friends found</div>`;
  el.innerHTML=html;
}

function fpFriendItem(f) {
  return `<div class="fp-item" onclick="openUserProfile('${f.name}')" style="cursor:pointer;">
    <div class="fp-item-av" style="background:${f.color};color:${f.textColor};">
      ${f.initial}<span class="fp-dot ${f.status}"></span>
    </div>
    <div class="fp-item-info">
      <div class="fp-item-name">${f.name}</div>
      <div class="fp-item-sub">${f.sub}</div>
    </div>
    <div class="fp-item-actions" onclick="event.stopPropagation()">
      <button class="fp-action-btn" onclick="fpMessage('${f.name}')" title="Message">💬</button>
      <button class="fp-action-btn" onclick="fpRemove('${f.name}')" title="Remove">✕</button>
    </div>
  </div>`;
}

function fpRenderRequests(list) {
  const el = document.getElementById('fp-requests-list');
  if (!list.length) { el.innerHTML=`<div class="fp-section" style="text-align:center;padding:30px 0;opacity:.4;">No pending requests</div>`; return; }
  el.innerHTML = list.map(f => `<div class="fp-item" onclick="openUserProfile('${f.name}')" style="cursor:pointer;">
    <div class="fp-item-av" style="background:${f.color};color:${f.textColor};">${f.initial}</div>
    <div class="fp-item-info"><div class="fp-item-name">${f.name}</div><div class="fp-item-sub">${f.sub}</div></div>
    <div class="fp-item-actions" onclick="event.stopPropagation()">
      <button class="fp-action-btn accept" onclick="fpAccept('${f.name}')">Accept</button>
      <button class="fp-action-btn decline" onclick="fpDecline('${f.name}')">✕</button>
    </div>
  </div>`).join('');
}

function fpSearch(query) {
  const q=query.toLowerCase().trim();
  fpRenderFriends(q ? fpFriendsList.filter(f=>f.name.toLowerCase().includes(q)) : fpFriendsList);
}
function fpMessage(name) { console.log('[Branch] DM →', name); }
function fpRemove(name)  { fpFriendsList=fpFriendsList.filter(f=>f.name!==name); fpRenderAll(); }
function fpAccept(name)  {
  const req=fpRequestsList.find(f=>f.name===name);
  if (req) { fpFriendsList.unshift({...req,status:'online',sub:'Just joined'}); fpRequestsList=fpRequestsList.filter(f=>f.name!==name); fpRenderAll(); }
}
function fpDecline(name) { fpRequestsList=fpRequestsList.filter(f=>f.name!==name); fpRenderAll(); }
function fpSendRequest() {
  const input=document.getElementById('fp-add-input'), name=input.value.trim();
  if (!name) return;
  input.value='';
  const t=document.getElementById('toast');
  if (t) { t.textContent=`Friend request sent to @${name}`; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500); }
}

// ═══════════════════════════════════════════════════════════════════════
// openUserProfile — UNIVERSAL ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

function openUserProfile(username) {
  document.getElementById('friend-panel').classList.remove('hidden');
  document.getElementById('friend-panel-backdrop').classList.remove('hidden');

  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if (!username || username === myName) {
    fpOpenProfile();
  } else {
    _fpViewOtherProfile(username);
  }
}

function fpOpenProfile() {
  fppViewingUsername = null;
  document.getElementById('fp-view-friends').style.display = 'none';
  document.getElementById('fp-view-profile').style.display = 'flex';
  document.querySelector('.fpp-topbar-title').textContent = 'My Profile';
  _setProfileControls(true);
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;

  // Ensure profile exists and has the real display_name from the logged-in user
  if (!USER_PROFILES[myName]) {
    USER_PROFILES[myName] = _buildDefaultProfile({
      name: myName,
      initial: myName[0].toUpperCase(),
      color: CURRENT_USER ? (CURRENT_USER.color || '#c8ff00') : '#c8ff00',
      textColor: CURRENT_USER ? (CURRENT_USER.text_color || '#000') : '#000'
    });
  }
  // Always override displayName with CURRENT_USER.display_name if available
  if (CURRENT_USER && CURRENT_USER.display_name) {
    USER_PROFILES[myName].displayName = CURRENT_USER.display_name;
  }
  // Sync fppPosts from stored profile so post count is accurate
  fppPosts = USER_PROFILES[myName].posts || [];

  _loadProfileIntoDOM(myName, true);

  // Wire display name + bio to auto-save on edit
  const nameEl = document.getElementById('fpp-display-name');
  const bioEl  = document.getElementById('fpp-bio');
  if (nameEl) { nameEl.oninput = () => { if(USER_PROFILES[myName]) USER_PROFILES[myName].displayName = nameEl.textContent.trim(); _scheduleSaveProfile(); }; }
  if (bioEl)  { bioEl.oninput  = () => { if(USER_PROFILES[myName]) USER_PROFILES[myName].bio = bioEl.textContent.trim(); _scheduleSaveProfile(); }; }

  // Wire avatar upload button to API version
  const avInput = document.querySelector('.fpp-av-upload-btn input[type=file]');
  if (avInput) avInput.onchange = fppUploadAvatarToAPI;
  const ta = document.getElementById('fpp-css-textarea');
  if (ta) ta.value = fppCssCode;
  _applyProfileCss(fppCssCode);
  fppApplyStyle();

  // Load fresh data from API (friends count, posts, etc.)
  if (CURRENT_USER) _loadProfileFromAPI(myName, true);
}

function _fpViewOtherProfile(username) {
  _syncMyState();
  fppViewingUsername = username;
  document.getElementById('fp-view-friends').style.display = 'none';
  document.getElementById('fp-view-profile').style.display = 'flex';
  document.querySelector('.fpp-topbar-title').textContent = username;
  _setProfileControls(false);
  _loadProfileIntoDOM(username, false);
  _loadProfileFromAPI(username, false);
}

function _loadProfileIntoDOM(username, isOwn) {
  const p = _getProfile(username);
  const pv = document.getElementById('fp-view-profile');
  const banner   = document.getElementById('fpp-banner');
  const bannerAv = document.getElementById('fpp-banner-av');
  const base     = _findBase(username);

  _applyBannerStyle(banner, p.bannerMode, p.accentColor, p.bannerImgUrl);

  if (p.avatarUrl) {
    bannerAv.style.backgroundImage=`url(${p.avatarUrl})`; bannerAv.style.backgroundSize='cover'; bannerAv.style.backgroundPosition='center'; bannerAv.textContent='';
  } else {
    bannerAv.style.backgroundImage=''; bannerAv.style.background=p.accentColor; bannerAv.style.color=p.accentText;
    bannerAv.textContent = base ? base.initial : username[0].toUpperCase();
  }

  // Display name: prefer CURRENT_USER.display_name for own profile
  let resolvedDisplayName = p.displayName || username;
  if (isOwn && CURRENT_USER && CURRENT_USER.display_name) {
    resolvedDisplayName = CURRENT_USER.display_name;
  }
  const nameEl = document.getElementById('fpp-display-name');
  if (nameEl) { nameEl.textContent = resolvedDisplayName; nameEl.contentEditable = isOwn ? 'true' : 'false'; }

  const bioEl = document.getElementById('fpp-bio');
  if (bioEl) { bioEl.textContent = p.bio || (isOwn ? '' : 'No bio yet.'); bioEl.contentEditable = isOwn ? 'true' : 'false'; }

  const handleEl = document.getElementById('fpp-handle');
  if (handleEl) {
    const status = isOwn ? 'online' : (base ? (base.status || 'online') : 'online');
    const dot    = status === 'offline' ? '○' : '●';
    const col    = status === 'online' ? '#4ade80' : status === 'away' ? '#facc15' : '#71717a';
    handleEl.innerHTML = `@${username.toLowerCase()} · <span style="color:${col}">${dot} ${status.charAt(0).toUpperCase()+status.slice(1)}</span>`;
  }

  const allStatN = pv.querySelectorAll('.fpp-stat-n');
  if (allStatN[0]) allStatN[0].textContent = p.posts.length;
  if (allStatN[1]) allStatN[1].textContent = p.friendCount || 0;
  if (allStatN[2]) allStatN[2].textContent = p.serverCount || 0;

  if (p.profileBgMode === 'image' && p.profileBgUrl) {
    pv.style.background = `url(${p.profileBgUrl}) center/cover no-repeat`;
  } else {
    const bgMap = { dark:'#0e0e12', darker:'#060608', light:'#1c1c22', accent:p.accentColor+'22' };
    pv.style.background = bgMap[p.profileBgMode] || '#0e0e12';
  }
  pv.style.fontSize   = (p.fontSize||14)+'px';
  pv.style.fontFamily = p.fontFamily || "'Inter',system-ui,sans-serif";

  _renderProfilePosts(p.posts, isOwn);
  _applyProfileCss(p.cssCode || '');

  if (isOwn) {
    const fpAv = document.getElementById('fp-av');
    if (fpAv) {
      if (p.avatarUrl) { fpAv.style.backgroundImage=`url(${p.avatarUrl})`; fpAv.style.backgroundSize='cover'; fpAv.textContent=''; }
      else { fpAv.style.backgroundImage=''; fpAv.style.background=p.accentColor; fpAv.style.color=p.accentText; }
    }
  }
}

function _renderProfilePosts(profilePosts, isOwn) {
  const feed = document.getElementById('fpp-feed');
  if (!feed) return;
  if (!profilePosts.length) { feed.innerHTML=`<div style="text-align:center;padding:30px 0;font-size:12px;opacity:.3;">No posts yet</div>`; return; }
  feed.innerHTML = profilePosts.map((p,i) => {
    let media='';
    if (p.media) {
      if (p.media.type==='image')  media=`<img class="fpp-post-media" src="${p.media.url}" onclick="fppLightbox('${p.media.url}')">`;
      else if (p.media.type==='video') media=`<video class="fpp-post-media" src="${p.media.url}" controls></video>`;
      else if (p.media.type==='audio') media=`<audio class="fpp-post-audio" src="${p.media.url}" controls></audio>`;
      else media=`<div class="fpp-post-file"><span>📎</span> <span>${p.media.name}</span></div>`;
    }
    return `<div class="fpp-post">
      <div class="fpp-post-time">${p.time}</div>
      ${p.text?`<div class="fpp-post-text">${p.text}</div>`:''}
      ${media}
      ${isOwn?`<div class="fpp-post-actions"><button class="fpp-post-act" onclick="fppDeletePost(${i})">Delete</button></div>`:''}
    </div>`;
  }).join('');
}

function _applyProfileCss(cssCode) {
  let style = document.getElementById('fpp-profile-custom-style');
  if (!style) { style=document.createElement('style'); style.id='fpp-profile-custom-style'; document.head.appendChild(style); }
  const raw=(cssCode||'').trim();
  style.textContent = raw ? _scopeCss(raw) : '';
}

function _scopeCss(raw) {
  const SCOPE='#fp-view-profile';
  function strip(s) { return s.replace(/\/\*[\s\S]*?\*\//g,''); }
  function scopeOne(s) {
    s=s.trim(); if(!s) return '';
    if(s===SCOPE||s.startsWith(SCOPE+' ')||s.startsWith(SCOPE+'.')||s.startsWith(SCOPE+':')||s.startsWith(SCOPE+'#')) return s;
    if(s==='body'||s==='html'||s==='*'||s===':root') return SCOPE;
    if(s.startsWith('body ')||s.startsWith('html ')||s.startsWith(':root ')) return SCOPE+' '+s.slice(s.indexOf(' ')+1);
    return SCOPE+' '+s;
  }
  function scopeList(sels) { return sels.split(',').map(scopeOne).filter(Boolean).join(',\n'); }
  function extract(src,start) {
    const bo=src.indexOf('{',start); if(bo===-1) return null;
    const sel=src.slice(start,bo).trim();
    let depth=1,j=bo+1;
    while(j<src.length&&depth>0){if(src[j]==='{')depth++;else if(src[j]==='}')depth--;j++;}
    return {sel,block:src.slice(bo,j),end:j};
  }
  function process(src) {
    let out='',i=0;
    src=strip(src).trim();
    while(i<src.length){
      while(i<src.length&&src[i]<=' ')i++;
      if(i>=src.length)break;
      const r=extract(src,i); if(!r)break; i=r.end; if(!r.sel)continue;
      if(/^@keyframes\b|^@font-face\b/i.test(r.sel)) out+=r.sel+' '+r.block+'\n';
      else if(r.sel.startsWith('@')) { const inner=r.block.slice(1,r.block.lastIndexOf('}')); out+=r.sel+' {\n'+process(inner)+'}\n'; }
      else out+=scopeList(r.sel)+' '+r.block+'\n';
    }
    return out;
  }
  return process(raw);
}

function _setProfileControls(isOwn) {
  ['fpp-customize-toggle','fpp-css-tab-btn'].forEach(id => {
    const el=document.getElementById(id); if(el) el.style.display=isOwn?'':'none';
  });
  const composer=document.querySelector('.fpp-composer');
  if(composer) composer.style.display=isOwn?'':'none';
  const avUp=document.querySelector('.fpp-av-upload-btn');
  if(avUp) avUp.style.display=isOwn?'':'none';
  if(!isOwn) {
    const cust=document.getElementById('fpp-customizer'); if(cust) cust.style.display='none';
    const cssEd=document.getElementById('fpp-css-editor-wrap'); if(cssEd) cssEd.style.display='none';
    fppCssActive=false;
    const cssBtn=document.getElementById('fpp-css-tab-btn'); if(cssBtn) cssBtn.classList.remove('active');
    const custBtn=document.getElementById('fpp-customize-toggle'); if(custBtn) custBtn.classList.remove('active');
  }
}

function _applyBannerStyle(banner,mode,color,imgUrl) {
  if(!banner) return;
  banner.style.backgroundSize=''; banner.style.backgroundImage='';
  if(mode==='image'&&imgUrl){banner.style.background=`url(${imgUrl}) center/cover no-repeat`;return;}
  switch(mode){
    case 'gradient': banner.style.background=`linear-gradient(135deg, ${color}, ${color}66)`; break;
    case 'grid':     banner.style.background=color; banner.style.backgroundImage=`linear-gradient(rgba(0,0,0,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.15) 1px,transparent 1px)`; banner.style.backgroundSize='18px 18px'; break;
    case 'dots':     banner.style.background=color; banner.style.backgroundImage=`radial-gradient(rgba(0,0,0,.2) 1.5px, transparent 1.5px)`; banner.style.backgroundSize='14px 14px'; break;
    default:         banner.style.background=color; banner.style.backgroundImage='none';
  }
}

function fpCloseProfile() {
  if(fppIsFullscreen){fppIsFullscreen=false;document.getElementById('fpp-fullscreen-overlay').classList.add('hidden');document.getElementById('fpp-fs-btn').innerHTML='⛶';document.body.classList.remove('profile-fullscreen-active');}
  _setProfileControls(true);
  fppViewingUsername=null;
  document.getElementById('fp-view-profile').style.display='none';
  document.getElementById('fp-view-friends').style.display='flex';
}

// ═══════════════════════════════════════
// OWN PROFILE ACTIONS
// ═══════════════════════════════════════

function fppRenderPosts() {
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  fppPosts = USER_PROFILES[myName] ? USER_PROFILES[myName].posts : [];
  const pc=document.getElementById('fpp-posts-count');
  if(pc) pc.textContent=fppPosts.length;
  _renderProfilePosts(fppPosts,true);
}

function fppPost() {
  const input=document.getElementById('fpp-compose-input');
  const text=input.value.trim();
  if(!text&&!fppPendingMedia) return;
  const post={time:'just now',text};
  if(fppPendingMedia){post.media=fppPendingMedia;fppPendingMedia=null;}
  fppPosts.unshift(post);
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].posts=fppPosts;
  input.value='';
  const prev=document.getElementById('fpp-compose-preview');
  if(prev){prev.innerHTML='';prev.style.display='none';}
  fppRenderPosts();
  posts.unshift({id:Date.now(),user:USERS[0],text:text||'📎 Attachment',time:'just now',branches:0,hidden:false});
  branchReplies[posts[0].id]=[];
  renderFeed();
}

function fppDeletePost(i) {
  fppPosts.splice(i,1);
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].posts=fppPosts;
  fppRenderPosts();
}

function fppAttachMedia(event,type) {
  const file=event.target.files[0]; if(!file) return;
  const url=URL.createObjectURL(file);
  fppPendingMedia={type,url,name:file.name};
  const prev=document.getElementById('fpp-compose-preview'); if(!prev) return;
  prev.style.display='block';
  if(type==='image')      prev.innerHTML=`<img src="${url}" style="max-height:120px;border-radius:8px;"><button onclick="fppClearMedia()" class="fpp-clear-media">✕</button>`;
  else if(type==='video') prev.innerHTML=`<video src="${url}" style="max-height:120px;border-radius:8px;" controls></video><button onclick="fppClearMedia()" class="fpp-clear-media">✕</button>`;
  else if(type==='audio') prev.innerHTML=`<audio src="${url}" controls style="width:100%;"></audio><button onclick="fppClearMedia()" class="fpp-clear-media">✕</button>`;
  else                    prev.innerHTML=`<div class="fpp-post-file"><span>📎</span> ${file.name}</div><button onclick="fppClearMedia()" class="fpp-clear-media">✕</button>`;
  event.target.value='';
}

function fppClearMedia() {
  fppPendingMedia=null;
  const prev=document.getElementById('fpp-compose-preview');
  if(prev){prev.innerHTML='';prev.style.display='none';}
}

function fppLightbox(url) {
  const lb=document.createElement('div');
  lb.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
  lb.innerHTML=`<img src="${url}" style="max-width:90vw;max-height:90vh;border-radius:8px;">`;
  lb.onclick=()=>lb.remove();
  document.body.appendChild(lb);
}

function fppUploadAvatar(event) {
  const file=event.target.files[0]; if(!file) return;
  const url=URL.createObjectURL(file);
  fppAvatarUrl=url;
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].avatarUrl=url;
  const av=document.getElementById('fpp-banner-av');
  if(av){av.style.backgroundImage=`url(${url})`;av.style.backgroundSize='cover';av.style.backgroundPosition='center';av.textContent='';}
  const fpAv=document.getElementById('fp-av');
  if(fpAv){fpAv.style.backgroundImage=`url(${url})`;fpAv.style.backgroundSize='cover';fpAv.textContent='';}
  const topAv=document.querySelector('.avatar-content');
  if(topAv){topAv.style.backgroundImage=`url(${url})`;topAv.style.backgroundSize='cover';topAv.textContent='';}
}

function fppUploadBanner(event) {
  const file=event.target.files[0]; if(!file) return;
  fppBannerImgUrl=URL.createObjectURL(file);
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].bannerImgUrl=fppBannerImgUrl;
  fppApplyStyle();
}
function fppClearBanner() {
  fppBannerImgUrl=null;
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].bannerImgUrl=null;
  fppApplyStyle();
}

function fppUploadProfileBg(event) {
  const file=event.target.files[0]; if(!file) return;
  fppProfileBgUrl=URL.createObjectURL(file);
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].profileBgUrl=fppProfileBgUrl;
  fppApplyStyle();
}
function fppClearProfileBg() {
  fppProfileBgUrl=null;
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].profileBgUrl=null;
  fppApplyStyle();
}

function fppSetProfileBg(el) {
  document.querySelectorAll('#fpp-bg-opts .fpp-bopt').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  fppProfileBgMode=el.dataset.pbg;
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].profileBgMode=fppProfileBgMode;
  const row=document.getElementById('fpp-bg-img-row'); if(row) row.style.display=fppProfileBgMode==='image'?'flex':'none';
  fppApplyStyle();
  _scheduleSaveProfile();
}

function fppSetFont(el) {
  document.querySelectorAll('#fpp-font-opts .fpp-bopt').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  const map={inter:"'Inter',system-ui,sans-serif",serif:'Georgia,serif',mono:"'Courier New',monospace",script:'cursive'};
  fppFontFamily=map[el.dataset.ff]||map.inter;
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].fontFamily=fppFontFamily;
  fppApplyStyle();
  _scheduleSaveProfile();
}
function fppSetFontSize(val) {
  fppFontSize=val;
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].fontSize=val;
  const v=document.getElementById('fpp-font-size-val'); if(v) v.textContent=val+'px';
  fppApplyStyle();
  _scheduleSaveProfile();
}

function fppToggleCustomizer() {
  const c=document.getElementById('fpp-customizer'); if(!c) return;
  const open=c.style.display!=='none';
  c.style.display=open?'none':'block';
  const btn=document.getElementById('fpp-customize-toggle'); if(btn) btn.classList.toggle('active',!open);
}

function fppToggleFullscreen() {
  fppIsFullscreen=!fppIsFullscreen;
  const overlay=document.getElementById('fpp-fullscreen-overlay');
  const btn=document.getElementById('fpp-fs-btn');
  if(fppIsFullscreen){
    overlay.classList.remove('hidden'); document.body.classList.add('profile-fullscreen-active');
    if(btn){btn.innerHTML='⊠';btn.title='Exit Fullscreen';btn.classList.add('active');}
  } else {
    overlay.classList.add('hidden'); document.body.classList.remove('profile-fullscreen-active');
    if(btn){btn.innerHTML='⛶';btn.title='Fullscreen';btn.classList.remove('active');}
  }
}

function fppSetColor(el) {
  document.querySelectorAll('.fpp-swatch').forEach(s=>s.classList.remove('active'));
  el.classList.add('active');
  fppAccentColor=el.dataset.color; fppAccentText=el.dataset.text;
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]){ USER_PROFILES[myName].accentColor=fppAccentColor; USER_PROFILES[myName].accentText=fppAccentText; }
  fppApplyStyle();
  _scheduleSaveProfile();
}
function fppSetColorCustom(val) {
  fppAccentColor=val; fppAccentText='#fff';
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]){ USER_PROFILES[myName].accentColor=val; USER_PROFILES[myName].accentText='#fff'; }
  document.querySelectorAll('.fpp-swatch').forEach(s=>s.classList.remove('active'));
  fppApplyStyle();
  _scheduleSaveProfile();
}

function fppSetBanner(el) {
  document.querySelectorAll('.fpp-customizer .fpp-banner-opts:first-of-type .fpp-bopt').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  fppBannerMode=el.dataset.bg;
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].bannerMode=fppBannerMode;
  const row=document.getElementById('fpp-banner-img-row'); if(row) row.style.display=fppBannerMode==='image'?'flex':'none';
  fppApplyStyle();
  _scheduleSaveProfile();
}

function fppApplyStyle() {
  if(fppViewingUsername!==null) return;
  const pv=document.getElementById('fp-view-profile');
  const banner=document.getElementById('fpp-banner');
  const bannerAv=document.getElementById('fpp-banner-av');
  const c=fppAccentColor;
  if(!banner) return;
  _applyBannerStyle(banner,fppBannerMode,c,fppBannerImgUrl);
  if(!fppAvatarUrl){bannerAv.style.background=c;bannerAv.style.color=fppAccentText;}
  if(pv){
    if(fppProfileBgMode==='image'&&fppProfileBgUrl) pv.style.background=`url(${fppProfileBgUrl}) center/cover no-repeat`;
    else { const bgMap={dark:'#0e0e12',darker:'#060608',light:'#1c1c22',accent:c+'22'}; pv.style.background=bgMap[fppProfileBgMode]||bgMap.dark; }
    pv.style.fontSize=fppFontSize+'px'; pv.style.fontFamily=fppFontFamily;
  }
  const fpAv=document.getElementById('fp-av');
  if(fpAv&&!fppAvatarUrl){fpAv.style.background=c;fpAv.style.color=fppAccentText;}
  _syncMyState();
}

function fppToggleCssEditor() {
  fppCssActive=!fppCssActive;
  const editor=document.getElementById('fpp-css-editor-wrap');
  const btn=document.getElementById('fpp-css-tab-btn');
  if(!editor) return;
  editor.style.display=fppCssActive?'flex':'none';
  if(btn) btn.classList.toggle('active',fppCssActive);
}

function fppApplyCss() {
  const ta=document.getElementById('fpp-css-textarea'); if(!ta) return;
  fppCssCode=ta.value;
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].cssCode=fppCssCode;
  _applyProfileCss(fppCssCode);
  const toast=document.getElementById('fpp-css-toast');
  if(toast){toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800);}
  _scheduleSaveProfile();
}

function fppResetCss() {
  const ta=document.getElementById('fpp-css-textarea'); if(ta) ta.value='';
  fppCssCode='';
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if(USER_PROFILES[myName]) USER_PROFILES[myName].cssCode='';
  _applyProfileCss('');
  _scheduleSaveProfile();
}

document.addEventListener('click', e => {
  if (e.target.closest('.fpp-css-hints') && e.target.tagName === 'SPAN') {
    const ta=document.getElementById('fpp-css-textarea'); if(!ta) return;
    const sel=e.target.textContent.trim();
    const snippet=`\n${sel} {\n  \n}\n`;
    const pos=ta.selectionStart;
    ta.value=ta.value.slice(0,pos)+snippet+ta.value.slice(pos);
    const newPos=pos+snippet.indexOf('  ')+2;
    ta.focus(); ta.setSelectionRange(newPos,newPos);
  }
});

window.addEventListener('message', function(e) {
  if (!e.data || typeof e.data !== 'object') return;
  if (e.data.type === 'openUserProfile' && e.data.username) {
    openUserProfile(e.data.username);
  }
});

// ═══════════════════════════════════════════════════════
// SEARCH — user lookup by @username
// ═══════════════════════════════════════════════════════

let _searchTimer = null;
let _searchCache = {}; // username → profile data

function handleSearchInput(val) {
  const dropdown = document.getElementById('search-dropdown');
  if (!val.trim()) { dropdown.classList.add('hidden'); return; }

  // Strip leading @ for the query
  const raw = val.startsWith('@') ? val.slice(1) : val;
  if (!raw.trim()) { dropdown.classList.add('hidden'); return; }

  dropdown.classList.remove('hidden');
  dropdown.innerHTML = '<div class="sd-loading">Searching…</div>';

  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => _runSearch(raw.trim()), 280);
}

function handleSearchKey(e) {
  if (e.key === 'Escape') {
    document.getElementById('search-dropdown').classList.add('hidden');
    e.target.value = '';
  }
  if (e.key === 'Enter') triggerSearch();
}

function triggerSearch() {
  const val = document.getElementById('search-input').value.trim();
  if (!val) return;
  const raw = val.startsWith('@') ? val.slice(1) : val;
  _runSearch(raw);
}

async function _runSearch(query) {
  const dropdown = document.getElementById('search-dropdown');
  try {
    // Fetch profile of exact match first, then try a loose search
    const res = await fetch(`${API}/search/users?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const users = await res.json();
      _renderSearchResults(users, query);
      return;
    }
  } catch(_) {}

  // Fallback: try exact username lookup via /profile/{username}
  try {
    const res = await fetch(`${API}/profile/${encodeURIComponent(query)}`);
    if (res.ok) {
      const u = await res.json();
      _renderSearchResults([u], query);
      return;
    }
  } catch(_) {}

  dropdown.innerHTML = `<div class="sd-empty">No users found for "@${query}"</div>`;
}

function _renderSearchResults(users, query) {
  const dropdown = document.getElementById('search-dropdown');
  if (!users || !users.length) {
    dropdown.innerHTML = `<div class="sd-empty">No users found for "@${query}"</div>`;
    return;
  }

  const myUsername = CURRENT_USER ? CURRENT_USER.username : null;

  dropdown.innerHTML = `<div class="sd-section">Users</div>` + users.map(u => {
    const displayName = u.display_name || u.username;
    const initial = displayName[0].toUpperCase();
    const color = u.color || '#a78bfa';
    const textColor = u.text_color || '#fff';
    const isMe = myUsername && u.username === myUsername;
    const avatarHtml = u.avatar_url
      ? `<div class="sd-av" style="background-image:url(${API}${u.avatar_url});background-size:cover;background-position:center;"></div>`
      : `<div class="sd-av" style="background:${color};color:${textColor};">${initial}</div>`;

    return `<div class="sd-user" onclick="sdOpenProfile('${u.username}')">
      ${avatarHtml}
      <div class="sd-info">
        <div class="sd-name">${displayName}</div>
        <div class="sd-handle">@${u.username}</div>
      </div>
      ${!isMe ? `<button class="sd-user-btn" onclick="event.stopPropagation();sdAddFriend('${u.username}',this)">+ Add</button>` : '<span style="font-size:11px;opacity:.4;">You</span>'}
    </div>`;
  }).join('');
}

function sdOpenProfile(username) {
  document.getElementById('search-dropdown').classList.add('hidden');
  document.getElementById('search-input').value = '';
  // Open friend panel on that user's profile
  openFriendPanel().then ? openFriendPanel().then(() => openUserProfile(username)) : (openFriendPanel(), setTimeout(() => openUserProfile(username), 150));
}

async function sdAddFriend(username, btn) {
  if (!CURRENT_USER) return;
  btn.disabled = true;
  btn.textContent = '…';
  try {
    const res = await fetch(`${API}/friends/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: CURRENT_USER.username, receiver: username })
    });
    btn.textContent = res.ok ? '✓ Sent' : '✗ Error';
  } catch(_) { btn.textContent = '✗'; }
}

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('#search-container')) {
    const dd = document.getElementById('search-dropdown');
    if (dd) dd.classList.add('hidden');
  }
});

// Add /search/users endpoint to main.py check — we also support it via fallback above.
// The backend needs: GET /search/users?q=... → returns list of users matching username prefix.
// If your main.py doesn't have it yet, add this route (see instructions).


// ═══════════════════════════════════════════════════════
// CUSTOMIZATION — auto-save to API after each change
// ═══════════════════════════════════════════════════════

let _saveTimer = null;

function _scheduleSaveProfile() {
  // Debounce saves so we don't hit the API on every slider tick
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(_saveProfileToAPI, 800);
}

async function _saveProfileToAPI() {
  if (!CURRENT_USER) return;
  const myName = CURRENT_USER.username;
  const nameEl = document.getElementById('fpp-display-name');
  const bioEl  = document.getElementById('fpp-bio');

  const body = {
    display_name:    nameEl ? nameEl.textContent.trim() : (CURRENT_USER.display_name || myName),
    bio:             bioEl  ? bioEl.textContent.trim()  : '',
    color:           fppAccentColor   || '#c8ff00',
    text_color:      fppAccentText    || '#000',
    banner_mode:     fppBannerMode    || 'solid',
    profile_bg_mode: fppProfileBgMode || 'dark',
    font_family:     fppFontFamily    || 'system-ui',
    font_size:       String(fppFontSize || 14),
    custom_css:      fppCssCode       || '',
  };

  try {
    await fetch(`${API}/profile/${myName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    // Update session so display_name stays consistent
    if (CURRENT_USER) {
      CURRENT_USER.display_name = body.display_name;
      CURRENT_USER.color        = body.color;
      CURRENT_USER.text_color   = body.text_color;
      sessionStorage.setItem('branch_user', JSON.stringify(CURRENT_USER));
    }
  } catch(err) {
    console.warn('Profile save failed:', err);
  }
}

// Also handle avatar upload via API
async function fppUploadAvatarToAPI(event) {
  const file = event.target.files[0];
  if (!file || !CURRENT_USER) return;

  // Show local preview immediately
  const localUrl = URL.createObjectURL(file);
  fppAvatarUrl = localUrl;
  const av = document.getElementById('fpp-banner-av');
  if (av) { av.style.backgroundImage=`url(${localUrl})`; av.style.backgroundSize='cover'; av.style.backgroundPosition='center'; av.textContent=''; }
  const fpAv = document.getElementById('fp-av');
  if (fpAv) { fpAv.style.backgroundImage=`url(${localUrl})`; fpAv.style.backgroundSize='cover'; fpAv.textContent=''; }
  const topAv = document.querySelector('.avatar-content');
  if (topAv) { topAv.style.backgroundImage=`url(${localUrl})`; topAv.style.backgroundSize='cover'; topAv.textContent=''; }

  // Upload to API
  try {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API}/profile/${CURRENT_USER.username}/avatar`, {
      method: 'POST',
      body: form
    });
    if (res.ok) {
      const data = await res.json();
      const serverUrl = API + data.avatar_url;
      fppAvatarUrl = serverUrl;
      CURRENT_USER.avatar_url = data.avatar_url;
      sessionStorage.setItem('branch_user', JSON.stringify(CURRENT_USER));
      // Update all avatar elements to use server URL
      [av, fpAv, topAv].forEach(el => {
        if (el) el.style.backgroundImage = `url(${serverUrl})`;
      });
    }
  } catch(err) { console.warn('Avatar upload failed:', err); }
}


// ═══════════════════════════════════════════════════════
// BRANCH API LAYER
// ═══════════════════════════════════════════════════════

const API = 'http://127.0.0.1:8000';
var CURRENT_USER = JSON.parse(sessionStorage.getItem('branch_user') || 'null');

window.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('auth-overlay');
  if (!overlay) return;
  if (!CURRENT_USER) {
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
    applyUserToTopBar(CURRENT_USER);
    loadFeedFromAPI();
    // Load the home server iframe
    if (typeof window._loadHomeOnReady === 'function') window._loadHomeOnReady();
    else window.addEventListener('load', () => { if (typeof window._loadHomeOnReady === 'function') window._loadHomeOnReady(); });
  }
});

function switchAuthTab(tab, event) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  document.getElementById('auth-login').style.display    = tab === 'login'    ? 'flex' : 'none';
  document.getElementById('auth-register').style.display = tab === 'register' ? 'flex' : 'none';
}

async function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl  = document.getElementById('login-error');
  errorEl.textContent = ''; errorEl.style.color = '#ff4d4d';
  if (!username || !password) { errorEl.textContent = 'Please fill in all fields'; return; }
  try {
    const res  = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) { errorEl.textContent = data.detail || 'Login failed'; return; }
    sessionStorage.setItem('branch_user', JSON.stringify(data));
    CURRENT_USER = data;
    document.getElementById('auth-overlay').classList.add('hidden');
    applyUserToTopBar(data);
    loadFeedFromAPI();
    // Load home server in iframe
    setTimeout(() => { if (typeof window._loadHomeOnReady === 'function') window._loadHomeOnReady(); }, 100);
  } catch(e) {
    errorEl.textContent = 'Cannot connect to server. Is the backend running?';
  }
}

async function doRegister() {
  const username     = document.getElementById('reg-username').value.trim();
  const display_name = document.getElementById('reg-displayname').value.trim();
  const password     = document.getElementById('reg-password').value;
  const password2    = document.getElementById('reg-password2').value;
  const errorEl      = document.getElementById('reg-error');
  errorEl.textContent = ''; errorEl.style.color = '#ff4d4d';
  if (!username || !password)  { errorEl.textContent = 'Username and password are required'; return; }
  if (password !== password2)  { errorEl.textContent = 'Passwords do not match'; return; }
  if (password.length < 6)     { errorEl.textContent = 'Password must be at least 6 characters'; return; }
  try {
    const res  = await fetch(API + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, display_name })
    });
    const data = await res.json();
    if (!res.ok) { errorEl.textContent = data.detail || 'Registration failed'; return; }
    document.getElementById('login-username').value = username;
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
    document.getElementById('auth-login').style.display    = 'flex';
    document.getElementById('auth-register').style.display = 'none';
    const loginErr = document.getElementById('login-error');
    loginErr.style.color = '#c8ff00';
    loginErr.textContent = '\u2713 Account created! Please log in.';
  } catch(e) {
    errorEl.textContent = 'Cannot connect to server';
  }
}

function doLogout() {
  sessionStorage.removeItem('branch_user');
  CURRENT_USER = null;
  location.reload();
}

// ── FIX 1: applyUserToTopBar — updates top bar AND friend panel header ──
function applyUserToTopBar(user) {
  const displayName = user.display_name || user.username;

  // Top bar username text
  const nameEl = document.querySelector('.username');
  if (nameEl) nameEl.textContent = displayName;

  // Top bar avatar
  const avatarEl = document.getElementById('top-avatar');
  if (avatarEl) {
    avatarEl.style.background = user.color      || '#c8ff00';
    avatarEl.style.color      = user.text_color || '#000';
    avatarEl.style.fontSize   = '22px';
    avatarEl.style.fontWeight = '800';
    avatarEl.textContent      = displayName[0].toUpperCase();
    if (user.avatar_url) {
      avatarEl.style.backgroundImage    = 'url(' + API + user.avatar_url + ')';
      avatarEl.style.backgroundSize     = 'cover';
      avatarEl.style.backgroundPosition = 'center';
      avatarEl.textContent              = '';
    }
  }

  // Friend panel header avatar
  const fpAv = document.getElementById('fp-av');
  if (fpAv) {
    fpAv.style.background = user.color      || '#c8ff00';
    fpAv.style.color      = user.text_color || '#000';
    fpAv.textContent      = displayName[0].toUpperCase();
    if (user.avatar_url) {
      fpAv.style.backgroundImage    = 'url(' + API + user.avatar_url + ')';
      fpAv.style.backgroundSize     = 'cover';
      fpAv.style.backgroundPosition = 'center';
      fpAv.textContent              = '';
    }
  }

  // Friend panel header username label
  const fpUser = document.getElementById('fp-username');
  if (fpUser) fpUser.textContent = displayName;

  // Also update USERS[0] so the feed composer avatar matches
  if (USERS && USERS[0]) {
    USERS[0].name      = user.username;
    USERS[0].initial   = displayName[0].toUpperCase();
    USERS[0].color     = user.color      || '#c8ff00';
    USERS[0].textColor = user.text_color || '#000';
  }

  // Update composer avatar in the feed iframe (if it has loaded)
  const composerAv = document.getElementById('c-av');
  if (composerAv) {
    composerAv.style.background = user.color      || '#c8ff00';
    composerAv.style.color      = user.text_color || '#000';
    composerAv.textContent      = displayName[0].toUpperCase();
  }
}

async function loadFeedFromAPI() {
  try {
    const res  = await fetch(API + '/posts');
    const data = await res.json();
    posts = data.map(p => ({
      id:       p.id,
      user: {
        name:      p.username,
        initial:   (p.display_name || p.username)[0].toUpperCase(),
        color:     p.color      || '#c8ff00',
        textColor: p.text_color || '#000',
      },
      text:     p.text,
      time:     p.created_at,
      branches: p.reply_count || 0,
      hidden:   false,
    }));
    branchReplies = {};
    renderFeed();
  } catch(e) {
    console.warn('Could not load posts from API, using seed data');
  }
}

async function createPost() {
  if (!CURRENT_USER) { alert('Please log in first'); return; }
  const input = document.getElementById('composer-input');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  try {
    await fetch(API + '/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: CURRENT_USER.username, text })
    });
    await loadFeedFromAPI();
  } catch(e) {
    console.error('Failed to save post:', e);
  }
}

async function addBranchReply() {
  if (!CURRENT_USER) return;
  const input = document.getElementById('bp-input');
  const text  = input.value.trim();
  if (!text || activeBranchPostId === null) return;
  input.value = '';
  try {
    await fetch(API + '/posts/' + activeBranchPostId + '/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: CURRENT_USER.username, text })
    });
  } catch(e) { console.error('Reply failed:', e); }
  const r = {
    user: {
      name: CURRENT_USER.username,
      initial: (CURRENT_USER.display_name || CURRENT_USER.username)[0].toUpperCase(),
      color: CURRENT_USER.color || '#c8ff00',
      textColor: CURRENT_USER.text_color || '#000',
    },
    text, time: 'just now'
  };
  if (!branchReplies[activeBranchPostId]) branchReplies[activeBranchPostId] = [];
  branchReplies[activeBranchPostId].push(r);
  const bpFeed = document.getElementById('bp-feed');
  bpFeed.appendChild(buildBranchReply(r));
  bpFeed.scrollTop = bpFeed.scrollHeight;
  const p = posts.find(p => p.id === activeBranchPostId);
  if (p) p.branches++;
  renderFeed();
}

async function openFriendPanel() {
  document.getElementById('fp-view-friends').style.display = 'flex';
  document.getElementById('fp-view-profile').style.display = 'none';
  fpSetTab('friends', document.getElementById('fp-tab-friends'));
  document.getElementById('friend-search').value = '';
  document.getElementById('friend-panel').classList.remove('hidden');
  document.getElementById('friend-panel-backdrop').classList.remove('hidden');
  if (!CURRENT_USER) { fpRenderAll(); return; }
  try {
    const [fr, pr] = await Promise.all([
      fetch(API + '/friends/' + CURRENT_USER.username),
      fetch(API + '/friends/' + CURRENT_USER.username + '/pending')
    ]);
    const friendsData = await fr.json();
    const pendingData = await pr.json();
    fpFriendsList = friendsData.map(f => ({
      name: f.username,
      initial: (f.display_name || f.username)[0].toUpperCase(),
      color: f.color || '#a78bfa',
      textColor: '#fff',
      status: 'online',
      sub: 'Online',
    }));
    fpRequestsList = pendingData.map(f => ({
      name: f.username,
      initial: (f.display_name || f.username)[0].toUpperCase(),
      color: f.color || '#a78bfa',
      textColor: '#fff',
      sub: 'Wants to connect',
      request_id: f.request_id,
    }));
  } catch(e) { console.warn('Could not load friends from API'); }
  fpRenderAll();
}

async function fpSendRequest() {
  if (!CURRENT_USER) return;
  const input = document.getElementById('fp-add-input');
  const name  = input.value.trim();
  if (!name) return;
  input.value = '';
  const t = document.getElementById('toast');
  try {
    const res  = await fetch(API + '/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: CURRENT_USER.username, receiver: name })
    });
    const data = await res.json();
    const msg  = res.ok ? ('Friend request sent to @' + name) : (data.detail || 'Error');
    if (t) { t.textContent = msg; t.style.color = res.ok ? '#c8ff00' : '#ff4d4d'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); }
  } catch(e) {
    if (t) { t.textContent = 'Could not connect'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); }
  }
}

async function fpAccept(name) {
  const req = fpRequestsList.find(f => f.name === name);
  if (!req || !req.request_id) return;
  try {
    await fetch(API + '/friends/' + req.request_id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accepted' })
    });
    fpFriendsList.unshift({ ...req, status: 'online', sub: 'Just joined' });
    fpRequestsList = fpRequestsList.filter(f => f.name !== name);
    fpRenderAll();
  } catch(e) { console.error('Accept failed:', e); }
}

async function fpDecline(name) {
  const req = fpRequestsList.find(f => f.name === name);
  if (!req || !req.request_id) return;
  try {
    await fetch(API + '/friends/' + req.request_id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rejected' })
    });
  } catch(e) {}
  fpRequestsList = fpRequestsList.filter(f => f.name !== name);
  fpRenderAll();
}

function _loadProfileFromAPI(username, isOwn) {
  const feedEl = document.getElementById('fpp-feed');
  if (feedEl) feedEl.innerHTML = '<div style="text-align:center;padding:30px 0;font-size:12px;opacity:.3;">Loading...</div>';

  fetch(API + '/profile/' + username)
    .then(r => r.json())
    .then(data => {
      const p = _getProfile(username);
      // Use display_name from API; fall back to CURRENT_USER.display_name for own profile, then username
      const resolvedDisplayName = data.display_name
        || (isOwn && CURRENT_USER && CURRENT_USER.display_name ? CURRENT_USER.display_name : null)
        || username;
      p.displayName   = resolvedDisplayName;
      p.bio           = data.bio             || '';
      p.accentColor   = data.color           || (isOwn && CURRENT_USER ? CURRENT_USER.color || '#c8ff00' : '#c8ff00');
      p.accentText    = data.text_color      || (isOwn && CURRENT_USER ? CURRENT_USER.text_color || '#000' : '#000');
      p.bannerMode    = data.banner_mode     || 'solid';
      p.profileBgMode = data.profile_bg_mode || 'dark';
      p.fontFamily    = data.font_family     || "'Inter',system-ui,sans-serif";
      p.fontSize      = parseInt(data.font_size) || 14;
      p.cssCode       = data.custom_css      || '';
      p.avatarUrl     = data.avatar_url      ? API + data.avatar_url : null;
      p.friendCount   = data.friend_count    || 0;
      p.serverCount   = data.server_count    || 0;
      if (isOwn) {
        fppAccentColor   = p.accentColor;
        fppAccentText    = p.accentText;
        fppBannerMode    = p.bannerMode;
        fppProfileBgMode = p.profileBgMode;
        fppFontFamily    = p.fontFamily;
        fppFontSize      = p.fontSize;
        fppCssCode       = p.cssCode;
        fppAvatarUrl     = p.avatarUrl;
      }
      _loadProfileIntoDOM(username, isOwn);
      // Update stats from API response
      const allStatN = document.querySelectorAll('#fp-view-profile .fpp-stat-n');
      if (allStatN[1]) allStatN[1].textContent = data.friend_count || 0;
      if (allStatN[2]) allStatN[2].textContent = data.server_count || 0;
    })
    .catch(() => _loadProfileIntoDOM(username, isOwn));

  // Load posts for this user
  fetch(API + '/posts?username=' + encodeURIComponent(username))
    .then(r => r.json())
    .then(data => {
      // API may return all posts; filter to this user's
      const arr = Array.isArray(data) ? data : (data.posts || []);
      const mine = arr
        .filter(p => p.username === username)
        .map(p => ({ time: p.created_at, text: p.text, id: p.id }));
      if (!USER_PROFILES[username]) return;
      USER_PROFILES[username].posts = mine;
      if (isOwn) fppPosts = mine;
      _renderProfilePosts(mine, isOwn);
      // Update post count stat
      const allStatN = document.querySelectorAll('#fp-view-profile .fpp-stat-n');
      if (allStatN[0]) allStatN[0].textContent = mine.length;
    })
    .catch(() => {
      // fallback: use /posts without filter
      fetch(API + '/posts')
        .then(r => r.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : (data.posts || []);
          const mine = arr
            .filter(p => p.username === username)
            .map(p => ({ time: p.created_at, text: p.text, id: p.id }));
          if (!USER_PROFILES[username]) return;
          USER_PROFILES[username].posts = mine;
          if (isOwn) fppPosts = mine;
          _renderProfilePosts(mine, isOwn);
          const allStatN = document.querySelectorAll('#fp-view-profile .fpp-stat-n');
          if (allStatN[0]) allStatN[0].textContent = mine.length;
        }).catch(() => {});
    });
}

async function fppPost() {
  if (!CURRENT_USER) return;
  const input = document.getElementById('fpp-compose-input');
  const text  = input.value.trim();
  if (!text && !fppPendingMedia) return;
  input.value = '';
  try {
    await fetch(API + '/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: CURRENT_USER.username, text: text || '' })
    });
  } catch(e) { console.error('Failed to save post:', e); }
  const post = { time: 'just now', text };
  if (fppPendingMedia) { post.media = fppPendingMedia; fppPendingMedia = null; }
  fppPosts.unshift(post);
  const myName = CURRENT_USER ? CURRENT_USER.username : MY_USERNAME;
  if (USER_PROFILES[myName]) USER_PROFILES[myName].posts = fppPosts;
  document.getElementById('fpp-compose-preview').style.display = 'none';
  fppRenderPosts();
}
