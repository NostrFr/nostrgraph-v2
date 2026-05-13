// ui/dom.js

window.NG_DOM = {
  init() {},

  getIdentityInput() {
    const el = document.getElementById('identity-input');
    return (el?.value || '').trim();
  },

  setStatus(msg) {
    const el = document.getElementById('status-msg');
    if (el) el.textContent = msg;
  },

  showNodeInfo(node) {
    const box = document.getElementById('node-info');
    if (!box) return;

    box.style.display = 'block';
    box.innerHTML = `
      <strong>Nœud sélectionné</strong><br>
      id : ${node.id}<br>
      type : ${node.type}<br>
      communauté : ${node.community}<br>
      centralité : ${(node.centrality * 100).toFixed(1)}%<br>
      pont : ${node.betweenness.toFixed(3)}<br>
      relay : ${node.relay || "n/a"}<br>
      x : ${node.x.toFixed(1)}<br>
      y : ${node.y.toFixed(1)}
    `;
  },

  showLatency(results) {
    const box = document.getElementById('latency-info');
    if (!box) return;

    box.style.display = 'block';
    box.innerHTML = `
      <strong>Latence par relay</strong><br>
      ${results.map(r => `${r.relay} → ${r.latency ?? "timeout"} ms`).join("<br>")}
    `;
  },

  showLegend(communities, relays) {
    const box = document.getElementById('legend');
    if (!box) return;

    box.style.display = 'block';

    let html = `<strong>Légende</strong><br><br>`;

    html += `<strong>Communautés</strong><br>`;
    communities.forEach(c => {
      html += `
        <div class="legend-item">
          <div class="legend-color" style="background:${COMMUNITY_COLORS[c % COMMUNITY_COLORS.length]}"></div>
          communauté ${c}
        </div>
      `;
    });

    html += `<br><strong>Relays</strong><br>`;
    relays.forEach(r => {
      html += `
        <div class="legend-item">
          <div class="legend-color" style="background:${colorForRelay(r)}"></div>
          ${r}
        </div>
      `;
    });

    html += `<br><strong>Latence</strong><br>
      <div class="legend-item"><div class="legend-color" style="background:rgba(0,0,0,0.15)"></div> rapide (&lt;150ms)</div>
      <div class="legend-item"><div class="legend-color" style="background:rgba(0,0,0,0.25)"></div> moyen (150–350ms)</div>
      <div class="legend-item"><div class="legend-color" style="background:rgba(0,0,0,0.35)"></div> lent (&gt;350ms)</div>
      <div class="legend-item"><div class="legend-color" style="background:#ccc"></div> timeout</div>
    `;

    box.innerHTML = html;
  },

  downloadJSON(obj, filename = "nostrgraph-v2.json") {
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", data);
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};
