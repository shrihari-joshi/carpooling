import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import DirectionsDisplay from "../DirectionsDisplay";
import { getDirections } from "../geminiService"; // Adjust path if needed
import api from "../../api"; // Adjust path if needed

const DirectionsPage = () => {
    const { id } = useParams(); // Get ride ID from URL params
    const location = useLocation();
    const [ride, setRide] = useState(null);
    const [rideLoading, setRideLoading] = useState(false);
    const [rideError, setRideError] = useState(null);

    const [geminiDirections, setGeminiDirections] = useState("");
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [geminiError, setGeminiError] = useState(null);

    // Fetch ride details
    useEffect(() => {
        const fetchRideDetails = async () => {
            setRideLoading(true);
            setRideError(null);
            try {
                const token = localStorage.getItem("token");
                const response = await api.get(`/rides/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRide(response.data);
            } catch (error) {
                console.error("Error fetching ride details:", error);
                setRideError("Failed to load ride details.");
            } finally {
                setRideLoading(false);
            }
        };

        fetchRideDetails();
    }, [id]);

    // Fetch directions after ride details are loaded
    useEffect(() => {
        const fetchDirections = async () => {
            if (!ride) return;
            setGeminiLoading(true);
            setGeminiError(null);
            try {
                const passengerLocations = ride.passengers.map((passenger) => ({
                    pickup: passenger.pickupLocation,
                    dropoff: passenger.dropoffLocation,
                }));

                const directions = await getDirections(
                    ride.startLocation,
                    ride.endLocation,
                    passengerLocations
                );
                setGeminiDirections(directions);
            } catch (err) {
                console.error("Error fetching directions:", err);
                setGeminiError(err.message || "Failed to fetch directions.");
            } finally {
                setGeminiLoading(false);
            }
        };

        if (ride) fetchDirections();
    }, [ride]);

    return (
        <div>
            <h2>Directions</h2>

            {rideLoading && <p>Loading ride details...</p>}
            {rideError && <p style={{ color: "red" }}>{rideError}</p>}

            {ride && (
                <div>
                    <p><strong>Ride from:</strong> {ride.startLocation} to {ride.endLocation}</p>
                </div>
            )}

            <DirectionsDisplay
                geminiLoading={geminiLoading}
                geminiError={geminiError}
                geminiDirections={geminiDirections}
            />
        </div>
    );
};

export default DirectionsPage;
