import { prisma } from './prisma';

/**
 * Generate a human-readable order number
 * Format: DDMMYY-NNN (e.g., "290824-001")
 * DD = Day, MM = Month, YY = Year, NNN = Sequential number for the day
 */
export async function generateOrderNumber(orderDate?: Date): Promise<string> {
  const date = orderDate || new Date();
  
  // Format date as DDMMYY
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  
  const datePrefix = `${day}${month}${year}`;
  
  // Find orders created on the same date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  try {
    // Count orders created today
    const ordersToday = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });
    
    // Next sequential number (ordersToday + 1)
    const sequentialNumber = (ordersToday + 1).toString().padStart(3, '0');
    
    const orderNumber = `${datePrefix}-${sequentialNumber}`;
    
    // Check if this order number already exists (safety check)
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber }
    });
    
    if (existingOrder) {
      // If it exists, try with next number
      const nextSequential = (ordersToday + 2).toString().padStart(3, '0');
      return `${datePrefix}-${nextSequential}`;
    }
    
    return orderNumber;
    
  } catch (error) {
    console.error('Error generating order number:', error);
    
    // Fallback: use timestamp-based number if database is unavailable
    const timestamp = Date.now().toString().slice(-3);
    return `${datePrefix}-${timestamp}`;
  }
}

/**
 * Parse order number to extract date information
 * @param orderNumber - Order number in format "DDMMYY-NNN"
 * @returns Object with date info or null if invalid format
 */
export function parseOrderNumber(orderNumber: string) {
  const match = orderNumber.match(/^(\d{2})(\d{2})(\d{2})-(\d{3})$/);
  
  if (!match) {
    return null;
  }
  
  const [, day, month, year, sequential] = match;
  
  // Convert to full year (assuming 2000s)
  const fullYear = parseInt(`20${year}`);
  
  return {
    day: parseInt(day),
    month: parseInt(month),
    year: fullYear,
    sequential: parseInt(sequential),
    date: new Date(fullYear, parseInt(month) - 1, parseInt(day))
  };
}

/**
 * Format order number for display
 * @param orderNumber - Order number string
 * @returns Formatted string for UI display
 */
export function formatOrderNumberForDisplay(orderNumber: string): string {
  const parsed = parseOrderNumber(orderNumber);
  
  if (!parsed) {
    return orderNumber; // Return as-is if can't parse
  }
  
  const { day, month, year, sequential } = parsed;
  return `N° ${orderNumber} (${day}/${month}/${year})`;
}

/**
 * Get today's order count (for analytics)
 */
export async function getTodayOrderCount(): Promise<number> {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  try {
    return await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });
  } catch (error) {
    console.error('Error getting today order count:', error);
    return 0;
  }
}