


export default async function getResponse( route: string, jsn: object){
     try { 

        // const response = await fetch(`https://key-grizzly-directly.ngrok-free.app/${route}`, { 
        const response = await fetch(`http://192.168.29.243:5000/${route}`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json', }, 
        body: JSON.stringify(jsn), 
        });
        if (response.ok) { 
            const jsonResponse = await response.json(); 
            return jsonResponse;
        }
        else { 
            const errorResponse = await response.json(); 
            return (errorResponse.detail); 
        }
      }
    
        catch (error) {
            return error;
        }
}