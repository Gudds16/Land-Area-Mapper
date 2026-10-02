import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * usePolygonMarker
 *
 * Manages the state and Google Maps objects for:
 *  - User-placed boundary markers
 *  - The polyline connecting markers (open path while marking)
 *  - The filled polygon (closed path after calculation)
 *
 * @param {google.maps.Map|null} map
 * @param {boolean} isMarking - Whether the user is currently placing points
 * @returns {{ points, markers, polyline, polygon, addPoint, clearAll }}
 */
export function usePolygonMarker(map, isMarking) {
  // Array of { lat, lng } coordinate objects
  const [points, setPoints] = useState([]);

  // Refs for the Google Maps objects (so we can remove/update them)
  const markersRef   = useRef([]);  // array of google.maps.Marker
  const polylineRef  = useRef(null); // google.maps.Polyline (open path while marking)
  const polygonRef   = useRef(null); // google.maps.Polygon (closed, filled area)
  const clickListenerRef = useRef(null);

  // ─── Add a new point when the map is clicked ───────────────────────────────
  useEffect(() => {
    if (!map) return;

    // Remove any previous click listener first
    if (clickListenerRef.current) {
      window.google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }

    if (!isMarking) return;

    clickListenerRef.current = map.addListener('click', (event) => {
      const newPoint = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setPoints((prev) => [...prev, newPoint]);
    });

    return () => {
      if (clickListenerRef.current) {
        window.google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
    };
  }, [map, isMarking]);

  // ─── Sync markers and polyline to the points state ────────────────────────
  useEffect(() => {
    if (!map || !window.google) return;

    const google = window.google;

    // --- Remove extra markers (if points were removed) ---
    while (markersRef.current.length > points.length) {
      const removed = markersRef.current.pop();
      removed.setMap(null);
    }

    // --- Add new marker for any new point ---
    points.forEach((point, index) => {
      if (markersRef.current[index]) return; // marker already exists

      const marker = new google.maps.Marker({
        position: point,
        map,
        label: {
          text: String(index + 1),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '11px',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#f57c00',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: `Point ${index + 1}`,
        draggable: true,  // allow user to drag and adjust points
      });

      // When a marker is dragged, update the point in state
      marker.addListener('dragend', (e) => {
        const updatedPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setPoints((prev) => {
          const next = [...prev];
          next[index] = updatedPoint;
          return next;
        });
      });

      markersRef.current[index] = marker;
    });

    // --- Update the polyline (open path while marking) ---
    if (polylineRef.current) {
      polylineRef.current.setPath(points);
    } else if (points.length >= 2) {
      polylineRef.current = new google.maps.Polyline({
        path: points,
        strokeColor: '#f57c00',
        strokeOpacity: 1,
        strokeWeight: 2.5,
        map,
      });
    }

    // If there are fewer than 2 points, hide the polyline
    if (points.length < 2 && polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
  }, [map, points]);

  // ─── Public: draw a closed polygon ────────────────────────────────────────
  const drawClosedPolygon = useCallback(() => {
    if (!map || !window.google || points.length < 3) return;

    // Remove any previous closed polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    // Hide the open polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Draw a filled, closed polygon
    polygonRef.current = new window.google.maps.Polygon({
      paths: points,
      strokeColor: '#f57c00',
      strokeOpacity: 1,
      strokeWeight: 2.5,
      fillColor: '#f57c00',
      fillOpacity: 0.25,
      map,
    });
  }, [map, points]);

  // ─── Public: undo the last point ──────────────────────────────────────────
  const undoLastPoint = useCallback(() => {
    // Remove closed polygon if present (undo after calculation)
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    setPoints((prev) => prev.slice(0, -1));
  }, []);

  // ─── Public: clear everything ─────────────────────────────────────────────
  const clearAll = useCallback(() => {
    // Remove all markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Remove polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Remove polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    setPoints([]);
  }, []);

  return {
    points,
    drawClosedPolygon,
    undoLastPoint,
    clearAll,
  };
}
