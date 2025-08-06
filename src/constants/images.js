/**
 * ORLQB Image Assets Constants
 * 
 * Centralized image management for the ORLQB React Native app
 * Provides easy access to all image assets with proper organization
 */

// Member Photos
export const MemberPhotos = {
  // Default fallback avatar
  DEFAULT_AVATAR: require('../../assets/images/Member_Photos/default_avatar.png'),
  
  // Dynamic member photo loader
  getMemberPhoto: (qbNumber) => {
    try {
      return require(`../../assets/images/Member_Photos/member_${qbNumber}.jpg`);
    } catch (error) {
      return MemberPhotos.DEFAULT_AVATAR;
    }
  }
};

// ORLQB Official Photos
export const ORLQBPhotos = {
  // Hangar Photos
  HANGAR_EXTERIOR: require('../../assets/images/ORLQB_Photos/orlqb_hangar_exterior.jpg'),
  HANGAR_INTERIOR: require('../../assets/images/ORLQB_Photos/orlqb_hangar_interior.jpg'),
  HANGAR_MEETING_ROOM: require('../../assets/images/ORLQB_Photos/orlqb_meeting_room.jpg'),
  
  // Events
  MONTHLY_MEETING: require('../../assets/images/ORLQB_Photos/orlqb_monthly_meeting.jpg'),
  LEADERSHIP_CEREMONY: require('../../assets/images/ORLQB_Photos/orlqb_leadership_ceremony.jpg'),
  
  // Historical
  ORLQB_FOUNDING: require('../../assets/images/ORLQB_Photos/orlqb_historical_founding.jpg'),
  
  // Backgrounds
  AVIATION_BACKGROUND: require('../../assets/images/ORLQB_Photos/orlqb_aviation_background.jpg'),
  INTRO_BACKGROUND: require('../../assets/images/ORLQB_Photos/orlqb_intro_background.jpg'),
};

// Quebec Bravo Graphics
export const QBGraphics = {
  // Logos
  ORLQB_LOGO_MAIN: require('../../assets/images/QB_Graphics/qb_logo_main.png'),
  ORLQB_LOGO_LIGHT: require('../../assets/images/QB_Graphics/qb_logo_light.png'),
  ORLQB_LOGO_DARK: require('../../assets/images/QB_Graphics/qb_logo_dark.png'),
  ORLQB_LOGO_ICON: require('../../assets/images/QB_Graphics/qb_logo_icon.png'),
  
  // Aviation Graphics
  QB_WINGS: require('../../assets/images/QB_Graphics/qb_wings.png'),
  QB_PROPELLER: require('../../assets/images/QB_Graphics/qb_propeller.png'),
  QB_COMPASS: require('../../assets/images/QB_Graphics/qb_compass.png'),
  
  // Themed Icons
  QB_MEETING_ICON: require('../../assets/images/QB_Graphics/qb_meeting_icon.png'),
  QB_LEADERSHIP_ICON: require('../../assets/images/QB_Graphics/qb_leadership_icon.png'),
  QB_HANGAR_ICON: require('../../assets/images/QB_Graphics/qb_hangar_icon.png'),
  
  // Backgrounds and Textures
  QB_TEXTURE_METAL: require('../../assets/images/QB_Graphics/qb_texture_metal.png'),
  QB_PATTERN_AVIATION: require('../../assets/images/QB_Graphics/qb_pattern_aviation.png'),
};

// Miscellaneous Photos
export const MiscPhotos = {
  // Aviation General
  AIRPORT_RUNWAY: require('../../assets/images/Misc_Photos/misc_airport_runway.jpg'),
  AVIATION_SUNSET: require('../../assets/images/Misc_Photos/misc_aviation_sunset.jpg'),
  PROPELLER_CLOSEUP: require('../../assets/images/Misc_Photos/misc_propeller_closeup.jpg'),
  
  // Orlando Area
  ORLANDO_EXECUTIVE_AIRPORT: require('../../assets/images/Misc_Photos/misc_orlando_executive.jpg'),
  ORLANDO_SKYLINE: require('../../assets/images/Misc_Photos/misc_orlando_skyline.jpg'),
  
  // Meeting Venues
  CONFERENCE_ROOM: require('../../assets/images/Misc_Photos/misc_conference_room.jpg'),
  
  // Backgrounds
  GRADIENT_AVIATION: require('../../assets/images/Misc_Photos/misc_gradient_aviation.jpg'),
  TEXTURE_CONCRETE: require('../../assets/images/Misc_Photos/misc_texture_concrete.jpg'),
};

// Screen-specific image collections
export const ScreenImages = {
  // Intro Screen
  INTRO: {
    BACKGROUND: ORLQBPhotos.INTRO_BACKGROUND,
    LOGO: QBGraphics.ORLQB_LOGO_LIGHT,
    FALLBACK_BACKGROUND: MiscPhotos.AVIATION_SUNSET,
  },
  
  // Profile Screen
  PROFILE: {
    DEFAULT_AVATAR: MemberPhotos.DEFAULT_AVATAR,
    BACKGROUND: ORLQBPhotos.HANGAR_INTERIOR,
  },
  
  // Calendar Screen
  CALENDAR: {
    EVENT_BACKGROUND: ORLQBPhotos.MONTHLY_MEETING,
    MEETING_ICON: QBGraphics.QB_MEETING_ICON,
  },
  
  // Auth Screens
  AUTH: {
    LOGIN_BACKGROUND: ORLQBPhotos.HANGAR_EXTERIOR,
    SIGNUP_BACKGROUND: MiscPhotos.ORLANDO_EXECUTIVE_AIRPORT,
  },
  
  // Navigation
  NAVIGATION: {
    HANGAR_LOCATION: ORLQBPhotos.HANGAR_EXTERIOR,
    AIRPORT_VIEW: MiscPhotos.ORLANDO_EXECUTIVE_AIRPORT,
  },
};

// Image utility functions
export const ImageUtils = {
  // Get member photo with fallback
  getMemberPhoto: (qbNumber) => {
    return MemberPhotos.getMemberPhoto(qbNumber);
  },
  
  // Get role-specific icon
  getRoleIcon: (role) => {
    switch (role) {
      case 'governor':
      case 'historian':
        return QBGraphics.QB_LEADERSHIP_ICON;
      case 'member':
        return QBGraphics.QB_WINGS;
      default:
        return QBGraphics.ORLQB_LOGO_ICON;
    }
  },
  
  // Get event type icon
  getEventTypeIcon: (eventType) => {
    switch (eventType) {
      case 'meeting':
        return QBGraphics.QB_MEETING_ICON;
      case 'leadership':
        return QBGraphics.QB_LEADERSHIP_ICON;
      case 'orientation':
        return QBGraphics.QB_WINGS;
      default:
        return QBGraphics.ORLQB_LOGO_ICON;
    }
  },
  
  // Get background for screen
  getScreenBackground: (screenName) => {
    return ScreenImages[screenName?.toUpperCase()]?.BACKGROUND || MiscPhotos.GRADIENT_AVIATION;
  },
};

// Export all collections
export default {
  MemberPhotos,
  ORLQBPhotos,
  QBGraphics,
  MiscPhotos,
  ScreenImages,
  ImageUtils,
};

// Video assets (for future implementation)
export const VideoAssets = {
  // Intro videos (requires expo-av)
  INTRO_VIDEO: require('../../assets/videos/orlqb_intro.mp4'),
  HANGAR_TOUR: require('../../assets/videos/orlqb_hangar_tour.mp4'),
  
  // Background videos
  AVIATION_LOOP: require('../../assets/videos/aviation_background_loop.mp4'),
};

// Usage Examples:
/*
// In a component:
import { ORLQBPhotos, QBGraphics, ImageUtils } from '../constants/images';

// Static image
<Image source={ORLQBPhotos.HANGAR_EXTERIOR} />

// Dynamic member photo
<Image source={ImageUtils.getMemberPhoto(123)} />

// Role-specific icon
<Image source={ImageUtils.getRoleIcon('governor')} />

// Screen background
<ImageBackground source={ImageUtils.getScreenBackground('intro')} />
*/