// ui/canvas.js

const COMMUNITY_COLORS = [
  "#ff3b30", "#ff9500", "#ffcc00", "#34c759",
  "#5ac8fa", "#007aff", "#af52de", "#8e8e93"
];

function colorForCommunity(c) {
  return COMMUNITY_COLORS[c % COMMUNITY_COLORS.length];
}

const RELAY_COLORS = [
  "#ff0000", "#007aff", "#ff9500", "#34c759",
  "#af52de", "#5ac8fa", "#ff2d55", "#8e8e93"
];

function colorForRelay(relay) {
  if (!relay) return "#000";
  const idx = Math.abs(hash(relay)) % RELAY_COLORS.length;
  return RELAY_COLORS[idx];
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function haloAlpha(latency) {
  if (latency == null) return 0.05;
  if (latency < 150) return 0.15;
  if (latency < 350) return 0.25;
  return 0.35;
}

window.NG_Canvas = {
  init(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) throw new Error('Canvas introuvable');
    const ctx = canvas.getContext('2d');
    this.clear(ctx, canvas);

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const node = this.findNodeAt(x, y);
      if (node) {
        window.NG_State.selectedNode = node;
        window.NG_DOM.showNodeInfo(node);
      }
    });

    return { ctx, canvas };
  },

  clear(ctx, canvas) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  },

  findNodeAt(x, y) {
    const nodes = window.NG_State.nodesLayout;
    for (let n of nodes) {
      const dx = x - n.x;
      const dy = y - n.y;
      if (dx * dx + dy * dy <= 10 * 10) {
        return n;
      }
    }
    return null;
  },

  renderGraph(ctx, canvas, graph) {
    this.clear(ctx, canvas);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const r1 = Math.min(canvas.width, canvas.height) / 3;
    const r2 = r1 + 120;

    const layout = [];

    layout.push({ id: graph.root, x: cx, y: cy, type: 'root', community: 0, relay: null, centrality: 0, betweenness: 0 });

    const depth1 = graph.nodes.filter(n => n.type === 'depth1');
    const depth2 = graph.nodes.filter(n => n.type === 'depth2');

    depth1.forEach((node, i) => {
      const angle = (i / depth1.length) * Math.PI * 2;
      const x = cx + r1 * Math.cos(angle);
      const y = cy + r1 * Math.sin(angle);

      this.drawNode(ctx, x, y, 6, node);
      layout.push({ ...node, x, y });
    });

    depth2.forEach((node, i) => {
      const angle = (i / depth2.length) * Math.PI * 2;
      const x = cx + r2 * Math.cos(angle);
      const y = cy + r2 * Math.sin(angle);

      this.drawNode(ctx, x, y, 4, node);
      layout.push({ ...node, x, y });
    });

    window.NG_State.nodesLayout = layout;
  },

  drawNode(ctx, x, y, baseRadius, node) {
    const latency = window.NG_State.relayLatency[node.relay];
    const scale = 1 + node.centrality * 2;
    const r = baseRadius * scale;

    ctx.beginPath();
    ctx.arc(x, y, r * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${haloAlpha(latency)})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = colorForCommunity(node.community);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = colorForRelay(node.relay);
    ctx.stroke();

    if (node.betweenness > 0.1) {
      ctx.beginPath();
      ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,0,0,0.4)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
};
