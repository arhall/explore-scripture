#!/bin/bash

# Explore Scripture → Cloudflare Workers Setup Script
# This script automates the initial setup for Workers deployment

set -e  # Exit on any error

echo "🚀 Explore Scripture → Cloudflare Workers Setup"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2)
print_success "Node.js $NODE_VERSION found"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm $(npm --version) found"

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_warning "Wrangler CLI not found. Installing globally..."
    npm install -g wrangler
    print_success "Wrangler CLI installed"
else
    WRANGLER_VERSION=$(wrangler --version | cut -d ' ' -f 2)
    print_success "Wrangler CLI $WRANGLER_VERSION found"
fi

# Install project dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
print_success "Dependencies installed"

# Check Cloudflare authentication
echo ""
echo "🔐 Checking Cloudflare authentication..."

if wrangler whoami &> /dev/null; then
    CLOUDFLARE_EMAIL=$(wrangler whoami | grep "email" | cut -d '"' -f 4)
    print_success "Authenticated as: $CLOUDFLARE_EMAIL"
else
    print_warning "Not authenticated with Cloudflare"
    echo ""
    print_info "Please authenticate with Cloudflare:"
    echo "   wrangler login"
    echo ""
    echo "Then run this script again or continue manually."
    exit 0
fi

# Get account ID
echo ""
echo "🏢 Retrieving account information..."

ACCOUNT_ID=""
if wrangler whoami | grep -q "Account ID"; then
    ACCOUNT_ID=$(wrangler whoami | grep "Account ID" | cut -d ' ' -f 4)
    print_success "Account ID: $ACCOUNT_ID"
else
    print_warning "Could not retrieve account ID automatically"
    echo ""
    print_info "Please add your account ID to wrangler.toml:"
    echo "   account_id = \"your-account-id-here\""
    echo ""
    echo "You can find your account ID in the Cloudflare dashboard → Right sidebar"
fi

# Update wrangler.toml with account ID if found
if [ ! -z "$ACCOUNT_ID" ]; then
    if [ -f "wrangler.toml" ]; then
        # Check if account_id already exists
        if grep -q "account_id" wrangler.toml; then
            print_info "Account ID already configured in wrangler.toml"
        else
            # Add account_id to wrangler.toml after the name line
            sed -i.bak "s/^name = .*/&\\n# account_id = \"$ACCOUNT_ID\"/" wrangler.toml
            print_warning "Added commented account_id to wrangler.toml. Please uncomment and verify."
        fi
    fi
fi

# Create KV namespaces
echo ""
echo "🗄️  Setting up KV namespaces..."

create_kv_namespace() {
    local binding=$1
    local namespace_name=$2
    
    echo ""
    print_info "Creating KV namespace: $binding"
    
    # Create production namespace
    PROD_OUTPUT=$(wrangler kv:namespace create "$binding" 2>/dev/null || true)
    if echo "$PROD_OUTPUT" | grep -q "id"; then
        PROD_ID=$(echo "$PROD_OUTPUT" | grep "id" | cut -d '"' -f 4)
        print_success "Production namespace created: $PROD_ID"
    fi
    
    # Create preview namespace
    PREVIEW_OUTPUT=$(wrangler kv:namespace create "$binding" --preview 2>/dev/null || true)
    if echo "$PREVIEW_OUTPUT" | grep -q "preview_id"; then
        PREVIEW_ID=$(echo "$PREVIEW_OUTPUT" | grep "preview_id" | cut -d '"' -f 4)
        print_success "Preview namespace created: $PREVIEW_ID"
    fi
    
    if [ ! -z "$PROD_ID" ] && [ ! -z "$PREVIEW_ID" ]; then
        echo ""
        print_info "Add this to your wrangler.toml:"
        echo "[[kv_namespaces]]"
        echo "binding = \"$binding\""
        echo "id = \"$PROD_ID\""
        echo "preview_id = \"$PREVIEW_ID\""
    fi
}

# Create both namespaces
create_kv_namespace "CACHE" "bible-explorer-cache"
create_kv_namespace "ENTITIES" "bible-explorer-entities"

# Build the project
echo ""
echo "🔨 Building project for Workers..."

if npm run build:workers; then
    print_success "Project built successfully"
else
    print_error "Build failed. Please check the error messages above."
    exit 1
fi

# Final instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_info "Next steps:"
echo "1. Update wrangler.toml with your KV namespace IDs (shown above)"
echo "2. Upload data to KV: npm run workers:kv:upload"
echo "3. Deploy to Workers: npm run workers:deploy"
echo "4. Test your deployment: curl https://your-worker.your-subdomain.workers.dev/"
echo ""
print_info "Development commands:"
echo "• Local development: npm run workers:dev"
echo "• Deploy to Workers: npm run workers:deploy"  
echo "• Upload KV data: npm run workers:kv:upload"
echo ""
print_info "For detailed instructions, see: WORKERS-MIGRATION.md"
echo ""
print_success "Your Explore Scripture is ready for the edge! 🚀"