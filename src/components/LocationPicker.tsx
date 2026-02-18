'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import styles from './LocationPicker.module.css';

interface LocationPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (lat: number, lng: number, address: string) => void;
    initialLocation?: { lat: number, lng: number };
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '12px'
};

const defaultCenter = {
    lat: 21.1458, // Nagpur
    lng: 79.0882
};

const libraries: ("places")[] = ["places"];

export default function LocationPicker({ isOpen, onClose, onConfirm, initialLocation }: LocationPickerProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries
    });

    const [markerPos, setMarkerPos] = useState(initialLocation || defaultCenter);
    const [address, setAddress] = useState('');
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

    const reverseGeocode = useCallback((pos: { lat: number, lng: number }) => {
        if (!isLoaded) return;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                setAddress(results[0].formatted_address);
            }
        });
    }, [isLoaded]);

    useEffect(() => {
        if (isOpen && markerPos) {
            reverseGeocode(markerPos);
        }
    }, [isOpen, markerPos, reverseGeocode]);

    const onLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newPos = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            };
            setMarkerPos(newPos);
            reverseGeocode(newPos);
        }
    }, [reverseGeocode]);

    const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
        searchBoxRef.current = ref;
    };

    const onPlacesChanged = () => {
        const places = searchBoxRef.current?.getPlaces();
        if (places && places.length > 0) {
            const place = places[0];
            if (place.geometry?.location) {
                const newPos = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                setMarkerPos(newPos);
                setAddress(place.formatted_address || '');
                map?.panTo(newPos);
                map?.setZoom(17);
            }
        }
    };

    if (!isOpen) return null;

    if (!isLoaded) {
        return (
            <div className={styles.overlay}>
                <div className={styles.loading}>Loading Maps...</div>
            </div>
        );
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className={styles.title}>Select Location</h2>
                </div>

                <div className={styles.searchContainer}>
                    <StandaloneSearchBox
                        onLoad={onSearchBoxLoad}
                        onPlacesChanged={onPlacesChanged}
                    >
                        <div className={styles.searchWrapper}>
                            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search for places, addresses..."
                                className={styles.searchInput}
                            />
                        </div>
                    </StandaloneSearchBox>
                </div>

                <div className={styles.mapWrapper}>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={markerPos}
                        zoom={15}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        onClick={onMapClick}
                        options={{
                            fullscreenControl: false,
                            streetViewControl: false,
                            mapTypeControl: false,
                            zoomControlOptions: {
                                position: google.maps.ControlPosition.RIGHT_BOTTOM
                            }
                        }}
                    >
                        <Marker
                            position={markerPos}
                            draggable={true}
                            onDragEnd={(e) => {
                                if (e.latLng) {
                                    const newPos = {
                                        lat: e.latLng.lat(),
                                        lng: e.latLng.lng()
                                    };
                                    setMarkerPos(newPos);
                                    reverseGeocode(newPos);
                                }
                            }}
                        />
                        <div className={styles.tooltip}>
                            Tap or drag pin to set location
                        </div>
                    </GoogleMap>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.confirmBtn}
                        onClick={() => onConfirm(markerPos.lat, markerPos.lng, address)}
                    >
                        Confirm Location
                    </button>
                </div>
            </div>
        </div>
    );
}
