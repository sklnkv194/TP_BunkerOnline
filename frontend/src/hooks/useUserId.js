import { useEffect, useState } from 'react';

export const useUserId = () => {
   const [userId, setUserId] = useState(null);
   const [isGuest, setIsGuest] = useState(false);
   const [displayName, setDisplayName] = useState('');
   
   useEffect(() => {
      // Проверяем авторизованного пользователя
      const authUserId = localStorage.getItem('id');
      const currentUserId = localStorage.getItem('current_user_id');
      const guestFlag = localStorage.getItem('is_guest');
      const guestName = localStorage.getItem('guest_display_name');
      
      if (authUserId) {
         // Авторизованный пользователь
         setUserId(parseInt(authUserId));
         setIsGuest(false);
         setDisplayName('');
      } else if (currentUserId) {
         // Гостевой пользователь
         setUserId(parseInt(currentUserId));
         setIsGuest(guestFlag === 'true');
         setDisplayName(guestName || 'Гость');
      }
   }, []);
   
   return { userId, isGuest, displayName };
};