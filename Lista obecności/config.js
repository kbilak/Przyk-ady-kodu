export default async (method = "GET", route, data) => {
    const url = 'http://localhost:8081/';
    const headers = new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
    });
    let body = JSON.stringify(data);
    try {
        const data = await fetch(url + route, { 
            method: method, 
            headers, 
            body: body 
        }).then(response => response.json()).then(data => data);
        return data
    } catch(err) {
        return err;
    }
}