const WORKER_URL = "https://steep-voice-0451.gokberkk.workers.dev";

const input = document.getElementById("pairInput");
const tableBody = document.getElementById("priceTable");
const statusEl = document.getElementById("status");
const addBtn = document.getElementById("addBtn");
const refreshBtn = document.getElementById("refreshBtn");

function setStatus(t) {
  statusEl.textContent = t;
}

async function fetchTicker(pair) {
  const r = await fetch(`${WORKER_URL}/?pair=${encodeURIComponent(pair)}`);
  if (!r.ok) throw new Error("fetch");
  const j = await r.json();
  return j.data[0];
}

function upsert(d) {
  let tr = tableBody.querySelector(`tr[data-pair="${d.pair}"]`);
  const last = Number(d.last).toLocaleString("tr-TR");
  const pct = Number(d.dailyPercent).toFixed(2) + "%";
  const time = new Date().toLocaleTimeString("tr-TR");

  if (!tr) {
    tr = document.createElement("tr");
    tr.dataset.pair = d.pair;
    tr.innerHTML = `<td></td><td></td><td></td><td></td>`;
    tableBody.appendChild(tr);
  }

  tr.children[0].textContent = d.pair;
  tr.children[1].textContent = last;
  tr.children[2].textContent = pct;
  tr.children[3].textContent = time;
}

async function addPair() {
  const pair = input.value.trim().toUpperCase();
  if (!pair) return;
  setStatus("Yükleniyor...");
  try {
    const d = await fetchTicker(pair);
    upsert(d);
    setStatus("Hazır");
    input.value = "";
  } catch {
    setStatus("Hata");
    alert("Veri alınamadı");
  }
}

async function refreshAll() {
  const rows = [...tableBody.querySelectorAll("tr[data-pair]")];
  if (!rows.length) return;
  setStatus("Güncelleniyor...");
  for (const r of rows) {
    try {
      const d = await fetchTicker(r.dataset.pair);
      upsert(d);
    } catch {}
  }
  setStatus("Hazır");
}

addBtn.onclick = addPair;
refreshBtn.onclick = refreshAll;
input.onkeydown = (e) => e.key === "Enter" && addPair();

setStatus("Hazır");
