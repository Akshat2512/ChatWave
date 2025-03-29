// const date = new Date(message.last_seen).toDateString();
// const time = new Date(message.last_seen).toLocaleTimeString();


  
  export function formatDate(dateString: string) {
        
        // dateString = UTCtoTimeZone(dateString)
        // console.log(dateString)

        if(dateString == "..."){
          return "..."
        }
        
        const option = {
          hour: '2-digit' as '2-digit',
          minute: '2-digit' as '2-digit',
          hour12: true
        }

        const date = new Date(dateString+'Z');
        const now = new Date();

        const isSameYear = date.getFullYear() === now.getFullYear();
        const isSameMonth = date.getMonth() === now.getMonth();
        const isSameDay = date.getDate() === now.getDate();

        const differenceInTime = now.getTime() - date.getTime();
        const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
        console.log(date)

        if (isSameYear && isSameMonth && isSameDay) {
          // Print only the time if the date is the same day
          return "today at " + date.toLocaleTimeString("en-IN", option);
      }
        else if (differenceInDays === 1) {
          return 'yesterday';
        }
         else {
          return date.toDateString();
        }
    }