# ORLQB Mobile App Deployment Guide

## Overview
This guide covers deploying the ORLQB React Native Web app to orlqb.org.

## Build Process
The app has been built for production deployment using Expo's static export:

```bash
npx expo export --platform web
```

This creates a `dist/` folder containing all necessary files for web hosting.

## Deployment Files
The `dist/` directory contains:

### Core Files
- `index.html` - Main HTML file
- `favicon.ico` - Website icon
- `metadata.json` - App metadata
- `robots.txt` - Search engine directives

### Static Assets
- `_expo/static/js/web/` - JavaScript bundles
- `assets/` - Icons, fonts, and other resources

## Server Configuration

### Nginx Configuration
The Nginx server configuration handles:
- **SPA Routing**: Redirects all routes to index.html
- **HTTPS Enforcement**: Forces secure connections via 301 redirect
- **Security Headers**: CSP, XSS protection, frame options, etc.
- **Caching**: Long-term caching for static assets, no-cache for HTML
- **Compression**: Gzip compression for better performance
- **Firebase Integration**: CSP rules for Firebase services
- **SSL/TLS**: Strong security with TLS 1.2+ and modern ciphers

### Firebase Configuration
The app requires these Firebase services:
- **Authentication**: User login/signup
- **Firestore**: Member data storage
- **Hosting** (optional): Can use Firebase Hosting instead of Apache

## Deployment Steps

### Option 1: Manual Upload to orlqb.org
1. **Upload files**: Copy entire `dist/` contents to `/var/www/orlqb.org/`
2. **Set permissions**: `chown -R www-data:www-data /var/www/orlqb.org/`
3. **Reload Nginx**: `systemctl reload nginx`
4. **Test**: Verify HTTPS redirect and routing work at https://orlqb.org

### Option 2: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting in the project
firebase init hosting

# Deploy
firebase deploy
```

### Option 3: GitHub Actions (Automated)
Set up continuous deployment using the included GitHub Actions workflow.

## Domain Setup for mobile.orlqb.org

### DNS Configuration
Point mobile.orlqb.org to your hosting server:
```
CNAME mobile.orlqb.org -> your-hosting-server.com
```

### SSL Certificate
Ensure SSL/TLS certificate is installed for HTTPS:
- Let's Encrypt (recommended, free)
- Or existing wildcard cert for *.orlqb.org

## Environment Variables

### Firebase Configuration
The app uses these Firebase settings (already configured in the code):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAqCWig0L0spfRpBUsL_VsgwxwSqtKzIPI",
  authDomain: "orlqb.firebaseapp.com",
  projectId: "firebase-orlqb",
  // ... other config
};
```

### Security Considerations
- Firebase rules should restrict access to authenticated users only
- CSP headers prevent XSS attacks
- HTTPS enforcement protects data in transit
- No sensitive data in client-side code

## Testing Deployment

### Pre-deployment Checklist
- [ ] Build completes without errors
- [ ] Firebase configuration is correct
- [ ] All routes work locally
- [ ] Authentication flow functions
- [ ] Mobile responsiveness verified

### Post-deployment Testing
1. **Visit mobile.orlqb.org**
2. **Test intro screen** (first-time users)
3. **Test authentication** (login/signup)
4. **Test guest features** (limited access)
5. **Test member features** (if authenticated)
6. **Test mobile responsiveness**
7. **Check browser console** for errors

### Performance Monitoring
- Monitor Firebase usage and costs
- Check Core Web Vitals in Google PageSpeed Insights
- Monitor error rates in browser console

## Maintenance

### Regular Updates
1. Update npm dependencies regularly
2. Monitor Firebase SDK updates
3. Review security headers periodically
4. Back up Firebase data regularly

### Monitoring
- Set up Firebase Analytics (optional)
- Monitor server logs for errors
- Track user authentication patterns

## Troubleshooting

### Common Issues
1. **White screen**: Check browser console for JavaScript errors
2. **Routing issues**: Verify .htaccess is working
3. **Firebase connection**: Check network tab for API calls
4. **Authentication failures**: Verify Firebase config

### Debug Mode
To enable debug mode, add to console:
```javascript
window.__EXPO_DEBUG__ = true;
```

## Support
For deployment issues:
1. Check browser developer tools console
2. Review server error logs
3. Verify Firebase project settings
4. Test locally first with `npm run web`

## File Structure After Deployment
```
mobile.orlqb.org/
├── index.html              # Main app entry point
├── favicon.ico             # Website icon
├── robots.txt              # SEO directives
├── .htaccess              # Apache configuration
├── metadata.json          # App metadata
├── _expo/
│   └── static/
│       └── js/
│           └── web/
│               └── index-[hash].js  # Main JavaScript bundle
└── assets/
    └── node_modules/       # Static assets (fonts, icons, etc.)
```

## Next Steps
1. Upload files to mobile.orlqb.org
2. Test deployment thoroughly
3. Set up monitoring and analytics
4. Configure automated backups
5. Plan for future updates and maintenance