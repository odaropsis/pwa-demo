const STORAGE_KEY = "pairs_try_demo_v1";

// Başlangıç listesi
let pairs = loadPairs() ?? ["BTCTRY", "ETHTRY", "USDTRY"];

function loadPairs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}

function savePairs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs.slice(0, 50)));
}

function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "-";
  return Number(n).toLocaleString("tr-TR");
}

function nowStr() {
  return new Date().toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

async function fetchTickerAll() {
  const r = await fetch("https://steep-voice-0451.gokberkk.workers.dev/");
  if (!r.ok) throw new Error("Ticker alınamadı");
  const j = await r.json();
  return j.data || [];
}

function renderRows(rows) {
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.pairSymbol}</td>
      <td>${fmt(row.last)}</td>
      <td>${fmt(row.dailyPercent)}</td>
      <td>${row.updatedAt}</td>
    `;
    tbody.appendChild(tr);
  }
}

async function refresh() {
  const status = document.getElementById("status");
  status.textContent = "Güncelleniyor…";

  try {
    const all = await fetchTickerAll();
    const want = new Set(
      pairs.map(x => x.trim().toUpperCase()).filter(Boolean)
    );

    const picked = all
      .filter(x => want.has(String(x.pairSymbol).toUpperCase()))
      .map(x => ({
        pairSymbol: x.pairSymbol,
        last: x.last,
        dailyPercent: x.dailyPercent,
        updatedAt: nowStr()
      }));

    renderRows(picked);
    status.textContent = "OK";
  } catch (e) {
    status.textContent = "Hata";
    alert(e.message);
  }
}

document.getElementById("addBtn").addEventListener("click", () => {
  const inp = document.getElementById("pairInput");
  const v = inp.value.trim().toUpperCase();
  if (!v) return;

  if (!pairs.includes(v)) pairs.unshift(v);
  savePairs();
  inp.value = "";
  refresh();
});

document.getElementById("refreshBtn").addEventListener("click", refresh);

// Service Worker (relative path!)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

savePairs();
refresh();
setInterval(refresh, 15000);

