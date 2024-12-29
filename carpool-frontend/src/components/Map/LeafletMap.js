import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

const LeafletMap = ({ onRouteSelected }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [routingControl, setRoutingControl] = useState(null);

    useEffect(() => {
        const mapInstance = L.map(mapRef.current).setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors',
        }).addTo(mapInstance);

        const provider = new OpenStreetMapProvider();
        const searchControl = new GeoSearchControl({
            provider: provider,
            style: 'bar',
            autoComplete: true,
            autoCompleteDelay: 250,
        });

        mapInstance.addControl(searchControl);

        mapInstance.on('geosearch/showlocation', (e) => {
            const { lat, lng } = e.location;
            L.marker([lat, lng]).addTo(mapInstance).bindPopup('Selected Location').openPopup();
        });

        setMap(mapInstance);
    }, []);

    const handleRoute = (start, end) => {
        if (routingControl) {
            map.removeControl(routingControl);
        }

        const control = L.Routing.control({
            waypoints: [
                L.latLng(start.lat, start.lng),
                L.latLng(end.lat, end.lng),
            ],
            routeWhileDragging: true,
        }).addTo(map);

        control.on('routesfound', (e) => {
            const routes = e.routes;
            onRouteSelected(routes[0]); // Pass the selected route to the parent component
        });

        setRoutingControl(control);
    };

    return (
        <div>
            <div ref={mapRef} style={{ height: '400px', width: '100%' }} />
            <button onClick={() => handleRoute({ lat: 51.505, lng: -0.09 }, { lat: 51.51, lng: -0.1 })}>
                Calculate Route
            </button>
        </div>
    );
};

export default LeafletMap;