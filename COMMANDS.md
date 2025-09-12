# Essential Commands Reference

## 🚀 Quick Start Commands

### Local Development
```bash
npm run dev                    # Start development server with live reload
```

### Deploy to Production  
```bash
npm run build                  # Build site
wrangler pages deploy _site    # Deploy to Cloudflare Pages
```

### Run Tests
```bash
npm run test:setup             # One-time: setup test environment  
npm run test:env               # Verify test configuration
npm run test:selenium          # Run all tests
```

---

## 📋 Complete Command Reference

### 🔧 Development
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development with live reload |
| `npm run build` | Full production build |
| `npm run build:fast` | Quick development build |
| `npm run build:analyze` | Build with performance analysis |
| `npm run clean` | Clean build artifacts |

### 🚢 Deployment
| Command | Description |
|---------|-------------|
| `wrangler pages deploy _site` | Deploy to production |
| `wrangler pages deployment list` | Check deployment status |
| `wrangler login` | Authenticate with Cloudflare |
| `wrangler whoami` | Check current authentication |

### 🧪 Testing
| Command | Description |
|---------|-------------|
| `npm run test:setup` | **One-time**: Create test environment |
| `npm run test:env` | Verify environment configuration |
| `npm run test:selenium` | All Selenium tests |
| `npm run test:smoke` | Quick smoke tests |
| `npm run test:ios` | iOS Safari tests |
| `npm run test:mobile` | Mobile-specific tests |

### 🔍 Quality & Analysis
| Command | Description |
|---------|-------------|
| `npm run lint` | Run all linting (JS + CSS) |
| `npm run lint:fix` | Fix linting issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run logs:analyze` | Analyze build performance |

---

## 🎯 Common Workflows

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup test environment
npm run test:setup

# 3. Create local test config
cp .env.test.example .env.test.local

# 4. Start development
npm run dev
```

### Daily Development
```bash
# Start development server
npm run dev

# Make your changes in src/
# Auto-reload happens automatically

# Test locally before deploying
npm run test:smoke

# Deploy when ready
npm run build && wrangler pages deploy _site
```

### Testing Workflow
```bash
# Test environment setup (first time only)
npm run test:env

# Run quick tests
npm run test:smoke

# Run comprehensive tests
npm run test:selenium

# Test specific functionality
npm run test:mobile
npm run test:ios
```

### Production Deployment
```bash
# Option 1: Quick deploy
npm run build && wrangler pages deploy _site

# Option 2: Full analysis deploy
npm run build:production && wrangler pages deploy _site

# Verify deployment
wrangler pages deployment list
```

### Troubleshooting
```bash
# Clean everything and start fresh
npm run clean:all
npm install
npm run test:setup

# Check configuration
npm run test:env

# Check build performance  
npm run build:analyze
npm run logs:analyze
```

---

## ⚙️ Environment Configuration

### Local Testing (.env.test.local)
```bash
# Test against local development server
EXPLORE_SCRIPTURE_LOCAL=true
LOCAL_BASE_URL=http://localhost:8080

# Browser settings
HEADLESS=false
BROWSER_WIDTH=1280
BROWSER_HEIGHT=720
```

### Production Testing
```bash
# Override for production testing
EXPLORE_SCRIPTURE_LOCAL=false npm run test:selenium
```

---

## 📊 Build Performance

| Build Type | Time | Use Case |
|------------|------|----------|
| `npm run dev` | ~6s | Development with live reload |
| `npm run build:fast` | ~3s | Quick development build |
| `npm run build` | ~8s | Full production build |
| `npm run build:production` | ~10s | Full build with analysis |

---

## 🔗 Related Files

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide
- **[tests/README.md](./tests/README.md)** - Detailed testing documentation  
- **[CLAUDE.md](./CLAUDE.md)** - Full technical documentation
- **`.env.test.local`** - Your local test configuration
- **`package.json`** - All available npm commands