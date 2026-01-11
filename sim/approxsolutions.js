/**
 * Katherine Johnson–era Reentry Mathematics
 * -----------------------------------------
 * Classical analytical equations used in atmospheric reentry analysis.
 * These models balance gravity, lift, drag, and atmospheric density.
 *
 * Units:
 *  - Distance: meters
 *  - Velocity: m/s
 *  - Mass: kg
 *  - Angles: radians
 */

/* Physical constants */
const EARTH_RADIUS = 6371000;       // m
const MU = 3.986004418e14;          // m^3/s^2 (Earth gravitational parameter)
const G0 = 9.80665;                 // m/s^2
const RHO_0 = 1.225;                // kg/m^3 (sea level density)
const H_SCALE = 7200;               // m (scale height)

/**
 * Exponential atmospheric density model
 * ρ(h) = ρ₀ e^(−h/H)
 */
function atmosphericDensity(altitude) {
  return RHO_0 * Math.exp(-altitude / H_SCALE);
}

/**
 * Aerodynamic drag force
 * D = 0.5 ρ V² C_D A
 */
function dragForce(rho, velocity, Cd, area) {
  return 0.5 * rho * velocity * velocity * Cd * area;
}

/**
 * Aerodynamic lift force
 * L = 0.5 ρ V² C_L A
 */
function liftForce(rho, velocity, Cl, area) {
  return 0.5 * rho * velocity * velocity * Cl * area;
}

/**
 * Gravity acceleration at altitude
 * g(h) = μ / r²
 */
function gravity(altitude) {
  const r = EARTH_RADIUS + altitude;
  return MU / (r * r);
}

/**
 * Flight-path angle rate equation (γ̇)
 *
 * γ̇ = (L / mV) cos(σ)
 *      + (V / r − g / V) cos(γ)
 *
 * σ = bank angle
 *
 * This form appears in Johnson-era analytical reentry derivations.
 */
function flightPathAngleRate({
  lift,
  mass,
  velocity,
  altitude,
  gamma,
  bankAngle = 0
}) {
  const r = EARTH_RADIUS + altitude;
  const g = gravity(altitude);

  const liftTerm = (lift / (mass * velocity)) * Math.cos(bankAngle);
  const gravityTerm = (velocity / r - g / velocity) * Math.cos(gamma);

  return liftTerm + gravityTerm;
}

/**
 * Approximate analytical solution for shallow reentry
 * (small γ assumption, Johnson-style approximation)
 *
 * γ ≈ γ₀ − ∫ (D / mV) dt
 */
function approximateFlightPathAngle({
  gamma0,
  drag,
  mass,
  velocity,
  deltaTime
}) {
  return gamma0 - (drag / (mass * velocity)) * deltaTime;
}

/**
 * Ballistic coefficient
 * β = m / (C_D A)
 */
function ballisticCoefficient(mass, Cd, area) {
  return mass / (Cd * area);
}

/**
 * Entry deceleration approximation
 * a ≈ D / m
 */
function deceleration(drag, mass) {
  return drag / mass;
}

/* ================================
   Example usage (simulation step)
   ================================ */

function reentryStep(state, vehicle, dt) {
  const rho = atmosphericDensity(state.altitude);
  const drag = dragForce(rho, state.velocity, vehicle.Cd, vehicle.area);
  const lift = liftForce(rho, state.velocity, vehicle.Cl, vehicle.area);

  const gammaDot = flightPathAngleRate({
    lift,
    mass: vehicle.mass,
    velocity: state.velocity,
    altitude: state.altitude,
    gamma: state.gamma,
    bankAngle: vehicle.bankAngle
  });

  return {
    gamma: state.gamma + gammaDot * dt,
    velocity: state.velocity - (drag / vehicle.mass) * dt,
    altitude: state.altitude + state.velocity * Math.sin(state.gamma) * dt
  };
}

export {
  atmosphericDensity,
  dragForce,
  liftForce,
  gravity,
  flightPathAngleRate,
  approximateFlightPathAngle,
  ballisticCoefficient,
  deceleration,
  reentryStep
};