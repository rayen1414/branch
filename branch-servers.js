// ═══════════════════════════════════════════════════════════════════
// branch-servers.js  —  Generates the content for default servers
// (Home feed, Explore, Media) rendered inside #server-iframe
// ═══════════════════════════════════════════════════════════════════

const API = 'http://127.0.0.1:8000';

// ── Inject default server content on sidebar click ──────────────────
document.querySelectorAll('.sidebar-item[data-default="true"]').forEach(item => {
  item.addEventListener('click', function () {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    const id = this.getAttribute('data-id');
    loadDefaultServer(id);
  });
});

// Auto-load home on startup (after auth resolves)
window._loadHomeOnReady = function () {
  const homeItem = document.querySelector('.sidebar-item[data-id="home"]');
  if (homeItem) homeItem.click();
};

// ── Intercept iframe messages (branch panel, user profile clicks) ───
window.addEventListener('message', function (e) {
  if (!e.data || typeof e.data !== 'object') return;
  const { type } = e.data;

  if (type === 'openBranchPanel') {
    // Pass to parent branch panel logic
    if (typeof openBranchPanelFromIframe === 'function') {
      openBranchPanelFromIframe(e.data.postId, e.data.post);
    }
  }
  if (type === 'openUserProfile') {
    if (typeof openUserProfile === 'function') openUserProfile(e.data.username);
  }
  if (type === 'closeBranchPanel') {
    if (typeof closeBranchPanel === 'function') closeBranchPanel();
  }
  if (type === 'iframeClick') {
    // Close friend panel if open
    const panel = document.getElementById('friend-panel');
    if (panel && !panel.classList.contains('hidden')) {
      panel.classList.add('hidden');
      const bd = document.getElementById('friend-panel-backdrop');
      if (bd) bd.classList.add('hidden');
    }
  }
});

// ── Route to correct server ──────────────────────────────────────────
function loadDefaultServer(id) {
  const iframe = document.getElementById('server-iframe');
  if (!iframe) return;

  let html = '';
  if (id === 'home')    html = generateHomeFeed();
  if (id === 'explore') html = generateExplore();
  if (id === 'media')   html = generateMedia();

  iframe.srcdoc = html;
}

// ════════════════════════════════════════════════════════════════════
// HOME FEED  — fully API-connected post feed
// ════════════════════════════════════════════════════════════════════

function generateHomeFeed() {
  // Get current user info from parent
  const cu = window.CURRENT_USER || null;
  const cuName      = cu ? (cu.display_name || cu.username) : 'You';
  const cuInitial   = cuName[0].toUpperCase();
  const cuColor     = cu ? (cu.color || '#c8ff00') : '#c8ff00';
  const cuTextColor = cu ? (cu.text_color || '#000') : '#000';
  const cuUsername  = cu ? cu.username : '';
  const cuAvatarUrl = cu ? (cu.avatar_url ? API + cu.avatar_url : '') : '';

  const avatarStyle = cuAvatarUrl
    ? `background-image:url(${cuAvatarUrl});background-size:cover;background-position:center;`
    : `background:${cuColor};color:${cuTextColor};`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0b0b0f;
    color: #e4e4e7;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 14px;
    min-height: 100vh;
    padding: 24px 0 80px;
  }

  .feed-wrap {
    max-width: 640px;
    margin: 0 auto;
    padding: 0 16px;
  }

  /* ── Composer ── */
  .composer {
    background: #131318;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .composer-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .c-av {
    width: 40px; height: 40px;
    border-radius: 12px;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 16px;
    cursor: pointer;
    transition: opacity .15s;
  }
  .c-av:hover { opacity: .8; }
  .composer-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 12px 14px;
    color: #e4e4e7;
    font-size: 14px;
    resize: none;
    min-height: 60px;
    font-family: inherit;
    outline: none;
    transition: border-color .2s;
  }
  .composer-input:focus { border-color: rgba(200,255,0,0.3); }
  .composer-input::placeholder { color: rgba(255,255,255,0.25); }
  .composer-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    gap: 8px;
    align-items: center;
  }
  .post-btn {
    background: #c8ff00;
    color: #000;
    border: none;
    border-radius: 8px;
    padding: 8px 20px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: opacity .15s, transform .1s;
  }
  .post-btn:hover { opacity: .85; transform: translateY(-1px); }
  .post-btn:active { transform: translateY(0); }

  /* ── Post cards ── */
  .post-card {
    background: #131318;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
    transition: border-color .2s;
  }
  .post-card:hover { border-color: rgba(255,255,255,0.12); }

  .post-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .post-avatar {
    width: 38px; height: 38px;
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 15px;
    flex-shrink: 0;
    cursor: pointer;
    transition: opacity .15s;
    background-size: cover;
    background-position: center;
  }
  .post-avatar:hover { opacity: .8; }
  .post-meta { flex: 1; min-width: 0; }
  .post-display-name {
    font-weight: 700;
    font-size: 14px;
    color: #fff;
    cursor: pointer;
  }
  .post-display-name:hover { text-decoration: underline; }
  .post-username { font-size: 11px; color: rgba(255,255,255,0.35); }
  .post-time { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }
  .post-menu-btn {
    background: none; border: none; color: rgba(255,255,255,0.3);
    font-size: 18px; cursor: pointer; padding: 4px 6px;
    border-radius: 6px; transition: background .15s, color .15s;
    line-height: 1;
  }
  .post-menu-btn:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); }

  .post-text {
    font-size: 14px;
    line-height: 1.6;
    color: #d4d4d8;
    margin-bottom: 12px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .post-image {
    width: 100%; border-radius: 10px;
    margin-bottom: 12px; display: block;
    max-height: 400px; object-fit: cover;
  }

  .post-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .action-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.55);
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    transition: all .15s;
    display: flex; align-items: center; gap: 6px;
  }
  .action-btn:hover { background: rgba(255,255,255,0.09); color: #fff; border-color: rgba(255,255,255,0.15); }
  .branch-btn.active { background: rgba(200,255,0,0.1); color: #c8ff00; border-color: rgba(200,255,0,0.3); }
  .branch-count {
    background: rgba(200,255,0,0.15);
    color: #c8ff00;
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 11px;
  }
  .hide-btn { margin-left: auto; }
  .hide-btn:hover { color: #ff4d4d; border-color: rgba(255,77,77,0.3); background: rgba(255,77,77,0.07); }

  /* ── Branch replies inline ── */
  .branch-replies {
    margin-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding-top: 12px;
    display: none;
  }
  .branch-replies.open { display: block; }
  .bp-reply {
    display: flex; gap: 10px; align-items: flex-start;
    margin-bottom: 10px;
  }
  .bp-av {
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 12px;
    flex-shrink: 0; cursor: pointer;
    background-size: cover; background-position: center;
  }
  .bp-meta { flex: 1; }
  .bp-name { font-weight: 600; font-size: 12px; color: rgba(255,255,255,0.7); cursor: pointer; }
  .bp-name:hover { text-decoration: underline; }
  .bp-time { font-size: 10px; color: rgba(255,255,255,0.3); }
  .bp-text { font-size: 13px; color: #c4c4c8; margin-top: 2px; line-height: 1.5; }

  .branch-compose {
    display: flex; gap: 8px; margin-top: 10px; align-items: center;
  }
  .branch-input {
    flex: 1; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 8px 12px;
    color: #e4e4e7; font-size: 13px; font-family: inherit; outline: none;
    transition: border-color .2s;
  }
  .branch-input:focus { border-color: rgba(200,255,0,0.3); }
  .branch-input::placeholder { color: rgba(255,255,255,0.2); }
  .branch-send {
    background: rgba(200,255,0,0.15); color: #c8ff00;
    border: 1px solid rgba(200,255,0,0.25); border-radius: 8px;
    padding: 8px 14px; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all .15s; font-family: inherit;
  }
  .branch-send:hover { background: rgba(200,255,0,0.25); }

  /* ── Loading / empty ── */
  .feed-loading {
    text-align: center; padding: 60px 0;
    color: rgba(255,255,255,0.25); font-size: 13px;
    letter-spacing: .04em;
  }
  .feed-empty {
    text-align: center; padding: 60px 0;
    color: rgba(255,255,255,0.2); font-size: 13px;
  }
  .feed-empty-icon { font-size: 36px; margin-bottom: 12px; opacity: .4; }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: #1e1e26; border: 1px solid rgba(255,255,255,0.1);
    color: #e4e4e7; padding: 10px 20px; border-radius: 10px;
    font-size: 13px; opacity: 0; transition: all .25s;
    pointer-events: none; z-index: 999;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
</style>
</head>
<body>

<div class="feed-wrap" onclick="notifyParentClick()">

  <!-- Composer -->
  <div class="composer">
    <div class="composer-row">
      <div class="c-av" id="c-av" style="${avatarStyle}" onclick="openMyProfile()" title="My profile">${cuAvatarUrl ? '' : cuInitial}</div>
      <textarea class="composer-input" id="composer-input" placeholder="What's branching?" rows="2"></textarea>
    </div>
    <div class="composer-footer">
      <button class="post-btn" onclick="submitPost()">Post</button>
    </div>
  </div>

  <!-- Feed -->
  <div id="feed"><div class="feed-loading">Loading feed…</div></div>
</div>

<div class="toast" id="toast"></div>

<script>
const API   = '${API}';
const CU_USERNAME  = '${cuUsername}';
const CU_COLOR     = '${cuColor}';
const CU_TEXT_COLOR= '${cuTextColor}';
const CU_INITIAL   = '${cuInitial}';
const CU_AVATAR    = '${cuAvatarUrl}';
const CU_NAME      = '${cuName}';

let activeBranchPostId = null;
let posts = [];

// Tell parent when user clicks anywhere in iframe
function notifyParentClick() {
  window.parent.postMessage({ type: 'iframeClick' }, '*');
}

function openMyProfile() {
  window.parent.postMessage({ type: 'openUserProfile', username: CU_USERNAME }, '*');
}

function showToast(msg, color) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.color = color || '#e4e4e7';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Load feed from API ───────────────────────────────────────────────
async function loadFeed() {
  try {
    const res  = await fetch(API + '/posts');
    const data = await res.json();
    posts = data;
    renderFeed();
  } catch(e) {
    document.getElementById('feed').innerHTML =
      '<div class="feed-empty"><div class="feed-empty-icon">⚡</div>Cannot reach server.<br>Is the backend running?</div>';
  }
}

function renderFeed() {
  const feed = document.getElementById('feed');
  if (!feed) return;
  const visible = posts.filter(p => !p._hidden);
  if (!visible.length) {
    feed.innerHTML = '<div class="feed-empty"><div class="feed-empty-icon">⬡</div>Nothing posted yet. Be the first!</div>';
    return;
  }
  feed.innerHTML = '';
  visible.forEach(p => feed.appendChild(buildCard(p)));
}

function buildCard(post) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.id = 'post-' + post.id;

  const displayName = post.display_name || post.username;
  const initial     = displayName[0].toUpperCase();
  const color       = post.color || '#a78bfa';
  const textColor   = post.text_color || '#fff';
  const isActive    = activeBranchPostId === post.id;
  const replyCount  = post.reply_count || 0;

  const avStyle = post.avatar_url
    ? \`background-image:url(\${API}\${post.avatar_url});background-size:cover;background-position:center;\`
    : \`background:\${color};color:\${textColor};\`;

  card.innerHTML = \`
    <div class="post-header">
      <div class="post-avatar" style="\${avStyle}" onclick="viewProfile('\${escHtml(post.username)}')">\${post.avatar_url ? '' : initial}</div>
      <div class="post-meta">
        <div class="post-display-name" onclick="viewProfile('\${escHtml(post.username)}')">\${escHtml(displayName)}</div>
        <div class="post-username">@\${escHtml(post.username)}</div>
        <div class="post-time">\${escHtml(post.created_at || '')}</div>
      </div>
      <button class="post-menu-btn" onclick="hidePost('\${post.id}')">···</button>
    </div>
    \${post.text ? \`<div class="post-text">\${escHtml(post.text)}</div>\` : ''}
    \${post.image_url ? \`<img class="post-image" src="\${API}\${post.image_url}">\` : ''}
    <div class="post-actions">
      <button class="action-btn branch-btn \${isActive ? 'active' : ''}" id="branch-btn-\${post.id}" onclick="toggleBranch('\${post.id}')">
        ⬡ Branch \${replyCount > 0 ? \`<span class="branch-count">\${replyCount}</span>\` : ''}
      </button>
      <button class="action-btn hide-btn" onclick="hidePost('\${post.id}')">Hide</button>
    </div>
    <div class="branch-replies \${isActive ? 'open' : ''}" id="branch-\${post.id}">
      <div class="branch-replies-list" id="branch-list-\${post.id}">
        <div style="font-size:12px;opacity:.3;padding:6px 0;">Loading replies…</div>
      </div>
      <div class="branch-compose">
        <input class="branch-input" id="branch-input-\${post.id}" type="text" placeholder="Branch off…">
        <button class="branch-send" onclick="submitReply('\${post.id}')">↳ Send</button>
      </div>
    </div>
  \`;

  if (isActive) loadReplies(post.id);
  return card;
}

function viewProfile(username) {
  window.parent.postMessage({ type: 'openUserProfile', username }, '*');
}

function hidePost(postId) {
  const p = posts.find(x => x.id === postId);
  if (p) p._hidden = true;
  renderFeed();
}

async function toggleBranch(postId) {
  if (activeBranchPostId === postId) {
    activeBranchPostId = null;
    const el = document.getElementById('branch-' + postId);
    if (el) el.classList.remove('open');
    const btn = document.getElementById('branch-btn-' + postId);
    if (btn) btn.classList.remove('active');
  } else {
    // Close previously open
    if (activeBranchPostId) {
      const prev = document.getElementById('branch-' + activeBranchPostId);
      if (prev) prev.classList.remove('open');
      const prevBtn = document.getElementById('branch-btn-' + activeBranchPostId);
      if (prevBtn) prevBtn.classList.remove('active');
    }
    activeBranchPostId = postId;
    const el = document.getElementById('branch-' + postId);
    if (el) { el.classList.add('open'); loadReplies(postId); }
    const btn = document.getElementById('branch-btn-' + postId);
    if (btn) btn.classList.add('active');
  }
}

async function loadReplies(postId) {
  const list = document.getElementById('branch-list-' + postId);
  if (!list) return;
  try {
    const res   = await fetch(API + '/posts/' + postId + '/replies');
    const replies = await res.json();
    if (!replies.length) {
      list.innerHTML = '<div style="font-size:12px;opacity:.3;padding:6px 0;">No replies yet — start the branch.</div>';
      return;
    }
    list.innerHTML = replies.map(r => {
      const rName  = r.display_name || r.username;
      const rInit  = rName[0].toUpperCase();
      const rColor = r.color || '#a78bfa';
      const rTColor= r.text_color || '#fff';
      return \`<div class="bp-reply">
        <div class="bp-av" style="background:\${rColor};color:\${rTColor};" onclick="viewProfile('\${escHtml(r.username)}')">\${rInit}</div>
        <div class="bp-meta">
          <div>
            <span class="bp-name" onclick="viewProfile('\${escHtml(r.username)}')">\${escHtml(rName)}</span>
            <span class="bp-time" style="margin-left:6px;">\${escHtml(r.created_at || '')}</span>
          </div>
          <div class="bp-text">\${escHtml(r.text)}</div>
        </div>
      </div>\`;
    }).join('');
  } catch(e) {
    list.innerHTML = '<div style="font-size:12px;color:#ff4d4d;padding:6px 0;">Failed to load replies.</div>';
  }
}

async function submitReply(postId) {
  if (!CU_USERNAME) { showToast('Log in to reply', '#ff4d4d'); return; }
  const input = document.getElementById('branch-input-' + postId);
  const text  = input ? input.value.trim() : '';
  if (!text) return;
  input.value = '';
  try {
    await fetch(API + '/posts/' + postId + '/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: CU_USERNAME, text })
    });
    // Optimistic UI
    const list = document.getElementById('branch-list-' + postId);
    if (list) {
      const div = document.createElement('div');
      div.className = 'bp-reply';
      div.innerHTML = \`
        <div class="bp-av" style="background:\${CU_COLOR};color:\${CU_TEXT_COLOR};">\${CU_INITIAL}</div>
        <div class="bp-meta">
          <div><span class="bp-name">\${escHtml(CU_NAME)}</span><span class="bp-time" style="margin-left:6px;">just now</span></div>
          <div class="bp-text">\${escHtml(text)}</div>
        </div>\`;
      if (list.querySelector('[style*="opacity"]')) list.innerHTML = '';
      list.appendChild(div);
    }
    // Update reply count on the button
    const post = posts.find(p => p.id === postId);
    if (post) { post.reply_count = (post.reply_count || 0) + 1; }
    const btn = document.getElementById('branch-btn-' + postId);
    if (btn && post) {
      btn.innerHTML = \`⬡ Branch <span class="branch-count">\${post.reply_count}</span>\`;
    }
  } catch(e) { showToast('Failed to send reply', '#ff4d4d'); }
}

async function submitPost() {
  if (!CU_USERNAME) { showToast('Log in to post', '#ff4d4d'); return; }
  const input = document.getElementById('composer-input');
  const text  = input ? input.value.trim() : '';
  if (!text) return;
  input.value = '';

  const btn = document.querySelector('.post-btn');
  if (btn) btn.disabled = true;

  try {
    const res  = await fetch(API + '/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: CU_USERNAME, text })
    });
    const data = await res.json();

    // Optimistic insert at top
    posts.unshift({
      id:           data.id || Date.now(),
      username:     CU_USERNAME,
      display_name: CU_NAME,
      color:        CU_COLOR,
      text_color:   CU_TEXT_COLOR,
      avatar_url:   CU_AVATAR ? CU_AVATAR.replace(API, '') : '',
      text,
      reply_count:  0,
      created_at:   'just now',
    });
    renderFeed();
    showToast('Posted!', '#c8ff00');
  } catch(e) {
    showToast('Failed to post', '#ff4d4d');
  } finally {
    if (btn) btn.disabled = false;
  }
}

// Enter key on branch input
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.target.classList.contains('branch-input')) {
    const postId = e.target.id.replace('branch-input-', '');
    submitReply(postId);
  }
  if (e.key === 'Enter' && e.ctrlKey && e.target.id === 'composer-input') {
    submitPost();
  }
});

// Load on boot
loadFeed();
</script>
</body>
</html>`;
}

// ════════════════════════════════════════════════════════════════════
// EXPLORE  — trending topics
// ════════════════════════════════════════════════════════════════════

function generateExplore() {
  const EXPLORE_DATA = [
    { icon:'🎨', color:'#ff6b35', name:'Design Systems in 2025', server:'Design Lab', replies:'1.2k', desc:'The shift from component libraries to token-first architecture.' },
    { icon:'⚡', color:'#c8ff00', name:'WebGPU is here', server:'Dev Zone', replies:'3.4k', desc:'Finally shipping in all major browsers.' },
    { icon:'🎵', color:'#a78bfa', name:'Generative audio tools', server:'Lofi Lounge', replies:'890', desc:'AI tools for music that actually sound good.' },
    { icon:'🤖', color:'#60a5fa', name:'LLM agents in prod', server:'AI Space', replies:'2.1k', desc:'What it actually takes to run reliable autonomous agents.' },
    { icon:'🌱', color:'#34d399', name:'Indie dev diaries', server:'Build Log', replies:'654', desc:'Shipping solo products without burning out.' },
    { icon:'📐', color:'#f9a8d4', name:'Typography deep dive', server:'Type Room', replies:'441', desc:'Variable fonts, optical sizing, and legibility at scale.' },
  ];

  const cards = EXPLORE_DATA.map(p => `
    <div style="background:#131318;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px;display:flex;gap:14px;align-items:flex-start;transition:border-color .2s;cursor:pointer;" onmouseover="this.style.borderColor='rgba(255,255,255,0.14)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.07)'">
      <div style="width:44px;height:44px;border-radius:12px;background:${p.color}22;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">${p.icon}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:4px;">${p.name}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:6px;">${p.desc}</div>
        <div style="font-size:11px;color:${p.color};opacity:.7;">${p.server} · ${p.replies} replies</div>
      </div>
    </div>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{box-sizing:border-box;margin:0;padding:0;}body{background:#0b0b0f;color:#e4e4e7;font-family:system-ui,sans-serif;padding:24px 16px 80px;}</style>
</head><body>
<div style="max-width:640px;margin:0 auto;">
  <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,0.3);font-weight:700;margin-bottom:16px;">Trending Branches</div>
  <div style="display:flex;flex-direction:column;gap:10px;">${cards}</div>
</div>
</body></html>`;
}

// ════════════════════════════════════════════════════════════════════
// MEDIA  — file gallery
// ════════════════════════════════════════════════════════════════════

function generateMedia() {
  const MEDIA = [
    { emoji:'🖼', bg:'#1a1a2e', name:'brand_v4_final.png', size:'2.1 MB', color:'#a78bfa' },
    { emoji:'🎬', bg:'#0d1f0d', name:'prototype_demo.mp4', size:'48 MB', color:'#34d399' },
    { emoji:'🎨', bg:'#1f0d0d', name:'moodboard_oct.jpg',  size:'5.7 MB', color:'#ff6b35' },
    { emoji:'✦',  bg:'#1a1510', name:'icons_set_v2.svg',   size:'128 KB', color:'#f9a8d4' },
    { emoji:'📄', bg:'#0d0d1f', name:'brief_oct.pdf',       size:'340 KB', color:'#60a5fa' },
    { emoji:'🖼', bg:'#1a0d1f', name:'cover_art.png',       size:'3.4 MB', color:'#c8ff00' },
  ];

  const cards = MEDIA.map(f => `
    <div style="background:#131318;border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor='rgba(255,255,255,0.14)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.07)'">
      <div style="height:100px;background:${f.bg};display:flex;align-items:center;justify-content:center;font-size:36px;">${f.emoji}</div>
      <div style="padding:10px 12px;">
        <div style="font-size:12px;font-weight:600;color:#e4e4e7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.name}</div>
        <div style="font-size:11px;color:${f.color};opacity:.6;margin-top:2px;">${f.size}</div>
      </div>
    </div>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{box-sizing:border-box;margin:0;padding:0;}body{background:#0b0b0f;color:#e4e4e7;font-family:system-ui,sans-serif;padding:24px 16px 80px;}</style>
</head><body>
<div style="max-width:900px;margin:0 auto;">
  <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,0.3);font-weight:700;margin-bottom:16px;">Media Library</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;">${cards}</div>
</div>
</body></html>`;
}

// ── Auto-load home once auth is ready ────────────────────────────────
// Called from branch.js after login
window._loadHomeOnReady = function () {
  const homeItem = document.querySelector('.sidebar-item[data-id="home"]');
  if (homeItem) {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    homeItem.classList.add('active');
    loadDefaultServer('home');
  }
};

// Load immediately if already logged in
if (typeof CURRENT_USER !== 'undefined' && CURRENT_USER) {
  window._loadHomeOnReady();
}
