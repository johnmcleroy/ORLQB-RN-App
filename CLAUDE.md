# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Expo Development Server
```bash
npm start          # Start Expo development server with QR code
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device
npm run web        # Run in web browser
```

### EAS Build Commands
```bash
eas build --profile development  # Development build
eas build --profile preview      # Preview build (APK for Android)
eas build --profile production   # Production build for app stores
eas build --platform all         # Build for both iOS and Android
```

### Ruby and CocoaPods Setup
For iOS development, ensure you have the correct Ruby and CocoaPods setup:
```bash
# Use Homebrew Ruby (recommended)
export PATH="/Users/macbookpro/.gem/ruby/3.4.0/bin:/usr/local/opt/ruby/bin:$PATH"
rvm use system  # Switch away from RVM if installed

# Verify versions
ruby --version   # Should show 3.4.5
pod --version    # Should show 1.16.2+
```

### Build Profiles
- **development**: Internal testing with development client
- **preview**: APK builds for testing, iOS simulator builds
- **production**: App store ready builds

## Architecture Overview
### File Structure local location
-- /Users/macbookpro/GitHub/johnmcleroy/ORLQB/IO7_ORLQB_App

### React Native Expo App
This is a React Native app using Expo framework, migrated from Ionic Angular. The app uses:
- **React Navigation** for navigation (Stack + Bottom Tabs)
- **Firebase** for authentication and Firestore database
- **React Context API** for global state management
- **AsyncStorage** for local data persistence

### Key Architectural Patterns

#### Authentication Flow
- `AuthContext.js` provides global authentication state using React Context
- Authentication state automatically determines navigation flow
- `AppNavigator.js` conditionally renders auth screens vs main app based on user state
- Firebase auth state listener maintains session persistence

#### Navigation Structure
```
AppNavigator (Stack)
├── Auth Flow (when not authenticated)
│   ├── WelcomeScreen (if first time)
│   ├── LoginScreen
│   └── SignUpScreen
└── MainApp (when authenticated)
    └── TabNavigator (Bottom Tabs)
        ├── GuestsScreen
        ├── MembersScreen  
        ├── LeadmenScreen
        ├── AdminScreen
        └── ProfileScreen
```

#### Role-Based Access
The app implements role-based navigation through bottom tabs. Different user roles see different tabs:
- **Guests**: Limited access
- **Members**: Standard access
- **Leadmen**: Leadership features
- **Admin**: Full administrative access

### Firebase Integration
- Uses React Native Firebase (native SDKs) instead of web SDK for better performance
- Configuration includes authentication and Firestore
- Firebase config is centralized in `src/services/firebase.js`

### State Management Philosophy
- React Context API for global state (authentication)
- Local component state with useState for UI state
- Firebase real-time listeners for data synchronization
- AsyncStorage for persistent local preferences

### Code Organization
- `src/screens/`: Organized by user role (auth, guests, members, leadmen, admin, profile)
- `src/navigation/`: Navigation configuration and routing logic
- `src/context/`: Global state providers (currently just AuthContext)
- `src/services/`: External service integrations (Firebase configuration)
- `src/components/`: Reusable UI components (currently empty, ready for shared components)

### Migration Context
This codebase was migrated from Ionic Angular to React Native for:
- Native performance improvements
- Better Firebase integration
- Smaller bundle sizes
- Improved development experience

The code includes extensive learning comments comparing Angular patterns to React patterns to help with the transition understanding.