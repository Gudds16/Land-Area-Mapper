import React from 'react';
import styles from './ResultCard.module.css';
import {
  sqMetersToSqFeet,
  sqMetersToAcres,
  sqMetersToGuntha,
  sqMetersToHectares,
  sqMetersToAcreGuntha,
  formatAcreGuntha,
  metersToFeet,
} from '../utils/areaCalculation';

/**
 * ResultCard
 * Shows the measurement summary: primary area in selected unit,
 * full conversion table, perimeter, and point count.
 */
function ResultCard({ sqMeters, perimeterMeters, pointCount, areaUnit }) {
  if (!sqMeters || sqMeters === 0) return null;

  // Compute all unit values
  const sqFeet     = sqMetersToSqFeet(sqMeters);
  const acres      = sqMetersToAcres(sqMeters);
  const guntha     = sqMetersToGuntha(sqMeters);
  const hectares   = sqMetersToHectares(sqMeters);
  const acreGuntha = sqMetersToAcreGuntha(sqMeters);
  const perimFt    = metersToFeet(perimeterMeters);

  const primary = getPrimary(areaUnit, { sqMeters, sqFeet, acres, guntha, acreGuntha });

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        &#128207; LAND MEASUREMENT
      </div>

      {/* Primary Area Result */}
      <div className={styles.primary}>
        <div className={styles.primaryLabel}>Area</div>
        <div className={styles.primaryValue}>{primary.main}</div>
        {primary.sub && <div className={styles.primarySub}>{primary.sub}</div>}
      </div>

      {/* Full Breakdown */}
      <div className={styles.breakdown}>
        <Row label="Square Meters" value={fmt(sqMeters, 2) + ' m²'} />
        <Row label="Square Feet"   value={fmt(sqFeet, 2) + ' ft²'} />
        <Row label="Acres"         value={acres.toFixed(4) + ' ac'} />
        <Row label="Guntha"        value={guntha.toFixed(2) + ' G'} />
        <Row label="Acre + Guntha" value={formatAcreGuntha(acreGuntha)} />
        <Row label="Hectares"      value={hectares.toFixed(4) + ' ha'} />
      </div>

      {/* Perimeter */}
      <div className={styles.perimeter}>
        <div className={styles.perimLabel}>Perimeter</div>
        <div className={styles.perimValue}>
          {perimeterMeters.toFixed(1)} m &nbsp;&bull;&nbsp; {perimFt.toFixed(1)} ft
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        Boundary Points: <strong>{pointCount}</strong>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className={styles.row}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/** Format a number with Indian locale, fixed decimals */
function fmt(n, decimals) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: decimals });
}

/** Get primary display based on selected unit */
function getPrimary(unit, { sqMeters, sqFeet, acres, guntha, acreGuntha }) {
  switch (unit) {
    case 'sqm':
      return { main: fmt(sqMeters, 2) + ' m²', sub: null };
    case 'sqft':
      return { main: fmt(sqFeet, 2) + ' ft²', sub: null };
    case 'acre':
      return { main: acres.toFixed(4) + ' Acres', sub: 'Total: ' + acres.toFixed(4) + ' ac' };
    case 'guntha':
      return { main: guntha.toFixed(2) + ' Guntha', sub: null };
    case 'acreGuntha': {
      const { totalAcres } = acreGuntha;
      return {
        main: formatAcreGuntha(acreGuntha),
        sub: 'Total: ' + totalAcres.toFixed(4) + ' Acres',
      };
    }
    default:
      return { main: fmt(sqMeters, 2) + ' m²', sub: null };
  }
}

export default ResultCard;
