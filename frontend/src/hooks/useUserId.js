import { useEffect, useState } from 'react';

export const useUserId = () => {
   const [userId, setUserId] = useState(null);
   const [isGuest, setIsGuest] = useState(false);
   const [displayName, setDisplayName] = useState('');
   
   useEffect(() => {
      const authUserId = localStorage.getItem('id');
      const currentUserId = localStorage.getItem('current_user_id');
      const guestFlag = localStorage.getItem('is_guest');
      const guestName = localStorage.getItem('guest_display_name');
      
      if (authUserId) {
         setUserId(parseInt(authUserId));
         setIsGuest(false);
         setDisplayName('');
      } else if (currentUserId) {
         setUserId(parseInt(currentUserId));
         setIsGuest(guestFlag === 'true');
         setDisplayName(guestName || 'Гость');
      }
   }, []);
   
   return { userId, isGuest, displayName };
};