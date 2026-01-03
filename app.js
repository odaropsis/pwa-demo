const WORKER_URL = "https://steep-voice-0451.gokberkk.workers.dev";

const input = document.getElementById("pairInput");
const table = document.getElementById("priceTable");
const statusEl = document.getElementById("status");

async function fetchPair(pair) {
  const res = await fetch(`${WORKER_URL}/?pair=${encodeURIComponent(pair)}`);
  if (!res.ok) throw new Error("Worker fetch failed");
  return res.json();
}

async function addPair() {
  const pair = input.value.trim().toUpperCase();
  if (!pair) return;

  statusEl.textContent = "Yükleniyor...";

  try {
    const json = await fetchPair(pair);

    if (!json.success || !json.data || !json.data.length) {
      throw new Error("Geçersiz veri");
    }

    const d = json.data[0];

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.pair}</td>
      <td>${Number(d.last).toLocaleString("tr-TR")}</td>
      <td>${Number(d.dailyPercent).toFixed(2)}%</td>
      <td>${new Date().toLocaleTimeString("tr-TR")}</td>
    `;
    table.appendChild(row);

    statusEl.textContent = "Hazır";
    input.value = "";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Hata oluştu";
    alert("Veri alınamadı (Worker kontrol et)");
  }
}

async function refreshAll() {
  statusEl.textContent = "Güncelleniyor...";

  const rows = [...table.querySelectorAll("tr")];
  table.innerHTML = "";

  for (const r of rows) {
    const pair = r.children[0].textContent;
    try {
      const json = await fetchPair(pair);
      const d = json.data[0];

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${d.pair}</td>
        <td>${Number(d.last).toLocaleString("tr-TR")}</td>
        <td>${Number(d.dailyPercent).toFixed(2)}%</td>
        <td>${new Date().toLocaleTimeString("tr-TR")}</td>
      `;
      table.appendChild(row);
    } catch {}
  }

  statusEl.textContent = "Hazır";
}
