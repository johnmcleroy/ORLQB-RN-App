# ORLQB Video Assets

This directory contains video assets for the ORLQB React Native application.

## Video Files

### Intro Videos
- `orlqb_intro.mp4` - Main intro video for first-time users
- `orlqb_hangar_tour.mp4` - Virtual hangar tour video
- `aviation_background_loop.mp4` - Looping aviation background

## Video Specifications

### Technical Requirements
- **Format**: MP4 (H.264 codec recommended)
- **Resolution**: 1080p (1920x1080) for backgrounds, 720p for mobile optimization
- **Duration**: 10-30 seconds for intro, 2-5 minutes for tours
- **Frame Rate**: 30fps
- **Audio**: AAC codec, 44.1kHz sample rate

### File Size Guidelines
- **Intro videos**: Keep under 10MB for app bundle
- **Background loops**: Keep under 5MB
- **Tour videos**: Can be larger (20-50MB) but consider loading times

## Implementation with expo-av

To use videos in the app, first install the required package:
```bash
npm install expo-av
```

### Usage Example
```javascript
import { Video } from 'expo-av';

// In your component
<Video
  source={require('../../assets/videos/orlqb_intro.mp4')}
  shouldPlay
  isLooping
  isMuted
  resizeMode="cover"
  style={{ width: '100%', height: '100%' }}
/>
```

### Intro Screen Video Implementation
```javascript
// In IntroScreen.js
import { Video } from 'expo-av';

// Replace ImageBackground with Video
<Video
  source={require('../../assets/videos/orlqb_intro.mp4')}
  shouldPlay
  isMuted
  resizeMode="cover"
  style={styles.video}
  onPlaybackStatusUpdate={(status) => {
    if (status.didJustFinish) {
      handleComplete();
    }
  }}
/>
```

## Video Content Guidelines

### ORLQB Intro Video
- **Duration**: 8-10 seconds (auto-advance timing)
- **Content**: ORLQB logo animation, hangar views, aviation theme
- **Style**: Professional, welcoming, aviation-focused
- **Audio**: Optional background music (aviation/inspirational theme)

### Hangar Tour Video
- **Duration**: 2-3 minutes
- **Content**: Virtual tour of Orlando QB Hangar
- **Sections**: Exterior, meeting room, member areas, historical displays
- **Narration**: Optional voice-over with ORLQB information

### Background Loop Videos
- **Duration**: 10-15 seconds (seamless loop)
- **Content**: Subtle aviation scenes (clouds, runway, hangar)
- **Style**: Subtle, non-distracting background motion
- **Audio**: Silent (background only)

## Production Notes

### Video Creation
- Use aviation-themed content reflecting ORLQB values
- Maintain consistent branding with app design
- Optimize for mobile viewing (clear, high contrast)
- Test on various device sizes and orientations

### Accessibility
- Provide captions for narrated videos
- Include alternative text descriptions
- Ensure videos don't auto-play sound
- Provide skip/pause controls for accessibility

### Performance Considerations
- Compress videos for mobile delivery
- Provide multiple quality options if needed
- Consider streaming for longer videos
- Test loading times on slower connections

## Deployment

### Mobile Apps
- Videos are bundled with the app for offline playback
- Larger videos may require streaming implementation
- Test app bundle size impact

### Web Deployment
- Videos served from web server with appropriate caching
- Consider CDN delivery for better performance
- Provide fallback images for slower connections

## File Organization

```
assets/videos/
├── intro/
│   ├── orlqb_intro_hd.mp4     (1080p version)
│   ├── orlqb_intro_mobile.mp4 (720p optimized)
│   └── orlqb_intro_thumb.jpg  (thumbnail/fallback)
├── backgrounds/
│   ├── aviation_loop_hd.mp4
│   └── aviation_loop_mobile.mp4
└── tours/
    ├── hangar_tour_full.mp4
    └── hangar_tour_highlights.mp4
```

## Future Enhancements
- Interactive video controls
- Chapter navigation for longer videos
- Picture-in-picture support
- Video quality selection
- Offline video caching