/**
 * Echo I Orbital Behavior Model
 * --------------------------------
 * Models orbital drift and decay across successive revolutions
 * using Earth oblateness (J2) and atmospheric drag.
 *
 * KJ Orbital Focus:
 * - Step-by-step evolution
 * - Transparent math
 * - Visualization-ready output
 */

// --------------------
// Physical Constants
// --------------------

const MU = 3.986004418e14;        // Earth gravitational parameter (m^3/s^2)
const R_E = 6378137;              // Earth radius (m)
const J2 = 1.08263e-3;            // Earth J2 coefficient
const DEG = 180 / Math.PI;

// --------------------
// Atmospheric Model
// --------------------

const RHO_0 = 1.225;              // Sea-level density (kg/m^3)
const SCALE_HEIGHT = 8500;        // Scale height (m)

function atmosphericDensity(altitude) {
  return RHO_0 * Math.exp(-altitude / SCALE_HEIGHT);
}

// --------------------
// Orbital Mechanics
// --------------------

function meanMotion(semiMajorAxis) {
  return Math.sqrt(MU / Math.pow(semiMajorAxis, 3));
}

function orbitalPeriod(semiMajorAxis) {
  return 2 * Math.PI / meanMotion(semiMajorAxis);
}

// --------------------
// J2 Secular Drift Rates
// --------------------

function raanDriftRate(a, e, inclination) {
  const n = meanMotion(a);
  return (
    -1.5 *
    J2 *
    Math.pow(R_E / a, 2) *
    (n * Math.cos(inclination)) /
    Math.pow(1 - e * e, 2)
  );
}

function perigeeDriftRate(a, e, inclination) {
  const n = meanMotion(a);
  return (
    0.75 *
    J2 *
    Math.pow(R_E / a, 2) *
    (n * (5 * Math.cos(inclination) ** 2 - 1)) /
    Math.pow(1 - e * e, 2)
  );
}

// --------------------
// Atmospheric Drag Decay
// --------------------

function semiMajorAxisDecay(a, area, mass, dragCoeff) {
  const altitude = a - R_E;
  const rho = atmosphericDensity(altitude);
  return (
    -dragCoeff *
    (area / mass) *
    rho *
    Math.sqrt(MU * a)
  );
}

// --------------------
// Orbit Evolution
// --------------------

export function propagateOrbit({
  semiMajorAxis,
  eccentricity = 0.0,
  inclination,
  area,
  mass,
  dragCoeff = 2.2,
  revolutions = 1000
}) {
  let a = semiMajorAxis;
  let Omega = 0;   // RAAN (rad)
  let omega = 0;   // Argument of perigee (rad)

  const history = [];

  for (let N = 0; N < revolutions; N++) {
    const T = orbitalPeriod(a);

    const da_dt = semiMajorAxisDecay(a, area, mass, dragCoeff);
    const dOmega_dt = raanDriftRate(a, eccentricity, inclination);
    const domega_dt = perigeeDriftRate(a, eccentricity, inclination);

    // Step forward one revolution
    a += da_dt * T;
    Omega += dOmega_dt * T;
    omega += domega_dt * T;

    history.push({
      orbit: N,
      semiMajorAxis: a,
      altitude: a - R_E,
      raanDeg: Omega * DEG,
      perigeeDeg: omega * DEG
    });
  }

  return history;
}

// --------------------
// Example Usage
// --------------------

// Echo I parameters (approximate)
const echoI = propagateOrbit({
  semiMajorAxis: R_E + 1600000, // ~1600 km altitude
  inclination: 47 * Math.PI / 180,
  area: 400,                   // m^2 (very large)
  mass: 75,                    // kg
  revolutions: 500
});

// Rocket casing comparison
const casing = propagateOrbit({
  semiMajorAxis: R_E + 1600000,
  inclination: 47 * Math.PI / 180,
  area: 1.5,
  mass: 200,
  revolutions: 500
});

console.log({ echoI, casing });