export class PostService {
   static async postData(url, data, contentType = 'json', authToken = null) {
      try {
         let body, headers = {
            'X-CSRFToken': this.getCsrfToken()
         };

         if (authToken) {
            headers['Authorization'] = `Token ${authToken}`;
         }

         if (contentType === 'form') {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
               if (Array.isArray(data[key])) {
                  data[key].forEach(item => {
                     formData.append(key, item);
                  });
               } else {
                  formData.append(key, data[key]);
               }
            });
            body = formData;
         } else {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(data);
         }

         const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: body,
            credentials: 'include'  
         });
         
         const result = await response.json();
         
         // ✅ Возвращаем объект с статусом и данными
         return {
            ok: response.ok,
            status: response.status,
            data: result
         };
         
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