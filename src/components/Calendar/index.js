/**
 * Calendar Module Exports
 * 
 * This module provides calendar functionality for ORLQB events:
 * - Event viewing and management
 * - Role-based permissions (Guest/Member/Leadman/Admin)
 * - RSVP and attendance tracking
 * - Administrative CRUD operations
 * - Future: Firebase integration for event storage
 */

export { default as CalendarComponent } from './CalendarComponent';
export { default as EventManager } from './EventManager';

// Future calendar-related utilities can be exported here:
// export { default as AttendanceTracker } from './AttendanceTracker';