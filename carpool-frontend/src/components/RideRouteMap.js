import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const RideRouteMap = ({ startLocation, endLocation }) => {
    const mapRef = useRef(null);
    const routingControlRef = useRef(null); // Store routing control reference

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map').setView([20, 77], 6);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(mapRef.current);
        }

        if (startLocation && endLocation) {
            const geocodeLocation = async (location) => {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
                const data = await response.json();
                if (data.length > 0) {
                    return L.latLng(data[0].lat, data[0].lon);
                }
                throw new Error(`Could not find coordinates for ${location}`);
            };

            (async () => {
                try {
                    const startCoords = await geocodeLocation(startLocation);
                    const endCoords = await geocodeLocation(endLocation);

                    // Create markers for start and end locations
                    L.marker(startCoords, { icon: redIcon })
                        .addTo(mapRef.current)
                        .bindPopup('Start Location')
                        .openPopup();

                    L.marker(endCoords, { icon: redIcon })
                        .addTo(mapRef.current)
                        .bindPopup('End Location')
                        .openPopup();

                    // Initialize routing control if it doesn't exist
                    if (!routingControlRef.current) {
                        routingControlRef.current = L.Routing.control({
                            waypoints: [startCoords, endCoords],
                            routeWhileDragging: false,
                            showAlternatives: false,
                            show: false,
                            fitSelectedRoutes: false,
                            createMarker: () => null, // Disable default markers
                            styles: [
                                {
                                    color: 'blue', // Set the color of the route line to blue
                                    opacity: 0.7,
                                    weight: 5, // Change the thickness of the route line
                                },
                            ],
                        }).addTo(mapRef.current);
                    } else {
                        // Update waypoints if routing control already exists
                        routingControlRef.current.setWaypoints([startCoords, endCoords]);
                    }

                    // Adjust map view to fit the route
                    mapRef.current.fitBounds(L.latLngBounds([startCoords, endCoords]));
                } catch (error) {
                    console.error(error);
                }
            })();
        }

        return () => {
            if (routingControlRef.current) {
                mapRef.current.removeControl(routingControlRef.current);
                routingControlRef.current = null; // Reset routing control reference
            }
        };

    }, [startLocation, endLocation]);

    return <div id="map" style={{ height: '400px', width: '100%' }}></div>;
};

export default RideRouteMap;