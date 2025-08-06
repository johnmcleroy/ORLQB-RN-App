# ORLQB Visual Assets Integration Guide

## Overview

The ORLQB React Native app now includes a comprehensive visual asset management system designed to showcase the Quebec Bravo hangar theme with aviation-focused graphics and photography.

## Asset Organization Structure

```
assets/
├── images/
│   ├── Member_Photos/          # Profile headshots
│   │   ├── member_123.jpg      # Individual member photos
│   │   └── default_avatar.png  # Fallback avatar
│   ├── ORLQB_Photos/           # Official ORLQB photography
│   │   ├── orlqb_hangar_exterior.jpg
│   │   ├── orlqb_hangar_interior.jpg
│   │   ├── orlqb_monthly_meeting.jpg
│   │   └── orlqb_intro_background.jpg
│   ├── QB_Graphics/            # Quebec Bravo themed graphics
│   │   ├── qb_logo_main.png
│   │   ├── qb_logo_light.png
│   │   ├── qb_wings.png
│   │   └── qb_compass.png
│   └── Misc_Photos/            # General aviation photos
│       ├── misc_aviation_sunset.jpg
│       ├── misc_orlando_executive.jpg
│       └── misc_gradient_aviation.jpg
├── videos/                     # Video assets (future)
│   ├── orlqb_intro.mp4
│   └── orlqb_hangar_tour.mp4
└── [existing app icons and splash screens]
```

## Current Implementation Status

### ✅ **Completed**
- **Folder structure** created with proper organization
- **Image constants system** (`src/constants/images.js`) for centralized management
- **IntroScreen enhanced** with ORLQB theming and asset placeholders
- **Documentation** and guidelines for asset management

### 🔄 **Ready for Assets**
- **Placeholder comments** in code show exactly where ORLQB assets will be integrated
- **Fallback system** using Unsplash aviation image until ORLQB photos are added
- **Dynamic loading** system for member photos and role-based graphics

### 📋 **Needs ORLQB-Specific Content**
- **ORLQB hangar photos** for backgrounds and theming
- **Official ORLQB logo** in various formats (light/dark/icon versions)
- **Member headshot photos** for profile system
- **Quebec Bravo graphics** and aviation-themed illustrations

## Key Files Modified

### IntroScreen (`src/screens/auth/IntroScreen.js`)
**Current Video/Image Location (Lines 36-42):**
```javascript
// ORLQB Images (will be populated with actual assets)
const ORLQB_IMAGES = {
  // Fallback to Unsplash aviation image until ORLQB assets are added
  INTRO_BACKGROUND: { uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05...' },
  // Future: Local ORLQB assets
  // INTRO_BACKGROUND: require('../../assets/images/ORLQB_Photos/orlqb_intro_background.jpg'),
  // ORLQB_LOGO: require('../../assets/images/QB_Graphics/qb_logo_light.png'),
};
```

**Enhanced ORLQB Theming:**
- Quebec Bravo gold accent colors (`#FFD700`)
- Aviation-themed text and styling
- Ready for logo image replacement
- Professional hangar/aviation aesthetic

### Image Constants (`src/constants/images.js`)
**Centralized Asset Management:**
```javascript
// Example usage throughout app
import { ORLQBPhotos, QBGraphics, ImageUtils } from '../constants/images';

// Static image
<Image source={ORLQBPhotos.HANGAR_EXTERIOR} />

// Dynamic member photo with fallback
<Image source={ImageUtils.getMemberPhoto(123)} />

// Role-specific graphics
<Image source={ImageUtils.getRoleIcon('governor')} />
```

## Asset Specifications

### ORLQB Photography Requirements
- **Format**: JPG, optimized for web (80-90% quality)
- **Intro Background**: 1920x1080px (landscape orientation)
- **Hangar Photos**: Various sizes, high quality for backgrounds
- **Event Photos**: 1200x800px recommended

### Quebec Bravo Graphics
- **Format**: PNG with transparency preferred
- **Logo Sizes**: Multiple sizes (120x120px, 256x256px, 512x512px)
- **Icons**: 24px, 32px, 48px, 64px for different use cases
- **Colors**: Gold (#FFD700), white, transparent backgrounds

### Member Photos
- **Format**: JPG, square aspect ratio (500x500px)
- **Privacy**: Obtain member consent, provide opt-out
- **Naming**: `member_[qbnumber].jpg` (e.g., `member_123.jpg`)

## Integration Steps

### 1. Add ORLQB Background Photo
```bash
# Add your ORLQB hangar/intro photo as:
assets/images/ORLQB_Photos/orlqb_intro_background.jpg

# Then update IntroScreen.js line 38:
INTRO_BACKGROUND: require('../../assets/images/ORLQB_Photos/orlqb_intro_background.jpg'),
```

### 2. Add ORLQB Logo
```bash
# Add logo image as:
assets/images/QB_Graphics/qb_logo_light.png

# Then uncomment IntroScreen.js lines 120-121:
<Image source={ORLQB_IMAGES.ORLQB_LOGO} style={styles.logoImage} />
```

### 3. Add Member Photos
```bash
# Add member photos as:
assets/images/Member_Photos/member_123.jpg
assets/images/Member_Photos/default_avatar.png

# Photos automatically work with existing ProfileScreen system
```

### 4. Add Video Support (Optional)
```bash
# Install video package:
npm install expo-av

# Add intro video as:
assets/videos/orlqb_intro.mp4

# Uncomment video code in IntroScreen.js (lines 96-103)
```

## Visual Theme

### Color Palette
- **Primary Gold**: `#FFD700` (Quebec Bravo accent)
- **Text White**: `#FFFFFF` with shadow
- **Overlay**: `rgba(0, 0, 0, 0.5)` for text readability
- **Secondary**: Aviation blues and metallic tones

### Typography
- **Logo**: Bold, large (72px), gold with letter spacing
- **Headings**: Bold, white with text shadows
- **Body**: Clean, readable with proper contrast
- **Quebec Bravo**: Italic, smaller, distinctive styling

### Visual Elements
- **Backgrounds**: Full-screen aviation/hangar photography
- **Overlays**: Semi-transparent for text readability
- **Shadows**: Text shadows for contrast against photos
- **Animation**: Smooth fade-in effects for professional feel

## Screen-Specific Theming

### IntroScreen
- **Background**: ORLQB hangar or aviation scene
- **Logo**: Centered ORLQB logo with Quebec Bravo tagline
- **Animation**: Fade-in with scale effect
- **Progress**: Gold progress bar for 10-second timer

### ProfileScreen
- **Avatar**: Member photos with default fallback
- **Background**: Subtle ORLQB hangar interior
- **Role Display**: Role-specific icons and colors

### EventInfoScreen  
- **Backgrounds**: Event-specific or hangar photos
- **Navigation**: ORLQB hangar location pre-configured
- **Branding**: Consistent ORLQB theming

## Deployment Impact

### Bundle Size
- **Images**: Automatically included in web/mobile builds
- **Optimization**: Images compressed for deployment
- **Caching**: Proper cache headers for web delivery

### Performance
- **Lazy Loading**: Member photos loaded on demand
- **Fallbacks**: Default assets when custom images unavailable
- **Compression**: All images optimized for mobile delivery

## Next Steps

### Priority 1: Essential Assets
1. **ORLQB intro background photo** (hangar exterior/interior)
2. **Official ORLQB logo** (light version for intro)
3. **Default member avatar** for profile system

### Priority 2: Enhanced Theming
1. **Additional hangar photos** for various screens
2. **Quebec Bravo graphics** and aviation icons
3. **Role-specific imagery** for leadership positions

### Priority 3: Video Integration
1. **ORLQB intro video** (8-10 seconds)
2. **Hangar tour video** for about section
3. **Event documentation videos**

## Testing Checklist

After adding ORLQB assets:
- [ ] IntroScreen displays with ORLQB background
- [ ] Logo appears correctly (if added)
- [ ] Member photos load with fallback system
- [ ] All images display correctly on web and mobile
- [ ] App bundle size remains reasonable
- [ ] Images load quickly on slower connections

## Maintenance

### Regular Tasks
- **Update member photos** as members join/leave
- **Add event photos** from monthly meetings
- **Optimize image sizes** for performance
- **Audit unused assets** to keep bundle lean

The visual asset system is now ready to showcase ORLQB's professional aviation identity while maintaining excellent performance and user experience.