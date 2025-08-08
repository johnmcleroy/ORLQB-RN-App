/**
 * RoleBasedComponent - Higher-Order Component for Authorization-Based Visibility
 * 
 * This component controls visibility of pages and components based on ORLQB
 * security authorization levels (0-4) and specific role requirements.
 * 
 * Usage Examples:
 * 
 * Security Level Based:
 * <RoleBasedComponent requiredLevel={3}>
 *   <LeadmenOnlyContent />
 * </RoleBasedComponent>
 * 
 * Specific Role Based:
 * <RoleBasedComponent allowedRoles={[HANGAR_ROLES.GOVERNOR, HANGAR_ROLES.HISTORIAN]}>
 *   <SeniorLeadershipContent />
 * </RoleBasedComponent>
 * 
 * Combined Requirements:
 * <RoleBasedComponent 
 *   requiredLevel={2} 
 *   allowedRoles={[HANGAR_ROLES.KEYMAN]}
 *   fallbackComponent={<AccessDeniedMessage />}
 * >
 *   <RestrictedContent />
 * </RoleBasedComponent>
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { 
  hasSecurityLevel, 
  SECURITY_LEVELS, 
  getRoleDisplayName, 
  getRoleColor,
  getRoleIcon,
  HANGAR_ROLES,
  logVisibilityEvent 
} from '../../utils/userRoles';

const RoleBasedComponent = ({
  children,
  requiredLevel = null,              // Minimum security level (0-4)
  allowedRoles = [],                 // Specific roles allowed
  deniedRoles = [],                  // Specific roles denied
  requireLeadman = false,            // Must be Level 3+ Leadman
  requireSeniorLeadership = false,   // Must be Level 4 Leadman
  fallbackComponent = null,          // Custom component when access denied
  showAccessDenied = true,           // Show default access denied message
  hideWhenDenied = false,            // Hide completely when access denied
  debugMode = false,                 // Show debug info
  componentName = 'Unknown Component', // Component name for monitoring
  enableMonitoring = true            // Enable admin monitoring
}) => {
  const { user, userRole } = useAuth();

  // Debug information
  if (debugMode) {
    console.log('RoleBasedComponent Debug:', {
      userRole,
      userLevel: SECURITY_LEVELS[userRole] || 0,
      requiredLevel,
      allowedRoles,
      deniedRoles,
      requireLeadman,
      requireSeniorLeadership,
      componentName
    });
  }

  // Log access attempt for admin monitoring
  useEffect(() => {
    if (enableMonitoring && user) {
      logVisibilityEvent({
        componentName,
        userEmail: user.email,
        userRole,
        userLevel: SECURITY_LEVELS[userRole] || 0,
        requiredLevel,
        allowedRoles,
        deniedRoles,
        requireLeadman,
        requireSeniorLeadership,
        timestamp: new Date().toISOString()
      });
    }
  }, [user, userRole, componentName, enableMonitoring]);

  const userSecurityLevel = SECURITY_LEVELS[userRole] || 0;
  let accessDecision = { granted: true, reason: null };

  // Check if user is authenticated
  if (!user) {
    accessDecision = { granted: false, reason: 'not_authenticated' };
    
    // Log the access decision
    if (enableMonitoring) {
      logVisibilityEvent({
        componentName,
        userEmail: 'anonymous',
        userRole: 'anonymous',
        userLevel: 0,
        requiredLevel,
        allowedRoles,
        deniedRoles,
        requireLeadman,
        requireSeniorLeadership,
        accessGranted: false,
        accessReason: 'not_authenticated',
        timestamp: new Date().toISOString()
      });
    }
    
    if (hideWhenDenied) return null;
    return fallbackComponent || (showAccessDenied ? <AuthenticationRequired /> : null);
  }

  // Check specific denied roles first
  if (deniedRoles.length > 0 && deniedRoles.includes(userRole)) {
    accessDecision = { granted: false, reason: 'role_denied' };
  }
  // Check required security level
  else if (requiredLevel !== null && !hasSecurityLevel(userRole, requiredLevel)) {
    accessDecision = { granted: false, reason: 'insufficient_level' };
  }
  // Check specific allowed roles
  else if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    accessDecision = { granted: false, reason: 'role_not_allowed' };
  }
  // Check Leadman requirement (Level 3+)
  else if (requireLeadman && userSecurityLevel < 3 && userRole !== HANGAR_ROLES.SUDO_ADMIN) {
    accessDecision = { granted: false, reason: 'leadman_required' };
  }
  // Check Senior Leadership requirement (Level 4)
  else if (requireSeniorLeadership && userSecurityLevel < 4 && userRole !== HANGAR_ROLES.SUDO_ADMIN) {
    accessDecision = { granted: false, reason: 'senior_leadership_required' };
  }

  // Log the access decision for admin monitoring
  if (enableMonitoring && user) {
    logVisibilityEvent({
      componentName,
      userEmail: user.email,
      userRole,
      userLevel: userSecurityLevel,
      requiredLevel,
      allowedRoles,
      deniedRoles,
      requireLeadman,
      requireSeniorLeadership,
      accessGranted: accessDecision.granted,
      accessReason: accessDecision.reason || 'access_granted',
      timestamp: new Date().toISOString()
    });
  }

  // Handle access denied cases
  if (!accessDecision.granted) {
    if (hideWhenDenied) return null;
    
    const accessDeniedProps = {
      reason: accessDecision.reason,
      userRole,
      requiredLevel,
      userLevel: userSecurityLevel,
      allowedRoles
    };
    
    return fallbackComponent || (showAccessDenied ? <AccessDenied {...accessDeniedProps} /> : null);
  }

  // Access granted - render children
  return <>{children}</>;
};

// Authentication Required Component
const AuthenticationRequired = () => (
  <View style={styles.accessDeniedContainer}>
    <Ionicons name="lock-closed-outline" size={48} color="#ff6b6b" />
    <Text style={styles.accessDeniedTitle}>Authentication Required</Text>
    <Text style={styles.accessDeniedMessage}>
      Please sign in to access this content
    </Text>
  </View>
);

// Access Denied Component
const AccessDenied = ({ reason, userRole, requiredLevel, userLevel, allowedRoles }) => {
  const getMessage = () => {
    switch (reason) {
      case 'insufficient_level':
        return `Security Level ${requiredLevel} Required\nYour Level: ${userLevel}`;
      case 'role_not_allowed':
        return `Restricted Access\nAllowed: ${allowedRoles.map(role => getRoleDisplayName(role)).join(', ')}`;
      case 'role_denied':
        return 'Access Denied for Your Role';
      case 'leadman_required':
        return 'Leadman Access Required\n(Level 3+ Leadership)';
      case 'senior_leadership_required':
        return 'Senior Leadership Access Required\n(Governor or Historian)';
      default:
        return 'Access Denied';
    }
  };

  return (
    <View style={styles.accessDeniedContainer}>
      <Ionicons 
        name="shield-outline" 
        size={48} 
        color={getRoleColor(userRole)} 
      />
      <Text style={styles.accessDeniedTitle}>
        {reason === 'insufficient_level' ? '🔒 Insufficient Clearance' : '🚫 Access Restricted'}
      </Text>
      <Text style={styles.accessDeniedMessage}>{getMessage()}</Text>
      
      <View style={styles.userInfoContainer}>
        <View style={styles.userRoleChip}>
          <Ionicons 
            name={getRoleIcon(userRole)} 
            size={14} 
            color={getRoleColor(userRole)} 
          />
          <Text style={[styles.userRoleText, { color: getRoleColor(userRole) }]}>
            {getRoleDisplayName(userRole)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Convenience Components for Common Use Cases

// Members Only (Level 2+)
export const MembersOnly = ({ children, fallback, hideWhenDenied = false, componentName = 'MembersOnly Component' }) => (
  <RoleBasedComponent 
    requiredLevel={2} 
    fallbackComponent={fallback}
    hideWhenDenied={hideWhenDenied}
    componentName={componentName}
  >
    {children}
  </RoleBasedComponent>
);

// Leadmen Only (Level 3+)
export const LeadmenOnly = ({ children, fallback, hideWhenDenied = false, componentName = 'LeadmenOnly Component' }) => (
  <RoleBasedComponent 
    requireLeadman={true}
    fallbackComponent={fallback}
    hideWhenDenied={hideWhenDenied}
    componentName={componentName}
  >
    {children}
  </RoleBasedComponent>
);

// Senior Leadership Only (Level 4)
export const SeniorLeadershipOnly = ({ children, fallback, hideWhenDenied = false, componentName = 'SeniorLeadershipOnly Component' }) => (
  <RoleBasedComponent 
    requireSeniorLeadership={true}
    fallbackComponent={fallback}
    hideWhenDenied={hideWhenDenied}
    componentName={componentName}
  >
    {children}
  </RoleBasedComponent>
);

// Governor Only
export const GovernorOnly = ({ children, fallback, hideWhenDenied = false, componentName = 'GovernorOnly Component' }) => (
  <RoleBasedComponent 
    allowedRoles={[HANGAR_ROLES.GOVERNOR, HANGAR_ROLES.SUDO_ADMIN]}
    fallbackComponent={fallback}
    hideWhenDenied={hideWhenDenied}
    componentName={componentName}
  >
    {children}
  </RoleBasedComponent>
);

// Historian Only
export const HistorianOnly = ({ children, fallback, hideWhenDenied = false, componentName = 'HistorianOnly Component' }) => (
  <RoleBasedComponent 
    allowedRoles={[HANGAR_ROLES.HISTORIAN, HANGAR_ROLES.SUDO_ADMIN]}
    fallbackComponent={fallback}
    hideWhenDenied={hideWhenDenied}
    componentName={componentName}
  >
    {children}
  </RoleBasedComponent>
);

// Keyman Only (including Assistant Keyman)
export const KeymanOnly = ({ children, fallback, hideWhenDenied = false, componentName = 'KeymanOnly Component' }) => (
  <RoleBasedComponent 
    allowedRoles={[
      HANGAR_ROLES.KEYMAN, 
      HANGAR_ROLES.ASSISTANT_KEYMAN, 
      HANGAR_ROLES.SUDO_ADMIN
    ]}
    fallbackComponent={fallback}
    hideWhenDenied={hideWhenDenied}
    componentName={componentName}
  >
    {children}
  </RoleBasedComponent>
);

// System Admin Only
export const SudoAdminOnly = ({ children, fallback, hideWhenDenied = false, componentName = 'SudoAdminOnly Component' }) => (
  <RoleBasedComponent 
    allowedRoles={[HANGAR_ROLES.SUDO_ADMIN]}
    fallbackComponent={fallback}
    hideWhenDenied={hideWhenDenied}
    componentName={componentName}
  >
    {children}
  </RoleBasedComponent>
);

const styles = StyleSheet.create({
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  accessDeniedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  accessDeniedMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userRoleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  userRoleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default RoleBasedComponent;