/**
 * Firestore Data Seeding Utility for ORLQB
 * 
 * This utility helps seed initial data into Firestore for testing
 * Run this once to populate your Firebase database with sample events
 */

import { Platform } from 'react-native';
import { firestore } from '../services/firebase';

// Sample events data to seed into Firestore
const sampleEvents = [
  {
    title: 'Monthly ORLQB Meeting',
    date: '2025-08-15',
    time: '19:00',
    type: 'meeting', // Keep for backward compatibility
    types: ['meeting', 'leadership'], // Multi-select types
    description: 'Regular monthly meeting for all ORLQB members',
    location: 'Main Hall',
    maxAttendees: 50,
    currentAttendees: 0,
    requiresRSVP: true,
    isRecurring: true,
    recurringPattern: {
      frequency: 'monthly',
      dayOfWeek: 1, // Monday
      weekOfMonth: 2, // 2nd week
      monthInterval: 1,
      endDate: '',
      customDescription: ''
    },
    recurringDescription: '2nd Monday of each month',
    notifyMembers: true,
    createdBy: 'admin@orlqb.org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: 'New Member Orientation',
    date: '2025-08-20',
    time: '18:00',
    type: 'orientation',
    types: ['orientation', 'meeting'],
    description: 'Orientation session for new ORLQB members',
    location: 'Conference Room A',
    maxAttendees: 15,
    currentAttendees: 0,
    requiresRSVP: true,
    isRecurring: false,
    notifyMembers: true,
    createdBy: 'admin@orlqb.org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: 'Leadership Committee',
    date: '2025-08-22',
    time: '18:30',
    type: 'leadership',
    types: ['leadership', 'meeting'],
    description: 'Monthly leadership committee meeting',
    location: 'Executive Boardroom',
    maxAttendees: 20,
    currentAttendees: 0,
    requiresRSVP: true,
    isRecurring: true,
    recurringPattern: {
      frequency: 'monthly',
      dayOfWeek: 4, // Thursday
      weekOfMonth: 4, // 4th week
      monthInterval: 1,
      endDate: '',
      customDescription: ''
    },
    recurringDescription: '4th Thursday of each month',
    notifyMembers: false,
    createdBy: 'admin@orlqb.org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: 'Social Gathering',
    date: '2025-08-28',
    time: '17:00',
    type: 'social',
    types: ['social'],
    description: 'Informal social gathering for members and families',
    location: 'Garden Pavilion',
    maxAttendees: 100,
    currentAttendees: 0,
    requiresRSVP: false,
    isRecurring: false,
    notifyMembers: true,
    createdBy: 'admin@orlqb.org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: 'Annual Ceremony',
    date: '2025-09-15',
    time: '14:00',
    type: 'ceremony',
    types: ['ceremony', 'meeting'],
    description: 'Annual ceremony for the Ancient Order of Quiet Birdmen',
    location: 'Grand Hall',
    maxAttendees: 200,
    currentAttendees: 0,
    requiresRSVP: true,
    isRecurring: true,
    recurringPattern: {
      frequency: 'yearly',
      dayOfWeek: 0, // Not applicable for yearly
      weekOfMonth: 0, // Not applicable for yearly
      monthInterval: 12,
      endDate: '',
      customDescription: ''
    },
    recurringDescription: 'Annually on the same date',
    notifyMembers: true,
    createdBy: 'admin@orlqb.org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: 'Flight Training Workshop',
    date: '2025-09-05',
    time: '10:00',
    type: 'training',
    types: ['training', 'orientation'],
    description: 'Advanced flight training workshop for qualified members',
    location: 'Training Center',
    maxAttendees: 25,
    currentAttendees: 0,
    requiresRSVP: true,
    isRecurring: false,
    notifyMembers: true,
    createdBy: 'admin@orlqb.org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Seed events data into Firestore
 * WARNING: This will add events to your production database
 * Only run this during initial setup or in development
 */
export const seedEventsData = async () => {
  try {
    console.log('Starting to seed events data...');
    let successCount = 0;

    if (Platform.OS === 'web') {
      // Web Firebase SDK
      const { collection, addDoc } = require('firebase/firestore');
      const eventsCollection = collection(firestore(), 'events');

      for (const event of sampleEvents) {
        try {
          const docRef = await addDoc(eventsCollection, event);
          console.log(`✅ Added event "${event.title}" with ID: ${docRef.id}`);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to add event "${event.title}":`, error);
        }
      }
    } else {
      // React Native Firebase SDK
      const eventsCollection = firestore().collection('events');

      for (const event of sampleEvents) {
        try {
          const docRef = await eventsCollection.add(event);
          console.log(`✅ Added event "${event.title}" with ID: ${docRef.id}`);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to add event "${event.title}":`, error);
        }
      }
    }

    console.log(`\n🎉 Successfully seeded ${successCount}/${sampleEvents.length} events!`);
    return { success: true, count: successCount };

  } catch (error) {
    console.error('❌ Error seeding events data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all events from Firestore
 * WARNING: This will delete all events in your database
 * Only use during development or testing
 */
export const clearEventsData = async () => {
  try {
    console.log('⚠️ WARNING: Clearing all events data...');

    if (Platform.OS === 'web') {
      // Web Firebase SDK
      const { collection, getDocs, deleteDoc } = require('firebase/firestore');
      const eventsCollection = collection(firestore(), 'events');
      const snapshot = await getDocs(eventsCollection);

      let deleteCount = 0;
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
        console.log(`🗑️ Deleted event: ${doc.id}`);
        deleteCount++;
      }

      console.log(`\n✅ Deleted ${deleteCount} events`);
      return { success: true, count: deleteCount };

    } else {
      // React Native Firebase SDK
      const eventsCollection = firestore().collection('events');
      const snapshot = await eventsCollection.get();

      let deleteCount = 0;
      for (const doc of snapshot.docs) {
        await doc.ref.delete();
        console.log(`🗑️ Deleted event: ${doc.id}`);
        deleteCount++;
      }

      console.log(`\n✅ Deleted ${deleteCount} events`);
      return { success: true, count: deleteCount };
    }

  } catch (error) {
    console.error('❌ Error clearing events data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * HOW TO USE THIS UTILITY:
 * 
 * 1. Import in your component:
 *    import { seedEventsData } from '../utils/seedFirestoreData';
 * 
 * 2. Call the function (only once during setup):
 *    const result = await seedEventsData();
 * 
 * 3. Or add a temporary button in your admin interface:
 *    <TouchableOpacity onPress={seedEventsData}>
 *      <Text>Seed Sample Events</Text>
 *    </TouchableOpacity>
 * 
 * 4. For clearing data (development only):
 *    const result = await clearEventsData();
 * 
 * IMPORTANT NOTES:
 * - Only run seedEventsData() once per environment
 * - Remove any seed buttons before production deployment
 * - clearEventsData() will delete ALL events - use with caution
 * - Events are created with 'admin@orlqb.org' as createdBy
 * - All sample events have currentAttendees set to 0
 */