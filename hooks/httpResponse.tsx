


export default async function getResponse( route: string, jsn: object){
     try { 
        const url = process.env.CHATWAVE_API_BASE_URL;
        const response = await fetch(url + route , { 
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