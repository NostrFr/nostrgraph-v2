// core/graph.js

function detectCommunities(graph) {
  const nodes = graph.nodes.map(n => n.id);
  const edges = graph.edges;

  const adj = {};
  nodes.forEach(n => adj[n] = new Set());
  edges.forEach(e => {
    adj[e.from].add(e.to);
    adj[e.to]?.add(e.from);
  });

  const community = {};
  nodes.forEach((n, i) => community[n] = i);

  let changed = true;
  while (changed) {
    changed = false;

    for (let n of nodes) {
      const current = community[n];
      const counts = {};

      adj[n].forEach(nei => {
        const c = community[nei];
        counts[c] = (counts[c] || 0) + 1;
      });

      let bestComm = current;
      let bestScore = 0;

      for (let c in counts) {
        if (counts[c] > bestScore) {
          bestScore = counts[c];
          bestComm = parseInt(c, 10);
        }
      }

      if (bestComm !== current) {
        community[n] = bestComm;
        changed = true;
      }
    }
  }

  return community;
}

function computeDegreeCentrality(graph) {
  const adj = {};
  graph.nodes.forEach(n => adj[n.id] = new Set());
  graph.edges.forEach(e => {
    adj[e.from].add(e.to);
    adj[e.to]?.add(e.from);
  });

  const total = graph.nodes.length - 1;
  const centrality = {};

  graph.nodes.forEach(n => {
    const deg = adj[n.id].size;
    centrality[n.id] = total > 0 ? deg / total : 0;
  });

  return centrality;
}

function computeBetweennessCentrality(graph) {
  const nodes = graph.nodes.map(n => n.id);
  const edges = graph.edges;

  const adj = {};
  nodes.forEach(n => adj[n] = []);
  edges.forEach(e => {
    adj[e.from].push(e.to);
    adj[e.to]?.push(e.from);
  });

  const Cb = {};
  nodes.forEach(n => Cb[n] = 0);

  nodes.forEach(s => {
    const S = [];
    const P = {};
    const sigma = {};
    const d = {};

    nodes.forEach(v => {
      P[v] = [];
      sigma[v] = 0;
      d[v] = -1;
    });

    sigma[s] = 1;
    d[s] = 0;

    const Q = [s];

    while (Q.length > 0) {
      const v = Q.shift();
      S.push(v);

      adj[v].forEach(w => {
        if (d[w] < 0) {
          Q.push(w);
          d[w] = d[v] + 1;
        }
        if (d[w] === d[v] + 1) {
          sigma[w] += sigma[v];
          P[w].push(v);
        }
      });
    }

    const delta = {};
    nodes.forEach(v => delta[v] = 0);

    while (S.length > 0) {
      const w = S.pop();
      P[w].forEach(v => {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      });
      if (w !== s) {
        Cb[w] += delta[w];
      }
    }
  });

  return Cb;
}

function detectBridges(graph) {
  const commById = {};
  graph.nodes.forEach(n => commById[n.id] = n.community);

  return graph.edges.map(e => {
    const cFrom = commById[e.from];
    const cTo = commById[e.to];
    return { ...e, isBridge: cFrom !== cTo };
  });
}

window.NG_Graph = {
  buildDepth2(rootPubkey, depth1, depth2) {
    const nodes = [];
    const edges = [];

    nodes.push({ id: rootPubkey, type: 'root', relay: null });

    depth1.forEach(c => {
      nodes.push({
        id: c.pubkey,
        type: 'depth1',
        relay: c.relay
      });
      edges.push({ from: rootPubkey, to: c.pubkey });
    });

    depth2.forEach(c => {
      nodes.push({
        id: c.pubkey,
        type: 'depth2',
        relay: c.relay
      });
      // edges depth2 exactes non reconstruites (v2+)
    });

    const graph = { root: rootPubkey, nodes, edges };

    const comm = detectCommunities(graph);
    graph.nodes = graph.nodes.map(n => ({
      ...n,
      community: comm[n.id] ?? 0
    }));

    const centrality = computeDegreeCentrality(graph);
    graph.nodes = graph.nodes.map(n => ({
      ...n,
      centrality: centrality[n.id] || 0
    }));

    const betweenness = computeBetweennessCentrality(graph);
    graph.nodes = graph.nodes.map(n => ({
      ...n,
      betweenness: betweenness[n.id] || 0
    }));

    graph.edges = detectBridges(graph);

    return graph;
  },

  exportGraph(graph, relayLatency) {
    return {
      root: graph.root,
      nodes: graph.nodes.map(n => ({
        id: n.id,
        type: n.type,
        relay: n.relay || null,
        community: n.community,
        centrality: n.centrality,
        betweenness: n.betweenness
      })),
      edges: graph.edges.map(e => ({
        from: e.from,
        to: e.to,
        isBridge: !!e.isBridge
      })),
      relayLatency: relayLatency || {}
    };
  }
};
