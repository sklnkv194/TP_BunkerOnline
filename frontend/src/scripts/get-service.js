export class GetService {
   static async getData(url, authToken = null) {
      try {
         let headers = {
            'X-CSRFToken': this.getCsrfToken()
         };

         if (authToken) {
            headers['Authorization'] = `Token ${authToken}`;
         }

         const response = await fetch(url, {
            method: "GET",
            headers: headers,
            credentials: 'include'  
         });
         
         if (!response.ok) throw new Error('Ошибка сервера');
         return await response.json();
      } catch (error) {
         console.error('Ошибка при отправке данных:', error);
         throw error;
      }
   }

   static getCsrfToken() {
      const name = 'csrftoken';
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return '';
   }
}