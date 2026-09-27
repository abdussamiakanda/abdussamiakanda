// Research content shared by the home section and the /research page.

export const BROAD_AREA = 'Condensed Matter Physics';

// "Specific Areas" from the CV.
export const SPECIFIC_AREAS = [
  'Spintronics',
  'Magnetization / Domain Wall Dynamics',
  'Magnetic Nanowires',
  'Landau–Lifshitz–Gilbert Equation',
  'Spin-Transfer Torque',
  'Spin-Orbit Torque',
  'Spin Waves',
  'Magnonic Crystals',
];

// Themes drawn from the research interests and publication record.
export const INTERESTS = [
  {
    k: '∇T',
    title: 'Domain-wall dynamics',
    body: 'How thermal gradients, spin waves and shape anisotropy drive magnetic domain walls along nanowires.',
    tone: 'up',
  },
  {
    k: 'τ',
    title: 'Magnetization switching',
    body: 'Fast, low-energy reversal with chirped microwave pulses, spin-transfer and spin-orbit torques, and AC-triggered magnetic tunnel junctions.',
    tone: 'down',
  },
  {
    k: 'ω(k)',
    title: 'Spin waves & magnonics',
    body: 'Spin-wave dispersion in permalloy microstrips and magnonic crystals, simulated with MuMax3 and COMSOL.',
    tone: 'up',
  },
];

export const LLG_TEX = String.raw`\frac{\partial \mathbf{m}}{\partial t} = -\gamma\, \mathbf{m} \times \mathbf{H}_{\mathrm{eff}} + \alpha\, \mathbf{m} \times \frac{\partial \mathbf{m}}{\partial t}`;
