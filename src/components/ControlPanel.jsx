import React from 'react';
import styles from './ControlPanel.module.css';

const UNITS = [
  { value: 'sqm',        label: 'Square Meter' },
  { value: 'sqft',       label: 'Square Feet' },
  { value: 'acre',       label: 'Acre' },
  { value: 'guntha',     label: 'Guntha' },
  { value: 'acreGuntha', label: 'Acre + Guntha' },
];

/**
 * ControlPanel
 * Sidebar with all action buttons and the area unit selector.
 */
function ControlPanel({
  isMarking,
  onStartMarking,
  onUndoPoint,
  onCalculateArea,
  onClear,
  pointCount,
  areaUnit,
  onAreaUnitChange,
}) {
  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>
        <span>&#128208;</span> Land Area Mapper
      </h1>

      <p className={styles.disclaimer}>
        Approximate map-based measurement only. Not a legally certified land survey.
      </p>

      {/* ─── Action Buttons ─── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Controls</h2>

        <button
          className={`${styles.btn} ${isMarking ? styles.btnActive : styles.btnPrimary}`}
          onClick={onStartMarking}
        >
          {isMarking ? 'Stop Marking' : 'Start Marking'}
        </button>

        {isMarking && (
          <p className={styles.hint}>Click on the map to add boundary points.</p>
        )}

        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={onUndoPoint}
          disabled={pointCount === 0}
        >
          &#8617; Undo Last Point
        </button>

        <button
          className={`${styles.btn} ${styles.btnSuccess}`}
          onClick={onCalculateArea}
          disabled={pointCount < 3}
        >
          &#9632; Calculate Area
        </button>

        <button
          className={`${styles.btn} ${styles.btnDanger}`}
          onClick={onClear}
          disabled={pointCount === 0}
        >
          &#128465; Clear All Points
        </button>
      </div>

      {/* ─── Unit Selector ─── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Select Area Unit</h2>
        <div className={styles.unitGrid}>
          {UNITS.map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.unitBtn} ${areaUnit === value ? styles.unitBtnSelected : ''}`}
              onClick={() => onAreaUnitChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Point count ─── */}
      <div className={styles.section}>
        <p className={styles.pointCount}>
          <span>Boundary Points:</span>
          <strong>{pointCount}</strong>
        </p>
        {pointCount < 3 && pointCount > 0 && (
          <p className={styles.hint}>Need at least 3 points to calculate area.</p>
        )}
      </div>
    </div>
  );
}

export default ControlPanel;
