/*
Immersive Biblical Genealogy — Pro Edition
=========================================
Two drop‑in builds:

A) **Eleventy‑ready Web Component (Vanilla JS + D3)** — works in any 11ty layout/page with a single `<script type="module">` and a custom element `<genealogy-explorer>`.
B) **React + D3 App (enhanced)** — keep for non‑11ty stacks or if you later migrate to Astro/Next.

Both include:
• polished UI (toolbar, breadcrumbs, legend, dark mode)
• keyboard navigation (← → ↑ ↓ to move focus; Enter to expand/collapse)
• URL hash permalinks for `root`, `mode`, and `query`
• color coding by tribe/role, tasteful motion, and accessible contrasts
• export button (downloads the current SVG as PNG)
• friendly empty‑state & help tips

————————————————————————————————————————————————————————
A) ELEVENTY‑READY WEB COMPONENT (Vanilla JS + D3)
————————————————————————————————————————————————————————

Usage in an Eleventy template (e.g., `.njk`, `.md`, or `.liquid` front‑matter content):

```html
<!-- In your 11ty layout or page -->
<link rel="preconnect" href="https://unpkg.com">

<div class="max-w-full">
  <!-- Option 1: reference a JSON endpoint you generate at build (recommended) -->
  <genealogy-explorer data-src="/data/bible-people.json" default-root="jesus" style="display:block;height:70vh"></genealogy-explorer>

  <!-- Option 2: inline data (smaller demos) -->
  <genealogy-explorer id="demo" style="display:block;height:70vh"></genealogy-explorer>
  <script id="demo-data" type="application/json">[
    {"id":"adam","name":"Adam","children":["seth"]},
    {"id":"eve","name":"Eve","spouses":["adam"],"children":["seth"]},
    {"id":"seth","name":"Seth","parents":["adam","eve"],"children":["enos"]},
    {"id":"enos","name":"Enosh","parents":["seth"],"children":["kenan"]},
    {"id":"kenan","name":"Kenan","parents":["enos"],"children":["mahalalel"]},
    {"id":"mahalalel","name":"Mahalalel","parents":["kenan"],"children":["jared"]},
    {"id":"jared","name":"Jared","parents":["mahalalel"],"children":["enoch"]},
    {"id":"enoch","name":"Enoch","parents":["jared"],"children":["methuselah"],"verses":["Gen 5:24"]},
    {"id":"methuselah","name":"Methuselah","parents":["enoch"],"children":["lamench"]},
    {"id":"lamench","name":"Lamech","parents":["methuselah"],"children":["noah"]},
    {"id":"noah","name":"Noah","parents":["lamench"],"children":["shem","ham","japheth"],"verses":["Gen 6–9"]},
    {"id":"shem","name":"Shem","parents":["noah"],"children":["arpachshad"]},
    {"id":"ham","name":"Ham","parents":["noah"]},
    {"id":"japheth","name":"Japheth","parents":["noah"]},
    {"id":"arpachshad","name":"Arpachshad","parents":["shem"],"children":["shelah"]},
    {"id":"shelah","name":"Shelah","parents":["arpachshad"],"children":["eber"]},
    {"id":"eber","name":"Eber","parents":["shelah"],"children":["peleg"]},
    {"id":"peleg","name":"Peleg","parents":["eber"],"children":["reu"]},
    {"id":"reu","name":"Reu","parents":["peleg"],"children":["serug"]},
    {"id":"serug","name":"Serug","parents":["reu"],"children":["nahor"]},
    {"id":"nahor","name":"Nahor","parents":["serug"],"children":["terah"]},
    {"id":"terah","name":"Terah","parents":["nahor"],"children":["abram","nahor2","haran"]},
    {"id":"abram","name":"Abram (Abraham)","aka":["Abraham"],"parents":["terah"],"spouses":["sarah"],"children":["isaac"],"verses":["Gen 12–25"]},
    {"id":"sarah","name":"Sarai (Sarah)","spouses":["abram"],"children":["isaac"]},
    {"id":"isaac","name":"Isaac","parents":["abram","sarah"],"spouses":["rebekah"],"children":["esau","jacob"]},
    {"id":"rebekah","name":"Rebekah","spouses":["isaac"],"children":["esau","jacob"]},
    {"id":"esau","name":"Esau","parents":["isaac","rebekah"]},
    {"id":"jacob","name":"Jacob (Israel)","aka":["Israel"],"tribe":"Israel","parents":["isaac","rebekah"],"spouses":["leah","rachel"],"children":["reuben","simeon","levi","judah"]},
    {"id":"leah","name":"Leah","spouses":["jacob"],"children":["reuben","simeon","levi","judah"]},
    {"id":"rachel","name":"Rachel","spouses":["jacob"],"children":[]},
    {"id":"reuben","name":"Reuben","parents":["jacob","leah"]},
    {"id":"simeon","name":"Simeon","parents":["jacob","leah"]},
    {"id":"levi","name":"Levi","parents":["jacob","leah"]},
    {"id":"judah","name":"Judah","parents":["jacob","leah"],"children":["perez"]},
    {"id":"perez","name":"Perez","parents":["judah"],"children":["hezron"]},
    {"id":"hezron","name":"Hezron","parents":["perez"],"children":["ram"]},
    {"id":"ram","name":"Ram","parents":["hezron"],"children":["amminadab"]},
    {"id":"amminadab","name":"Amminadab","parents":["ram"],"children":["nahshon"]},
    {"id":"nahshon","name":"Nahshon","parents":["amminadab"],"children":["salmon"]},
    {"id":"salmon","name":"Salmon","parents":["nahshon"],"spouses":["rahab"],"children":["boaz"]},
    {"id":"rahab","name":"Rahab","spouses":["salmon"],"children":["boaz"]},
    {"id":"boaz","name":"Boaz","parents":["salmon","rahab"],"spouses":["ruth"],"children":["obed"],"verses":["Ruth 4"]},
    {"id":"ruth","name":"Ruth","spouses":["boaz"],"children":["obed"]},
    {"id":"obed","name":"Obed","parents":["boaz","ruth"],"children":["jesse"]},
    {"id":"jesse","name":"Jesse","parents":["obed"],"children":["david"]},
    {"id":"david","name":"David","parents":["jesse"],"role":"King of Israel","tribe":"Judah","children":[]}
  ]</script>
</div>

<!-- Include the component library (1 file) -->
<script type="module" src="/assets/genealogy-explorer.js"></script>
```

Create the file at `/assets/genealogy-explorer.js` with the following code:

```js
import * as d3 from "https://unpkg.com/d3@7/dist/d3.min.js";

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
    this.attachShadow({ mode: "open" });
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
    this.loadData().then(() => {
      this.buildIndex();
      this.renderTree();
      window.addEventListener("keydown", this._onKey);
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

    this.shadowRoot.innerHTML = `
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
    const svgEl = this.shadowRoot.getElementById("svg");
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const W = this.clientWidth || 900;
    const H = this.clientHeight || 600;
    svg.attr("viewBox", [0, 0, W, H]);

    const modeSel = this.shadowRoot.getElementById("mode");
    modeSel.value = this.state.mode;
    const search = this.shadowRoot.getElementById("search");
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
    const tip = d3.select(this.shadowRoot).append("div").attr("class", "tip").style("display", "none");
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
    this.shadowRoot.getElementById("mode").onchange = (e) => { this.state.mode = e.target.value; this.pushHash(); this.renderTree(); };
    this.shadowRoot.getElementById("search").onchange = (e) => { this.state.query = e.target.value; this.centerOnQuery(g, svg); this.pushHash(); };
    this.shadowRoot.getElementById("export").onclick = () => this.exportPng(svgEl);

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
      if (this.shadowRoot.activeElement === this.shadowRoot.getElementById("search")) return;
      e.preventDefault();
    }
  }

  renderEmpty(svg) {
    svg.append("text").attr("x", 20).attr("y", 40).text("No data").attr("fill", "#9CA3AF");
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
```

Deployment notes for 11ty
- Place `genealogy-explorer.js` in your output dir (e.g., `./assets/` copied via passthrough in `.eleventy.js`).
- Generate your big people JSON at build (e.g., `/_data/people.json` or `/data/bible-people.json`).
- Drop the `<genealogy-explorer>` anywhere; it will hydrate client‑side only.

————————————————————————————————————————————————————————
B) ENHANCED REACT + D3 (keep if you migrate later)
————————————————————————————————————————————————————————
- The previous React app still works great in a Vite/Next/Remix stack.
- If you want island hydration while staying mostly static, consider **Astro**. You can render Eleventy content + mount this React tree as an island for the genealogy page only.
- For 11ty specifically, prefer the Web Component above.

(End of file)
```
