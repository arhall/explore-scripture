/**
 * Global Theme Manager - Professional color themes for the entire site
 * Provides consistent theming across all components
 */

class ThemeManager {
  constructor() {
    this.themes = {
      'light': {
        name: 'Light',
        category: 'Default',
        colors: {
          '--bg': '#ffffff',
          '--card': '#ffffff', 
          '--text': '#111827',
          '--text-secondary': '#6b7280',
          '--accent': '#2563eb',
          '--accent-dark': '#1e40af',
          '--border': '#e5e7eb',
          '--bg-secondary': '#f9fafb',
          '--success': '#10b981',
          '--success-dark': '#059669',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#dc2626'
        }
      },
      'warm': {
        name: 'Warm',
        category: 'Light',
        colors: {
          '--bg': '#fef7ed',
          '--card': '#fffbf5',
          '--text': '#451a03',
          '--text-secondary': '#92400e',
          '--accent': '#ea580c',
          '--accent-dark': '#c2410c',
          '--border': '#fed7aa',
          '--bg-secondary': '#ffedd5',
          '--success': '#059669',
          '--success-dark': '#047857',
          '--warning': '#d97706',
          '--warning-dark': '#b45309',
          '--error': '#dc2626'
        }
      },
      'nature': {
        name: 'Nature',
        category: 'Light',
        colors: {
          '--bg': '#f0fdf4',
          '--card': '#f7fee7',
          '--text': '#14532d',
          '--text-secondary': '#166534',
          '--accent': '#16a34a',
          '--accent-dark': '#15803d',
          '--border': '#bbf7d0',
          '--bg-secondary': '#dcfce7',
          '--success': '#16a34a',
          '--success-dark': '#15803d',
          '--warning': '#ca8a04',
          '--warning-dark': '#a16207',
          '--error': '#dc2626'
        }
      },
      'ocean': {
        name: 'Ocean',
        category: 'Light',
        colors: {
          '--bg': '#f0fdfa',
          '--card': '#f7fffe',
          '--text': '#042f2e',
          '--text-secondary': '#134e4a',
          '--accent': '#14b8a6',
          '--accent-dark': '#0f766e',
          '--border': '#99f6e4',
          '--bg-secondary': '#ccfbf1',
          '--success': '#10b981',
          '--success-dark': '#059669',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#dc2626'
        }
      },
      'slate': {
        name: 'Slate',
        category: 'Dark',
        colors: {
          '--bg': '#0f172a',
          '--card': '#1e293b',
          '--text': '#f1f5f9',
          '--text-secondary': '#cbd5e1',
          '--accent': '#3b82f6',
          '--accent-dark': '#2563eb',
          '--border': '#334155',
          '--bg-secondary': '#334155',
          '--success': '#10b981',
          '--success-dark': '#059669',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#ef4444'
        }
      },
      'charcoal': {
        name: 'Charcoal',
        category: 'Dark',
        colors: {
          '--bg': '#1c1917',
          '--card': '#292524',
          '--text': '#fbbf24',
          '--text-secondary': '#a3a3a3',
          '--accent': '#d97706',
          '--accent-dark': '#b45309',
          '--border': '#44403c',
          '--bg-secondary': '#44403c',
          '--success': '#84cc16',
          '--success-dark': '#65a30d',
          '--warning': '#eab308',
          '--warning-dark': '#ca8a04',
          '--error': '#ef4444'
        }
      },
      'midnight': {
        name: 'Midnight',
        category: 'Dark',
        colors: {
          '--bg': '#0c0a09',
          '--card': '#1c1917',
          '--text': '#fbbf24',
          '--text-secondary': '#d6d3d1',
          '--accent': '#f59e0b',
          '--accent-dark': '#d97706',
          '--border': '#44403c',
          '--bg-secondary': '#292524',
          '--success': '#84cc16',
          '--success-dark': '#65a30d',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#f87171'
        }
      },
      'purple': {
        name: 'Purple',
        category: 'Dark',
        colors: {
          '--bg': '#1e1b4b',
          '--card': '#312e81',
          '--text': '#fbbf24',
          '--text-secondary': '#c7d2fe',
          '--accent': '#7c3aed',
          '--accent-dark': '#6d28d9',
          '--border': '#4c1d95',
          '--bg-secondary': '#4c1d95',
          '--success': '#10b981',
          '--success-dark': '#059669',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#f87171'
        }
      },
      'cream': {
        name: 'Cream',
        category: 'Light',
        colors: {
          '--bg': '#fefcf3',
          '--card': '#ffffff',
          '--text': '#3c2e26',
          '--text-secondary': '#8b7355',
          '--accent': '#c17817',
          '--accent-dark': '#a0620f',
          '--border': '#e8e0d1',
          '--bg-secondary': '#f6f2e8',
          '--success': '#16a34a',
          '--success-dark': '#15803d',
          '--warning': '#d97706',
          '--warning-dark': '#b45309',
          '--error': '#dc2626'
        }
      },
      'coral': {
        name: 'Coral',
        category: 'Light',
        colors: {
          '--bg': '#fef7f0',
          '--card': '#ffffff',
          '--text': '#7c2d12',
          '--text-secondary': '#9a3412',
          '--accent': '#ea580c',
          '--accent-dark': '#c2410c',
          '--border': '#fed7aa',
          '--bg-secondary': '#fff2e8',
          '--success': '#16a34a',
          '--success-dark': '#15803d',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#dc2626'
        }
      },
      'sage': {
        name: 'Sage',
        category: 'Light',
        colors: {
          '--bg': '#f8faf8',
          '--card': '#ffffff',
          '--text': '#1f2937',
          '--text-secondary': '#6b7280',
          '--accent': '#059669',
          '--accent-dark': '#047857',
          '--border': '#d1d5db',
          '--bg-secondary': '#f3f4f6',
          '--success': '#10b981',
          '--success-dark': '#059669',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#dc2626'
        }
      },
      'lavender': {
        name: 'Lavender',
        category: 'Light',
        colors: {
          '--bg': '#faf9ff',
          '--card': '#ffffff',
          '--text': '#4c1d95',
          '--text-secondary': '#7c3aed',
          '--accent': '#8b5cf6',
          '--accent-dark': '#7c3aed',
          '--border': '#e5e7eb',
          '--bg-secondary': '#f3f4f6',
          '--success': '#10b981',
          '--success-dark': '#059669',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#dc2626'
        }
      },
      'stone': {
        name: 'Stone',
        category: 'Dark',
        colors: {
          '--bg': '#1c1917',
          '--card': '#2d2a27',
          '--text': '#e7e5e4',
          '--text-secondary': '#a8a29e',
          '--accent': '#78716c',
          '--accent-dark': '#57534e',
          '--border': '#44403c',
          '--bg-secondary': '#44403c',
          '--success': '#22c55e',
          '--success-dark': '#16a34a',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#ef4444'
        }
      },
      'ember': {
        name: 'Ember',
        category: 'Dark',
        colors: {
          '--bg': '#1f1611',
          '--card': '#2d2216',
          '--text': '#fed7aa',
          '--text-secondary': '#fdba74',
          '--accent': '#f97316',
          '--accent-dark': '#ea580c',
          '--border': '#451a03',
          '--bg-secondary': '#451a03',
          '--success': '#22c55e',
          '--success-dark': '#16a34a',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#f87171'
        }
      },
      'forest': {
        name: 'Forest',
        category: 'Dark',
        colors: {
          '--bg': '#0c1a0c',
          '--card': '#1a2e1a',
          '--text': '#bbf7d0',
          '--text-secondary': '#86efac',
          '--accent': '#22c55e',
          '--accent-dark': '#16a34a',
          '--border': '#14532d',
          '--bg-secondary': '#14532d',
          '--success': '#22c55e',
          '--success-dark': '#16a34a',
          '--warning': '#fbbf24',
          '--warning-dark': '#f59e0b',
          '--error': '#f87171'
        }
      },
      'indigo': {
        name: 'Indigo',
        category: 'Dark',
        colors: {
          '--bg': '#1e1b4b',
          '--card': '#312e81',
          '--text': '#c7d2fe',
          '--text-secondary': '#a5b4fc',
          '--accent': '#6366f1',
          '--accent-dark': '#4f46e5',
          '--border': '#3730a3',
          '--bg-secondary': '#3730a3',
          '--success': '#22c55e',
          '--success-dark': '#16a34a',
          '--warning': '#fbbf24',
          '--warning-dark': '#f59e0b',
          '--error': '#f87171'
        }
      },
      'rose': {
        name: 'Rose',
        category: 'Light',
        colors: {
          '--bg': '#fff1f2',
          '--card': '#ffffff',
          '--text': '#881337',
          '--text-secondary': '#be185d',
          '--accent': '#e11d48',
          '--accent-dark': '#be123c',
          '--border': '#fecdd3',
          '--bg-secondary': '#fdf2f8',
          '--success': '#16a34a',
          '--success-dark': '#15803d',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#dc2626'
        }
      },
      'sky': {
        name: 'Sky',
        category: 'Light',
        colors: {
          '--bg': '#f0f9ff',
          '--card': '#ffffff',
          '--text': '#0c4a6e',
          '--text-secondary': '#0369a1',
          '--accent': '#0ea5e9',
          '--accent-dark': '#0284c7',
          '--border': '#bae6fd',
          '--bg-secondary': '#e0f2fe',
          '--success': '#16a34a',
          '--success-dark': '#15803d',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#dc2626'
        }
      },
      'amber': {
        name: 'Amber',
        category: 'Light',
        colors: {
          '--bg': '#fffbeb',
          '--card': '#ffffff',
          '--text': '#78350f',
          '--text-secondary': '#92400e',
          '--accent': '#f59e0b',
          '--accent-dark': '#d97706',
          '--border': '#fde68a',
          '--bg-secondary': '#fef3c7',
          '--success': '#16a34a',
          '--success-dark': '#15803d',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#dc2626'
        }
      },
      'ruby': {
        name: 'Ruby',
        category: 'Dark',
        colors: {
          '--bg': '#1f0a0a',
          '--card': '#2d1414',
          '--text': '#fecaca',
          '--text-secondary': '#f87171',
          '--accent': '#ef4444',
          '--accent-dark': '#dc2626',
          '--border': '#7f1d1d',
          '--bg-secondary': '#7f1d1d',
          '--success': '#22c55e',
          '--success-dark': '#16a34a',
          '--warning': '#fbbf24',
          '--warning-dark': '#f59e0b',
          '--error': '#f87171'
        }
      },
      'emerald': {
        name: 'Emerald',
        category: 'Dark',
        colors: {
          '--bg': '#022c22',
          '--card': '#064e3b',
          '--text': '#a7f3d0',
          '--text-secondary': '#6ee7b7',
          '--accent': '#10b981',
          '--accent-dark': '#059669',
          '--border': '#065f46',
          '--bg-secondary': '#065f46',
          '--success': '#10b981',
          '--success-dark': '#059669',
          '--warning': '#fbbf24',
          '--warning-dark': '#f59e0b',
          '--error': '#f87171'
        }
      },
      'cyan': {
        name: 'Cyan',
        category: 'Light',
        colors: {
          '--bg': '#ecfeff',
          '--card': '#ffffff',
          '--text': '#083344',
          '--text-secondary': '#155e75',
          '--accent': '#06b6d4',
          '--accent-dark': '#0891b2',
          '--border': '#a5f3fc',
          '--bg-secondary': '#cffafe',
          '--success': '#16a34a',
          '--success-dark': '#15803d',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#dc2626'
        }
      },
      'mint': {
        name: 'Mint',
        category: 'Light',
        colors: {
          '--bg': '#f0fdfa',
          '--card': '#ffffff',
          '--text': '#134e4a',
          '--text-secondary': '#0f766e',
          '--accent': '#14b8a6',
          '--accent-dark': '#0d9488',
          '--border': '#99f6e4',
          '--bg-secondary': '#ccfbf1',
          '--success': '#10b981',
          '--success-dark': '#059669',
          '--warning': '#f59e0b',
          '--warning-dark': '#d97706',
          '--error': '#dc2626'
        }
      }
    };
    
    this.currentTheme = localStorage.getItem('site-theme') || 'slate';
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.restoreHighContrast();
    this.createThemeSwitcher();
  }
  
  restoreHighContrast() {
    try {
      const highContrast = localStorage.getItem('highContrast') === 'true';
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
        
        // Update button if it exists
        const contrastBtn = document.querySelector('.high-contrast-toggle .high-contrast-icon');
        if (contrastBtn) {
          contrastBtn.textContent = '◼';
        }
      }
    } catch (error) {
      console.warn('Failed to restore high contrast preference:', error);
    }
  }

  applyTheme(themeKey) {
    const theme = this.themes[themeKey];
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply theme colors with additional CSS variables
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Add alpha variants for the theme
    const accentColor = theme.colors['--accent'];
    if (accentColor) {
      root.style.setProperty('--accent-alpha-3', this.hexToRgba(accentColor, 0.03));
      root.style.setProperty('--accent-alpha-5', this.hexToRgba(accentColor, 0.05));
      root.style.setProperty('--accent-alpha-10', this.hexToRgba(accentColor, 0.1));
      root.style.setProperty('--accent-alpha-20', this.hexToRgba(accentColor, 0.2));
      root.style.setProperty('--accent-alpha-25', this.hexToRgba(accentColor, 0.25));
      root.style.setProperty('--accent-alpha-30', this.hexToRgba(accentColor, 0.3));
    }
    
    // Update body class for theme-specific styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeKey}`);
    
    // Set data attribute for theme-specific CSS
    root.setAttribute('data-theme', themeKey);
    
    this.currentTheme = themeKey;
    localStorage.setItem('site-theme', themeKey);
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: themeKey, colors: theme.colors } 
    }));
  }
  
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  createThemeSwitcher() {
    // Check if we have a navigation theme button
    const navButton = document.querySelector('.theme-toggle-nav');
    
    if (navButton) {
      // Use navigation integration
      this.createNavigationDropdown();
    } else {
      // Fallback to floating button
      this.createFloatingButton();
    }
    
    // Add CSS if not already present
    this.addStyles();
  }
  
  createNavigationDropdown() {
    // Remove existing dropdown
    const existing = document.getElementById('theme-nav-dropdown');
    if (existing) existing.remove();

    // Create dropdown element
    const dropdown = document.createElement('div');
    dropdown.id = 'theme-nav-dropdown';
    dropdown.className = 'theme-nav-dropdown';
    dropdown.innerHTML = this.generateDropdownContent();
    
    // Position relative to navigation
    document.body.appendChild(dropdown);
    
    // Setup event listeners for navigation integration
    this.setupNavigationListeners(dropdown);
  }
  
  createFloatingButton() {
    // Remove existing switcher
    const existing = document.getElementById('theme-switcher');
    if (existing) existing.remove();

    // Create theme switcher element
    const switcher = document.createElement('div');
    switcher.id = 'theme-switcher';
    switcher.className = 'theme-switcher';
    
    const button = document.createElement('button');
    button.className = 'theme-switcher-button';
    button.setAttribute('aria-label', 'Change theme');
    button.innerHTML = '◈';
    
    const dropdown = document.createElement('div');
    dropdown.className = 'theme-switcher-dropdown';
    dropdown.innerHTML = this.generateDropdownContent();
    
    switcher.appendChild(button);
    switcher.appendChild(dropdown);
    document.body.appendChild(switcher);
    
    // Add event listeners
    this.setupEventListeners(switcher, button, dropdown);
  }

  generateDropdownContent() {
    const categories = [...new Set(Object.values(this.themes).map(t => t.category))];
    
    return categories.map(category => {
      const categoryThemes = Object.entries(this.themes)
        .filter(([, theme]) => theme.category === category);
      
      return `
        <div class="theme-category">
          <div class="theme-category-label">${category}</div>
          ${categoryThemes.map(([key, theme]) => `
            <button 
              class="theme-option ${key === this.currentTheme ? 'active' : ''}" 
              data-theme="${key}"
            >
              <div class="theme-preview">
                <div class="theme-preview-bg" style="background: ${theme.colors['--bg']}"></div>
                <div class="theme-preview-card" style="background: ${theme.colors['--card']}; color: ${theme.colors['--text']}"></div>
                <div class="theme-preview-accent" style="background: ${theme.colors['--accent']}"></div>
              </div>
              <span class="theme-name">${theme.name}</span>
            </button>
          `).join('')}
        </div>
      `;
    }).join('');
  }

  setupEventListeners(switcher, button, dropdown) {
    // Toggle dropdown
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    // Theme selection
    dropdown.addEventListener('click', (e) => {
      if (e.target.classList.contains('theme-option') || e.target.closest('.theme-option')) {
        const themeButton = e.target.closest('.theme-option');
        const themeKey = themeButton.dataset.theme;
        
        // Update active state
        dropdown.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
        themeButton.classList.add('active');
        
        // Apply theme
        this.applyTheme(themeKey);
        dropdown.classList.remove('open');
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
    });

    // Prevent dropdown from closing when clicking inside
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  
  setupNavigationListeners(dropdown) {
    // Theme selection
    dropdown.addEventListener('click', (e) => {
      if (e.target.classList.contains('theme-option') || e.target.closest('.theme-option')) {
        const themeButton = e.target.closest('.theme-option');
        const themeKey = themeButton.dataset.theme;
        
        // Update active state
        dropdown.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
        themeButton.classList.add('active');
        
        // Apply theme
        this.applyTheme(themeKey);
        dropdown.classList.remove('open');
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !e.target.closest('.theme-toggle-nav')) {
        dropdown.classList.remove('open');
      }
    });

    // Prevent dropdown from closing when clicking inside
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  
  // Toggle dropdown method for navigation button
  toggleDropdown() {
    const dropdown = document.getElementById('theme-nav-dropdown') || document.querySelector('.theme-switcher-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('open');
    }
  }

  addStyles() {
    if (document.getElementById('theme-switcher-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'theme-switcher-styles';
    styles.textContent = `
      /* Navigation Theme Button Styling */
      .theme-toggle-nav {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.5rem;
        margin: 0;
        border-radius: 6px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
      }
      
      .theme-toggle-nav:hover {
        background: var(--bg-secondary);
        color: var(--text);
      }
      
      /* Navigation Theme Dropdown */
      .theme-nav-dropdown {
        position: fixed;
        top: 60px;
        right: 20px;
        min-width: 280px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: all 0.2s ease;
        max-height: 400px;
        overflow-y: auto;
        z-index: 9999;
      }

      .theme-nav-dropdown.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      /* Floating Theme Switcher (Fallback) */
      .theme-switcher {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9998;
      }

      .theme-switcher-button {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 2px solid var(--border);
        background: var(--card);
        color: var(--text);
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
      }

      .theme-switcher-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      .theme-switcher-dropdown {
        position: absolute;
        top: 56px;
        right: 0;
        min-width: 280px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: all 0.2s ease;
        max-height: 400px;
        overflow-y: auto;
        z-index: 9999;
      }

      .theme-switcher-dropdown.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .theme-category {
        padding: 8px 0;
      }

      .theme-category:not(:last-child) {
        border-bottom: 1px solid var(--border);
      }

      .theme-category-label {
        padding: 8px 16px;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .theme-option {
        width: 100%;
        padding: 12px 16px;
        border: none;
        background: none;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
        color: var(--text);
      }

      .theme-option:hover {
        background: var(--bg-secondary);
      }

      .theme-option.active {
        background: var(--accent);
        color: white;
      }

      .theme-option.active .theme-name {
        font-weight: 600;
      }

      .theme-preview {
        display: flex;
        width: 32px;
        height: 20px;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }

      .theme-preview-bg {
        flex: 2;
      }

      .theme-preview-card {
        flex: 2;
      }

      .theme-preview-accent {
        flex: 1;
      }

      .theme-name {
        font-size: 14px;
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .theme-switcher {
          top: 16px;
          right: 16px;
        }
        
        .theme-switcher-button {
          width: 44px;
          height: 44px;
          font-size: 18px;
        }
        
        .theme-switcher-dropdown {
          min-width: 240px;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  // High contrast functionality
  toggleHighContrast() {
    const isHighContrast = document.documentElement.classList.contains('high-contrast');
    document.documentElement.classList.toggle('high-contrast', !isHighContrast);
    
    try {
      localStorage.setItem('highContrast', !isHighContrast);
    } catch (error) {
      console.warn('Failed to save high contrast preference:', error);
    }
    
    // Update high contrast button if it exists
    const contrastBtn = document.querySelector('.high-contrast-toggle .high-contrast-icon');
    if (contrastBtn) {
      contrastBtn.textContent = !isHighContrast ? '◼' : '◻';
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('highContrastToggled', { 
      detail: { enabled: !isHighContrast } 
    }));
  }

  // Public API
  getThemes() {
    return this.themes;
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  setTheme(themeKey) {
    this.applyTheme(themeKey);
  }
}

// Initialize theme manager immediately for faster loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeThemeManager);
} else {
  initializeThemeManager();
}

function initializeThemeManager() {
  window.themeManager = new ThemeManager();
  
  // Ensure global functions are available
  window.toggleHighContrast = () => {
    if (window.themeManager) {
      window.themeManager.toggleHighContrast();
    }
  };
  
  window.toggleThemeDropdown = () => {
    if (window.themeManager) {
      window.themeManager.toggleDropdown();
    }
  };
}

// Export for manual use
window.ThemeManager = ThemeManager;