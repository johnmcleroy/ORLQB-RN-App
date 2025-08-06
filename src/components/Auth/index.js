/**
 * Authentication & Authorization Components Export
 * 
 * Components for role-based access control and visibility management:
 * - RoleBasedComponent: Main authorization wrapper
 * - Convenience components for common roles
 */

export { default as RoleBasedComponent } from './RoleBasedComponent';

// Convenience components for common use cases
export {
  MembersOnly,
  LeadmenOnly,
  SeniorLeadershipOnly,
  GovernorOnly,
  HistorianOnly,
  KeymanOnly,
  SudoAdminOnly
} from './RoleBasedComponent';