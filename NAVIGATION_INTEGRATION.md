# Navigation Integration - Turn-by-Turn Directions

## Overview

The ORLQB app now includes comprehensive navigation integration that provides turn-by-turn directions to event locations using the device's native navigation apps.

## Features

### 🗺️ **Cross-Platform Navigation Support**
- **iOS**: Apple Maps, Google Maps, Waze
- **Android**: Google Maps, Waze  
- **Web**: Google Maps (web interface)

### 📍 **Location Integration**
- Automatic location permission handling
- Current location detection for optimal routing
- Support for both address strings and GPS coordinates

### 🎯 **ORLQB Location Database**
- Pre-configured common ORLQB venues:
  - Orlando QB Hangar (Orlando Executive Airport)
  - Orlando Executive Airport
- Easy expansion for additional frequent locations

## User Experience

### Event Location Navigation
1. **Open any event** from the calendar
2. **Tap the location** in event details (shows navigation icon)
3. **Choose navigation app** from available options
4. **Get turn-by-turn directions** automatically

### Navigation Button
- **"Get Directions" button** appears for events with location data
- **Orange button** for easy identification
- **One-tap navigation** to user's preferred app

## Technical Implementation

### Location Services
```javascript
// Location permission handling
const permissionResult = await checkLocationPermission();

// Current location for better routing  
const currentLocation = await getCurrentLocation();
```

### Multi-Platform Navigation URLs
```javascript
// iOS Apple Maps
maps://?daddr=28.5449,-81.3324&saddr=current

// Google Maps (iOS)
comgooglemaps://?daddr=28.5449,-81.3324&directionsmode=driving

// Google Maps (Android)  
google.navigation:q=28.5449,-81.3324

// Waze
waze://?ll=28.5449,-81.3324&navigate=yes

// Web Google Maps
https://maps.google.com/dir/?api=1&destination=28.5449,-81.3324
```

### Location Data Structure
```javascript
const orlqbLocation = {
  address: 'Orlando Executive Airport, Orlando, FL 32803',
  latitude: 28.5449,
  longitude: -81.3324,
  name: 'Orlando QB Hangar'
};
```

## Configuration

### Permissions (app.json)
```json
{
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "ORLQB needs location access to provide turn-by-turn navigation to event locations and hangar meetings."
    }
  },
  "android": {
    "permissions": [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION"
    ]
  }
}
```

### Dependencies
- `expo-location`: Location services and permissions
- `expo-linking`: Deep linking to navigation apps
- Native navigation apps (user-installed)

## Navigation Options

### Automatic App Detection
The system automatically detects which navigation apps are installed:
- **Single app**: Opens directly
- **Multiple apps**: Shows selection dialog
- **No apps**: Prompts user to install navigation app

### Fallback Strategy  
1. **Best available app** (prioritized order)
2. **User selection** for multiple options
3. **Installation prompt** if no apps found

## Location Format Support

### Supported Location Formats
1. **Known ORLQB locations**: "Orlando QB Hangar"
2. **Address strings**: "123 Airport Blvd, Orlando, FL"
3. **Coordinates**: "Orlando QB Hangar (28.5449, -81.3324)"
4. **GPS coordinates**: Direct latitude/longitude

### Event Location Examples
```javascript
// Known location (automatic GPS lookup)
location: "Orlando QB Hangar"

// Full address (geocoded by navigation app)
location: "Orlando Executive Airport, 365 Rickenbacker Dr, Orlando, FL 32803"  

// Address with coordinates (precise navigation)
location: "Orlando QB Hangar (28.5449, -81.3324)"
```

## User Interface

### Visual Indicators
- **Navigation icon** (🧭) appears next to clickable locations
- **Underlined text** indicates interactive location
- **Blue highlight** on location tap
- **Orange "Get Directions" button** in event actions

### Interactive Elements
- **Tap location text**: Shows navigation app options
- **"Get Directions" button**: Quick navigation launch
- **Location permissions**: Automatic request when needed

## Error Handling

### Common Scenarios
- **No location data**: "Location information not available"
- **No navigation apps**: "Please install Google Maps, Apple Maps, or Waze"  
- **Permission denied**: "Location permission required for navigation"
- **Network issues**: Graceful fallback to address-based navigation

### User Feedback
- **Success**: Direct app launch with routing
- **Errors**: Clear alerts with actionable solutions
- **Permissions**: Helpful explanation of why location is needed

## Future Enhancements

### Planned Features
- **Distance and travel time** estimates
- **Multiple destination routing** for event series
- **Saved favorite locations** for quick access
- **Traffic-aware routing** recommendations

### Integration Opportunities
- **Calendar reminders** with navigation shortcuts
- **Event check-in** with location verification
- **Hangar proximity** notifications
- **Meeting attendance** tracking via location

## Testing

### Web Testing (https://orlqb.org)
1. Open calendar and select an event
2. Verify "Get Directions" button appears
3. Click location or directions button  
4. Should open Google Maps in new tab

### Mobile Testing
1. Install Google Maps, Apple Maps, or Waze
2. Open ORLQB app and navigate to event
3. Grant location permissions when prompted
4. Test navigation to Orlando QB Hangar
5. Verify turn-by-turn directions launch

## Troubleshooting

### Common Issues
- **Button not showing**: Event may not have location data
- **Navigation not opening**: Check if navigation apps are installed
- **Permission errors**: Grant location access in device settings
- **Incorrect destination**: Verify event location data accuracy

### Debug Information
Location parsing and navigation attempts are logged to console for development debugging.