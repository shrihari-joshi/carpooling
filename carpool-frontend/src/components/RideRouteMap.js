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

const RideRouteMap = ({ startLocation, endLocation, passengerLocations }) => {
    const mapRef = useRef(null);
    const routingControlRef = useRef(null);
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map').setView([20, 77], 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(mapRef.current);
        }

        const geocodeLocation = async (location) => {
            const url = `https://geocode.maps.co/search?q=${location}&api_key=677d1282b47ab200124575pqr8c7fdc`;

            const response = await fetch(url);
            const data = await response.json();
            if (data.length > 0) {
                return L.latLng(data[0].lat, data[0].lon);
            } else {
                throw new Error(`Could not find coordinates for ${location}`);
            }
        };

        (async () => {
            try {
                const waypoints = [];

                // Geocode and add start location
                if (startLocation) {
                    const startCoords = await geocodeLocation(startLocation);
                    waypoints.push(startCoords);
                    L.marker(startCoords, { icon: redIcon })
                        .addTo(mapRef.current)
                        .bindPopup('Start Location');
                }
                // Geocode and add end location
                if (endLocation) {
                    const endCoords = await geocodeLocation(endLocation);
                    waypoints.push(endCoords);
                    L.marker(endCoords, { icon: redIcon })
                        .addTo(mapRef.current)
                        .bindPopup('End Location');
                }

                // Geocode and add passenger locations
                if (passengerLocations && passengerLocations.length > 0) {
                    for (const loc of passengerLocations) {
                        const passengerStartCoords = await geocodeLocation(loc.startLocation);
                        const passengerEndCoords = await geocodeLocation(loc.endLocation);
                        waypoints.push(passengerStartCoords, passengerEndCoords);
                        L.marker(passengerStartCoords, { icon: redIcon })
                            .addTo(mapRef.current)
                            .bindPopup('Passenger Start Location');
                        L.marker(passengerEndCoords, { icon: redIcon })
                            .addTo(mapRef.current)
                            .bindPopup('Passenger End Location');
                    }
                }



                // Update or create the routing control
                if (!routingControlRef.current) {
                    routingControlRef.current = L.Routing.control({
                        waypoints: waypoints,
                        routeWhileDragging: false,
                        showAlternatives: false,
                        createMarker: () => null,
                        styles: [
                            {
                                color: 'blue',
                                opacity: 0.7,
                                weight: 5,
                            },
                        ],
                    }).addTo(mapRef.current);
                } else {
                    routingControlRef.current.setWaypoints(waypoints);
                }
                mapRef.current.fitBounds(L.latLngBounds(waypoints));
            } catch (error) {
                console.error(error);
            }
        })();

        return () => {
            if (routingControlRef.current) {
                mapRef.current.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            }
        };
    }, [startLocation, endLocation, passengerLocations]);

    return <div id="map" style={{ height: '400px', width: '100%' }}></div>;
};

export default RideRouteMap;
