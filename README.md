# ORLQB React Native App 🛩️

A comprehensive React Native Expo application for the **Order of Quiet Birdmen (ORLQB)** Orlando Hangar, featuring complete leadership management tools and authentic ORLQB organizational structure. Migrated from Ionic Angular for superior performance and native user experience.

## 🌟 **Featured Capabilities**

- **🏛️ Authentic ORLQB Structure**: Complete 6-persona Leadmen hierarchy with 5-level security system
- **📋 Leadership Dashboard**: Comprehensive management tools for the 4 main ORLQB gathering types
- **👥 Member Management**: Profile cards, attendance tracking, and role administration
- **📦 Resource Management**: Complete Hangar inventory tracking for all supplies and equipment
- **📊 Administrative Reports**: Attendance, Financial, Logistics, and Meeting Minutes documentation
- **🔐 Role-based Security**: Hierarchical access control from Guest (Level 0) to Governor/Historian (Level 4)

---

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

## 🎯 **ORLQB Leadership Management System**

### 📋 **Leadership Dashboard**
The central hub for ORLQB Leadmen (Level 3+) providing comprehensive management tools for the 4 main types of ORLQB gatherings:

#### **🗓️ Monthly Meetings**
- Regular Hangar business meetings and fellowship
- Agenda preparation and meeting logistics
- Member notification coordination
- Recurring schedule management

#### **✈️ Wing Dings**  
- Social gatherings and celebrations
- Entertainment and activity planning
- Catering and venue coordination
- Guest list and invitation management

#### **🎗️ Initiations**
- New member induction ceremonies
- Ceremonial material preparation
- Candidate coordination and scheduling
- Protocol compliance and venue arrangement

#### **⭐ Special Events**
- Commemorative and unique gatherings
- External partnership coordination
- Special logistical arrangements
- Custom event planning tools

---

### 👥 **Member Management System**

Complete member profile administration with advanced features:

#### **Member Profile Cards**
- High-resolution member photos
- Role status with security level badges
- Contact information (phone, email, address)
- Emergency contact details
- Join date and membership notes
- Active/inactive status management

#### **Attendance Tracking**
- **Check-in Options**: Present, Called In, Excused, Absent
- **Event Integration**: Track attendance across all ORLQB gathering types
- **Historical Data**: Complete participation history per member
- **Real-time Updates**: Instant attendance recording during events
- **Participation Reports**: Generate attendance summaries

#### **Advanced Features**
- **Search & Filter**: By role, name, email, status
- **Role Management**: Update member roles within ORLQB hierarchy
- **Batch Operations**: Bulk attendance updates
- **Export Capabilities**: Member lists and attendance reports

---

### 📦 **Resource & Inventory Management**

Professional-grade inventory system for all Hangar resources:

#### **Resource Categories**
1. **🍽️ Food & Beverages**: Coffee, Tea, Snacks, Event Catering
2. **🪑 Furniture & Setup**: Chairs, Tables, Podium, Display Stands
3. **🎤 Audio/Video**: Microphones, Speakers, Projectors, Cables, Lighting
4. **📋 Signage & Materials**: Banners, Programs, Certificates, Name Tags
5. **🎗️ Ceremonial Items**: Robes, Decorations, Awards, Memorabilia
6. **📦 General Supplies**: Paper Goods, Cleaning Supplies, Office Materials

#### **Inventory Features**
- **Stock Tracking**: Current quantity, min/max levels
- **Usage Logging**: Track consumption with operation history
- **Reorder Alerts**: Automatic low-stock notifications
- **Supplier Management**: Vendor contact and procurement tracking
- **Location Mapping**: Storage location tracking
- **Cost Management**: Budget tracking and expense reporting

#### **Stock Operations**
- **Quick Actions**: Use/Restock buttons with quantity input
- **Bulk Updates**: Mass inventory adjustments
- **Audit Trail**: Complete history of stock changes
- **Reporting**: Inventory status and usage reports

---

### 📊 **Reports & Documentation System**

Comprehensive reporting tools for administrative record-keeping:

#### **Report Types**

##### **📈 Attendance Reports**
- Member participation tracking across events
- Attendance percentages by role and time period
- Event-specific attendance summaries
- Trend analysis and participation insights

##### **💰 Financial Reports**
- Budget tracking and expense management
- Income categorization and expense analysis
- Event cost breakdowns and profitability
- Annual financial summaries

##### **⚙️ Meeting Logistics Reports**
- Event planning and execution documentation
- Venue capacity and setup requirements  
- Resource utilization and logistics coordination
- Issue tracking and resolution documentation

##### **📝 Meeting Minutes**
- Official meeting records and decisions
- Attendee tracking and chairperson documentation
- Agenda items and motion recording
- Action item assignment and follow-up

#### **Report Features**
- **Date Range Filtering**: Custom time period selection
- **Export Options**: PDF and CSV format support
- **Template System**: Standardized report formats
- **Historical Archive**: Complete documentation history
- **Search & Filter**: Find reports by type, date, or content

---

## 🔧 **Technical Architecture**

### **Frontend Stack**
- **React Native**: Cross-platform native development
- **Expo SDK 51**: Development platform and build system
- **React Navigation**: Stack and tab-based navigation
- **Expo Vector Icons**: Ionicons for consistent UI
- **React Context API**: Global state management
- **AsyncStorage**: Local data persistence

### **Backend & Database**
- **Firebase Authentication**: Email/password with role-based access
- **Cloud Firestore**: Real-time database with offline support
- **Firestore Security Rules**: Server-side authorization enforcement
- **Firebase SDK**: Native iOS/Android integration

### **Security Architecture**
- **5-Level Hierarchy**: Granular access control (Levels 0-4)
- **Role-Based Components**: Client-side authorization wrappers
- **Server-side Validation**: Firestore rules enforce permissions
- **Audit Logging**: Complete tracking of administrative actions

### **Data Architecture**
```
Firestore Collections:
├── users/           # Member profiles and roles
├── events/          # ORLQB gatherings and meetings
├── attendance/      # Event participation tracking
├── resources/       # Hangar inventory management
└── reports/         # Administrative documentation
```

---

## 🚀 **Deployment & Distribution**

### **Development Environment**
```bash
# Install dependencies
npm install

# Start development server
npm start

# Platform-specific testing
npm run ios      # iOS Simulator
npm run android  # Android Emulator  
npm run web      # Web browser
```

### **EAS Build System**
```bash
# Development builds (with Expo Dev Client)
eas build --profile development --platform all

# Preview builds (standalone APK/IPA for testing)
eas build --profile preview --platform all

# Production builds (app store ready)
eas build --profile production --platform all
```

### **Firebase Setup**
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Add iOS/Android apps and download config files:
   - `GoogleService-Info.plist` (iOS)
   - `google-services.json` (Android)
5. Deploy Firestore security rules: `firebase deploy --only firestore:rules`

### **Environment Configuration**
- **Development**: Uses Expo Development Client
- **Preview**: Standalone builds for testing
- **Production**: Optimized builds for app stores

---

## 📚 **Migration from Ionic Angular**

This comprehensive React Native application was migrated from Ionic Angular to achieve:

### **Performance Improvements**
- **Native Components**: True native UI instead of web views
- **60fps Animations**: Smooth native transitions and interactions
- **Reduced Bundle Size**: Optimized for mobile deployment
- **Better Memory Management**: Native garbage collection

### **Enhanced User Experience**  
- **Native Navigation**: iOS/Android standard navigation patterns
- **Platform-specific UI**: Adaptive components for each platform
- **Offline-first Design**: Robust offline functionality
- **Push Notifications**: Native notification support

### **Developer Benefits**
- **Hot Reload**: Instant development feedback
- **Better Debugging**: Native debugging tools integration
- **Single Codebase**: iOS and Android from one source
- **Modern Architecture**: React hooks and context patterns

See `MIGRATION_GUIDE.md` for detailed migration notes and comparisons.

---

## 🎯 **Future Enhancements**

- **📱 Push Notifications**: Event reminders and admin alerts
- **📍 Location Services**: Venue mapping and check-in features  
- **💬 Messaging System**: Internal member communication
- **📸 Photo Management**: Event photo galleries and sharing
- **🔄 Sync Optimization**: Enhanced offline capabilities
- **📊 Advanced Analytics**: Detailed participation insights
- **🏆 Achievement System**: Member recognition and badges

---

## 🤝 **Contributing**

This is a private application for the Order of Quiet Birdmen Orlando Hangar. Development is restricted to authorized contributors.

For authorized developers:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 **License**

Private - **Ye Ancient and Secret Order of Quiet Birdmen (ORLQB)**  
Orlando Hangar • Restricted Access • All Rights Reserved

---

## 📞 **Support & Documentation**

- **Technical Documentation**: See `CLAUDE.md` for development guidelines
- **Component Documentation**: `src/components/` with inline documentation
- **Firebase Setup**: `firebase.json` and `firestore.rules` configurations
- **Build Configuration**: `eas.json` for deployment profiles

**Repository**: [https://github.com/johnmcleroy/ORLQB-RN-App](https://github.com/johnmcleroy/ORLQB-RN-App)

---

*🛩️ Generated with [Claude Code](https://claude.ai/code)*