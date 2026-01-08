/**
 * azimuth.js
 *
 * Launch azimuth and orbital geometry utilities.
 *
 * This module implements classical orbital mechanics relationships
 * used in early NASA trajectory analysis, including launch azimuth
 * determination for Earth-orbiting spacecraft.
 *
 * The analytical structure aligns with the methods used by
 * Katherine Johnson and contemporaries during Project Mercury
 * and early Apollo-era mission design.
 *
 * Reference:
 * NASA NTRS 19980227091
 * https://ntrs.nasa.gov/citations/19980227091
 */

/* =========================================================
 * Physical constants
 * ========================================================= */

export const EARTH_RADIUS_KM = 6378.0;      // R
export const EARTH_ROT_RATE = 0.25068;      // omegaEarth (deg/min)
export const G0 = 9.80665;                  // g0 (m/s^2)

/* =========================================================
 * Angle utilities
 * ========================================================= */

export function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians) {
  return (radians * 180) / Math.PI;
}

/* =========================================================
 * Orbital geometry
 * ========================================================= */

/**
 * Semilatus rectum
 * p = a (1 - e^2)
 */
export function computeSemilatusRectum(semimajorAxis, eccentricity) {
  return semimajorAxis * (1 - eccentricity ** 2);
}

/**
 * Orbital radius
 * r = p / (1 + e cos(theta))
 */
export function computeOrbitalRadius(p, trueAnomalyDeg, eccentricity) {
  const theta = degToRad(trueAnomalyDeg);
  return p / (1 + eccentricity * Math.cos(theta));
}

/**
 * Circular orbit velocity (normalized)
 * Placeholder for future gravitational parameter inclusion.
 */
export function computeCircularVelocity(radiusKm) {
  return Math.sqrt(1 / radiusKm);
}

/* =========================================================
 * Orbital timing
 * ========================================================= */

/**
 * Time from perigee (simplified Kepler relation)
 *
 * t(theta) ≈ (T / 2π) · E
 */
export function computeTimeFromPerigee(
  orbitalPeriodMin,
  eccentricAnomalyDeg
) {
  const eccentricAnomalyRad = degToRad(eccentricAnomalyDeg);
  return (orbitalPeriodMin / (2 * Math.PI)) * eccentricAnomalyRad;
}

/* =========================================================
 * Earth rotation
 * ========================================================= */

/**
 * Longitude shift due to Earth rotation
 *
 * lambda = omegaEarth · t
 */
export function computeEarthRotationLongitude(timeMin) {
  return EARTH_ROT_RATE * timeMin;
}

/* =========================================================
 * Launch azimuth
 * ========================================================= */

/**
 * Compute launch azimuth angle.
 *
 * cos(psi) = cos(i) / cos(phi)
 *
 * where:
 *  psi  = azimuth angle (clockwise from North)
 *  i    = orbital inclination
 *  phi  = geocentric latitude
 *
 * This is the same geometric constraint used to
 * analytically verify launch windows in early NASA missions.
 */
export function computeLaunchAzimuth(
  latitudeDeg,
  inclinationDeg
) {
  const phi = degToRad(latitudeDeg);
  const inclination = degToRad(inclinationDeg);

  const cosPsi = Math.cos(inclination) / Math.cos(phi);

  if (Math.abs(cosPsi) > 1) {
    throw new Error(
      "Target inclination cannot be achieved from this latitude."
    );
  }

  const psi = Math.acos(cosPsi);
  return radToDeg(psi);
}

/* =========================================================
 * Feasibility checks
 * ========================================================= */

/**
 * Determine if an orbital inclination
 * is reachable from a given latitude.
 */
export function isInclinationReachable(
  latitudeDeg,
  inclinationDeg
) {
  return Math.abs(inclinationDeg) >= Math.abs(latitudeDeg);
}

/* =========================================================
 * High-level simulation interface
 * ========================================================= */

/**
 * Run azimuth angle simulation.
 *
 * Input variables map directly to
 * the NASA paper symbol set.
 */
export function runAzimuthSimulation({
  latitudeDeg,          // phi
  inclinationDeg,       // i
  timeSinceEpochMin = 0 // t
}) {
  const azimuthDeg = computeLaunchAzimuth(
    latitudeDeg,
    inclinationDeg
  );

  const longitudeShiftDeg = computeEarthRotationLongitude(
    timeSinceEpochMin
  );

  return {
    azimuthDeg,
    longitudeShiftDeg,
    feasible: isInclinationReachable(
      latitudeDeg,
      inclinationDeg
    )
  };
}
