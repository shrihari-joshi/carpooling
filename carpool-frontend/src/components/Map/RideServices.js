import api from '../../api'; // Adjust the import based on your API configuration

export const checkRouteMatch = async (newRoute) => {
    try {
        const response = await api.get('/rides'); // Fetch existing rides
        const existingRides = response.data;

        for (const ride of existingRides) {
            // Compare start and end locations
            if (ride.startLocation === newRoute.legs[0].start_address && ride.endLocation === newRoute.legs[0].end_address) {
                return true; // Match found
            }
        }
        return false; // No match found
    } catch (error) {
        console.error('Error fetching rides:', error);
        return false; // Handle error appropriately
    }
};