/**
 * Entity Relationship Visualizer
 * Interactive visualization of biblical entity relationships
 * Uses D3.js for network graph visualization
 */

class EntityRelationshipVisualizer {
  constructor(containerId) {
    this.container = containerId;
    this.width = 600;
    this.height = 400;
    this.svg = null;
    this.simulation = null;
    this.currentEntity = null;
    this.relationships = [];
    this.nodes = [];
    this.links = [];
    
    // Color scheme for different relationship types
    this.relationshipColors = {
      'family': '#e74c3c',
      'spouse': '#e91e63',
      'parent': '#9c27b0',
      'child': '#673ab7',
      'sibling': '#3f51b5',
      'ancestor': '#2196f3',
      'descendant': '#03a9f4',
      'friend': '#00bcd4',
      'enemy': '#ff5722',
      'ruler': '#ff9800',
      'subject': '#ffc107',
      'mentor': '#4caf50',
      'student': '#8bc34a',
      'colleague': '#cddc39',
      'associate': '#607d8b',
      'default': '#9e9e9e'
    };
    
    this.init();
  }

  init() {
    this.createVisualization();
    this.setupStyles();
  }

  createVisualization() {
    const container = document.getElementById(this.container);
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Create main container
    const vizContainer = document.createElement('div');
    vizContainer.className = 'relationship-visualizer';
    vizContainer.innerHTML = `
      <div class="viz-header">
        <h4>Relationship Network</h4>
        <div class="viz-controls">
          <button class="viz-btn" onclick="this.parentNode.parentNode.parentNode.querySelector('.entity-relationship-visualizer').resetZoom()">Reset View</button>
          <button class="viz-btn" onclick="this.parentNode.parentNode.parentNode.querySelector('.entity-relationship-visualizer').expandNetwork()">Expand Network</button>
        </div>
      </div>
      <div class="viz-content">
        <svg class="relationship-svg" width="${this.width}" height="${this.height}"></svg>
        <div class="viz-legend">
          <div class="legend-title">Relationship Types</div>
          <div class="legend-items" id="legendItems"></div>
        </div>
      </div>
      <div class="viz-info">
        <div class="selected-info" id="selectedInfo">
          <span class="info-hint">Click on a node to see details</span>
        </div>
      </div>
    `;

    container.appendChild(vizContainer);
    this.svg = d3.select(container).select('.relationship-svg');
    
    // Add zoom and pan
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        this.svg.select('.graph-container')
          .attr('transform', event.transform);
      });
    
    this.svg.call(zoom);

    // Create main graph container
    this.svg.append('g').attr('class', 'graph-container');
  }

  setupStyles() {
    if (document.getElementById('relationship-viz-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'relationship-viz-styles';
    styles.textContent = `
      .relationship-visualizer {
        background: var(--card, #ffffff);
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 8px;
        margin: 1rem 0;
        overflow: hidden;
      }

      .viz-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--bg-secondary, #f8fafc);
        border-bottom: 1px solid var(--border, #e5e7eb);
      }

      .viz-header h4 {
        margin: 0;
        color: var(--text, #111827);
        font-size: 1.1rem;
        font-weight: 600;
      }

      .viz-controls {
        display: flex;
        gap: 0.5rem;
      }

      .viz-btn {
        background: var(--accent, #2563eb);
        color: white;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .viz-btn:hover {
        background: var(--accent-hover, #1d4ed8);
      }

      .viz-content {
        display: flex;
        position: relative;
      }

      .relationship-svg {
        flex: 1;
        background: var(--bg-tertiary, #fafafa);
        cursor: move;
      }

      .viz-legend {
        width: 180px;
        padding: 1rem;
        background: var(--bg-secondary, #f8fafc);
        border-left: 1px solid var(--border, #e5e7eb);
        font-size: 0.85rem;
      }

      .legend-title {
        font-weight: 600;
        color: var(--text, #111827);
        margin-bottom: 0.5rem;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0;
      }

      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .legend-label {
        color: var(--text-secondary, #6b7280);
        font-size: 0.8rem;
        text-transform: capitalize;
      }

      .viz-info {
        padding: 0.75rem 1rem;
        background: var(--bg-secondary, #f8fafc);
        border-top: 1px solid var(--border, #e5e7eb);
        min-height: 3rem;
      }

      .selected-info {
        color: var(--text-secondary, #6b7280);
        font-size: 0.85rem;
      }

      .info-hint {
        font-style: italic;
      }

      .node-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .node-name {
        font-weight: 600;
        color: var(--text, #111827);
      }

      .node-type {
        background: var(--accent-alpha-10, rgba(37, 99, 235, 0.1));
        color: var(--accent, #2563eb);
        padding: 0.1rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
        display: inline-block;
        margin-right: 0.5rem;
      }

      /* Node and link styles */
      .node {
        cursor: pointer;
        stroke: #fff;
        stroke-width: 2px;
      }

      .node:hover {
        stroke-width: 3px;
        filter: brightness(1.1);
      }

      .node.selected {
        stroke: var(--accent, #2563eb);
        stroke-width: 4px;
      }

      .node.central {
        stroke: var(--accent, #2563eb);
        stroke-width: 3px;
      }

      .link {
        stroke-opacity: 0.6;
        stroke-width: 2px;
      }

      .link:hover {
        stroke-opacity: 0.9;
        stroke-width: 3px;
      }

      .node-label {
        font-size: 12px;
        font-weight: 500;
        fill: var(--text, #111827);
        text-anchor: middle;
        pointer-events: none;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
      }

      .link-label {
        font-size: 10px;
        fill: var(--text-secondary, #6b7280);
        text-anchor: middle;
        pointer-events: none;
        opacity: 0.7;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .relationship-visualizer {
          background: var(--card-dark, #1f2937);
        }
        
        .viz-header {
          background: var(--bg-secondary-dark, #111827);
          border-color: var(--border-dark, #374151);
        }
        
        .relationship-svg {
          background: var(--bg-tertiary-dark, #0f172a);
        }
        
        .node-label {
          fill: var(--text-dark, #f9fafb);
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
      }

      [data-theme="dark"] .relationship-visualizer {
        background: var(--card-dark, #1f2937);
      }
      
      [data-theme="dark"] .viz-header {
        background: var(--bg-secondary-dark, #111827);
        border-color: var(--border-dark, #374151);
      }
      
      [data-theme="dark"] .relationship-svg {
        background: var(--bg-tertiary-dark, #0f172a);
      }
      
      [data-theme="dark"] .node-label {
        fill: var(--text-dark, #f9fafb);
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .viz-content {
          flex-direction: column;
        }
        
        .viz-legend {
          width: 100%;
          border-left: none;
          border-top: 1px solid var(--border, #e5e7eb);
        }
        
        .relationship-svg {
          width: 100%;
          height: 300px;
        }
        
        .viz-controls {
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .viz-btn {
          padding: 0.3rem 0.6rem;
          font-size: 0.7rem;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  loadRelationships(entityData) {
    this.currentEntity = entityData;
    this.relationships = entityData.relations || {};
    
    if (Object.keys(this.relationships).length === 0) {
      this.showEmptyState();
      return;
    }

    this.buildNetworkData();
    this.renderVisualization();
    this.updateLegend();
  }

  buildNetworkData() {
    this.nodes = [];
    this.links = [];
    
    // Central node (current entity)
    this.nodes.push({
      id: this.currentEntity.id,
      name: this.currentEntity.name,
      type: this.currentEntity.type,
      central: true,
      x: this.width / 2,
      y: this.height / 2
    });

    // Add related entities and links
    Object.entries(this.relationships).forEach(([relationType, entities]) => {
      entities.forEach(entityName => {
        const nodeId = `${relationType}-${entityName}`;
        
        // Add entity node
        this.nodes.push({
          id: nodeId,
          name: entityName,
          type: 'related',
          relationType: relationType
        });

        // Add relationship link
        this.links.push({
          source: this.currentEntity.id,
          target: nodeId,
          type: relationType,
          color: this.relationshipColors[relationType] || this.relationshipColors.default
        });
      });
    });
  }

  renderVisualization() {
    const container = this.svg.select('.graph-container');
    container.selectAll('*').remove();

    // Create force simulation
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(25));

    // Render links
    const links = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke', d => d.color);

    // Render link labels
    const linkLabels = container.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(this.links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .text(d => d.type.replace(/_/g, ' '))
      .style('opacity', 0);

    // Render nodes
    const nodes = container.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodes)
      .enter()
      .append('circle')
      .attr('class', d => `node ${d.central ? 'central' : ''}`)
      .attr('r', d => d.central ? 20 : 15)
      .style('fill', d => d.central ? 
        this.relationshipColors.default : 
        this.relationshipColors[d.relationType] || this.relationshipColors.default)
      .call(d3.drag()
        .on('start', (event, d) => this.dragStart(event, d))
        .on('drag', (event, d) => this.dragging(event, d))
        .on('end', (event, d) => this.dragEnd(event, d)))
      .on('click', (event, d) => this.selectNode(d))
      .on('mouseenter', () => linkLabels.style('opacity', 0.8))
      .on('mouseleave', () => linkLabels.style('opacity', 0));

    // Render node labels
    const nodeLabels = container.append('g')
      .attr('class', 'node-labels')
      .selectAll('text')
      .data(this.nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', d => d.central ? 35 : 30)
      .style('font-weight', d => d.central ? '600' : '500')
      .text(d => this.truncateText(d.name, 15));

    // Update positions on simulation tick
    this.simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodes
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      nodeLabels
        .attr('x', d => d.x)
        .attr('y', d => d.y);

      linkLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);
    });
  }

  updateLegend() {
    const legendContainer = document.getElementById('legendItems');
    if (!legendContainer) return;

    const relationTypes = Object.keys(this.relationships);
    const legendHTML = relationTypes.map(type => `
      <div class="legend-item">
        <div class="legend-color" style="background-color: ${this.relationshipColors[type] || this.relationshipColors.default}"></div>
        <span class="legend-label">${type.replace(/_/g, ' ')}</span>
      </div>
    `).join('');

    legendContainer.innerHTML = legendHTML;
  }

  selectNode(node) {
    // Update visual selection
    this.svg.selectAll('.node').classed('selected', false);
    this.svg.selectAll('.node').filter(d => d.id === node.id).classed('selected', true);

    // Update info panel
    const infoPanel = document.getElementById('selectedInfo');
    if (!infoPanel) return;

    if (node.central) {
      infoPanel.innerHTML = `
        <div class="node-details">
          <div class="node-name">${node.name}</div>
          <span class="node-type">${node.type}</span>
          <div>Central entity with ${this.links.length} relationships</div>
        </div>
      `;
    } else {
      infoPanel.innerHTML = `
        <div class="node-details">
          <div class="node-name">${node.name}</div>
          <span class="node-type">${node.relationType.replace(/_/g, ' ')}</span>
          <div>Related to ${this.currentEntity.name} as ${node.relationType.replace(/_/g, ' ')}</div>
        </div>
      `;
    }
  }

  showEmptyState() {
    const container = document.getElementById(this.container);
    if (!container) return;

    container.innerHTML = `
      <div class="relationship-empty">
        <div class="empty-icon">🔗</div>
        <div class="empty-message">
          <h4>No Relationships Found</h4>
          <p>This entity doesn't have documented relationships in our database.</p>
        </div>
      </div>
    `;
  }

  resetZoom() {
    const zoom = d3.zoom().scaleExtent([0.5, 3]);
    this.svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
    );
  }

  expandNetwork() {
    // Future enhancement: load related entities of related entities
    console.log('Expand network functionality to be implemented');
  }

  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Drag handlers
  dragStart(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragging(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragEnd(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

// Make available globally
window.EntityRelationshipVisualizer = EntityRelationshipVisualizer;