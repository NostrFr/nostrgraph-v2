// app.js

window.addEventListener('DOMContentLoaded', () => {
  const { init } = window.NG_DOM;
  const { init: initCanvas, renderGraph } = window.NG_Canvas;
  const { decodeIdentity } = window.NG_NIP19;
  const { fetchContactsDepth2, measureLatency } = window.NG_Req;
  const { buildDepth2, exportGraph } = window.NG_Graph;
  const { setStatus, getIdentityInput, showLatency, showLegend, downloadJSON } = window.NG_DOM;

  init();
  const { ctx, canvas } = initCanvas('graph-canvas');

  const exploreBtn = document.getElementById('explore-btn');
  const exportBtn = document.getElementById('export-json-btn');

  exploreBtn.addEventListener('click', async () => {
    try {
      setStatus('Décodage…');
      const raw = getIdentityInput();
      const pubkeyHex = decodeIdentity(raw);

      setStatus('Mesure de latence…');
      const latency = await measureLatency();
      latency.forEach(r => window.NG_State.relayLatency[r.relay] = r.latency);
      showLatency(latency);

      setStatus('Récupération depth1 + depth2…');
      const { depth1, depth2 } = await fetchContactsDepth2(pubkeyHex);

      setStatus('Construction du graphe…');
      const graph = buildDepth2(pubkeyHex, depth1, depth2);
      window.NG_State.currentGraph = graph;

      renderGraph(ctx, canvas, graph);

      const communities = [...new Set(graph.nodes.map(n => n.community))];
      const relays = [...new Set(graph.nodes.map(n => n.relay).filter(Boolean))];
      showLegend(communities, relays);

      setStatus(`OK : ${depth1.length} depth1, ${depth2.length} depth2.`);
    } catch (e) {
      console.error(e);
      setStatus('Erreur : ' + e.message);
    }
  });

  exportBtn.addEventListener('click', () => {
    if (!window.NG_State.currentGraph) {
      setStatus("Aucun graphe à exporter.");
      return;
    }
    const json = exportGraph(window.NG_State.currentGraph, window.NG_State.relayLatency);
    downloadJSON(json, "nostrgraph-v2.json");
    setStatus("Export JSON effectué.");
  });
});
