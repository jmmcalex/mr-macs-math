export const degreesToRadians = (degrees: number) =>
  (degrees * Math.PI) / 180;

export const radiansToDegrees = (radians: number) =>
  (radians * 180) / Math.PI;

export const clampAngle = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const computeTriangle = (angleA: number, angleB: number, base: number) => {
  const angleC = 180 - angleA - angleB;
  const radiansA = degreesToRadians(angleA);
  const radiansB = degreesToRadians(angleB);
  const radiansC = degreesToRadians(angleC);
  const sinC = Math.sin(radiansC);

  const a = (base * Math.sin(radiansA)) / sinC;
  const b = (base * Math.sin(radiansB)) / sinC;

  const xC = b * Math.cos(radiansA);
  const yC = b * Math.sin(radiansA);

  return {
    angleC,
    radiansA,
    radiansB,
    radiansC,
    a,
    b,
    c: base,
    xC,
    yC,
  };
};

export const computeSineLawRatios = (triangle: {
  radiansA: number;
  radiansB: number;
  radiansC: number;
  a: number;
  b: number;
  c: number;
}) => ({
  ratioA: Math.sin(triangle.radiansA) / triangle.a,
  ratioB: Math.sin(triangle.radiansB) / triangle.b,
  ratioC: Math.sin(triangle.radiansC) / triangle.c,
});

export const computeCosineLaw = (triangle: {
  radiansC: number;
  a: number;
  b: number;
  c: number;
}) => {
  const c2 = triangle.c ** 2;
  const a2b2 = triangle.a ** 2 + triangle.b ** 2;
  const correction = 2 * triangle.a * triangle.b * Math.cos(triangle.radiansC);
  const diff = c2 - (a2b2 - correction);

  return { c2, a2b2, correction, diff };
};
