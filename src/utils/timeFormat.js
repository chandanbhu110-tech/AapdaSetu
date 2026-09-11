/**
 * SIH NER Smart Logistics Platform - Time Formatting Utilities
 */

/**
 * Calculates a dynamic relative time string from an ISO timestamp or date
 * Examples: "Just now", "1 min ago", "5 mins ago", "1 hour ago", "2 hours ago", "1 day ago"
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Recently';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return String(timestamp);
  
  const now = Date.now();
  const diffMs = now - date.getTime();
  
  // Handle slight future clock skew or within 45 seconds
  if (diffMs < 45000) {
    return 'Just now';
  }
  
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 2) {
    return '1 min ago';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) {
    return '1 hour ago';
  }
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return '1 day ago';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formats an ISO timestamp or date into an unambiguous localized string
 * Example: "Sep 12, 2026, 02:45:10 AM"
 */
export function formatExactDateTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return String(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
