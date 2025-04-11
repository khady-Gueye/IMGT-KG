
export async function fetchData(requete) { // Fetch data from the SPARQL endpoint
    const response = await fetch('https://www.imgt.org/fuseki/MabkgKg/' + '?query=' + encodeURIComponent(requete), {
        method: 'GET',
        headers: {
            'Accept': 'text/csv' 
        }
    });
    if (response.ok) {

        const data = await response.text();
        return data;
    }
    else {
        throw new Error('Error: ' + response.status);
    }
}