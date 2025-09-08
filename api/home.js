export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Sleep Coach — Mini UI</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 32px; }
    .wrap { max-width: 760px; margin: 0 auto; }
    h1 { margin: 0 0 8px; }
    .muted { color: #666; margin: 0 0 24px; }
    textarea, input, select { width: 100%; padding: 10px; margin-top: 6px; }
    button { padding: 10px 14px; cursor: pointer; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; }
    .row > div { flex: 1 1 240px; }
    .card { border: 1px solid #eee; border-radius: 10px; padding: 16px; margin: 12px 0; }
    code { background: #f6f6f6; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
<div class="wrap">
  <h1>😴 Sleep Coach — Mini UI</h1>
  <p class="muted">Formdan kayıt ekle, altta listele/sil; sağda haftalık özet.</p>

  <div class="card">
    <h3>Kayıt Ekle</h3>
    <div class="row">
      <div><label>User ID <input id="userId" value="canim" /></label></div>
      <div><label>Start (ISO) <input id="start" placeholder="2025-09-01T23:30:00Z" /></label></div>
      <div><label>End (ISO) <input id="end" placeholder="2025-09-02T07:00:00Z" /></label></div>
    </div>
    <label>Not <textarea id="note" rows="2" placeholder="opsiyonel"></textarea></label>
    <div class="row" style="align-items:center;margin-top:10px;">
      <div><label>API Token <input id="token" placeholder="X-Api-Token" /></label></div>
      <div style="flex:0 0 auto;"><button onclick="create()">Ekle</button></div>
    </div>
    <div id="createMsg" class="muted"></div>
  </div>

  <div class="row">
    <div class="card" style="flex: 1 1 380px;">
      <div class="row" style="align-items:center;">
        <div><h3>Liste</h3></div>
        <div style="flex:0 0 auto;"><button onclick="list()">Yenile</button></div>
      </div>
      <div id="list"></div>
    </div>

    <div class="card" style="flex: 1 1 280px;">
      <h3>Haftalık Özet</h3>
      <div id="weeklyBox" class="muted">—</div>
      <button onclick="weekly()">Yenile</button>
    </div>
  </div>

  <p class="muted">API test: <code>/api/ping</code></p>
</div>

<script>
const base = location.origin;

async function create() {
  const userId = document.getElementById('userId').value.trim();
  const start  = document.getElementById('start').value.trim();
  const end    = document.getElementById('end').value.trim();
  const note   = document.getElementById('note').value.trim();
  const token  = document.getElementById('token').value.trim();
  const box    = document.getElementById('createMsg');
  box.textContent = 'Gönderiliyor...';

  try {
    const r = await fetch(\`\${base}/api/sessions\`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json','X-Api-Token': token},
      body: JSON.stringify({ userId, start, end, note })
    });
    const t = await r.text();
    box.textContent = r.ok ? '✔️ Eklendi: ' + t : '❌ Hata: ' + t;
    if (r.ok) { list(); weekly(); }
  } catch (e) { box.textContent = '❌ İstek hatası: ' + e.message; }
}

async function list() {
  const userId = document.getElementById('userId').value.trim();
  const el = document.getElementById('list');
  el.textContent = 'Yükleniyor...';

  try {
    const r = await fetch(\`\${base}/api/sessions?userId=\${encodeURIComponent(userId)}\`);
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) { el.textContent = 'Kayıt yok.'; return; }
    el.innerHTML = data.map(row => \`
      <div class="card">
        <div><b>ID:</b> \${row.id}</div>
        <div><b>Start:</b> \${row.start_at}</div>
        <div><b>End:</b> \${row.end_at}</div>
        <div><b>Minutes:</b> \${row.minutes}</div>
        <div><b>Note:</b> \${row.note || ''}</div>
        <button onclick="del('\${row.id}')">Sil</button>
      </div>\`).join('');
  } catch (e) { el.textContent = '❌ Hata: ' + e.message; }
}

async function del(id) {
  const userId = document.getElementById('userId').value.trim();
  const token  = document.getElementById('token').value.trim();
  try {
    const r = await fetch(\`\${base}/api/sessions/\${id}?userId=\${encodeURIComponent(userId)}\`, {
      method: 'DELETE',
      headers: { 'X-Api-Token': token }
    });
    if (r.status === 204) { alert('Silindi'); list(); weekly(); }
    else { const t = await r.text(); alert('Silme hatası: ' + t); }
  } catch (e) { alert('İstek hatası: ' + e.message); }
}

async function weekly() {
  const userId = document.getElementById('userId').value.trim();
  const box = document.getElementById('weeklyBox');
  box.textContent = 'Yükleniyor...';
  try {
    const r = await fetch(\`\${base}/api/weekly?userId=\${encodeURIComponent(userId)}\`);
    const d = await r.json();
    box.textContent = \`Gün: \${d.days} | Ortalama (dk): \${d.avgMinutes} | Score: \${d.sleepScore}\`;
  } catch (e) { box.textContent = '❌ Hata: ' + e.message; }
}

list(); weekly();
</script>
</body>
</html>`);
}
