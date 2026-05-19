import { useState } from 'react';
import { restaurantService } from '../services/restaurantService';

export function useBookmark(restaurantId, initialBookmarked = false) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const toggleBookmark = async () => {
    await restaurantService.toggleBookmark(restaurantId);
    setBookmarked((prev) => !prev);
  };

  return { bookmarked, setBookmarked, toggleBookmark };
}
