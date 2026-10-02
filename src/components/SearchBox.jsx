import React, { useEffect, useRef } from 'react';
import styles from './SearchBox.module.css';

/**
 * SearchBox
 * Uses the Google Maps Places Autocomplete API to let the user
 * search for a location and pan the map there.
 *
 * @param {{ map: google.maps.Map|null }} props
 */
function SearchBox({ map }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    // Only initialise once map and google are ready
    if (!map || !window.google || !inputRef.current) return;

    // Attach Google Places Autocomplete to the input element
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      { fields: ['geometry', 'name'] }
    );

    // When the user picks a suggestion, pan the map there
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.panTo(place.geometry.location);
          map.setZoom(17);
        }
      }
    });

    return () => {
      // Cleanup listener when component unmounts
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [map]);

  return (
    <div className={styles.container}>
      <span className={styles.icon}>🔍</span>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for a location..."
        className={styles.input}
      />
    </div>
  );
}

export default SearchBox;
