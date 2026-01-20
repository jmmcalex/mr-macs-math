export const TWO_PI = Math.PI * 2;

export const degreesToRadians = (degrees: number) =>
  (degrees * Math.PI) / 180;

export const radiansToDegrees = (radians: number) =>
  (radians * 180) / Math.PI;

export const normalizeRadians = (radians: number) => {
  const normalized = ((radians % TWO_PI) + TWO_PI) % TWO_PI;
  return normalized === TWO_PI ? 0 : normalized;
};

export const formatNumber = (value: number, maxDecimals = 3) => {
  const fixed = value.toFixed(maxDecimals);
  return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
};

export const sinCosTan = (radians: number) => {
  const sinValue = Math.sin(radians);
  const cosValue = Math.cos(radians);
  const tanValue =
    Math.abs(cosValue) < 1e-6 ? null : Math.tan(radians);

  return { sinValue, cosValue, tanValue };
};

export const quadrantLabel = (radians: number) => {
  const angle = normalizeRadians(radians);
  const epsilon = 1e-6;
  if (
    Math.abs(angle) < epsilon ||
    Math.abs(angle - Math.PI / 2) < epsilon ||
    Math.abs(angle - Math.PI) < epsilon ||
    Math.abs(angle - (3 * Math.PI) / 2) < epsilon
  ) {
    return "Axis";
  }
  if (angle > 0 && angle < Math.PI / 2) return "Q1";
  if (angle > Math.PI / 2 && angle < Math.PI) return "Q2";
  if (angle > Math.PI && angle < (3 * Math.PI) / 2) return "Q3";
  return "Q4";
};
