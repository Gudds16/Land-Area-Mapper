import React, { useRef, useState, useCallback } from 'react';
import { useGoogleMap } from './hooks/useGoogleMap';
import { usePolygonMarker } from './hooks/usePolygonMarker';
import ControlPanel from './components/ControlPanel';
import ResultCard from './components/ResultCard';
import SearchBox from './components/SearchBox';
import {
  calculateGeodesicArea,
  calculatePerimeter,
} from './utils/areaCalculation';
import './App.css';

function App() {
  // Ref for the map container div
  const mapContainerRef = useRef(null);

  // Load Google Maps and get the map instance
  const { map, isLoaded, error } = useGoogleMap(mapContainerRef);

  // Whether the user is actively placing boundary points
  const [isMarking, setIsMarking] = useState(false);

  // Selected area unit (used by ControlPanel and ResultCard)
  const [areaUnit, setAreaUnit] = useState('acreGuntha');

  // Calculated results
  const [result, setResult] = useState(null);

  // Polygon drawing logic
  const { points, drawClosedPolygon, undoLastPoint, clearAll } =
    usePolygonMarker(map, isMarking);

  // ─── Toggle marking mode ──────────────────────────────────────────────────
  const handleStartMarking = useCallback(() => {
    setIsMarking((prev) => !prev);
    // Clear any old result when starting a new session
    if (!isMarking) setResult(null);
  }, [isMarking]);

  // ─── Calculate area ───────────────────────────────────────────────────────
  const handleCalculateArea = useCallback(() => {
    if (points.length < 3) return;

    // Stop marking mode
    setIsMarking(false);

    // Draw the closed polygon on the map
    drawClosedPolygon();

    // Compute area and perimeter from geographic coordinates
    const sqMeters       = calculateGeodesicArea(points);
    const perimeterMeters = calculatePerimeter(points);

    setResult({ sqMeters, perimeterMeters, pointCount: points.length });
  }, [points, drawClosedPolygon]);

  // ─── Undo last point ─────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    undoLastPoint();
    setResult(null); // Clear result when editing
  }, [undoLastPoint]);

  // ─── Clear all ───────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    clearAll();
    setIsMarking(false);
    setResult(null);
  }, [clearAll]);

  return (
    <div className="app-layout">
      {/* ─── Sidebar control panel ─── */}
      <aside className="sidebar">
        <ControlPanel
          isMarking={isMarking}
          onStartMarking={handleStartMarking}
          onUndoPoint={handleUndo}
          onCalculateArea={handleCalculateArea}
          onClear={handleClear}
          pointCount={points.length}
          areaUnit={areaUnit}
          onAreaUnitChange={setAreaUnit}
        />

        {/* Show result card when calculation is done */}
        {result && (
          <div className="result-container">
            <ResultCard
              sqMeters={result.sqMeters}
              perimeterMeters={result.perimeterMeters}
              pointCount={result.pointCount}
              areaUnit={areaUnit}
            />
          </div>
        )}
      </aside>

      {/* ─── Map area ─── */}
      <main className="map-area">
        {/* Error state */}
        {error && (
          <div className="map-error">
            <div className="map-error-box">
              <h2>⚠️ Configuration Required</h2>
              <p>{error}</p>
              <ol>
                <li>Copy <code>.env.example</code> to <code>.env</code></li>
                <li>Add your Google Maps API key</li>
                <li>Restart the dev server</li>
              </ol>
              <a
                href="https://console.cloud.google.com/google/maps-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="map-error-link"
              >
                Get API Key →
              </a>
            </div>
          </div>
        )}

        {/* Loading state */}
        {!error && !isLoaded && (
          <div className="map-loading">
            <div className="spinner" />
            <p>Loading satellite map...</p>
          </div>
        )}

        {/* Map container — always rendered so ref is attached */}
        <div
          ref={mapContainerRef}
          className={`map-container ${isMarking ? 'cursor-crosshair' : ''}`}
        />

        {/* Floating search box — only when map is loaded */}
        {isLoaded && <SearchBox map={map} />}

        {/* Floating instruction when marking */}
        {isMarking && (
          <div className="marking-indicator">
            📍 Click on the map to add boundary points
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
