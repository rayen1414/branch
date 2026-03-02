// ═══════════════════════════════════════════════════════
// BRANCH EDITOR — branch-editor.js
// Handles:
//   1. Right-click context menu (admin vs member vs default)
//   2. Editor overlay (admin = full HTML/CSS/JS editor)
//   3. Member/default = Visual Customizer + CSS skin override
//   4. Create Server modal (UI only)
//
// Depends on: branch-servers.js (SERVER_TEMPLATES)
// ═══════════════════════════════════════════════════════

// ── BLANK DEFAULTS (for brand new custom servers) ──
const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Server</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!--
    This is YOUR server. It is a real website.
    Delete everything and build what you want.

    OPTIONAL — Branch SDK (auto-injected, no import needed)
      Branch.chat.render('#div-id')   drop live chat anywhere
      Branch.auth.getUser()           who is visiting
      Branch.members.online()         online member count
      Branch.notify('Hello!')         push notification
  -->

  <div class="hero">
    <h1>My Server</h1>
    <p>Start building. This is your canvas.</p>
  </div>

  <script src="app.js"><\/script>
</body>
</html>`;

const DEFAULT_CSS = `/* ════════════════════════
   YOUR SERVER — styles.css
   No limits. Full control.
   ════════════════════════ */

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, sans-serif;
  background: #0a0a0f;
  color: #ffffff;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero { text-align: center; }
.hero h1 { font-size: 48px; font-weight: 800; margin-bottom: 12px; }
.hero p { font-size: 16px; opacity: 0.4; }`;

const DEFAULT_JS = `// ════════════════════════
// YOUR SERVER — app.js
// ════════════════════════

console.log('Server ready.');`;

// ── STATE ──
let editorInstance    = null;
let edCurrentFile     = 'html';
let edIsAdmin         = false;
let _customizerMode   = false;
let edCurrentServer   = null;
let edRefreshTimer    = null;
let edIsResizing      = false;
let contextTargetItem = null;
let newServerItem     = null;

function key(serverName, file) {
  return `branch::${serverName}::${file}`;
}

const edFiles = { html: '', css: '', js: '', skin: '' };
let activeServerName = 'Dashboard';

// ══════════════════════════════════════════════
// RENDER SERVER IN MAIN IFRAME
// ══════════════════════════════════════════════
function renderServer(serverName) {
  const iframe = document.getElementById('server-iframe');
  if (!iframe) return;

  activeServerName = serverName;

  const tpl  = SERVER_TEMPLATES[serverName];

  // ── Version-based cache busting ──
  // If TEMPLATE_VERSIONS says the template is newer than what's cached,
  // wipe the cached html/css/js so the fresh template is loaded instead.
  if (tpl && typeof TEMPLATE_VERSIONS !== 'undefined' && TEMPLATE_VERSIONS[serverName]) {
    const vKey = 'branch::version::' + serverName;
    const cachedVer = parseInt(localStorage.getItem(vKey) || '0', 10);
    const currentVer = TEMPLATE_VERSIONS[serverName];
    if (currentVer > cachedVer) {
      localStorage.removeItem(key(serverName, 'html'));
      localStorage.removeItem(key(serverName, 'css'));
      localStorage.removeItem(key(serverName, 'js'));
      localStorage.setItem(vKey, String(currentVer));
      console.log('[Branch] Cache busted for', serverName, 'v' + currentVer);
    }
  }

  const html = localStorage.getItem(key(serverName, 'html')) || (tpl ? tpl.html : DEFAULT_HTML);
  const css  = localStorage.getItem(key(serverName, 'css'))  || (tpl ? tpl.css  : DEFAULT_CSS);
  const jsrc = localStorage.getItem(key(serverName, 'js'))   || (tpl ? tpl.js   : DEFAULT_JS);
  const skin = localStorage.getItem(key(serverName, 'skin')) || '';

  let compiled = html
    .replace(/<link[^>]+href=["']styles\.css["'][^>]*>/gi, '<style>' + css + '</style>')
    .replace(/<script[^>]+src=["']app\.js["'][^>]*><\/script>/gi, '<script>' + jsrc + '<\/script>');

  if (skin) {
    compiled = compiled.replace('</head>', '<style>/* SKIN */\n' + skin + '\n</style></head>');
  }

  // ── Inject identity so iframe JS knows who's logged in ──
  // The Dashboard JS reads window.__branchMe and window.__branchAPI on init
  const _me      = JSON.parse(localStorage.getItem('branch::me') || 'null') || {};
  const _apiBase = window.location.origin;
  const _inject  = `<script>
window.__branchMe  = ${JSON.stringify(_me)};
window.__branchAPI = "${_apiBase}";
<\/script>`;
  compiled = compiled.replace('<head>', '<head>' + _inject);

  const blob    = new Blob([compiled], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);
  iframe.src    = blobUrl;

  // ── Sync to profile embed iframe if the profile panel is open ──
  const _profileIframe = document.getElementById('fpp-server-iframe');
  const _profileView   = document.getElementById('fp-view-profile');
  if (_profileIframe && _profileView && _profileView.style.display !== 'none') {
    _profileIframe.src = blobUrl;
    const _lbl = document.getElementById('fpp-embed-server-name');
    if (_lbl) _lbl.textContent = serverName;
  }
}

// ═══════════════════════════════════════
// RIGHT-CLICK CONTEXT MENU
// ═══════════════════════════════════════
function openContextMenu(e, serverItem) {
  e.preventDefault();
  e.stopPropagation();

  contextTargetItem = serverItem;
  const isAdmin   = serverItem.getAttribute('data-owner')   === 'true';
  const isDefault = serverItem.getAttribute('data-default') === 'true';

  const menu = document.getElementById('server-context-menu');
  menu.querySelector('.ctx-default-only').style.display  = isDefault             ? 'block' : 'none';
  menu.querySelector('.ctx-admin-only').style.display    = (!isDefault && isAdmin)   ? 'block' : 'none';
  menu.querySelector('.ctx-member-only').style.display   = (!isDefault && !isAdmin)  ? 'block' : 'none';

  menu.classList.add('visible');

  const W = 220, H = 220;
  let x = e.clientX, y = e.clientY;
  if (x + W > window.innerWidth)  x = window.innerWidth  - W - 8;
  if (y + H > window.innerHeight) y = window.innerHeight - H - 8;
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
}

function openCustomizer() {
  closeContextMenu();
  edIsAdmin = false;
  _customizerMode = true;
  openEditor();
}

function closeContextMenu() {
  document.getElementById('server-context-menu').classList.remove('visible');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#server-context-menu')) closeContextMenu();
});

// ═══════════════════════════════════════
// EDITOR — OPEN / CLOSE
// ═══════════════════════════════════════
function openEditor() {
  closeContextMenu();

  const serverName = contextTargetItem
    ? contextTargetItem.getAttribute('data-server-name')
    : 'Server';

  if (!_customizerMode) {
    edIsAdmin = contextTargetItem
      ? (contextTargetItem.getAttribute('data-owner') === 'true' &&
         contextTargetItem.getAttribute('data-default') !== 'true')
      : false;
  }
  _customizerMode = false;

  edCurrentServer = serverName;

  const _tpl = SERVER_TEMPLATES[serverName];
  edFiles.html = localStorage.getItem(key(serverName,'html')) || (_tpl ? _tpl.html : DEFAULT_HTML);
  edFiles.css  = localStorage.getItem(key(serverName,'css'))  || (_tpl ? _tpl.css  : DEFAULT_CSS);
  edFiles.js   = localStorage.getItem(key(serverName,'js'))   || (_tpl ? _tpl.js   : DEFAULT_JS);

  const _savedSkin = localStorage.getItem(key(serverName, 'skin'));
  edFiles.skin = _savedSkin || '';

  document.getElementById('ed-server-name').textContent = serverName;
  document.getElementById('ed-url-slug').textContent =
    serverName.toLowerCase().replace(/\s+/g,'-');

  // Role badges
  document.getElementById('ed-badge-admin').classList.toggle('visible', edIsAdmin);
  document.getElementById('ed-badge-member').classList.toggle('visible', !edIsAdmin);

  // File tabs visibility
  document.querySelectorAll('.ed-admin-tab').forEach(t => t.style.display = edIsAdmin ? 'flex' : 'none');
  document.querySelectorAll('.ed-member-tab').forEach(t => t.style.display = edIsAdmin ? 'none' : 'flex');

  // Buttons
  document.getElementById('ed-publish-btn').style.display = edIsAdmin  ? '' : 'none';
  document.getElementById('ed-save-btn').style.display    = !edIsAdmin ? '' : 'none';
  document.getElementById('ed-local-notice').style.display= !edIsAdmin ? 'block' : 'none';

  // Tab group in topbar
  document.getElementById('ed-mode-tabs').style.display  = edIsAdmin ? '' : 'none';
  document.getElementById('ed-skin-tabs').style.display  = !edIsAdmin ? '' : 'none';

  edCurrentFile = edIsAdmin ? 'html' : 'skin';

  document.querySelectorAll('.ed-file-tab').forEach(t => t.classList.remove('active'));
  const startTab = document.querySelector(`.ed-file-tab[data-file="${edCurrentFile}"]`);
  if (startTab) startTab.classList.add('active');

  if (!edIsAdmin) {
    // Customize mode: go directly to CSS editor (Visual + Interface panels removed)
    edSkinSetPanel('code', document.getElementById('ed-skin-code-btn'));
  } else {
    document.getElementById('ed-visual-panel').style.display = 'none';
    document.getElementById('ed-editor-panel').style.display = 'flex';
    document.getElementById('ed-editor-panel').style.width = '480px';
    document.getElementById('ed-editor-panel').style.flex = '';
    document.getElementById('ed-preview-panel').style.display = 'flex';
    document.getElementById('ed-resizer').style.display = 'block';
  }

  document.getElementById('editor-overlay').classList.remove('hidden');

  if (!editorInstance) {
    initMonaco();
  } else {
    edLoadFile(edCurrentFile);
    edRefresh();
  }
}

function closeEditor() {
  if (editorInstance) {
    edFiles[edCurrentFile] = editorInstance.getValue();
    edAutoSave();
  }
  document.getElementById('editor-overlay').classList.add('hidden');
  renderServer(edCurrentServer || activeServerName);
}

// ── MONACO INIT ──
function initMonaco() {
  require.config({
    paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
  });

  require(['vs/editor/editor.main'], () => {
    monaco.editor.defineTheme('branch-theme', {
      base: 'vs-dark', inherit: true,
      rules: [
        { token: 'comment',        foreground: '3a3a55', fontStyle: 'italic' },
        { token: 'keyword',        foreground: 'c8ff00' },
        { token: 'string',         foreground: 'ff9960' },
        { token: 'number',         foreground: '00ffcc' },
        { token: 'tag',            foreground: 'ff66aa' },
        { token: 'attribute.name', foreground: '66ccff' },
      ],
      colors: {
        'editor.background':                 '#080809',
        'editor.foreground':                 '#d0d0e0',
        'editorLineNumber.foreground':       '#2a2a40',
        'editorLineNumber.activeForeground': '#c8ff00',
        'editor.selectionBackground':        '#c8ff0020',
        'editor.lineHighlightBackground':    '#0f0f18',
        'editorCursor.foreground':           '#c8ff00',
      }
    });

    const lang = edCurrentFile === 'js' ? 'javascript'
               : edCurrentFile === 'skin' ? 'css'
               : edCurrentFile;

    editorInstance = monaco.editor.create(document.getElementById('ed-monaco'), {
      value: edFiles[edCurrentFile],
      language: lang,
      theme: 'branch-theme',
      fontFamily: '"JetBrains Mono","Fira Code","Courier New",monospace',
      fontSize: 13,
      lineHeight: 22,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'phase',
      padding: { top: 16, bottom: 16 },
      wordWrap: 'on',
      automaticLayout: true,
      bracketPairColorization: { enabled: true },
    });

    editorInstance.onDidChangeCursorPosition(e => {
      document.getElementById('ed-status-pos').textContent =
        `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
    });

    editorInstance.onDidChangeModelContent(() => {
      edFiles[edCurrentFile] = editorInstance.getValue();
      edMarkModified(edCurrentFile);
      edUpdateCharCount();
      clearTimeout(edRefreshTimer);
      edRefreshTimer = setTimeout(edRefresh, 700);
    });

    edUpdateCharCount();
    edRefresh();
  });
}

// ── FILE SWITCHING ──
function edSwitchFile(fileKey, tabEl) {
  if (editorInstance) edFiles[edCurrentFile] = editorInstance.getValue();
  edCurrentFile = fileKey;

  document.querySelectorAll('.ed-file-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');

  document.getElementById('ed-status-lang').textContent =
    fileKey === 'skin' ? 'CSS' : fileKey.toUpperCase();

  edLoadFile(fileKey);
  edUpdateCharCount();
}

function edLoadFile(fileKey) {
  if (!editorInstance) return;
  const langMap = { html:'html', css:'css', js:'javascript', skin:'css' };
  const model = monaco.editor.createModel(edFiles[fileKey], langMap[fileKey]);
  editorInstance.setModel(model);
  editorInstance.onDidChangeModelContent(() => {
    edFiles[edCurrentFile] = editorInstance.getValue();
    edMarkModified(edCurrentFile);
    edUpdateCharCount();
    clearTimeout(edRefreshTimer);
    edRefreshTimer = setTimeout(edRefresh, 700);
  });
}

function edMarkModified(fileKey) {
  const tab = document.querySelector(`.ed-file-tab[data-file="${fileKey}"]`);
  if (tab) tab.classList.add('modified');
}

function edUpdateCharCount() {
  const v = editorInstance ? editorInstance.getValue() : '';
  document.getElementById('ed-status-chars').textContent =
    v.length.toLocaleString() + ' chars';
}

// ── LIVE PREVIEW ──
function edRefresh() {
  const iframe = document.getElementById('ed-iframe');

  let compiled;

  if (edIsAdmin) {
    // Admin: uses edFiles.html/css/js directly
    compiled = edFiles.html
      .replace(/<link[^>]+href=["']styles\.css["'][^>]*>/gi,
               `<style>${sanitize(edFiles.css)}</style>`)
      .replace(/<script[^>]+src=["']app\.js["'][^>]*><\/script>/gi,
               `<script>${edFiles.js}<\/script>`);
  } else {
    // Customize mode: uses edFiles.html/css/js — cvpPreview patches edFiles.css
    // directly so the preview always shows the real server CSS with changes applied.
    compiled = edFiles.html
      .replace(/<link[^>]+href=["']styles\.css["'][^>]*>/gi,
               `<style>${sanitize(edFiles.css)}</style>`)
      .replace(/<script[^>]+src=["']app\.js["'][^>]*><\/script>/gi,
               `<script>${edFiles.js}<\/script>`);
  }

  compiled = compiled.replace('</head>',
    `<script>
window.Branch={
  chat:   {render:(s)=>console.log('[SDK] chat.render:',s)},
  auth:   {getUser:()=>Promise.resolve({username:'PreviewUser',id:'000'})},
  members:{online:()=>Promise.resolve(42)},
  notify: (m)=>console.log('[SDK] notify:',m)
};
<\/script></head>`);

  const blob = new Blob([compiled], {type:'text/html'});
  iframe.src = URL.createObjectURL(blob);
}

function sanitize(css) {
  return css
    .replace(/expression\s*\(/gi,  '/* blocked */(')
    .replace(/javascript:/gi,       '/* blocked */')
    .replace(/behavior\s*:/gi,      '/* blocked */:')
    .replace(/@import\s/gi,         '/* @import blocked */ ');
}

// ── VIEW MODES ──
function edSetMode(e, mode) {
  const ep = document.getElementById('ed-editor-panel');
  const pp = document.getElementById('ed-preview-panel');
  const rs = document.getElementById('ed-resizer');

  document.querySelectorAll('#ed-mode-tabs .ed-tab').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');

  if (mode === 'code') {
    ep.style.display='flex'; ep.style.width='100%'; ep.style.flex='1';
    pp.style.display='none'; rs.style.display='none';
  } else if (mode === 'preview') {
    ep.style.display='none';
    pp.style.display='flex'; rs.style.display='none';
  } else {
    ep.style.display='flex'; ep.style.width='480px'; ep.style.flex='';
    pp.style.display='flex'; rs.style.display='block';
  }
  if (editorInstance) editorInstance.layout();
}

// ── DEVICE ──
function edSetDevice(e, device) {
  document.querySelectorAll('.ed-device-btn').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  document.getElementById('ed-frame-wrap').className =
    'ed-frame-wrap' + (device==='mobile' ? ' mobile' : '');
}

// ── RESIZER ──
document.getElementById('ed-resizer').addEventListener('mousedown', () => {
  edIsResizing = true;
  document.getElementById('ed-resizer').classList.add('active');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
});
document.addEventListener('mousemove', e => {
  if (!edIsResizing) return;
  const ws   = document.querySelector('.ed-workspace');
  const rect = ws.getBoundingClientRect();
  const newW = Math.max(260, Math.min(e.clientX - rect.left, ws.offsetWidth - 260));
  document.getElementById('ed-editor-panel').style.width = newW + 'px';
  if (editorInstance) editorInstance.layout();
});
document.addEventListener('mouseup', () => {
  if (!edIsResizing) return;
  edIsResizing = false;
  document.getElementById('ed-resizer').classList.remove('active');
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});

// ── SAVE / PUBLISH ──
function edAutoSave() {
  if (!edCurrentServer) return;
  localStorage.setItem(key(edCurrentServer,'html'), edFiles.html);
  localStorage.setItem(key(edCurrentServer,'css'),  edFiles.css);
  localStorage.setItem(key(edCurrentServer,'js'),   edFiles.js);
  localStorage.setItem(key(edCurrentServer,'skin'), edFiles.skin);
}

function edPublish() {
  if (editorInstance) edFiles[edCurrentFile] = editorInstance.getValue();
  edAutoSave();
  document.querySelectorAll('.ed-file-tab').forEach(t => t.classList.remove('modified'));

  const toastId = edIsAdmin ? 'ed-toast' : 'ed-toast-save';
  const toast = document.getElementById(toastId);
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  renderServer(edCurrentServer || activeServerName);
}

// ── KEYBOARD ──
document.addEventListener('keydown', e => {
  if (document.getElementById('editor-overlay').classList.contains('hidden')) return;
  if ((e.ctrlKey||e.metaKey) && e.key==='s') { e.preventDefault(); edPublish(); }
  if ((e.ctrlKey||e.metaKey) && e.key==='Enter') { e.preventDefault(); edRefresh(); }
  if (e.key==='Escape') closeEditor();
});

// ── SIDEBAR CLICKS ──
document.addEventListener('DOMContentLoaded', () => {
  bindSidebarClicks();
  renderServer('Dashboard');
});

function bindSidebarClicks() {
  document.querySelectorAll('.sidebar-item[data-server-name]').forEach(item => {
    let dragged = false;
    item.addEventListener('dragstart', () => { dragged = true; });
    item.addEventListener('dragend',   () => { setTimeout(() => { dragged = false; }, 100); });
    item.addEventListener('click', () => {
      if (dragged) return;
      const serverName = item.getAttribute('data-server-name');
      if (!serverName) return;
      document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      renderServer(serverName);
    });
  });
}

// ═══════════════════════════════════════
// SKIN PANEL SWITCHER (member mode)
// ═══════════════════════════════════════
function edSkinSetPanel(panel, btn) {
  document.querySelectorAll('#ed-skin-tabs .ed-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const visualPanel  = document.getElementById('ed-visual-panel');
  const shellPanel   = document.getElementById('ed-shell-panel');
  const editorPanel  = document.getElementById('ed-editor-panel');
  const previewPanel = document.getElementById('ed-preview-panel');
  const resizer      = document.getElementById('ed-resizer');
  const refreshBtn   = document.getElementById('ed-refresh-btn');

  // Hide all left-side panels first
  visualPanel.style.display  = 'none';
  if (shellPanel) shellPanel.style.display = 'none';
  editorPanel.style.display  = 'none';

  if (panel === 'visual') {
    visualPanel.style.display  = 'flex';
    visualPanel.style.flexDirection = 'column';
    previewPanel.style.display = 'flex';
    previewPanel.style.flex    = '1';
    resizer.style.display      = 'none';
    if (refreshBtn) refreshBtn.style.display = 'none';
    edRefresh();
  } else if (panel === 'shell') {
    if (shellPanel) {
      shellPanel.style.display = 'flex';
      shellPanel.style.flexDirection = 'column';
    }
    previewPanel.style.display = 'flex';
    previewPanel.style.flex    = '1';
    resizer.style.display      = 'none';
    if (refreshBtn) refreshBtn.style.display = 'none';
    shpSyncUI();
  } else {
    // CSS editor mode
    editorPanel.style.display  = 'flex';
    editorPanel.style.width    = '480px';
    editorPanel.style.flex     = '';
    previewPanel.style.display = 'flex';
    resizer.style.display      = 'block';
    if (refreshBtn) refreshBtn.style.display = '';

    if (editorInstance) {
      edCurrentFile = 'skin';
      edLoadFile('skin');
      edUpdateCharCount();
    }
    edRefresh();
  }

  if (editorInstance) editorInstance.layout();
}

// ═══════════════════════════════════════════════════════
// VISUAL CUSTOMIZER (cvp = Customizer Visual Panel)
//
// HOW IT WORKS:
//   Reads server's actual CSS (edFiles.css), extracts current
//   values, lets you change them visually, then patches those
//   values DIRECTLY back into edFiles.css. The iframe preview
//   shows the real server CSS with your changes applied.
//   Save/Publish writes the patched CSS as the server's CSS.
//   No separate skin layer — you are editing the real CSS.
// ═══════════════════════════════════════════════════════

let cvpState = {
  accentColor: '#c8ff00',
  bgColor:     '#0a0a0f',
  surfaceColor:'#111118',
  textColor:   '#e0e0e8',
  fontSize:    14,
  borderRadius:12,
  fontFamily:  'system-ui, sans-serif',
  cardStyle:   'default',
  bgMode:      'solid',
  spacing:     'normal',
};

// Clean baseline CSS — always patch from this to avoid stacking changes
let cvpOriginalCSS = '';

// Read the server's actual CSS and populate the controls
function cvpLoadServerCSS(css) {
  if (!css) return;
  cvpOriginalCSS = css;

  // Extract :root block variables
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  if (rootMatch) {
    const rootBlock = rootMatch[1];
    function extractVar(name) {
      const m = rootBlock.match(new RegExp('--' + name + '\\s*:\\s*([^;\\n]+)'));
      return m ? m[1].trim() : null;
    }
    const accent  = extractVar('accent');
    const bg      = extractVar('bg');
    const surface = extractVar('surface');
    const text    = extractVar('text');
    if (accent)  cvpState.accentColor  = accent;
    if (bg)      cvpState.bgColor      = bg;
    if (surface) cvpState.surfaceColor = surface;
    if (text)    cvpState.textColor    = text;
  }

  // Font-size from body block
  const fsMatch = css.match(/body\s*\{[^}]*font-size\s*:\s*(\d+)px/);
  if (fsMatch) cvpState.fontSize = parseInt(fsMatch[1]);

  // First border-radius value
  const brMatch = css.match(/border-radius\s*:\s*(\d+)px/);
  if (brMatch) cvpState.borderRadius = parseInt(brMatch[1]);

  // Font-family from body block
  const ffMatch = css.match(/body\s*\{[^}]*font-family\s*:\s*([^;]+)/);
  if (ffMatch) {
    const ff = ffMatch[1].trim();
    if (ff.includes('serif') && !ff.includes('sans')) cvpState.fontFamily = 'Georgia, serif';
    else if (ff.match(/mono|Mono|Courier/)) cvpState.fontFamily = "'Courier New', monospace";
    else cvpState.fontFamily = 'system-ui, sans-serif';
  }

  cvpSyncUI();
}

// Sync panel controls to current state
function cvpSyncUI() {
  const s = cvpState;
  setIfExists('cvp-accent-color', s.accentColor);
  setIfExists('cvp-accent-hex',   s.accentColor);
  setIfExists('cvp-bg-color',     s.bgColor);
  setIfExists('cvp-bg-hex',       s.bgColor);
  setIfExists('cvp-surface-color',s.surfaceColor);
  setIfExists('cvp-surface-hex',  s.surfaceColor);
  setIfExists('cvp-text-color',   s.textColor);
  setIfExists('cvp-text-hex',     s.textColor);
  setIfExists('cvp-fontsize',     s.fontSize);
  setIfExists('cvp-fontsize-val', s.fontSize + 'px');
  setIfExists('cvp-radius',       s.borderRadius);
  setIfExists('cvp-radius-val',   s.borderRadius + 'px');
  document.querySelectorAll('.cvp-font-opt').forEach(el => el.classList.toggle('sel', el.dataset.font === s.fontFamily));
  document.querySelectorAll('.cvp-card-opt').forEach(el => el.classList.toggle('sel', el.dataset.style === s.cardStyle));
  document.querySelectorAll('.cvp-bg-opt').forEach(el => el.classList.toggle('sel', el.dataset.mode === s.bgMode));
  document.querySelectorAll('.cvp-spacing-opt').forEach(el => el.classList.toggle('sel', el.dataset.spacing === s.spacing));
}

function setIfExists(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.tagName === 'INPUT') el.value = val;
  else el.textContent = val;
}

function cvpPatchServerCSS() {
  let css = cvpOriginalCSS || edFiles.css;
  const s = cvpState;

  // 1. Patch CSS variable values in :root block
  function patchVar(c, name, value) {
    return c.replace(
      new RegExp('(--' + name + '\\s*:\\s*)[^;]+', 'g'),
      '$1' + value
    );
  }
  css = patchVar(css, 'accent',  s.accentColor);
  css = patchVar(css, 'bg',      s.bgColor);
  css = patchVar(css, 'surface', s.surfaceColor);
  css = patchVar(css, 'text',    s.textColor);

  // 2. Patch body font-size
  css = css.replace(
    /(body\s*\{[^}]*font-size\s*:\s*)\d+px/,
    '$1' + s.fontSize + 'px'
  );

  // 3. Patch body font-family
  css = css.replace(
    /(body\s*\{[^}]*font-family\s*:\s*)[^;]+/,
    '$1' + s.fontFamily
  );

  // 4. Patch ALL border-radius values (scale them proportionally or set flat)
  css = css.replace(/border-radius\s*:\s*\d+px/g, 'border-radius: ' + s.borderRadius + 'px');

  // 5. Body background from bgMode
  const bgReplacement = cvpGetBgCSS();
  // Replace existing body background property
  css = css.replace(
    /(body\s*\{[^}]*)background(?:-color)?\s*:[^;]+/,
    '$1background: ' + bgReplacement
  );

  // 6. Card styles — inject/replace a card override block at the end
  // Remove any previous cvp card block
  css = css.replace(/\/\* CVP:cards \*\/[\s\S]*?\/\* \/CVP:cards \*\//g, '');
  const cardBlock = cvpBuildCardBlock(s);
  css += '\n' + cardBlock;

  // 7. Spacing override block
  css = css.replace(/\/\* CVP:spacing \*\/[\s\S]*?\/\* \/CVP:spacing \*\//g, '');
  const spacingBlock = cvpBuildSpacingBlock(s);
  css += '\n' + spacingBlock;

  return css;
}

function cvpGetBgCSS() {
  const s = cvpState;
  switch (s.bgMode) {
    case 'gradient-warm':  return 'linear-gradient(135deg, #0e0a00, #1a0d00)';
    case 'gradient-cool':  return 'linear-gradient(135deg, #000814, #001429)';
    case 'gradient-neon':  return 'linear-gradient(135deg, #0a000f, #000a0f)';
    case 'grid':
      return s.bgColor + '; background-image: linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px); background-size: 40px 40px';
    case 'dots':
      return s.bgColor + '; background-image: radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px); background-size: 20px 20px';
    default: return s.bgColor;
  }
}

function cvpBuildCardBlock(s) {
  const lines = ['/* CVP:cards */'];
  switch (s.cardStyle) {
    case 'flat':
      lines.push('[class*="card"],[class*="msg"],[class*="item"]{background:rgba(255,255,255,0.02)!important;border-color:transparent!important;border-radius:'+s.borderRadius+'px!important;}');
      break;
    case 'outline':
      lines.push('[class*="card"],[class*="msg"],[class*="item"]{background:transparent!important;border:1.5px solid rgba(255,255,255,0.18)!important;border-radius:'+s.borderRadius+'px!important;}');
      break;
    case 'ghost':
      lines.push('[class*="card"],[class*="msg"],[class*="item"]{background:transparent!important;border:none!important;border-bottom:1px solid rgba(255,255,255,0.07)!important;border-radius:0!important;}');
      break;
    case 'glass':
      lines.push('[class*="card"],[class*="msg"],[class*="item"]{background:rgba(255,255,255,0.05)!important;backdrop-filter:blur(12px)!important;border:1px solid rgba(255,255,255,0.1)!important;border-radius:'+s.borderRadius+'px!important;}');
      break;
    default:
      lines.push('[class*="card"],[class*="msg"]{border-radius:'+s.borderRadius+'px;}');
  }
  lines.push('/* /CVP:cards */');
  return lines.join('\n');
}

function cvpBuildSpacingBlock(s) {
  const lines = ['/* CVP:spacing */'];
  if (s.spacing === 'compact') {
    lines.push('[class*="card"],[class*="msg"]{padding:10px 12px!important;margin-bottom:6px!important;}');
  } else if (s.spacing === 'relaxed') {
    lines.push('[class*="card"],[class*="msg"]{padding:24px!important;margin-bottom:20px!important;}');
  }
  lines.push('/* /CVP:spacing */');
  return lines.join('\n');
}

// Apply changes: patch edFiles.css then refresh the iframe
function cvpPreview() {
  edFiles.css = cvpPatchServerCSS();
  edRefresh();
}

// ── CVP Control handlers ──

function cvpSetAccent(color) {
  cvpState.accentColor = color;
  setIfExists('cvp-accent-color', color);
  setIfExists('cvp-accent-hex', color);
  cvpPreview();
}

function cvpSetBg(color) {
  cvpState.bgColor = color;
  setIfExists('cvp-bg-color', color);
  setIfExists('cvp-bg-hex', color);
  cvpPreview();
}

function cvpSetSurface(color) {
  cvpState.surfaceColor = color;
  setIfExists('cvp-surface-color', color);
  setIfExists('cvp-surface-hex', color);
  cvpPreview();
}

function cvpSetText(color) {
  cvpState.textColor = color;
  setIfExists('cvp-text-color', color);
  setIfExists('cvp-text-hex', color);
  cvpPreview();
}

function cvpSetFont(el) {
  document.querySelectorAll('.cvp-font-opt').forEach(f => f.classList.remove('sel'));
  el.classList.add('sel');
  cvpState.fontFamily = el.dataset.font;
  cvpPreview();
}

function cvpSetCardStyle(el) {
  document.querySelectorAll('.cvp-card-opt').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  cvpState.cardStyle = el.dataset.style;
  cvpPreview();
}

function cvpSetBgMode(el) {
  document.querySelectorAll('.cvp-bg-opt').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  cvpState.bgMode = el.dataset.mode;
  cvpPreview();
}

function cvpSetSpacing(el) {
  document.querySelectorAll('.cvp-spacing-opt').forEach(s => s.classList.remove('sel'));
  el.classList.add('sel');
  cvpState.spacing = el.dataset.spacing;
  cvpPreview();
}

function cvpUpdateSlider(id, value, unit) {
  document.getElementById(`cvp-${id}-val`).textContent = value + unit;
  if (id === 'fontsize') cvpState.fontSize    = parseInt(value);
  if (id === 'radius')   cvpState.borderRadius = parseInt(value);
  cvpPreview();
}

function cvpApplyToEditor() {
  // Switch to CSS tab so user can see and manually edit the patched server CSS
  edSkinSetPanel('code', document.getElementById('ed-skin-code-btn'));
  if (editorInstance) {
    editorInstance.setValue(edFiles.css);
    edCurrentFile = 'css';
    edMarkModified('css');
    edUpdateCharCount();
  }
}

function cvpReset() {
  // Restore original server CSS (before any customizer changes this session)
  if (cvpOriginalCSS) {
    edFiles.css = cvpOriginalCSS;
    cvpLoadServerCSS(cvpOriginalCSS);
  }
  edRefresh();
}

// ═══════════════════════════════════════════════════════
// SHELL CUSTOMIZER (shp = Shell Panel)
// Controls the outer Branch interface via CSS variables.
// Writes to <style id="branch-shell-skin"> in the host
// page — never touches any server JS or server content.
// ═══════════════════════════════════════════════════════

const SHP_DEFAULTS = {
  topbarH:         100,
  topbarBg:        '#121217',
  accent:          '#d2d2d2',
  searchW:         380,
  searchRadius:    12,
  searchBtnRadius: 8,
  searchPos:       'center',
  sidebarW:        120,
  iconSize:        74,
  iconRadius:      18,
  sidebarBg:       '#121217',
  logoSize:        74,
  logoRadius:      20,
  avatarRadius:    15,
};

let shpState = { ...SHP_DEFAULTS };

const SHP_STORAGE_KEY = 'branch::shell-skin-state';

function shpLoad() {
  try {
    const saved = localStorage.getItem(SHP_STORAGE_KEY);
    if (saved) shpState = { ...SHP_DEFAULTS, ...JSON.parse(saved) };
  } catch(e) {}
  shpApply();
}

function shpSave() {
  localStorage.setItem(SHP_STORAGE_KEY, JSON.stringify(shpState));
  shpApply();
  const toast = document.getElementById('ed-toast-save');
  if (toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }
}

function shpApply() {
  const css = shpBuildCSS();
  const el = document.getElementById('branch-shell-skin');
  if (el) el.textContent = css;
}

function shpBuildCSS() {
  const s = shpState;
  const lines = [];
  lines.push('/* ══ Branch Shell Skin — auto-generated, CSS-only ══ */');
  lines.push(':root {');
  lines.push(`  --topbar-h: ${s.topbarH}px;`);
  lines.push(`  --topbar-bg: ${s.topbarBg};`);
  lines.push(`  --accent: ${s.accent};`);
  lines.push(`  --search-w: ${s.searchW}px;`);
  lines.push(`  --search-radius: ${s.searchRadius}px;`);
  lines.push(`  --search-btn-radius: ${s.searchBtnRadius}px;`);
  lines.push(`  --sidebar-w: ${s.sidebarW}px;`);
  lines.push(`  --sidebar-icon-size: ${s.iconSize}px;`);
  lines.push(`  --sidebar-icon-radius: ${s.iconRadius}px;`);
  lines.push(`  --sidebar-bg: ${s.sidebarBg};`);
  lines.push(`  --logo-size: ${s.logoSize}px;`);
  lines.push(`  --logo-radius: ${s.logoRadius}px;`);
  lines.push(`  --avatar-radius: ${s.avatarRadius}px;`);
  lines.push('}');

  // Search position
  if (s.searchPos === 'left') {
    lines.push('.search-container { margin-left: 0; margin-right: auto; }');
  } else if (s.searchPos === 'right') {
    lines.push('.search-container { margin-left: auto; margin-right: 0; }');
  } else {
    lines.push('.search-container { margin-left: auto; margin-right: auto; }');
  }

  lines.push('/* ══ End Shell Skin ══ */');
  return lines.join('\n');
}

function shpSyncUI() {
  const s = shpState;
  const set = (id, v) => { const el = document.getElementById(id); if (!el) return; if (el.tagName==='INPUT') el.value = v; else el.textContent = v; };

  set('shp-topbar-h', s.topbarH);
  set('shp-topbar-h-val', s.topbarH + 'px');
  set('shp-topbar-bg-color', s.topbarBg);
  set('shp-topbar-bg-hex', s.topbarBg);
  set('shp-accent-color', s.accent);
  set('shp-accent-hex', s.accent);
  set('shp-search-w', s.searchW);
  set('shp-search-w-val', s.searchW + 'px');
  set('shp-search-radius', s.searchRadius);
  set('shp-search-radius-val', s.searchRadius + 'px');
  set('shp-search-btn-radius', s.searchBtnRadius);
  set('shp-search-btn-radius-val', s.searchBtnRadius + 'px');
  set('shp-sidebar-w', s.sidebarW);
  set('shp-sidebar-w-val', s.sidebarW + 'px');
  set('shp-icon-size', s.iconSize);
  set('shp-icon-size-val', s.iconSize + 'px');
  set('shp-icon-radius', s.iconRadius);
  set('shp-icon-radius-val', s.iconRadius + 'px');
  set('shp-sidebar-bg-color', s.sidebarBg);
  set('shp-sidebar-bg-hex', s.sidebarBg);
  set('shp-logo-size', s.logoSize);
  set('shp-logo-size-val', s.logoSize + 'px');
  set('shp-logo-radius', s.logoRadius);
  set('shp-logo-radius-val', s.logoRadius + 'px');

  // Search position buttons
  document.querySelectorAll('[data-pos]').forEach(el => {
    el.classList.toggle('sel', el.dataset.pos === s.searchPos);
  });
  // Avatar shape buttons
  document.querySelectorAll('[data-av]').forEach(el => {
    el.classList.toggle('sel', parseInt(el.dataset.av) === s.avatarRadius);
  });
}

function shpUpdate(prop, value, unit) {
  // Map slider id to state key
  const map = {
    'topbar-h': 'topbarH',
    'search-w': 'searchW',
    'search-radius': 'searchRadius',
    'search-btn-radius': 'searchBtnRadius',
    'sidebar-w': 'sidebarW',
    'icon-size': 'iconSize',
    'icon-radius': 'iconRadius',
    'logo-size': 'logoSize',
    'logo-radius': 'logoRadius',
  };
  const key = map[prop];
  if (!key) return;
  shpState[key] = parseInt(value);
  const valEl = document.getElementById('shp-' + prop + '-val');
  if (valEl) valEl.textContent = value + unit;
  shpApply();
}

function shpUpdateColor(prop, value) {
  const map = {
    'topbar-bg': 'topbarBg',
    'accent': 'accent',
    'sidebar-bg': 'sidebarBg',
  };
  const key = map[prop];
  if (!key) return;
  shpState[key] = value;
  // Sync the paired hex input
  const hexId = 'shp-' + prop + '-hex';
  const hexEl = document.getElementById(hexId);
  if (hexEl) hexEl.value = value;
  const colorId = 'shp-' + prop + '-color';
  const colorEl = document.getElementById(colorId);
  if (colorEl) colorEl.value = value;
  shpApply();
}

function shpSetSearchPos(el) {
  document.querySelectorAll('[data-pos]').forEach(e => e.classList.remove('sel'));
  el.classList.add('sel');
  shpState.searchPos = el.dataset.pos;
  shpApply();
}

function shpSetAvatar(el) {
  document.querySelectorAll('[data-av]').forEach(e => e.classList.remove('sel'));
  el.classList.add('sel');
  shpState.avatarRadius = parseInt(el.dataset.av);
  shpApply();
}

function shpPreset(name) {
  const presets = {
    minimal: { topbarH:60, searchRadius:4, searchBtnRadius:2, iconRadius:4, logoRadius:4, avatarRadius:4, sidebarW:90, iconSize:58, logoSize:52 },
    rounded: { topbarH:100, searchRadius:40, searchBtnRadius:40, iconRadius:50, logoRadius:50, avatarRadius:50, sidebarW:110, iconSize:70, logoSize:70 },
    compact: { topbarH:60, searchRadius:8, searchBtnRadius:6, iconRadius:12, logoRadius:12, avatarRadius:10, sidebarW:80, iconSize:52, logoSize:52 },
    wide:    { topbarH:120, searchW:600, searchRadius:14, searchBtnRadius:10, iconRadius:18, logoRadius:20, avatarRadius:14, sidebarW:150, iconSize:80, logoSize:80 },
  };
  if (presets[name]) {
    shpState = { ...shpState, ...presets[name] };
    shpSyncUI();
    shpApply();
  }
}

function shpReset() {
  shpState = { ...SHP_DEFAULTS };
  shpSyncUI();
  shpApply();
}

// Load shell skin on page startup
document.addEventListener('DOMContentLoaded', () => {
  shpLoad();
});

// ═══════════════════════════════════════
// CREATE SERVER MODAL
// ═══════════════════════════════════════
let selectedType  = 'scratch';
let selectedIcon  = '✦';
let selectedColor = '#c8ff00';
let selectedPhoto  = null;

function openCreateModal() {
  goToStep(1);
  document.getElementById('server-name-input').value = '';
  document.getElementById('server-desc-input') && (document.getElementById('server-desc-input').value = '');
  document.getElementById('slug-preview').textContent = 'my-server';
  selectedPhoto = null;
  selectedIcon  = '✦';
  selectedColor = '#c8ff00';

  const zone = document.getElementById('photo-upload-zone');
  if (zone) {
    zone.classList.remove('has-photo');
    zone.querySelector('img') && zone.querySelector('img').remove();
    zone.querySelector('.photo-upload-icon').style.display = '';
    zone.querySelector('.photo-upload-label').style.display = '';
  }

  const ip = document.getElementById('icon-preview');
  if (ip) { ip.textContent = '✦'; ip.style.color='#c8ff00'; ip.style.background='rgba(200,255,0,0.08)'; ip.style.borderColor='rgba(200,255,0,0.3)'; }

  document.querySelectorAll('.icon-options span').forEach(s => s.classList.remove('selected'));
  document.querySelector('.icon-options span') && document.querySelector('.icon-options span').classList.add('selected');
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  document.querySelector('.color-swatch') && document.querySelector('.color-swatch').classList.add('selected');
  document.getElementById('create-modal-backdrop').classList.remove('hidden');
}

function triggerPhotoUpload() {
  document.getElementById('photo-file-input').click();
}

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    selectedPhoto = ev.target.result;
    selectedIcon  = '';

    const zone = document.getElementById('photo-upload-zone');
    zone.classList.add('has-photo');
    const existing = zone.querySelector('img');
    if (existing) existing.remove();
    const img = document.createElement('img');
    img.src = selectedPhoto;
    zone.insertBefore(img, zone.firstChild);
    zone.querySelector('.photo-upload-icon').style.display = 'none';
    zone.querySelector('.photo-upload-label').style.display = 'none';

    const ip = document.getElementById('icon-preview');
    ip.textContent = '';
    ip.style.padding = '0';
    ip.style.background = 'none';
    ip.style.borderColor = 'rgba(200,255,0,0.4)';
    const previewImg = document.createElement('img');
    previewImg.src = selectedPhoto;
    ip.appendChild(previewImg);
  };
  reader.readAsDataURL(file);
}

function removePhoto(e) {
  e.stopPropagation();
  selectedPhoto = null;
  selectedIcon  = '✦';
  const zone = document.getElementById('photo-upload-zone');
  zone.classList.remove('has-photo');
  const img = zone.querySelector('img');
  if (img) img.remove();
  zone.querySelector('.photo-upload-icon').style.display = '';
  zone.querySelector('.photo-upload-label').style.display = '';

  const ip = document.getElementById('icon-preview');
  const pimg = ip.querySelector('img');
  if (pimg) pimg.remove();
  ip.textContent = '✦';
  ip.style.padding = '';
  ip.style.color = selectedColor;
  ip.style.background = selectedColor + '18';
  ip.style.borderColor = selectedColor + '80';
  document.getElementById('photo-file-input').value = '';
}

function closeCreateModal() {
  document.getElementById('create-modal-backdrop').classList.add('hidden');
}

function handleBackdropClick(e) {
  if (e.target === document.getElementById('create-modal-backdrop')) closeCreateModal();
}

function goToStep(n) {
  document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');
}

function selectType(card, type) {
  document.querySelectorAll('.server-type-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedType = type;
}

function pickIcon(el, icon) {
  document.querySelectorAll('.icon-options span').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  selectedIcon = icon;
  document.getElementById('icon-preview').textContent = icon;
}

function pickColor(el, color) {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  selectedColor = color;
  document.getElementById('icon-preview').style.color = color;
  document.getElementById('icon-preview').style.borderColor = color + '80';
  document.getElementById('icon-preview').style.background = color + '18';
}

function pickColorCustom(color) {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  selectedColor = color;
  document.getElementById('icon-preview').style.color = color;
}

function updateSlugPreview() {
  const val = document.getElementById('server-name-input').value;
  document.getElementById('slug-preview').textContent =
    val.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') || 'my-server';
}

function createServer() {
  const nameInput = document.getElementById('server-name-input');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    nameInput.style.borderColor = '#ff4455';
    setTimeout(() => nameInput.style.borderColor = '', 1500);
    return;
  }

  const zone2 = document.getElementById('draggable-zone');
  const viewId = 'server-view-' + Date.now();

  const item = document.createElement('div');
  item.className = 'sidebar-item';
  item.draggable = true;
  item.setAttribute('data-id', viewId);
  item.setAttribute('data-view', viewId);
  item.setAttribute('data-server-name', name);
  item.setAttribute('data-owner', 'true');
  item.setAttribute('oncontextmenu', 'openContextMenu(event,this)');

  const iconContent = selectedPhoto
    ? `<img src="${selectedPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">`
    : `<span style="font-size:22px;">${selectedIcon}</span>`;

  item.innerHTML = `
    <div class="active-pill"></div>
    <div class="icon-box" style="background:${selectedColor}18;color:${selectedColor};border:1px solid ${selectedColor}40;overflow:hidden;padding:0;">
      ${iconContent}
    </div>
    <div class="server-accent-dot" style="background:${selectedColor};"></div>
  `;

  zone2.appendChild(item);

  // Bind interactions
  let dragged = false;
  item.addEventListener('dragstart', () => { dragged = true; item.classList.add('dragging'); });
  item.addEventListener('dragend',   () => { setTimeout(()=>{ dragged=false; },100); item.classList.remove('dragging'); saveOrder(); });
  item.addEventListener('click', () => {
    if (dragged) return;
    document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
    item.classList.add('active');
    activeServerName = name;
    renderServer(name);
  });

  newServerItem = item;

  const successIconEl = document.getElementById('success-icon');
  if (selectedPhoto) {
    successIconEl.style.backgroundImage = `url(${selectedPhoto})`;
    successIconEl.style.backgroundSize = 'cover';
    successIconEl.style.backgroundPosition = 'center';
    successIconEl.style.borderRadius = '20px';
    successIconEl.style.width = '80px';
    successIconEl.style.height = '80px';
    successIconEl.style.display = 'block';
    successIconEl.style.margin = '0 auto 16px';
    successIconEl.textContent = '';
  } else {
    successIconEl.textContent = selectedIcon;
    successIconEl.style.color = selectedColor;
    successIconEl.style.backgroundImage = '';
  }
  document.getElementById('success-name').textContent = `"${name}" is ready.`;
  goToStep(3);
}

function openNewServerEditor() {
  closeCreateModal();
  if (newServerItem) {
    contextTargetItem = newServerItem;
    openEditor();
  }
}

// ════════════════════════════════════════════════════════════════
// STANDALONE SHELL CUSTOMIZER (shc*)
// Triggered by: Settings → Customize Shell
// Completely independent from the editor overlay.
// Reads/writes shpState (the existing shell state) + adds
// extra color props (logo bg/icon, page bg, text, font).
// ════════════════════════════════════════════════════════════════

// Extra defaults for new props (extends SHP_DEFAULTS)
const SHC_EXTRA = {
  logoBg:     '#d2d2d2',
  logoIcon:   '#08080a',
  bgDeep:     '#08080a',
  textMain:   '#ffffff',
  textDim:    '#71717a',
  fontFamily: "'Inter',system-ui,sans-serif",
};

// On load, merge extra defaults into shpState
(function mergeExtras() {
  // If shpState already has these keys (from saved state), keep them; else add defaults
  Object.keys(SHC_EXTRA).forEach(k => {
    if (!(k in shpState)) shpState[k] = SHC_EXTRA[k];
  });
})();

// Override shpBuildCSS to include extra colors, logo overrides, font, bgDeep
const _origShpBuildCSS = shpBuildCSS;
shpBuildCSS = function() {
  const s = shpState;
  const lines = ['/* ══ Branch Shell Skin — auto-generated ══ */'];
  lines.push(':root {');
  lines.push(`  --topbar-h: ${s.topbarH||100}px;`);
  lines.push(`  --topbar-bg: ${s.topbarBg||'#121217'};`);
  lines.push(`  --accent: ${s.accent||'#d2d2d2'};`);
  lines.push(`  --search-w: ${s.searchW||380}px;`);
  lines.push(`  --search-radius: ${s.searchRadius||12}px;`);
  lines.push(`  --search-btn-radius: ${s.searchBtnRadius||8}px;`);
  lines.push(`  --sidebar-w: ${s.sidebarW||120}px;`);
  lines.push(`  --sidebar-icon-size: ${s.iconSize||74}px;`);
  lines.push(`  --sidebar-icon-radius: ${s.iconRadius||18}px;`);
  lines.push(`  --sidebar-bg: ${s.sidebarBg||'#121217'};`);
  lines.push(`  --logo-size: ${s.logoSize||74}px;`);
  lines.push(`  --logo-radius: ${s.logoRadius||20}px;`);
  lines.push(`  --avatar-radius: ${s.avatarRadius||15}px;`);
  lines.push(`  --bg-deep: ${s.bgDeep||'#08080a'};`);
  lines.push(`  --text-main: ${s.textMain||'#ffffff'};`);
  lines.push(`  --text-dim: ${s.textDim||'#71717a'};`);
  lines.push('}');
  // Logo colors
  lines.push(`.logo { background: ${s.logoBg||s.accent||'#d2d2d2'} !important; color: ${s.logoIcon||'#08080a'} !important; }`);
  // body bg
  lines.push(`body { background-color: ${s.bgDeep||'#08080a'} !important; }`);
  // Font
  if (s.fontFamily) {
    lines.push(`body, .top-bar, .sidebar, .dropdown-menu { font-family: ${s.fontFamily} !important; }`);
  }
  // Search position
  const pos = s.searchPos || 'center';
  if (pos === 'left')       lines.push('.search-container { margin-left: 0; margin-right: auto; }');
  else if (pos === 'right') lines.push('.search-container { margin-left: auto; margin-right: 0; }');
  else                      lines.push('.search-container { margin-left: auto; margin-right: auto; }');
  lines.push('/* ══ End Shell Skin ══ */');
  return lines.join('\n');
};

// Open / close
function openShellCustomizer() {
  shcSyncUI();
  document.getElementById('shc-panel').classList.add('open');
  document.getElementById('shc-backdrop').classList.add('open');
}
function closeShellCustomizer() {
  document.getElementById('shc-panel').classList.remove('open');
  document.getElementById('shc-backdrop').classList.remove('open');
}

// Color input handler
function shcColor(prop, value) {
  const map = {
    'accent':      'accent',
    'bg':          'bgDeep',
    'topbar-bg':   'topbarBg',
    'sidebar-bg':  'sidebarBg',
    'logo-bg':     'logoBg',
    'logo-icon':   'logoIcon',
    'text':        'textMain',
    'text-dim':    'textDim',
  };
  const key = map[prop];
  if (!key) return;
  shpState[key] = value;
  // Sync paired hex field
  const hexEl = document.getElementById('shc-' + prop + '-hex');
  if (hexEl) hexEl.value = value;
  shpApply();
}

// Hex text input handler
function shcHex(prop, value) {
  if (/^#[0-9a-f]{6}$/i.test(value)) shcColor(prop, value);
}

// Accent preset: sets accent + logo icon color together
function shcAccentPreset(accent, logoIcon) {
  shpState.accent   = accent;
  shpState.logoBg   = accent;
  shpState.logoIcon = logoIcon;
  shcSyncUI();
  shpApply();
}

// Slider
function shcSlider(prop, value, unit) {
  const map = {
    'topbar-h':      'topbarH',
    'search-w':      'searchW',
    'search-radius': 'searchRadius',
    'search-btn-r':  'searchBtnRadius',
    'sidebar-w':     'sidebarW',
    'icon-size':     'iconSize',
    'icon-radius':   'iconRadius',
    'logo-size':     'logoSize',
    'logo-radius':   'logoRadius',
  };
  const key = map[prop];
  if (!key) return;
  shpState[key] = parseInt(value);
  const el = document.getElementById('shc-' + prop + '-val');
  if (el) el.textContent = value + unit;
  shpApply();
}

// Font
function shcFont(el) {
  document.querySelectorAll('#shc-font-chips .shc-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  shpState.fontFamily = el.dataset.font;
  shpApply();
}

// Search position
function shcSearchPos(el) {
  document.querySelectorAll('#shc-pos-chips .shc-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  shpState.searchPos = el.dataset.pos;
  shpApply();
}

// Avatar shape
function shcAvatar(el) {
  document.querySelectorAll('#shc-av-chips .shc-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  shpState.avatarRadius = parseInt(el.dataset.av);
  shpApply();
}

// Quick presets
function shcPreset(name) {
  const presets = {
    minimal: { topbarH:64, searchRadius:4, searchBtnRadius:2, iconRadius:4, logoRadius:4, avatarRadius:4, sidebarW:88, iconSize:58, logoSize:52 },
    rounded: { topbarH:100, searchRadius:40, searchBtnRadius:40, iconRadius:50, logoRadius:50, avatarRadius:50, sidebarW:110, iconSize:70, logoSize:70 },
    compact: { topbarH:62, searchRadius:8, searchBtnRadius:6, iconRadius:12, logoRadius:12, avatarRadius:10, sidebarW:80, iconSize:52, logoSize:52 },
    wide:    { topbarH:120, searchW:600, searchRadius:14, searchBtnRadius:10, iconRadius:18, logoRadius:20, avatarRadius:14, sidebarW:150, iconSize:80, logoSize:80 },
  };
  if (presets[name]) {
    Object.assign(shpState, presets[name]);
    shcSyncUI();
    shpApply();
  }
}

// Reset to defaults
function shcReset() {
  shpState = { ...SHP_DEFAULTS, ...SHC_EXTRA };
  shcSyncUI();
  shpApply();
}

// Save
function shcSave() {
  localStorage.setItem(SHP_STORAGE_KEY, JSON.stringify(shpState));
  shpApply();
  closeShellCustomizer();
  const toast = document.getElementById('ed-toast-save');
  if (toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }
}

// Sync all SHC UI inputs from shpState
function shcSyncUI() {
  const s = shpState;
  const sv = (id, v) => { const el = document.getElementById(id); if (!el) return; if (el.tagName==='INPUT') el.value = v; else el.textContent = v; };

  sv('shc-accent',       s.accent     || '#d2d2d2');
  sv('shc-accent-hex',   s.accent     || '#d2d2d2');
  sv('shc-bg',           s.bgDeep     || '#08080a');
  sv('shc-bg-hex',       s.bgDeep     || '#08080a');
  sv('shc-topbar-bg',    s.topbarBg   || '#121217');
  sv('shc-topbar-bg-hex',s.topbarBg   || '#121217');
  sv('shc-sidebar-bg',   s.sidebarBg  || '#121217');
  sv('shc-sidebar-bg-hex',s.sidebarBg || '#121217');
  sv('shc-logo-bg',      s.logoBg     || s.accent || '#d2d2d2');
  sv('shc-logo-bg-hex',  s.logoBg     || s.accent || '#d2d2d2');
  sv('shc-logo-icon',    s.logoIcon   || '#08080a');
  sv('shc-logo-icon-hex',s.logoIcon   || '#08080a');
  sv('shc-text',         s.textMain   || '#ffffff');
  sv('shc-text-hex',     s.textMain   || '#ffffff');
  sv('shc-text-dim',     s.textDim    || '#71717a');
  sv('shc-text-dim-hex', s.textDim    || '#71717a');

  sv('shc-topbar-h',        s.topbarH     || 100);
  sv('shc-topbar-h-val',   (s.topbarH     || 100) + 'px');
  sv('shc-search-w',        s.searchW     || 380);
  sv('shc-search-w-val',   (s.searchW     || 380) + 'px');
  sv('shc-search-radius',   s.searchRadius|| 12);
  sv('shc-search-radius-val',(s.searchRadius||12)+'px');
  sv('shc-search-btn-r',    s.searchBtnRadius||8);
  sv('shc-search-btn-r-val',(s.searchBtnRadius||8)+'px');
  sv('shc-sidebar-w',       s.sidebarW    || 120);
  sv('shc-sidebar-w-val',  (s.sidebarW    || 120)+'px');
  sv('shc-icon-size',       s.iconSize    || 74);
  sv('shc-icon-size-val',  (s.iconSize    || 74)+'px');
  sv('shc-icon-radius',     s.iconRadius  || 18);
  sv('shc-icon-radius-val',(s.iconRadius  || 18)+'px');
  sv('shc-logo-size',       s.logoSize    || 74);
  sv('shc-logo-size-val',  (s.logoSize    || 74)+'px');
  sv('shc-logo-radius',     s.logoRadius  || 20);
  sv('shc-logo-radius-val',(s.logoRadius  || 20)+'px');

  // Font chips
  const font = s.fontFamily || "'Inter',system-ui,sans-serif";
  document.querySelectorAll('#shc-font-chips .shc-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.font === font);
  });
  // Position chips
  const pos = s.searchPos || 'center';
  document.querySelectorAll('#shc-pos-chips .shc-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.pos === pos);
  });
  // Avatar chips
  const av = s.avatarRadius !== undefined ? s.avatarRadius : 15;
  document.querySelectorAll('#shc-av-chips .shc-chip').forEach(c => {
    c.classList.toggle('active', parseInt(c.dataset.av) === av);
  });
}

// Also load extra defaults when shpLoad runs
const _origShpLoad = shpLoad;
shpLoad = function() {
  try {
    const saved = localStorage.getItem(SHP_STORAGE_KEY);
    if (saved) {
      shpState = { ...SHP_DEFAULTS, ...SHC_EXTRA, ...JSON.parse(saved) };
    } else {
      shpState = { ...SHP_DEFAULTS, ...SHC_EXTRA };
    }
  } catch(e) {
    shpState = { ...SHP_DEFAULTS, ...SHC_EXTRA };
  }
  shpApply();
};
