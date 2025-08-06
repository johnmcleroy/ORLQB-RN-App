# ORLQB Image Assets Organization

This directory contains all visual assets for the ORLQB React Native application, organized for easy management and deployment.

## Folder Structure

### 📸 **Member_Photos/**
Profile headshot photographs for ORLQB members
- **Purpose**: User profile pictures, member directory photos
- **Format**: JPG/PNG, square aspect ratio preferred (500x500px recommended)
- **Naming**: `member_[qbnumber].jpg` (e.g., `member_123.jpg`)
- **Privacy**: Ensure member consent for photo usage
- **Fallback**: Default avatar for members without photos

### 🏢 **ORLQB_Photos/**
Official ORLQB hangar, events, and organizational photos
- **Purpose**: Hangar photos, meeting images, official events
- **Format**: JPG/PNG, various aspect ratios
- **Categories**:
  - Hangar exterior/interior shots
  - Monthly meetings
  - Special events and ceremonies
  - Historical photographs
- **Naming**: `orlqb_[event/location]_[date].jpg`
- **Usage**: Backgrounds, about section, event documentation

### ✈️ **QB_Graphics/**
Quebec Bravo aviation-themed graphics and logos
- **Purpose**: QB logos, aviation graphics, themed illustrations
- **Format**: PNG (with transparency), SVG preferred for scalable graphics
- **Categories**:
  - ORLQB official logos (various sizes)
  - Aviation-themed icons and illustrations
  - Quasi-Bravo symbolism and graphics
  - Themed backgrounds and textures
- **Naming**: `qb_[type]_[description].png`
- **Usage**: App branding, navigation icons, themed decorations

### 📷 **Misc_Photos/**
General photography and miscellaneous visual assets
- **Purpose**: General photos not fitting other categories
- **Format**: JPG/PNG
- **Categories**:
  - Airport and aviation photography
  - Meeting locations and venues
  - Social events and gatherings
  - Stock photos and general imagery
- **Naming**: `misc_[description]_[date].jpg`
- **Usage**: Backgrounds, content illustrations, gallery

## Image Guidelines

### Technical Specifications
- **Web Optimization**: Compress images for web delivery
- **Responsive**: Provide multiple sizes when needed (@1x, @2x, @3x)
- **Format**: 
  - Photos: JPG (compressed, 80-90% quality)
  - Graphics with transparency: PNG
  - Scalable graphics: SVG when possible
  - Icons: PNG with multiple sizes

### Size Recommendations
- **Profile Photos**: 500x500px (square)
- **Background Images**: 1920x1080px (landscape)
- **App Icons**: 24px, 32px, 48px, 64px, 128px
- **Hero Images**: 1200x600px
- **Thumbnails**: 200x200px

### Naming Conventions
- Use lowercase and underscores
- Include descriptive keywords
- Add dimensions for multiple sizes: `image_name_200x200.jpg`
- Version with date if needed: `logo_v2_20250806.png`

## Usage in App

### Import Examples
```javascript
// Member photo
import memberPhoto from '../assets/images/Member_Photos/member_123.jpg';

// ORLQB photo
import hangarPhoto from '../assets/images/ORLQB_Photos/orlqb_hangar_exterior_2025.jpg';

// QB graphic
import qbLogo from '../assets/images/QB_Graphics/qb_logo_main.png';

// Misc photo
import aviationBg from '../assets/images/Misc_Photos/misc_aviation_background.jpg';
```

### Dynamic Loading
```javascript
// Dynamic member photo loading
const getMemberPhoto = (qbNumber) => {
  try {
    return require(`../assets/images/Member_Photos/member_${qbNumber}.jpg`);
  } catch (error) {
    return require('../assets/images/Member_Photos/default_avatar.png');
  }
};
```

## Content Management

### Adding New Images
1. Place images in appropriate subfolder
2. Follow naming conventions
3. Optimize for web (compress, resize)
4. Update image constants file if needed
5. Test in app before committing

### Member Photos
- Obtain consent before adding member photos
- Provide default avatar for members without photos
- Update member photos when members provide new ones
- Remove photos when members leave organization

### ORLQB Photos
- Document source and date for historical photos
- Organize by event type and chronological order
- Maintain high-quality originals separately
- Create web-optimized versions for app use

## Security and Privacy

### Member Privacy
- Only use photos with explicit member consent
- Provide opt-out mechanism for members
- Remove photos upon member request
- Don't include identifying information in metadata

### Copyright
- Ensure proper rights for all images used
- Credit photographers when required
- Use only ORLQB-owned or licensed images
- Document image sources and permissions

### File Security
- Don't commit sensitive or private images to public repo
- Use appropriate image compression
- Remove EXIF data from photos before deployment
- Regular audit of image content

## Deployment

### Web Deployment
Images are automatically included in the Expo web build and deployed to:
- Production: `https://orlqb.org/assets/images/`
- Served with appropriate caching headers
- Optimized for web delivery

### Mobile Deployment
Images are bundled with the mobile app for offline access:
- iOS: Included in app bundle
- Android: Included in APK/Bundle
- Cached for performance

## Maintenance

### Regular Tasks
- [ ] Audit image sizes and optimize
- [ ] Update member photos as needed
- [ ] Add new ORLQB event photos
- [ ] Clean up unused images
- [ ] Verify all images load correctly
- [ ] Check for broken image references

### Performance Monitoring
- Monitor bundle size impact
- Optimize large images
- Implement lazy loading where appropriate
- Use progressive JPEGs for large images