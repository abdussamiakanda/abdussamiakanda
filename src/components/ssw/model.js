// A cartoon of the paper's argument, not its micromagnetic simulation.
// Spin waves fade over a propagation length Lp that shrinks as damping grows.
// A wave that survives the trip to the far end and back is "standing" and
// pushes nothing; a wave that fades first is "travelling" and pushes the wall,
// provided it also survives the walk to the wall (REACH_NM).
export const ALPHA_MIN = 0.0005;
export const ALPHA_MAX = 0.006;
export const LP_COEFF = 5; // nm, so Lp = LP_COEFF / alpha
export const REACH_NM = 750; // typical distance from where magnons are born to the wall

export const propagationLength = (alpha) => LP_COEFF / alpha;

export function shares(alpha, lengthNm) {
  const lp = propagationLength(alpha);
  const standing = Math.exp((-2 * lengthNm) / lp);
  const reach = Math.exp(-REACH_NM / lp);
  const pushing = (1 - standing) * reach;
  return { standing, pushing, faded: 1 - standing - pushing };
}

export const wallSpeed = (alpha, lengthNm) => shares(alpha, lengthNm).pushing;

// Damping at which the speed peaks: e^(kα) = 1 + k/m with k = 2L/LP_COEFF, m = REACH/LP_COEFF.
export function criticalDamping(lengthNm) {
  const k = (2 * lengthNm) / LP_COEFF;
  const m = REACH_NM / LP_COEFF;
  return Math.log(1 + k / m) / k;
}
