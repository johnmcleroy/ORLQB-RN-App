# ORLQB React Native App

A React Native Expo application for the Ye Ancient Order of Quiet Birdmen, migrated from Ionic Angular for better performance and native experience.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your phone (for testing)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Development Commands
```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
```

## 📱 Project Structure

```
src/
├── navigation/           # Navigation configuration
│   ├── AppNavigator.js  # Main app navigation
│   └── TabNavigator.js  # Role-based bottom tab navigation
├── screens/             # Screen components organized by role
│   ├── auth/           # Authentication screens
│   ├── guests/         # Guest role screens (Level 0+)
│   ├── members/        # Member screens (Level 1+)
│   ├── leadmen/        # Leadership screens (Level 3+)
│   ├── admin/          # Admin screens (Level 4+)
│   └── profile/        # Profile screens (All levels)
├── context/            # React Context providers
│   └── AuthContext.js  # Authentication & role state
├── services/           # API and Firebase services
│   └── firebase.js     # Firebase configuration
├── components/         # Reusable UI components
│   ├── Auth/           # Authorization components
│   │   ├── RoleBasedComponent.js  # Main authorization wrapper
│   │   └── index.js    # Convenience component exports
│   ├── Calendar/       # Calendar management
│   └── Admin/          # Administrative components
├── utils/              # Utility functions
│   └── userRoles.js    # ORLQB role definitions & functions
└── firestore.rules     # Firebase security rules
```

### Key Implementation Files

#### Authentication & Authorization
- **`src/utils/userRoles.js`**: ORLQB role constants, security levels, and utility functions
- **`src/components/Auth/RoleBasedComponent.js`**: Higher-order component for role-based visibility
- **`src/context/AuthContext.js`**: React Context managing authentication and user roles
- **`firestore.rules`**: Firebase Firestore security rules enforcing ORLQB hierarchy

#### Navigation
- **`src/navigation/TabNavigator.js`**: Implements role-based tab visibility using ORLQB security levels
- **`src/navigation/AppNavigator.js`**: Main navigation flow with authentication guards

## 🔥 Firebase Setup

The app uses Firebase for:
- Authentication (Email/Password)
- Firestore database
- Real-time updates

Firebase configuration is in `src/services/firebase.js`.

## 🎯 Key Features

- **ORLQB Role-based Authentication**: Authentic Order of Quiet Birdmen organizational hierarchy
- **5-Level Security Authorization**: Comprehensive access control (Levels 0-4)
- **Hangar-specific Access Control**: Page and component visibility based on roles
- **Firebase Authentication**: Secure login/signup with email
- **Native Performance**: 60fps animations and smooth scrolling
- **Cross-platform**: Single codebase for iOS and Android
- **Offline Support**: Works without internet connection

## 🏛️ ORLQB Organizational Structure

### Hangar Hierarchy
This app implements the authentic **Order of Quiet Birdmen (ORLQB)** organizational structure for local Hangars within the National Organization.

#### Leadership Roles (Leadmen)
The app recognizes 6 distinct Leadmen personas:

| Role | Persona | Security Level | Description |
|------|---------|----------------|-------------|
| **Governor** | Senior Leadership | Level 4 | Hangar executive leadership |
| **Historian** | Senior Leadership | Level 4 | Records and heritage keeper |
| **Assistant Governor** | Leadman | Level 3 | Deputy executive leadership |
| **Keyman** | Leadman | Level 3 | Membership and access control |
| **Assistant Keyman** | Leadman | Level 3 | Deputy membership management |
| **Beam Man** | Leadman | Level 3 | Ceremonial and protocol officer |

#### Membership Levels

| Level | Role | Security Level | Access Rights |
|-------|------|----------------|---------------|
| **0** | Guest | Level 0 | Basic guest information access |
| **1** | Candidate/Initiate | Level 1 | Member directory access |
| **2** | Member | Level 2 | Full member privileges |
| **3** | Leadman | Level 3 | Leadership functions access |
| **4** | Senior Leadership | Level 4 | Full administrative access |
| **5** | Sudo Admin | Level 5 | System administration (technical) |

## 🔐 Authentication & Authorization System

### Security Authorization Levels
The app implements a hierarchical security system where **higher levels inherit all lower level permissions**:

- **Level 0 (Guest)**: Guest information, Profile access
- **Level 1 (Candidate/Initiate)**: + Member directory access  
- **Level 2 (Member)**: + Full member privileges
- **Level 3 (Leadman)**: + Leadership functions and tools
- **Level 4 (Senior Leadership)**: + Hangar administration
- **Level 5 (Sudo Admin)**: + System configuration

### Role-based Component Visibility
Components and pages are protected using the `RoleBasedComponent` system:

```javascript
// Security level based access
<RoleBasedComponent requiredLevel={3}>
  <LeadmenOnlyContent />
</RoleBasedComponent>

// Specific role based access  
<RoleBasedComponent allowedRoles={[HANGAR_ROLES.GOVERNOR, HANGAR_ROLES.HISTORIAN]}>
  <SeniorLeadershipContent />
</RoleBasedComponent>

// Convenience components
<LeadmenOnly>
  <LeadershipTools />
</LeadmenOnly>
```

### Navigation Access Control
Bottom tab navigation is dynamically controlled based on user authorization:

- **Guests Tab**: All authenticated users (Level 0+)
- **Members Tab**: Candidates and above (Level 1+)
- **Leadmen Tab**: Leadership roles only (Level 3+)  
- **Admin Tab**: Senior Leadership (Level 4+) or Sudo Admin
- **Profile Tab**: All authenticated users

### Firebase Security Rules
Firestore security rules enforce the same hierarchical access:

```javascript
// Example: Leadmen-only document access
allow read, write: if hasSecurityLevel(3);

// Senior leadership administrative functions
allow read, write: if hasSecurityLevel(4);
```

## 👨‍💻 Developer Usage

### Using Role-based Components

Import authorization components:
```javascript
import { 
  RoleBasedComponent, 
  LeadmenOnly, 
  SeniorLeadershipOnly,
  GovernorOnly 
} from '../components/Auth';
import { HANGAR_ROLES } from '../utils/userRoles';
```

### Example Implementations

#### Security Level Based Access
```javascript
// Require minimum security level
<RoleBasedComponent requiredLevel={2}>
  <MemberOnlyFeature />
</RoleBasedComponent>

// Hide completely when access denied
<RoleBasedComponent requiredLevel={3} hideWhenDenied={true}>
  <LeadershipTools />
</RoleBasedComponent>
```

#### Specific Role Access
```javascript
// Allow specific roles only
<RoleBasedComponent 
  allowedRoles={[
    HANGAR_ROLES.KEYMAN, 
    HANGAR_ROLES.ASSISTANT_KEYMAN
  ]}
>
  <MembershipManagement />
</RoleBasedComponent>

// Deny specific roles
<RoleBasedComponent 
  deniedRoles={[HANGAR_ROLES.GUEST]}
  fallbackComponent={<PleaseSignIn />}
>
  <AuthenticatedContent />
</RoleBasedComponent>
```

#### Convenience Components
```javascript
// Quick access patterns
<LeadmenOnly>
  <LeadershipDashboard />
</LeadmenOnly>

<SeniorLeadershipOnly>
  <HangarAdministration />
</SeniorLeadershipOnly>

<GovernorOnly hideWhenDenied={true}>
  <ExecutiveDecisions />
</GovernorOnly>
```

### Testing Different Roles
Use the auth context to check current user role:
```javascript
import { useAuth } from '../context/AuthContext';
import { getRoleDisplayName, SECURITY_LEVELS } from '../utils/userRoles';

const MyComponent = () => {
  const { userRole } = useAuth();
  const userLevel = SECURITY_LEVELS[userRole] || 0;
  
  return (
    <Text>
      Current Role: {getRoleDisplayName(userRole)} (Level {userLevel})
    </Text>
  );
};
```

## 📚 Migration from Ionic

This app was migrated from Ionic Angular to React Native for:
- Better performance (native components vs web views)
- Smaller bundle size
- Better Firebase integration
- Improved development experience

See `MIGRATION_GUIDE.md` for detailed migration notes.

## 🔧 Development

### Testing
- Use Expo Go app to test on physical device
- Changes appear instantly (hot reload)
- No need to build for testing

### Building for Production
```bash
# Build for app stores
eas build --platform all
```

## 📄 License

Private - Ye Ancient and Secret Order of Quiet Birdmen (ORLQB)