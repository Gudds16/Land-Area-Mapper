import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

/**
 * useGoogleMap
 *
 * Loads the Google Maps JavaScript API and initialises a satellite map
 * inside the provided containerRef element.
 *
 * @param {React.RefObject} containerRef - Ref to the map container div
 * @returns {{ map: google.maps.Map|null, isLoaded: boolean, error: string|null }}
 */
export function useGoogleMap(containerRef) {
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setError('Google Maps API key is not configured. Please copy .env.example to .env and add your API key.');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],  // needed for location search autocomplete
    });

    loader
      .load()
      .then((google) => {
        // Create the satellite map
        const mapInstance = new google.maps.Map(containerRef.current, {
          center: { lat: 20.5937, lng: 78.9629 }, // Default: center of India
          zoom: 5,
          mapTypeId: google.maps.MapTypeId.HYBRID, // Satellite + labels
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        mapInstanceRef.current = mapInstance;
        setMap(mapInstance);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('Google Maps failed to load:', err);
        setError('Failed to load Google Maps. Check your API key and network connection.');
      });

    // No cleanup needed — Google Maps manages its own DOM
  }, [containerRef]);

  return { map, isLoaded, error };
}
