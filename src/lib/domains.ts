export type Domain = {
  slug: string;
  title: string;
  summary: string;
  playgrounds: { slug: string; title: string; summary: string }[];
};

export const domains: Domain[] = [
  {
    slug: "trig",
    title: "Trigonometry",
    summary: "Angle-driven ratios, unit circle, and triangle laws.",
    playgrounds: [
      {
        slug: "unit-circle",
        title: "Unit Circle",
        summary: "Connect angles, triangles, and sinusoidal graphs.",
      },
      {
        slug: "triangle-laws",
        title: "Triangle Laws",
        summary: "Decompose a triangle and compare sine/cosine laws.",
      },
    ],
  },
  {
    slug: "exp-log",
    title: "Exponential & Logarithmic",
    summary: "Model growth and decay with structured controls.",
    playgrounds: [
      {
        slug: "exponential-growth",
        title: "Exponential Growth",
        summary: "Adjust parameters and observe exponential change.",
      },
      {
        slug: "logarithms",
        title: "Logarithms",
        summary: "See how logarithmic curves respond to base changes.",
      },
    ],
  },
  {
    slug: "number-sense",
    title: "Number Sense",
    summary: "Build intuition with patterns, place value, and estimation.",
    playgrounds: [
      {
        slug: "estimation-studio",
        title: "Estimation Studio",
        summary: "Practice quick, confident rounding decisions.",
      },
      {
        slug: "place-value-mixer",
        title: "Place Value Mixer",
        summary: "Rearrange digits and watch value shifts.",
      },
    ],
  },
  {
    slug: "fractions-decimals",
    title: "Fractions & Decimals",
    summary: "Connect representations with visual models.",
    playgrounds: [
      {
        slug: "fraction-kitchen",
        title: "Fraction Kitchen",
        summary: "Slice, combine, and compare fraction pieces.",
      },
      {
        slug: "decimal-dial",
        title: "Decimal Dial",
        summary: "Spin to see how decimals change in real time.",
      },
    ],
  },
  {
    slug: "geometry",
    title: "Geometry",
    summary: "Explore shapes, angles, and spatial reasoning.",
    playgrounds: [
      {
        slug: "shape-forge",
        title: "Shape Forge",
        summary: "Build polygons and test their properties.",
      },
      {
        slug: "angle-lab",
        title: "Angle Lab",
        summary: "Measure, rotate, and compare angles.",
      },
    ],
  },
];
