/**
 * Client-Side Debug Dashboard
 * Provides a UI for viewing logs, telemetry data, and performance metrics
 */

class DebugDashboard {
  constructor() {
    this.isVisible = false;
    this.refreshInterval = null;
    this.filters = {
      level: 'all',
      category: 'all',
      timeRange: 'session'
    };
    this.init();
  }

  init() {
    // Only initialize if in debug mode
    if (!this.isDebugMode()) return;

    // Add keyboard shortcut to toggle dashboard (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Add debug info to console
    console.log('%c🔍 Explore Scripture Debug Mode Enabled', 'color: #6aa9ff; font-weight: bold;');
    console.log('%c📊 Press Ctrl+Shift+D to open debug dashboard', 'color: #a7b2d6;');
    
    // Create dashboard elements but keep hidden
    this.createDashboard();
  }

  isDebugMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true' || 
           localStorage.getItem('bibleExplorerDebug') === 'true' ||
           window.location.hostname === 'localhost';
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if (!document.getElementById('debug-dashboard')) {
      this.createDashboard();
    }
    
    document.getElementById('debug-dashboard').style.display = 'block';
    this.isVisible = true;
    this.refreshData();
    
    // Start auto-refresh
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, 2000);

    if (document.body) {
      document.body.style.paddingTop = '350px';
    }
  }

  hide() {
    const dashboard = document.getElementById('debug-dashboard');
    if (dashboard) {
      dashboard.style.display = 'none';
    }
    this.isVisible = false;
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    if (document.body) {
      document.body.style.paddingTop = '';
    }
  }

  createDashboard() {
    if (document.getElementById('debug-dashboard')) return;

    const dashboard = document.createElement('div');
    dashboard.id = 'debug-dashboard';
    dashboard.innerHTML = this.getDashboardHTML();

    if (document.body) {
      document.body.appendChild(dashboard);
    } else {
      // Wait for DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.body) document.body.appendChild(dashboard);
        });
      }
    }

    // Add event listeners
    this.attachEventListeners();
  }

  getDashboardHTML() {
    return `
      <div id="debug-dashboard" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 320px;
        background: linear-gradient(135deg, #0b1220 0%, #121a2b 100%);
        border-bottom: 2px solid #6aa9ff;
        color: #e6ecff;
        font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
        font-size: 12px;
        z-index: 10000;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        display: none;
      ">
        <!-- Header -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: rgba(106, 169, 255, 0.1);
          border-bottom: 1px solid #1f2a44;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-weight: bold; color: #6aa9ff;">🔍 Explore Scripture Debug Dashboard</span>
            <button id="debug-export-logs" style="
              background: #6aa9ff;
              color: #0b1220;
              border: none;
              padding: 4px 8px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 10px;
            ">Export Logs</button>
            <button id="debug-clear-logs" style="
              background: #ff6b6b;
              color: white;
              border: none;
              padding: 4px 8px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 10px;
            ">Clear</button>
          </div>
          <button id="debug-close" style="
            background: none;
            border: none;
            color: #a7b2d6;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
          ">✕</button>
        </div>

        <!-- Controls -->
        <div style="
          display: flex;
          gap: 16px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid #1f2a44;
          align-items: center;
        ">
          <label style="display: flex; align-items: center; gap: 4px;">
            Level:
            <select id="debug-level-filter" style="
              background: #121a2b;
              color: #e6ecff;
              border: 1px solid #1f2a44;
              padding: 2px 4px;
              font-size: 10px;
            ">
              <option value="all">All</option>
              <option value="ERROR">Error</option>
              <option value="WARN">Warning</option>
              <option value="INFO">Info</option>
              <option value="DEBUG">Debug</option>
            </select>
          </label>
          <label style="display: flex; align-items: center; gap: 4px;">
            Category:
            <select id="debug-category-filter" style="
              background: #121a2b;
              color: #e6ecff;
              border: 1px solid #1f2a44;
              padding: 2px 4px;
              font-size: 10px;
            ">
              <option value="all">All</option>
            </select>
          </label>
          <span id="debug-stats" style="color: #a7b2d6; font-size: 10px;"></span>
        </div>

        <!-- Tabs -->
        <div style="
          display: flex;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid #1f2a44;
        ">
          <button class="debug-tab active" data-tab="logs" style="
            background: none;
            border: none;
            color: #6aa9ff;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 11px;
            border-bottom: 2px solid #6aa9ff;
          ">Logs</button>
          <button class="debug-tab" data-tab="telemetry" style="
            background: none;
            border: none;
            color: #a7b2d6;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 11px;
            border-bottom: 2px solid transparent;
          ">Telemetry</button>
          <button class="debug-tab" data-tab="performance" style="
            background: none;
            border: none;
            color: #a7b2d6;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 11px;
            border-bottom: 2px solid transparent;
          ">Performance</button>
          <button class="debug-tab" data-tab="session" style="
            background: none;
            border: none;
            color: #a7b2d6;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 11px;
            border-bottom: 2px solid transparent;
          ">Session</button>
        </div>

        <!-- Content -->
        <div style="height: calc(100% - 120px); overflow: hidden;">
          <div id="debug-content-logs" class="debug-content" style="
            height: 100%;
            overflow-y: auto;
            padding: 8px;
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 10px;
            line-height: 1.4;
          "></div>
          <div id="debug-content-telemetry" class="debug-content" style="
            height: 100%;
            overflow-y: auto;
            padding: 8px;
            display: none;
          "></div>
          <div id="debug-content-performance" class="debug-content" style="
            height: 100%;
            overflow-y: auto;
            padding: 8px;
            display: none;
          "></div>
          <div id="debug-content-session" class="debug-content" style="
            height: 100%;
            overflow-y: auto;
            padding: 8px;
            display: none;
          "></div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Close button
    const closeBtn = document.getElementById('debug-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // Export logs
    const exportBtn = document.getElementById('debug-export-logs');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (window.logger) {
          window.logger.exportLogs();
        }
      });
    }

    // Clear logs
    const clearBtn = document.getElementById('debug-clear-logs');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (window.logger) {
          window.logger.clearLogs();
          this.refreshData();
        }
      });
    }

    // Filters
    const levelFilter = document.getElementById('debug-level-filter');
    if (levelFilter) {
      levelFilter.addEventListener('change', (e) => {
        this.filters.level = e.target.value;
        this.refreshData();
      });
    }

    const categoryFilter = document.getElementById('debug-category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.refreshData();
      });
    }

    // Tabs
    document.querySelectorAll('.debug-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }

  switchTab(tabName) {
    // Update tab appearance
    document.querySelectorAll('.debug-tab').forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.style.color = '#6aa9ff';
        tab.style.borderBottomColor = '#6aa9ff';
      } else {
        tab.style.color = '#a7b2d6';
        tab.style.borderBottomColor = 'transparent';
      }
    });

    // Show/hide content
    document.querySelectorAll('.debug-content').forEach(content => {
      content.style.display = 'none';
    });
    
    const activeContent = document.getElementById(`debug-content-${tabName}`);
    if (activeContent) {
      activeContent.style.display = 'block';
    }

    // Refresh content for active tab
    this.refreshTabContent(tabName);
  }

  refreshData() {
    const activeTab = document.querySelector('.debug-tab[style*="color: rgb(106, 169, 255)"]');
    const tabName = activeTab ? activeTab.dataset.tab : 'logs';
    this.refreshTabContent(tabName);
    this.updateFilters();
    this.updateStats();
  }

  refreshTabContent(tabName) {
    switch (tabName) {
      case 'logs':
        this.refreshLogsTab();
        break;
      case 'telemetry':
        this.refreshTelemetryTab();
        break;
      case 'performance':
        this.refreshPerformanceTab();
        break;
      case 'session':
        this.refreshSessionTab();
        break;
    }
  }

  refreshLogsTab() {
    const content = document.getElementById('debug-content-logs');
    if (!content || !window.logger) return;

    const logs = window.logger.getLogs();
    const filteredLogs = this.filterLogs(logs);

    content.innerHTML = filteredLogs.slice(-100).map(log => {
      const levelColors = {
        ERROR: '#ff4444',
        WARN: '#ffaa00',
        INFO: '#0088cc',
        DEBUG: '#888888',
        TRACE: '#666666'
      };

      const color = levelColors[log.level] || '#a7b2d6';
      const time = new Date(log.timestamp).toLocaleTimeString();
      
      return `
        <div style="margin-bottom: 4px; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div style="display: flex; gap: 8px; align-items: flex-start;">
            <span style="color: #666; width: 70px; flex-shrink: 0;">${time}</span>
            <span style="color: ${color}; width: 50px; flex-shrink: 0; font-weight: bold;">${this.escapeHtml(log.level)}</span>
            <span style="color: #9dd1ff; width: 80px; flex-shrink: 0;">${this.escapeHtml(log.category)}</span>
            <span style="color: #e6ecff; flex: 1;">${this.escapeHtml(log.message)}</span>
          </div>
          ${Object.keys(log.data).length > 0 ? 
            `<div style="margin-left: 210px; color: #a7b2d6; font-size: 9px; margin-top: 2px;">
              ${this.escapeHtml(JSON.stringify(log.data, null, 2).substring(0, 200))}${Object.keys(log.data).length > 3 ? '...' : ''}
            </div>` : ''
          }
        </div>
      `;
    }).join('');

    // Auto-scroll to bottom
    content.scrollTop = content.scrollHeight;
  }

  refreshTelemetryTab() {
    const content = document.getElementById('debug-content-telemetry');
    if (!content || !window.telemetry) return;

    const summary = window.telemetry.getSessionSummary ? window.telemetry.getSessionSummary() : {};
    
    content.innerHTML = `
      <div style="color: #e6ecff; line-height: 1.6;">
        <h4 style="color: #6aa9ff; margin: 0 0 12px 0;">Telemetry Summary</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <strong style="color: #9dd1ff;">Session Info:</strong><br>
            Session ID: <span style="color: #a7b2d6;">${summary.sessionId || 'N/A'}</span><br>
            Duration: <span style="color: #a7b2d6;">${this.formatDuration(summary.sessionDuration || 0)}</span><br>
            Service: <span style="color: #a7b2d6;">bible-explorer-web</span><br>
            Environment: <span style="color: #a7b2d6;">${window.telemetry.environment || 'unknown'}</span>
          </div>
          <div>
            <strong style="color: #9dd1ff;">Metrics:</strong><br>
            Total Logs: <span style="color: #a7b2d6;">${summary.totalLogs || 0}</span><br>
            Errors: <span style="color: #ff4444;">${summary.errors || 0}</span><br>
            Warnings: <span style="color: #ffaa00;">${summary.warnings || 0}</span>
          </div>
        </div>
        
        ${summary.logsByLevel ? `
          <div style="margin-top: 16px;">
            <strong style="color: #9dd1ff;">Logs by Level:</strong><br>
            ${Object.entries(summary.logsByLevel).map(([level, count]) => 
              `<span style="color: #a7b2d6;">${level}: ${count}</span>`
            ).join(' • ')}
          </div>
        ` : ''}
        
        ${summary.logsByCategory ? `
          <div style="margin-top: 16px;">
            <strong style="color: #9dd1ff;">Logs by Category:</strong><br>
            ${Object.entries(summary.logsByCategory).map(([category, count]) => 
              `<span style="color: #a7b2d6;">${category}: ${count}</span>`
            ).join(' • ')}
          </div>
        ` : ''}
      </div>
    `;
  }

  refreshPerformanceTab() {
    const content = document.getElementById('debug-content-performance');
    if (!content) return;

    // Get performance data
    const perfData = performance.getEntriesByType('navigation')[0];
    const memoryInfo = (performance as any).memory || {};

    content.innerHTML = `
      <div style="color: #e6ecff; line-height: 1.6;">
        <h4 style="color: #6aa9ff; margin: 0 0 12px 0;">Performance Metrics</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div>
            <strong style="color: #9dd1ff;">Page Load:</strong><br>
            DOM Ready: <span style="color: #a7b2d6;">${this.formatDuration(perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart || 0)}</span><br>
            Load Complete: <span style="color: #a7b2d6;">${this.formatDuration(perfData?.loadEventEnd - perfData?.loadEventStart || 0)}</span><br>
            Total Time: <span style="color: #a7b2d6;">${this.formatDuration(perfData?.loadEventEnd - perfData?.fetchStart || 0)}</span>
          </div>
          <div>
            <strong style="color: #9dd1ff;">Network:</strong><br>
            DNS Lookup: <span style="color: #a7b2d6;">${this.formatDuration(perfData?.domainLookupEnd - perfData?.domainLookupStart || 0)}</span><br>
            Server Response: <span style="color: #a7b2d6;">${this.formatDuration(perfData?.responseEnd - perfData?.requestStart || 0)}</span>
          </div>
        </div>
        
        ${Object.keys(memoryInfo).length > 0 ? `
          <div>
            <strong style="color: #9dd1ff;">Memory Usage:</strong><br>
            Used: <span style="color: #a7b2d6;">${this.formatBytes(memoryInfo.usedJSHeapSize || 0)}</span><br>
            Total: <span style="color: #a7b2d6;">${this.formatBytes(memoryInfo.totalJSHeapSize || 0)}</span><br>
            Limit: <span style="color: #a7b2d6;">${this.formatBytes(memoryInfo.jsHeapSizeLimit || 0)}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  refreshSessionTab() {
    const content = document.getElementById('debug-content-session');
    if (!content) return;

    const sessionData = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      cookiesEnabled: navigator.cookieEnabled,
      language: navigator.language,
      platform: navigator.platform,
      onLine: navigator.onLine,
      timestamp: new Date().toISOString()
    };

    content.innerHTML = `
      <div style="color: #e6ecff; line-height: 1.6;">
        <h4 style="color: #6aa9ff; margin: 0 0 12px 0;">Session Information</h4>
        
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; font-size: 10px;">
          <span style="color: #9dd1ff;">URL:</span>
          <span style="color: #a7b2d6; word-break: break-all;">${sessionData.url}</span>
          
          <span style="color: #9dd1ff;">Screen:</span>
          <span style="color: #a7b2d6;">${sessionData.screen}</span>
          
          <span style="color: #9dd1ff;">Viewport:</span>
          <span style="color: #a7b2d6;">${sessionData.viewport}</span>
          
          <span style="color: #9dd1ff;">Language:</span>
          <span style="color: #a7b2d6;">${sessionData.language}</span>
          
          <span style="color: #9dd1ff;">Platform:</span>
          <span style="color: #a7b2d6;">${sessionData.platform}</span>
          
          <span style="color: #9dd1ff;">Online:</span>
          <span style="color: ${sessionData.onLine ? '#4ade80' : '#ff4444'};">${sessionData.onLine ? 'Yes' : 'No'}</span>
          
          <span style="color: #9dd1ff;">Cookies:</span>
          <span style="color: ${sessionData.cookiesEnabled ? '#4ade80' : '#ff4444'};">${sessionData.cookiesEnabled ? 'Enabled' : 'Disabled'}</span>
          
          <span style="color: #9dd1ff;">User Agent:</span>
          <span style="color: #a7b2d6; font-size: 9px; word-break: break-all;">${sessionData.userAgent}</span>
        </div>
      </div>
    `;
  }

  updateFilters() {
    if (!window.logger) return;

    const categoryFilter = document.getElementById('debug-category-filter');
    if (!categoryFilter) return;

    // Get unique categories
    const logs = window.logger.getLogs();
    const categories = [...new Set(logs.map(log => log.category))];
    
    // Update category filter options
    const currentValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">All</option>' +
      categories.map(cat => `<option value="${this.escapeHtml(cat)}">${this.escapeHtml(cat)}</option>`).join('');
    categoryFilter.value = currentValue;
  }

  updateStats() {
    if (!window.logger) return;

    const statsElement = document.getElementById('debug-stats');
    if (!statsElement) return;

    const logs = window.logger.getLogs();
    const filteredLogs = this.filterLogs(logs);
    
    statsElement.textContent = `${filteredLogs.length} / ${logs.length} logs`;
  }

  filterLogs(logs) {
    return logs.filter(log => {
      if (this.filters.level !== 'all' && log.level !== this.filters.level) {
        return false;
      }
      if (this.filters.category !== 'all' && log.category !== this.filters.category) {
        return false;
      }
      return true;
    });
  }

  formatDuration(ms) {
    if (ms < 1000) return Math.round(ms) + 'ms';
    return (ms / 1000).toFixed(1) + 's';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Utility method to escape HTML and prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize debug dashboard
if (typeof window !== 'undefined') {
  window.debugDashboard = new DebugDashboard();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DebugDashboard;
}