"use client";

import { useEffect, useRef, useState } from "react";

interface MapPin {
    id: number;
    title: string;
    address: string;
    latitude: number;
    longitude: number;
    price: string | number;
}

interface JobsMapProps {
    pins: MapPin[];
    centerLat?: number;
    centerLng?: number;
}

export function JobsMap({ pins, centerLat = 30.2672, centerLng = -97.7431 }: JobsMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadLeaflet = async () => {
            if (typeof window === "undefined" || mapRef.current) return;

            // Injected Leaflet CSS
            if (!document.getElementById("leaflet-css")) {
                const link = document.createElement("link");
                link.id = "leaflet-css";
                link.rel = "stylesheet";
                link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                document.head.appendChild(link);
            }

            // Injected Leaflet JS script
            if (!(window as any).L) {
                await new Promise<void>((resolve) => {
                    const script = document.createElement("script");
                    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
                    script.onload = () => resolve();
                    document.head.appendChild(script);
                });
            }

            const L = (window as any).L;
            if (mapContainerRef.current && L) {
                const mapInstance = L.map(mapContainerRef.current).setView([centerLat, centerLng], 12);
                
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(mapInstance);

                mapRef.current = mapInstance;
                setIsLoaded(true);
            }
        };

        loadLeaflet();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [centerLat, centerLng]);

    useEffect(() => {
        const L = (window as any).L;
        if (!isLoaded || !mapRef.current || !L) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        pins.forEach(pin => {
            if (!pin.latitude || !pin.longitude) return;

            const customIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            const marker = L.marker([pin.latitude, pin.longitude], { icon: customIcon })
                .addTo(mapRef.current)
                .bindPopup(`
                    <div style="font-family: sans-serif; padding: 4px;">
                        <b style="font-size: 14px; text-transform: capitalize; color: #0f172a;">
                            ${pin.title === 'mowing' ? 'Lawn Mowing' : pin.title}
                        </b>
                        <p style="margin: 4px 0; color: #475569; font-size: 12px;">${pin.address}</p>
                        <b style="color: #16a34a; font-size: 13px;">$${pin.price}</b>
                    </div>
                `);

            markersRef.current.push(marker);
        });

        if (pins.length > 0) {
            const validCoords = pins
                .filter(p => p.latitude && p.longitude)
                .map(p => [p.latitude, p.longitude]);
            
            if (validCoords.length > 0) {
                mapRef.current.fitBounds(validCoords, { padding: [50, 50] });
            }
        }
    }, [pins, isLoaded]);

    return (
        <div className="relative w-full h-[320px] rounded-xl overflow-hidden border shadow-inner bg-slate-100 dark:bg-slate-900/40">
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 backdrop-blur-sm z-10">
                    <p className="text-sm font-medium text-muted-foreground">Initializing interactive map...</p>
                </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>
    );
}
