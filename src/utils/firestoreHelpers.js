import { Timestamp } from 'firebase/firestore';

/**
 * Cleans data for Firestore by:
 * - Removing undefined values (Firestore doesn't support undefined)
 * - Converting empty strings to null for optional fields
 * - Ensuring proper data types
 * - Handling Timestamps properly
 */
export const cleanFirestoreData = (data) => {
  // Handle null or undefined input
  if (data === null || data === undefined) {
    return null;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => {
      if (typeof item === 'object' && item !== null && !(item instanceof Timestamp)) {
        return cleanFirestoreData(item);
      }
      return item;
    });
  }
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    // If it's already a Timestamp, keep it as-is
    if (data instanceof Timestamp) {
      return data;
    }
    
    const cleaned = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Skip undefined values (Firestore doesn't support undefined)
      if (value === undefined) {
        continue;
      }
      
      // Convert empty strings to null for optional fields
      if (value === '') {
        cleaned[key] = null;
      } else if (value instanceof Timestamp) {
        // Keep Timestamps as-is
        cleaned[key] = value;
      } else if (Array.isArray(value)) {
        // Clean arrays recursively
        cleaned[key] = cleanFirestoreData(value);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively clean nested objects
        cleaned[key] = cleanFirestoreData(value);
      } else {
        // Keep primitives as-is (string, number, boolean, null)
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  }
  
  // Return primitives as-is
  return data;
};

/**
 * Converts date string to Firestore Timestamp
 */
export const dateStringToTimestamp = (dateString) => {
  if (!dateString || dateString === '') {
    return null;
  }
  try {
    const date = new Date(dateString);
    return Timestamp.fromDate(date);
  } catch (error) {
    console.error('Error converting date to timestamp:', error);
    return null;
  }
};

