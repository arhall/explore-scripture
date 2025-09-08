// Use globally loaded D3.js
const d3 = window.d3;

const COLORS = {
  defaultNode: "#4B5563",
  leafNode: "#A3A3A3",
  link: "#D1D5DB",
  focus: "#111827",
  tribes: {
    Judah: "#8B5CF6",
    Levi: "#10B981",
    Israel: "#2563EB",
  },
};

class GenealogyExplorer extends HTMLElement {
  static observedAttributes = ["data-src", "default-root", "mode"];
  constructor() {
    super();
    // Don't use Shadow DOM to avoid D3 compatibility issues
    this.state = {
      data: [],
      byId: new Map(),
      mode: this.getAttribute("mode") || "descendants",
      rootId: this.getAttribute("default-root") || "abram",
      query: "",
    };
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback() {
    this.renderShell();
    
    // Check if D3 is available
    if (!d3) {
      console.error('[GenealogyExplorer] D3.js not available');
      this.renderError('D3.js library not loaded');
      return;
    }
    
    this.loadData().then(() => {
      this.buildIndex();
      this.renderTree();
      window.addEventListener("keydown", this._onKey);
    }).catch(error => {
      console.error('[GenealogyExplorer] Failed to initialize:', error);
      this.renderError('Failed to load genealogy data: ' + error.message);
    });
  }
  disconnectedCallback() {
    window.removeEventListener("keydown", this._onKey);
  }
  attributeChangedCallback() {}

  async loadData() {
    const src = this.getAttribute("data-src");
    if (src) {
      const res = await fetch(src);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      this.state.data = await res.json();
    } else {
      // Inline <script type="application/json"> next to this element
      const id = this.getAttribute("for") || this.getAttribute("id") || this.getAttribute("data-inline-id");
      const inline = document.querySelector(`#${id}-data`) || document.querySelector("script[type='application/json']");
      this.state.data = inline ? JSON.parse(inline.textContent) : [];
    }
  }

  buildIndex() {
    this.state.byId = new Map(this.state.data.map((d) => [d.id, d]));
    if (!this.state.byId.has(this.state.rootId)) {
      // attempt to pick a sensible root
      const guess = this.state.byId.has("jesus") ? "jesus" : this.state.data[0]?.id;
      if (guess) this.state.rootId = guess;
    }

    // URL hash: #root=abram&mode=descendants&query=david
    const params = new URLSearchParams(location.hash.slice(1));
    if (params.get("root")) this.state.rootId = params.get("root");
    if (params.get("mode")) this.state.mode = params.get("mode");
    if (params.get("query")) this.state.query = params.get("query");
  }

  renderShell() {
    const style = `
      :host{--bg: #fff; --fg: #111827; --muted:#6B7280; --ring:#E5E7EB; --chip:#F3F4F6; --accent:#111827; display:block}
      @media(prefers-color-scheme:dark){:host{--bg:#0b0f19;--fg:#E5E7EB;--muted:#9CA3AF;--ring:#1F2937;--chip:#111827;--accent:#E5E7EB}}
      .wrap{background:var(--bg); color:var(--fg); height:100%; width:100%; border:1px solid var(--ring); border-radius:16px; box-shadow:0 1px 8px rgba(0,0,0,.05); overflow:hidden}
      .toolbar{display:flex; gap:.5rem; align-items:center; padding:.75rem .75rem; border-bottom:1px solid var(--ring)}
      .title{font-weight:600}
      .spacer{flex:1}
      select,input,button{font:inherit}
      .ctl{border:1px solid var(--ring); background:var(--chip); color:var(--fg); border-radius:12px; padding:.45rem .6rem}
      .btn{background:var(--accent); color:var(--bg); border-radius:12px; padding:.45rem .8rem; border:0; cursor:pointer}
      .legend{display:flex; gap:.5rem; align-items:center; font-size:.85rem; color:var(--muted)}
      .legend i{display:inline-block; width:.75rem; height:.75rem; border-radius:999px; margin-right:.35rem}
      .canvas{position:relative; height:calc(100% - 56px)}
      .tip{position:fixed; pointer-events:none; background:rgba(255,255,255,.9); color:#111; border:1px solid #e5e7eb; padding:.5rem .6rem; border-radius:10px; box-shadow:0 6px 24px rgba(0,0,0,.12)}
      @media(prefers-color-scheme:dark){.tip{background:rgba(17,24,39,.9); color:#E5E7EB; border-color:#374151}}
    `;

    this.innerHTML = `
      <style>${style}</style>
      <div class="wrap">
        <div class="toolbar">
          <div class="title">Biblical Genealogy Explorer</div>
          <div class="legend" title="Color hints">
            <span><i style="background:${COLORS.tribes.Judah}"></i>Judah</span>
            <span><i style="background:${COLORS.tribes.Levi}"></i>Levi</span>
            <span><i style="background:${COLORS.tribes.Israel}"></i>Israel</span>
          </div>
          <div class="spacer"></div>
          <select class="ctl" id="mode">
            <option value="descendants">Descendants</option>
            <option value="ancestors">Ancestors</option>
          </select>
          <input class="ctl" id="search" placeholder="Search (e.g., David)" />
          <button class="btn" id="export">Export PNG</button>
        </div>
        <div class="canvas">
          <svg id="svg" width="100%" height="100%"></svg>
        </div>
      </div>
    `;
  }

  buildHierarchy(rootId, mode) {
    const relKey = mode === "ancestors" ? "parents" : "children";
    const visit = (id, seen = new Set()) => {
      const me = this.state.byId.get(id);
      if (!me || seen.has(id)) return null;
      seen.add(id);
      const kids = (me[relKey] || []).filter((k) => this.state.byId.has(k));
      return { ...me, children: kids.map((k) => visit(k, seen)).filter(Boolean) };
    };
    const root = visit(rootId);
    return d3.hierarchy(root);
  }

  renderTree() {
    const svgEl = this.querySelector("svg#svg");
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const W = this.clientWidth || 900;
    const H = this.clientHeight || 600;
    svg.attr("viewBox", [0, 0, W, H]);

    const modeSel = this.querySelector("#mode");
    modeSel.value = this.state.mode;
    const search = this.querySelector("#search");
    search.value = this.state.query;

    const root = this.buildHierarchy(this.state.rootId, this.state.mode);
    if (!root) return this.renderEmpty(svg);

    // Collapse all except root
    root.each((d) => (d._children = d.children));
    root.children = root._children; // show first layer by default

    const g = svg.append("g").attr("transform", `translate(80,${H / 2})`);
    const linkG = g.append("g").attr("fill", "none").attr("stroke", COLORS.link).attr("stroke-width", 1.25);
    const nodeG = g.append("g").attr("stroke-linejoin", "round").attr("stroke-width", 1.5);

    const tree = d3.tree().nodeSize([28, 240]);

    const diagonal = d3.linkHorizontal().x((d) => d.y).y((d) => d.x);

    function colorFor(d) {
      const tribe = d.data.tribe;
      if (tribe && COLORS.tribes[tribe]) return COLORS.tribes[tribe];
      return d.children || d._children ? COLORS.defaultNode : COLORS.leafNode;
    }

    const update = (source) => {
      tree(root);
      const nodes = root.descendants().reverse();
      const links = root.links();

      let left = root, right = root;
      root.eachBefore((n) => { if (n.x < left.x) left = n; if (n.x > right.x) right = n; });
      const heightNeeded = Math.max(600, right.x - left.x + 80);
      svg.attr("height", heightNeeded);

      const t = svg.transition().duration(400);

      const node = nodeG.selectAll("g.node").data(nodes, (d) => d.data.id);
      const nodeEnter = node.enter().append("g").attr("class", "node")
        .attr("transform", `translate(${source.y0 || 0},${source.x0 || 0})`)
        .on("click", (event, d) => { d.children = d.children ? null : d._children; update(d); })
        .on("mousemove", (event, d) => showTip(event, d.data))
        .on("mouseleave", hideTip);

      nodeEnter.append("circle").attr("r", 7).attr("fill", colorFor).attr("stroke", COLORS.focus);
      nodeEnter.append("text")
        .attr("dy", "0.32em").attr("x", 12).attr("text-anchor", "start")
        .text((d) => d.data.name)
        .clone(true).lower().attr("stroke", "white");

      node.merge(nodeEnter).transition(t).attr("transform", (d) => `translate(${d.y},${d.x})`);
      node.exit().transition(t).remove().attr("transform", (d) => `translate(${source.y},${source.x})`).select("circle").attr("r", 1e-6);

      const link = linkG.selectAll("path").data(links, (d) => d.target.data.id);
      link.enter().append("path").attr("d", (d) => diagonal({ source: { x: source.x0 || 0, y: source.y0 || 0 }, target: { x: source.x0 || 0, y: source.y0 || 0 } }))
        .merge(link).transition(t).attr("d", diagonal);
      link.exit().transition(t).remove().attr("d", (d) => diagonal({ source: { x: source.x, y: source.y }, target: { x: source.x, y: source.y } }));

      root.eachBefore((d) => { d.x0 = d.x; d.y0 = d.y; });
    };

    // Tooltip
    const tip = d3.select(this).append("div").attr("class", "tip").style("display", "none");
    const showTip = (event, data) => {
      const { clientX:x, clientY:y } = event;
      tip.style("display", "block").style("left", x + 12 + "px").style("top", y + 12 + "px").html(`
        <div style="font-weight:600">${data.name}</div>
        ${data.aka ? `<div style='font-size:.85rem;color:#6B7280'>aka: ${data.aka.join(", ")}</div>`: ""}
        ${data.role ? `<div style='font-size:.85rem;color:#6B7280'>Role: ${data.role}</div>`: ""}
        ${data.tribe ? `<div style='font-size:.85rem;color:#6B7280'>Tribe: ${data.tribe}</div>`: ""}
        ${data.spouses ? `<div style='font-size:.85rem;color:#6B7280'>Spouses: ${data.spouses.join(", ")}</div>`: ""}
        ${data.verses ? `<div style='font-size:.85rem;color:#6B7280'>Refs: ${data.verses.join("; ")}</div>`: ""}
      `);
    };
    const hideTip = () => tip.style("display", "none");

    // Zoom/pan
    const zoom = d3.zoom().scaleExtent([0.3, 2.5]).on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    // Controls
    this.querySelector("#mode").onchange = (e) => { this.state.mode = e.target.value; this.pushHash(); this.renderTree(); };
    this.querySelector("#search").onchange = (e) => { this.state.query = e.target.value; this.centerOnQuery(g, svg); this.pushHash(); };
    this.querySelector("#export").onclick = () => this.exportPng(svgEl);

    update(root);

    // Center first view
    svg.transition().duration(350).call(zoom.transform, d3.zoomIdentity.translate(80, H/2));
  }

  centerOnQuery(g, svg) {
    const q = (this.state.query || "").toLowerCase().trim();
    if (!q) return;
    const root = this.buildHierarchy(this.state.rootId, this.state.mode);
    const hit = root.descendants().find((d) => (d.data.name || "").toLowerCase().includes(q));
    if (!hit) return;
    const { x, y } = hit;
    const H = this.clientHeight || 600;
    svg.transition().duration(400).call(d3.zoom().transform, d3.zoomIdentity.translate(120 - y, H/2 - x).scale(1));
  }

  pushHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    params.set("root", this.state.rootId);
    params.set("mode", this.state.mode);
    if (this.state.query) params.set("query", this.state.query); else params.delete("query");
    history.replaceState(null, "", `#${params.toString()}`);
  }

  _onKey(e) {
    if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Enter"].includes(e.key)) {
      // Future: maintain a focused node; for now, just prevent scroll when svg focused
      if (document.activeElement === this.querySelector("#search")) return;
      e.preventDefault();
    }
  }

  renderEmpty(svg) {
    svg.append("text").attr("x", 20).attr("y", 40).text("No data").attr("fill", "#9CA3AF");
  }

  renderError(customMessage = null) {
    const canvas = this.querySelector('.canvas');
    if (canvas) {
      const errorMessage = customMessage || 'Unable to load the genealogy explorer. Please check your internet connection and try again.';
      canvas.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
          <h3 style="margin: 0 0 0.5rem 0; color: #dc2626;">Failed to Load Genealogy Explorer</h3>
          <p style="margin: 0 0 1rem 0; color: #6b7280;">${errorMessage}</p>
          <button onclick="location.reload()" style="background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
            Retry
          </button>
        </div>
      `;
    }
  }

  exportPng(svgEl) {
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svgEl.clientWidth || 1200;
      canvas.height = svgEl.clientHeight || 800;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--bg") || "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `genealogy-${this.state.rootId}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }
}

customElements.define("genealogy-explorer", GenealogyExplorer);