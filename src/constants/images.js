/**
 * ORLQB Image Assets Constants - Simplified for Web Loading
 * 
 * Using simple placeholders and Unsplash images to ensure web compatibility
 */

// Simple color placeholder generator
const createColorPlaceholder = (width = 400, height = 300, color = 'cccccc', textColor = '666666', text = '') => {
  return { uri: `https://via.placeholder.com/${width}x${height}/${color}/${textColor}?text=${encodeURIComponent(text || 'ORLQB')}` };
};

// Member Photos - Simple placeholders
export const MemberPhotos = {
  DEFAULT_AVATAR: createColorPlaceholder(150, 150, 'f0f0f0', 'FFD700', 'ORLQB Member'),
  
  getMemberPhoto: (qbNumber) => {
    if (qbNumber) {
      return createColorPlaceholder(150, 150, 'f0f0f0', 'FFD700', `QB ${qbNumber}`);
    }
    return MemberPhotos.DEFAULT_AVATAR;
  }
};

// ORLQB Official Photos - Simple Unsplash aviation images
export const ORLQBPhotos = {
  HANGAR_EXTERIOR: { uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
  HANGAR_INTERIOR: { uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
  HANGAR_MEETING_ROOM: createColorPlaceholder(1200, 800, 'e5e5e5', '666666', 'ORLQB Meeting Room'),
  
  MONTHLY_MEETING: createColorPlaceholder(1200, 800, 'f0f8ff', '333333', 'Monthly Meeting'),
  LEADERSHIP_CEREMONY: createColorPlaceholder(1200, 800, 'fffacd', '333333', 'Leadership Ceremony'),
  
  ORLQB_FOUNDING: createColorPlaceholder(1200, 800, 'f5f5dc', '444444', 'ORLQB History'),
  
  AVIATION_BACKGROUND: { uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
  INTRO_BACKGROUND: { uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
};

// Quebec Bravo Graphics - Simple placeholders 
export const QBGraphics = {
  ORLQB_LOGO_MAIN: createColorPlaceholder(200, 200, 'FFD700', '000000', 'ORLQB'),
  ORLQB_LOGO_LIGHT: createColorPlaceholder(200, 200, 'ffffff', 'FFD700', 'ORLQB'),
  ORLQB_LOGO_DARK: createColorPlaceholder(200, 200, '333333', 'FFD700', 'ORLQB'),
  ORLQB_LOGO_ICON: createColorPlaceholder(64, 64, 'FFD700', 'ffffff', 'QB'),
  
  QB_WINGS: createColorPlaceholder(100, 50, 'FFD700', '333333', 'Wings'),
  QB_PROPELLER: createColorPlaceholder(80, 80, 'cccccc', '666666', 'Prop'),
  QB_COMPASS: createColorPlaceholder(100, 100, 'e6e6fa', '4169e1', 'Compass'),
  
  QB_MEETING_ICON: createColorPlaceholder(48, 48, 'lightblue', '333333', 'Meet'),
  QB_LEADERSHIP_ICON: createColorPlaceholder(48, 48, 'gold', '333333', 'Lead'),
  QB_HANGAR_ICON: createColorPlaceholder(48, 48, 'lightgray', '333333', 'Hangar'),
  
  QB_TEXTURE_METAL: createColorPlaceholder(400, 300, 'c0c0c0', '666666', 'Metal Texture'),
  QB_PATTERN_AVIATION: createColorPlaceholder(400, 300, 'f0f8ff', '333333', 'Aviation Pattern'),
};

// Miscellaneous Photos - Simple placeholders
export const MiscPhotos = {
  AIRPORT_RUNWAY: createColorPlaceholder(1200, 800, 'a9a9a9', '333333', 'Airport Runway'),
  AVIATION_SUNSET: { uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  PROPELLER_CLOSEUP: createColorPlaceholder(600, 400, 'ddd', '333', 'Propeller'),
  
  ORLANDO_EXECUTIVE_AIRPORT: createColorPlaceholder(1200, 800, 'e0e0e0', '444444', 'Orlando Executive'),
  ORLANDO_SKYLINE: createColorPlaceholder(1200, 600, 'f0f0f0', '555555', 'Orlando Skyline'),
  
  CONFERENCE_ROOM: createColorPlaceholder(800, 600, 'f5f5f5', '666666', 'Conference Room'),
  
  GRADIENT_AVIATION: { uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  TEXTURE_CONCRETE: createColorPlaceholder(400, 400, 'cccccc', '888888', 'Concrete'),
};

// Simple utility functions
export const ImageUtils = {
  getMemberPhoto: (qbNumber) => MemberPhotos.getMemberPhoto(qbNumber),
  
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
  }
};

// Simple exports
export default {
  MemberPhotos,
  ORLQBPhotos,
  QBGraphics,
  MiscPhotos,
  ImageUtils,
};