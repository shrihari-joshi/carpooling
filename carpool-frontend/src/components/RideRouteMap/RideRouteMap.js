import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import api from '../../api';
import './RideRouteMap.css';

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const RideRouteMap = ({ startLocation, endLocation, rideId }) => {
    const mapRef = useRef(null);
    const routingControlRef = useRef(null);
    const [passengerLocations, setPassengerLocations] = useState([]);

    useEffect(() => {
        const fetchPassengerLocations = async () => {
            try {
                const response = await api.get(`/rides/${rideId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setPassengerLocations(response.data.passengerLocations);
            } catch (error) {
                console.error('Error fetching passenger locations:', error);
            }
        };

        if (rideId) {
            fetchPassengerLocations();
        }
    }, [rideId]);

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

                if (startLocation) {
                    const startCoords = await geocodeLocation(startLocation);
                    waypoints.push(startCoords);
                    L.marker(startCoords, { icon: redIcon })
                        .addTo(mapRef.current)
                        .bindPopup('Start Location');
                }

                if (endLocation) {
                    const endCoords = await geocodeLocation(endLocation);
                    waypoints.push(endCoords);
                    L.marker(endCoords, { icon: redIcon })
                        .addTo(mapRef.current)
                        .bindPopup('End Location');
                }

                if (routingControlRef.current) {
                    routingControlRef.current.setWaypoints(waypoints);
                } else {
                    routingControlRef.current = L.Routing.control({
                        waypoints,
                        routeWhileDragging: false,
                        showAlternatives: false,
                        createMarker: () => null,
                        router: new L.Routing.OSRMv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
                        plan: L.Routing.plan(waypoints, {
                            createMarker: () => null,
                            show: false, // Hide the panel
                        }),
                        styles: [{ color: 'blue', opacity: 0.9, weight: 5 }],
                    }).addTo(mapRef.current);
                }

                if (waypoints.length > 0) {
                    mapRef.current.fitBounds(L.latLngBounds(waypoints));
                }
            } catch (error) {
                console.error(error);
            }
        })();

        return () => {
            if (routingControlRef.current) {
                routingControlRef.current.getPlan().setWaypoints([]); // Clear waypoints
                routingControlRef.current = null; // Reset routing control reference
            }
        };
    }, [startLocation, endLocation, passengerLocations]);

    return <div id="map" style={{ height: '400px', width: '80%', zIndex: 2, borderRadius: '1rem' }}></div>;
};

export default RideRouteMap;
