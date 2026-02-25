// ═══════════════════════════════════════════════════════
// BRANCH — DEFAULT SERVER TEMPLATES
// branch-servers.js
//
// Each key maps to a server name.
// Properties: html, css, js
// These are the "factory defaults" — loaded when a server
// has never been edited. localStorage overrides these.
// ═══════════════════════════════════════════════════════

const SERVER_TEMPLATES = {

  // ══════════════════════════════════
  // DASHBOARD — Live Chat Interface
  // ══════════════════════════════════
  'Dashboard': {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="server-logo">⬡</div>
      <div class="channels-label">Channels</div>
      <div class="channel active" onclick="setChannel(this,'general')"># general</div>
      <div class="channel" onclick="setChannel(this,'random')"># random</div>
      <div class="channel" onclick="setChannel(this,'announcements')"># announcements</div>
      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="user-dot"></div>
          <span>Alex_Indie</span>
        </div>
      </div>
    </aside>
    <div class="main">
      <div class="chat-header">
        <span class="header-hash">#</span>
        <span class="header-channel" id="header-channel">general</span>
        <span class="header-desc">Welcome to the server.</span>
      </div>
      <div class="messages" id="messages">
        <div class="msg">
          <div class="msg-avatar" style="background:#c8ff00;color:#000;">A</div>
          <div class="msg-body">
            <div class="msg-meta"><span class="msg-name">Alex_Indie</span><span class="msg-time">Today at 12:00</span></div>
            <div class="msg-text">Welcome everyone! This is the general channel.</div>
          </div>
        </div>
        <div class="msg">
          <div class="msg-avatar" style="background:#a78bfa;color:#fff;">J</div>
          <div class="msg-body">
            <div class="msg-meta"><span class="msg-name" style="color:#a78bfa;">jade_x</span><span class="msg-time">Today at 12:01</span></div>
            <div class="msg-text">Hey! Glad to be here 👋</div>
          </div>
        </div>
        <div class="msg">
          <div class="msg-avatar" style="background:#34d399;color:#000;">M</div>
          <div class="msg-body">
            <div class="msg-meta"><span class="msg-name" style="color:#34d399;">m4rk</span><span class="msg-time">Today at 12:03</span></div>
            <div class="msg-text">This server looks incredible. Who designed it?</div>
          </div>
        </div>
      </div>
      <div class="input-bar">
        <input class="msg-input" id="msg-input" type="text"
               placeholder="Message #general"
               onkeydown="handleKey(event)">
        <button class="send-btn" onclick="sendMessage()">Send</button>
      </div>
    </div>
    <aside class="members-panel">
      <div class="members-label">Online — 3</div>
      <div class="member"><div class="m-dot green"></div>Alex_Indie</div>
      <div class="member"><div class="m-dot green"></div>jade_x</div>
      <div class="member"><div class="m-dot green"></div>m4rk</div>
      <div class="members-label" style="margin-top:16px;">Offline — 2</div>
      <div class="member offline"><div class="m-dot grey"></div>nova_</div>
      <div class="member offline"><div class="m-dot grey"></div>ryu77</div>
    </aside>
  </div>
  <script src="app.js"></script>
</body>
</html>`,

    css: `* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0a0a0f;
  --surface: #111118;
  --border: rgba(255,255,255,0.06);
  --accent: #c8ff00;
  --text: #e0e0e8;
  --dim: #555568;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  height: 100vh;
  overflow: hidden;
}

.app { display: flex; height: 100vh; }

.sidebar {
  width: 220px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  flex-shrink: 0;
}

.server-logo { font-size: 28px; color: var(--accent); margin-bottom: 24px; padding-left: 8px; }

.channels-label {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--dim); padding: 0 8px; margin-bottom: 8px;
}

.channel {
  padding: 7px 10px; border-radius: 6px; font-size: 14px;
  color: var(--dim); cursor: pointer; transition: all 0.15s; margin-bottom: 2px;
}
.channel:hover { background: rgba(255,255,255,0.04); color: var(--text); }
.channel.active { background: rgba(200,255,0,0.08); color: var(--accent); }

.sidebar-footer { margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border); }
.user-chip { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text); padding: 6px 8px; }
.user-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; }

.main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.chat-header {
  height: 52px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; padding: 0 20px; gap: 8px; flex-shrink: 0;
}
.header-hash { font-size: 20px; color: var(--dim); }
.header-channel { font-size: 15px; font-weight: 700; }
.header-desc { font-size: 13px; color: var(--dim); margin-left: 8px; border-left: 1px solid var(--border); padding-left: 12px; }

.messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.msg { display: flex; gap: 14px; align-items: flex-start; }
.msg-avatar { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; flex-shrink: 0; }
.msg-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
.msg-name { font-size: 14px; font-weight: 700; color: var(--accent); }
.msg-time { font-size: 11px; color: var(--dim); }
.msg-text { font-size: 14px; line-height: 1.5; color: var(--text); }

.input-bar { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; gap: 10px; }
.msg-input {
  flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--border);
  border-radius: 10px; color: var(--text); font-size: 14px; padding: 10px 14px;
  outline: none; font-family: inherit; transition: border-color 0.2s;
}
.msg-input:focus { border-color: rgba(200,255,0,0.4); }
.msg-input::placeholder { color: var(--dim); }

.send-btn {
  background: var(--accent); color: #000; border: none; border-radius: 10px;
  padding: 10px 20px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: inherit;
}
.send-btn:hover { filter: brightness(1.1); }

.members-panel { width: 200px; background: var(--surface); border-left: 1px solid var(--border); padding: 20px 16px; flex-shrink: 0; }
.members-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--dim); margin-bottom: 10px; }
.member { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text); padding: 5px 0; }
.member.offline { opacity: 0.4; }
.m-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.m-dot.green { background: #4ade80; }
.m-dot.grey  { background: #555; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }`,

    js: `let currentChannel = 'general';

function setChannel(el, name) {
  document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentChannel = name;
  document.getElementById('header-channel').textContent = name;
  document.querySelector('.msg-input').placeholder = 'Message #' + name;
  document.querySelectorAll('.msg').forEach(m => m.remove());
}

function handleKey(e) { if (e.key === 'Enter') sendMessage(); }

function sendMessage() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text) return;
  const msgs = document.getElementById('messages');
  const now = new Date();
  const time = 'Today at ' + now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0');
  const msg = document.createElement('div');
  msg.className = 'msg';
  msg.innerHTML = \`
    <div class="msg-avatar" style="background:#c8ff00;color:#000;">A</div>
    <div class="msg-body">
      <div class="msg-meta">
        <span class="msg-name">Alex_Indie</span>
        <span class="msg-time">\${time}</span>
      </div>
      <div class="msg-text">\${text}</div>
    </div>
  \`;
  msgs.appendChild(msg);
  msgs.scrollTop = msgs.scrollHeight;
  input.value = '';
}`
  },

  // ══════════════════════════════════
  // DISCOVERY — Community Explore
  // ══════════════════════════════════
  'Discovery': {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discovery</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="header">
    <div class="header-logo">◈ Discovery</div>
    <div class="header-search">
      <input type="text" placeholder="Search servers, topics, people...">
    </div>
    <div class="header-actions">
      <button class="tag-btn active">All</button>
      <button class="tag-btn">Art</button>
      <button class="tag-btn">Tech</button>
      <button class="tag-btn">Music</button>
      <button class="tag-btn">Gaming</button>
    </div>
  </header>
  <main class="main">
    <section class="section">
      <div class="section-title">Trending Now</div>
      <div class="card-grid" id="card-grid"></div>
    </section>
    <section class="section">
      <div class="section-title">Recently Active</div>
      <div class="list-view" id="list-view"></div>
    </section>
  </main>
  <script src="app.js"></script>
</body>
</html>`,

    css: `* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #08080d;
  --surface: #10101a;
  --border: rgba(255,255,255,0.06);
  --accent: #d2d2d2;
  --text: #e0e0e8;
  --dim: #44445a;
}

body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

.header {
  height: 64px; background: var(--surface); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; padding: 0 28px; gap: 20px; position: sticky; top: 0; z-index: 10;
}
.header-logo { font-size: 16px; font-weight: 800; color: var(--accent); flex-shrink: 0; }
.header-search input {
  background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 10px;
  color: var(--text); font-size: 13px; padding: 8px 14px; width: 240px; outline: none; font-family: inherit;
}
.header-search input::placeholder { color: var(--dim); }
.header-actions { display: flex; gap: 6px; margin-left: auto; }

.tag-btn {
  padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: transparent;
  color: var(--dim); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.tag-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
.tag-btn.active { background: var(--accent); color: #000; border-color: transparent; }

.main { padding: 32px 28px; max-width: 1100px; }
.section { margin-bottom: 48px; }
.section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--dim); margin-bottom: 18px; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
.card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-2px); }
.card-banner { height: 80px; display: flex; align-items: center; justify-content: center; font-size: 36px; }
.card-body { padding: 14px; }
.card-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
.card-desc { font-size: 12px; color: var(--dim); line-height: 1.5; margin-bottom: 10px; }
.card-meta { font-size: 11px; color: var(--dim); display: flex; gap: 12px; }

.list-item { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--border); cursor: pointer; transition: padding 0.15s; }
.list-item:hover { padding-left: 6px; }
.list-item:last-child { border-bottom: none; }
.list-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.list-name { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
.list-meta { font-size: 12px; color: var(--dim); }
.list-badge { margin-left: auto; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(255,255,255,0.06); color: var(--dim); flex-shrink: 0; }`,

    js: `const servers = [
  { icon:'🎨', name:'Design Lab', desc:'UI, branding, motion.', members:1240, color:'#ff6b35' },
  { icon:'⚡', name:'Dev Zone', desc:'Code, builds, APIs.', members:3800, color:'#c8ff00' },
  { icon:'🎵', name:'Lofi Lounge', desc:'Beats and chill.', members:920, color:'#a78bfa' },
  { icon:'🌍', name:'World Builders', desc:'Maps, lore, stories.', members:540, color:'#34d399' },
  { icon:'📷', name:'Frame by Frame', desc:'Photography & video.', members:1100, color:'#60a5fa' },
  { icon:'🤖', name:'AI Space', desc:'LLMs, agents, tools.', members:2200, color:'#f9a8d4' },
];

const recent = [
  { icon:'🔥', name:'Neon District', desc:'Cyberpunk community.', members:444, active:'2m ago', color:'#ff00ff' },
  { icon:'🌿', name:'Green Method', desc:'Sustainability talk.', members:210, active:'8m ago', color:'#34d399' },
  { icon:'🎭', name:'Stage & Screen', desc:'Film and theater.', members:780, active:'15m ago', color:'#fbbf24' },
];

const grid = document.getElementById('card-grid');
servers.forEach(s => {
  grid.innerHTML += \`
    <div class="card">
      <div class="card-banner" style="background:\${s.color}18;">\${s.icon}</div>
      <div class="card-body">
        <div class="card-name">\${s.name}</div>
        <div class="card-desc">\${s.desc}</div>
        <div class="card-meta">
          <span>👥 \${s.members.toLocaleString()}</span>
          <span>🟢 Online</span>
        </div>
      </div>
    </div>
  \`;
});

const list = document.getElementById('list-view');
recent.forEach(s => {
  list.innerHTML += \`
    <div class="list-item">
      <div class="list-icon" style="background:\${s.color}18;">\${s.icon}</div>
      <div>
        <div class="list-name">\${s.name}</div>
        <div class="list-meta">\${s.desc} · \${s.members} members</div>
      </div>
      <div class="list-badge">Active \${s.active}</div>
    </div>
  \`;
});

document.querySelectorAll('.tag-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});`
  },

  // ══════════════════════════════════
  // MEDIA LIBRARY — Portfolio Grid
  // ══════════════════════════════════
  'Media Library': {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Media Library</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="header">
    <div class="header-title">⬡ Media Library</div>
    <div class="filter-row">
      <button class="filter-btn active" onclick="filter(this,'all')">All</button>
      <button class="filter-btn" onclick="filter(this,'image')">Images</button>
      <button class="filter-btn" onclick="filter(this,'video')">Videos</button>
      <button class="filter-btn" onclick="filter(this,'doc')">Docs</button>
    </div>
    <div class="header-meta" id="header-meta">6 files</div>
  </header>
  <main class="grid" id="media-grid"></main>
  <script src="app.js"></script>
</body>
</html>`,

    css: `* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #080808;
  --surface: #0f0f0f;
  --border: rgba(255,255,255,0.06);
  --accent: #d2d2d2;
  --text: #e8e8e8;
  --dim: #404040;
}

body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

.header {
  height: 60px; background: var(--surface); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; padding: 0 24px; gap: 20px; position: sticky; top: 0; z-index: 10;
}
.header-title { font-size: 15px; font-weight: 800; color: var(--text); flex-shrink: 0; }
.filter-row { display: flex; gap: 4px; }
.filter-btn {
  padding: 5px 14px; border-radius: 20px; border: 1px solid var(--border); background: transparent;
  color: var(--dim); font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.filter-btn:hover { color: var(--text); }
.filter-btn.active { background: var(--text); color: #000; border-color: transparent; }
.header-meta { margin-left: auto; font-size: 12px; color: var(--dim); }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 2px; padding: 2px; }

.media-item { position: relative; aspect-ratio: 1; background: var(--surface); overflow: hidden; cursor: pointer; }
.media-item:hover .media-overlay { opacity: 1; }
.media-thumb { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; }
.media-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end;
  padding: 14px; opacity: 0; transition: opacity 0.2s;
}
.media-name { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.media-size { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }`,

    js: `const files = [
  { name:'brand_v4_final.png', type:'image', size:'2.1 MB', bg:'#1a1a2e', emoji:'🖼' },
  { name:'prototype_demo.mp4', type:'video', size:'48 MB',  bg:'#0d1f0d', emoji:'🎬' },
  { name:'moodboard_oct.jpg',  type:'image', size:'5.7 MB', bg:'#1f0d0d', emoji:'🎨' },
  { name:'icons_set_v2.svg',   type:'image', size:'128 KB', bg:'#1a1510', emoji:'✦' },
  { name:'brief_oct.pdf',      type:'doc',   size:'340 KB', bg:'#0d0d1f', emoji:'📄' },
  { name:'cover_art.png',      type:'image', size:'3.4 MB', bg:'#1a0d1f', emoji:'🖼' },
];

function render(data) {
  const grid = document.getElementById('media-grid');
  grid.innerHTML = data.map(f => \`
    <div class="media-item" data-type="\${f.type}">
      <div class="media-thumb" style="background:\${f.bg};">\${f.emoji}</div>
      <div class="media-overlay">
        <div class="media-name">\${f.name}</div>
        <div class="media-size">\${f.size}</div>
      </div>
    </div>
  \`).join('');
  document.getElementById('header-meta').textContent = data.length + ' files';
}

function filter(btn, type) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = type === 'all' ? files : files.filter(f => f.type === type);
  render(filtered);
}

render(files);`
  }

}; // end SERVER_TEMPLATES
