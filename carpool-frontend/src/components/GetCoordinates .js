const getCoordinates = async (address) => {
    const url = `https://geocode.maps.co/search?q=${address}&api_key=677d1282b47ab200124575pqr8c7fdc`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            const latitude = data[0].lat;
            const longitude = data[0].lon;
            return { latitude, longitude };

        } else {
            throw new Error('No data found for the given address.');
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

export default getCoordinates;
