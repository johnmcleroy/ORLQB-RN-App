#!/bin/bash

# ORLQB React Native Web App Production Deployment Script
# Builds and deploys the app to orlqb.org (TLD root)

set -e  # Exit on any error

echo "🚀 Starting ORLQB App Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || ! grep -q "ORLQB" package.json; then
    print_error "Please run this script from the ORLQB project root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

print_status "Cleaning previous builds..."
rm -rf dist/

print_status "Building optimized React Native web app..."
npx expo export --platform web

if [ $? -ne 0 ] || [ ! -f "dist/index.html" ]; then
    print_error "Build failed!"
    exit 1
fi

print_success "Build completed successfully!"

# Display build info
LOCAL_JS=$(ls -1 dist/_expo/static/js/web/index-*.js | head -1 | xargs basename)
BUNDLE_SIZE=$(du -h dist/_expo/static/js/web/*.js | cut -f1)
print_status "JavaScript bundle: $LOCAL_JS ($BUNDLE_SIZE)"

# Deploy to server TLD root (NOT html subdirectory)
print_status "Deploying to orlqb.org production server..."
scp -r dist/* root@138.197.0.25:/var/www/orlqb.org/

if [ $? -ne 0 ]; then
    print_error "Deployment failed!"
    exit 1
fi

print_success "Files uploaded successfully!"

# Verify deployment
print_status "Verifying deployment..."
DEPLOYED_JS=$(ssh root@138.197.0.25 "ls -1 /var/www/orlqb.org/_expo/static/js/web/index-*.js 2>/dev/null | head -1 | xargs basename")

if [ "$DEPLOYED_JS" = "$LOCAL_JS" ]; then
    print_success "Deployment verified - JavaScript bundle matches: $DEPLOYED_JS"
else
    print_warning "JavaScript bundle mismatch detected"
    echo "   Local: $LOCAL_JS"
    echo "   Deployed: $DEPLOYED_JS"
fi

# Test server response
print_status "Testing server response..."
HTTP_STATUS=$(ssh root@138.197.0.25 "curl -s -o /dev/null -w '%{http_code}' https://orlqb.org")

if [ "$HTTP_STATUS" = "200" ]; then
    print_success "Server responding correctly (HTTP $HTTP_STATUS)"
else
    print_warning "Server response: HTTP $HTTP_STATUS"
fi

print_success "🎉 Production deployment completed successfully!"

echo ""
echo "📋 DEPLOYMENT SUMMARY:"
echo "===================="
echo "✅ Target: orlqb.org (TLD root)"
echo "✅ Server: 138.197.0.25"
echo "✅ Path: /var/www/orlqb.org/"
echo "✅ Nginx: Configured for SPA routing"
echo "✅ SSL: Enabled with Let's Encrypt"
echo "✅ Bundle: $LOCAL_JS"
echo "✅ Size: $BUNDLE_SIZE"

echo ""
echo "🔗 LIVE URLS:"
echo "• Production: https://orlqb.org"
echo "• Testing: https://orlqb.org/?debug=1"

echo ""
echo "🧪 TESTING CHECKLIST:"
echo "□ Authentication flow (login/logout)"
echo "□ Calendar functionality"
echo "□ Event navigation (Get Directions)"
echo "□ User role management"
echo "□ Mobile responsiveness"

echo ""
print_success "Deployment ready for testing!"