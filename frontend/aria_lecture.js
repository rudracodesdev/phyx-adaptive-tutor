// Prof. Aria — Interactive AI Lecture & Live Doubt Interruption Studio

const LECTURE_CURRICULUM = {
  P1: {
    title: "Reflection & Plane Mirrors",
    formula: "∠i = ∠r (measured from normal)",
    numerical: "Q: A ray strikes a plane mirror at 35° to the mirror surface. Find ∠r.\nStep 1: Angle with normal ∠i = 90° - 35° = 55°.\nStep 2: By Law of Reflection, ∠r = ∠i = 55°.",
    trap: "Glancing angle with the mirror surface is NOT the angle of incidence. Always subtract from 90° first!",
    steps: [
      {
        heading: "Step 1: Core Intuition & The Normal Line",
        speech: "Welcome! In plane mirror reflection, all angles are measured from the Normal, which is the perpendicular line at 90 degrees to the mirror surface, never from the mirror surface itself.",
        boardLines: [
          "1. Core Law of Reflection:",
          "   Angle of Incidence (∠i) = Angle of Reflection (∠r)",
          "   * Measured from the NORMAL (90° to mirror)",
          "   * If ray makes 35° with surface → ∠i = 90° - 35° = 55°",
        ],
      },
      {
        heading: "Step 2: Plane Mirror Image Properties",
        speech: "A plane mirror always forms a virtual, erect, and laterally inverted image of the exact same size as the object, located as far behind the mirror as the object is in front.",
        boardLines: [
          "2. Plane Mirror Image Characteristics:",
          "   • Nature: Virtual & Erect (cannot be caught on a screen)",
          "   • Magnification: m = +1 (Image height = Object height)",
          "   • Distance: |v| = |u| behind the mirror",
        ],
      },
      {
        heading: "Step 3: Solved Exam Numerical (Relative Speed)",
        speech: "Here is a classic exam question: If you walk towards a plane mirror at 2 meters per second, your image also moves towards the mirror at 2 meters per second, so your image approaches you at 4 meters per second.",
        boardLines: [
          "3. Solved Board Problem:",
          "   Q: Person walks towards mirror at v = 2.0 m/s.",
          "   • Image moves towards mirror at 2.0 m/s.",
          "   • Relative approach speed = 2.0 + 2.0 = 4.0 m/s",
        ],
      },
      {
        heading: "Step 4: #1 Board Exam Trap to Avoid",
        speech: "Watch out for the glancing angle trap! Examiners often give the angle between the ray and the mirror surface. Always subtract that angle from 90 degrees first.",
        boardLines: [
          "4. Exam Trap Alert:",
          "   ⚠ Glancing angle θ ≠ Angle of incidence ∠i",
          "   ✓ Always compute: ∠i = 90° - θ before answering!",
        ],
      },
    ],
  },
  P2: {
    title: "Spherical Mirrors & New Cartesian Sign Convention",
    formula: "1/f = 1/v + 1/u  |  m = -v/u",
    numerical: "Q: Object at 30 cm in front of concave mirror (f = 15 cm). Find v.\nStep 1: u = -30 cm, f = -15 cm.\nStep 2: 1/v = 1/(-15) - 1/(-30) = -1/30 → v = -30 cm (Real, inverted).",
    trap: "Never take focal length f as positive for a concave mirror! Concave f is always negative (-f); convex f is positive (+f).",
    steps: [
      {
        heading: "Step 1: New Cartesian Sign Convention",
        speech: "Let's master Spherical Mirrors! Place the object on the left of the pole. Distances measured against incident light are negative, so object distance u is always negative.",
        boardLines: [
          "1. New Cartesian Sign Convention (Pole = Origin):",
          "   • Object distance (u): ALWAYS NEGATIVE (-u)",
          "   • Concave mirror focal length (f): NEGATIVE (-f)",
          "   • Convex mirror focal length (f): POSITIVE (+f)",
        ],
      },
      {
        heading: "Step 2: Mirror Formula & Magnification",
        speech: "The mirror formula is 1 over f equals 1 over v plus 1 over u. Linear magnification m is minus v over u. Negative magnification means a real, inverted image.",
        boardLines: [
          "2. Governing Equations:",
          "   • Mirror Formula:  1/f = 1/v + 1/u",
          "   • Magnification:   m = h'/h = -v / u",
          "   • m < 0 → Real & Inverted  |  m > 0 → Virtual & Erect",
        ],
      },
      {
        heading: "Step 3: Solved Numerical (Concave Mirror)",
        speech: "Suppose an object is 30 centimeters in front of a concave mirror of focal length 15 centimeters. Here u is minus 30 and f is minus 15. Solving 1 over v gives v equals minus 30 centimeters, a real inverted same size image.",
        boardLines: [
          "3. Worked Example (Object at Center of Curvature C):",
          "   Given: u = -30 cm, f = -15 cm",
          "   1/v = 1/(-15) - 1/(-30) = -2/30 + 1/30 = -1/30",
          "   Result: v = -30 cm (Real, inverted, m = -1)",
        ],
      },
      {
        heading: "Step 4: #1 Board Exam Trap to Avoid",
        speech: "Never plug positive focal length for a concave mirror! Even though a concave mirror converges light, its focus lies in front of the mirror on the negative x-axis.",
        boardLines: [
          "4. Exam Trap Alert:",
          "   ⚠ Wrong: f = +15 cm for concave mirror",
          "   ✓ Right: f = -15 cm (Focus is in front of reflecting face)",
        ],
      },
    ],
  },
  P3: {
    title: "Refraction of Light & Snell's Law",
    formula: "n₁ sin(i) = n₂ sin(r)  |  n = c / v",
    numerical: "Q: Refractive index of glass is 1.5. Find speed of light in glass.\nStep 1: v = c / n = (3.0 × 10⁸) / 1.5 = 2.0 × 10⁸ m/s.",
    trap: "Total Internal Reflection NEVER occurs when light goes from rarer (air) to denser (glass)—only from denser to rarer when ∠i > critical angle!",
    steps: [
      {
        heading: "Step 1: Why Light Bends Across Media",
        speech: "Refraction happens because light changes speed when entering a medium with a different optical density. Entering a denser medium slows light down and bends it towards the normal.",
        boardLines: [
          "1. Optical Density & Bending Rules:",
          "   • Rarer → Denser (Air to Glass): Slows down, bends TOWARDS normal",
          "   • Denser → Rarer (Glass to Air): Speeds up, bends AWAY from normal",
        ],
      },
      {
        heading: "Step 2: Snell's Law & Refractive Index",
        speech: "Snell's law states that n1 sine i equals n2 sine r. Absolute refractive index n equals c over v, where c is 3 times 10 to the power 8 meters per second.",
        boardLines: [
          "2. Governing Equations:",
          "   • Snell's Law:  n₁ · sin(i) = n₂ · sin(r)",
          "   • Refractive Index:  n = c / v  (c = 3.0 × 10⁸ m/s)",
        ],
      },
      {
        heading: "Step 3: Solved Example (Speed in Glass)",
        speech: "If crown glass has refractive index 1.5, the speed of light inside glass is 3 times 10 to the 8 divided by 1.5, which equals 2 times 10 to the 8 meters per second.",
        boardLines: [
          "3. Worked Example:",
          "   Given: n_glass = 1.5, c = 3.0 × 10⁸ m/s",
          "   v = c / n = (3.0 × 10⁸) / 1.5 = 2.0 × 10⁸ m/s",
        ],
      },
      {
        heading: "Step 4: Total Internal Reflection Condition",
        speech: "Total internal reflection can only occur when light travels from an optically denser medium to a rarer medium at an angle of incidence greater than the critical angle.",
        boardLines: [
          "4. Exam Trap Alert:",
          "   ⚠ TIR NEVER occurs from air (rarer) into glass (denser).",
          "   ✓ Requires: Denser → Rarer AND ∠i > Critical Angle θc",
        ],
      },
    ],
  },
  P4: {
    title: "Spherical Lenses & Optical Power",
    formula: "1/f = 1/v - 1/u  |  P = 1/f(m)",
    numerical: "Q: Power of lens is -2.5 D. Find focal length.\nStep 1: f = 100 / P = 100 / (-2.5) = -40 cm (Concave lens).",
    trap: "Always convert focal length f from centimeters into meters before computing Power P = 1/f, and use (-1/u) not (+1/u)!",
    steps: [
      {
        heading: "Step 1: Lens Formula vs Mirror Formula",
        speech: "Pay close attention! The lens formula has a MINUS sign: 1 over f equals 1 over v minus 1 over u. And magnification for a lens is positive v over u.",
        boardLines: [
          "1. Lens Equations (Note the Minus Sign!):",
          "   • Lens Formula:   1/f = 1/v - 1/u",
          "   • Magnification:  m = h'/h = +v / u",
          "   • Convex Lens: +f  |  Concave Lens: -f",
        ],
      },
      {
        heading: "Step 2: Optical Power in Dioptres",
        speech: "Optical power P measures the degree of convergence or divergence and equals 1 over f in METERS. The SI unit is Dioptre, symbol D.",
        boardLines: [
          "2. Power of a Lens:",
          "   • P = 1 / f(in meters)  =  100 / f(in cm)",
          "   • Unit: Dioptre (D) = m⁻¹",
        ],
      },
      {
        heading: "Step 3: Solved Example (Corrective Lens)",
        speech: "If a doctor prescribes a lens of power minus 2.5 Dioptres, the focal length is 100 divided by minus 2.5, which is minus 40 centimeters, a diverging concave lens.",
        boardLines: [
          "3. Worked Example:",
          "   Given: P = -2.5 D",
          "   f = 100 / (-2.5) = -40 cm = -0.40 m (Concave Lens)",
        ],
      },
      {
        heading: "Step 4: #1 Board Exam Trap to Avoid",
        speech: "Always convert focal length from centimeters into meters before computing Dioptre power! Using centimeters directly gives an answer off by a factor of 100.",
        boardLines: [
          "4. Exam Trap Alert:",
          "   ⚠ Wrong: f = 20 cm → P = 1/20 = 0.05 D",
          "   ✓ Right: f = 0.20 m → P = 1/0.20 = +5.0 D",
        ],
      },
    ],
  },
  P5: {
    title: "Electric Current & Potential Difference",
    formula: "I = Q / t  |  V = W / Q",
    numerical: "Q: 0.5 A flows for 10 minutes. Find charge Q.\nStep 1: t = 10 × 60 = 600 s.\nStep 2: Q = I × t = 0.5 × 600 = 300 C.",
    trap: "Current is NEVER 'used up' by a resistor—the exact same current entering a resistor exits the other end!",
    steps: [
      {
        heading: "Step 1: Charge Flow & Current Conservation",
        speech: "Electric current I is the rate of flow of electric charge: I equals Q over t. Crucially, current is NOT consumed as it passes through a resistor; charge is conserved.",
        boardLines: [
          "1. Electric Current & Charge Conservation:",
          "   • I = Q / t  (1 Ampere = 1 Coulomb / 1 second)",
          "   • Current entering a resistor = Current leaving the resistor",
        ],
      },
      {
        heading: "Step 2: Potential Difference (Voltage)",
        speech: "Potential difference V between two points is the work done per unit charge moved: V equals W over Q, measured in Volts.",
        boardLines: [
          "2. Potential Difference:",
          "   • V = W / Q  (1 Volt = 1 Joule / 1 Coulomb)",
          "   • Conventional current flows from + terminal to - terminal",
        ],
      },
      {
        heading: "Step 3: Solved Example",
        speech: "If 0.5 Amperes flows for 10 minutes, convert 10 minutes to 600 seconds first. Then charge Q equals 0.5 times 600, which is 300 Coulombs.",
        boardLines: [
          "3. Worked Example:",
          "   Given: I = 0.5 A, t = 10 min = 600 s",
          "   Q = I × t = 0.5 × 600 = 300 C",
        ],
      },
      {
        heading: "Step 4: Exam Trap Alert",
        speech: "Always convert time into seconds before multiplying by Amperes, and remember electrons flow opposite to conventional current.",
        boardLines: [
          "4. Exam Trap Alert:",
          "   ⚠ Forgot minutes → seconds conversion",
          "   ✓ Always use SI units: Amperes, Seconds, Coulombs, Joules",
        ],
      },
    ],
  },
  P6: {
    title: "Ohm's Law & Resistivity",
    formula: "V = I·R  |  R = ρ·L / A",
    numerical: "Q: A 4 Ω wire is stretched to double its length. Find new R.\nStep 1: L' = 2L and A' = A/2 (volume constant).\nStep 2: R' = 2² × 4 Ω = 16 Ω.",
    trap: "Stretching a wire to n× length halves/reduces area simultaneously—so resistance scales by n², NOT n!",
    steps: [
      {
        heading: "Step 1: Ohm's Law & Ohmic Conductors",
        speech: "At constant temperature, potential difference V is directly proportional to current I: V equals I times R. Changing voltage changes current, while resistance R stays constant.",
        boardLines: [
          "1. Ohm's Law:",
          "   • V = I · R  →  R = V / I (Slope of V-I graph)",
          "   • For an ohmic resistor at constant T, R is CONSTANT",
        ],
      },
      {
        heading: "Step 2: Factors Affecting Resistance",
        speech: "Resistance R equals rho times L divided by A. Resistivity rho depends only on the material and temperature, not on wire length or thickness.",
        boardLines: [
          "2. Resistivity Formula:",
          "   • R = ρ · L / A",
          "   • ρ (rho) depends ONLY on material & temperature",
        ],
      },
      {
        heading: "Step 3: Wire Stretching Problem (n² Rule)",
        speech: "When a wire is stretched to double its length while keeping volume constant, its cross-sectional area becomes half. Therefore resistance becomes 2 squared, or 4 times larger!",
        boardLines: [
          "3. Wire Stretching Derivation (Constant Volume):",
          "   • L' = 2L  and  A' = A/2",
          "   • R' = ρ(2L) / (A/2) = 4 · (ρL/A) = 4R",
        ],
      },
      {
        heading: "Step 4: #1 Board Exam Trap",
        speech: "Do not say resistance doubles when a wire is stretched to double length; area halves simultaneously, so resistance quadruples!",
        boardLines: [
          "4. Exam Trap Alert:",
          "   ⚠ Stretched to n× length → R_new = n² · R (NOT n · R)",
        ],
      },
    ],
  },
  P7: {
    title: "Series & Parallel Resistor Circuits",
    formula: "R_s = R₁ + R₂  |  1/R_p = 1/R₁ + 1/R₂",
    numerical: "Q: 6 Ω and 3 Ω in parallel across 6 V. Find total current.\nStep 1: R_eq = (6×3)/(6+3) = 2 Ω.\nStep 2: I = V / R_eq = 6 / 2 = 3 A.",
    trap: "Never add parallel resistances directly! And remember to flip the fraction at the end of 1/R_eq = 1/R1 + 1/R2.",
    steps: [
      {
        heading: "Step 1: Series Circuits (Current Same, Voltage Splits)",
        speech: "In series, there is only one path for charge, so current I is identical through every resistor, and total resistance is R1 plus R2.",
        boardLines: [
          "1. Series Combination:",
          "   • I is SAME through all resistors",
          "   • V_total = V₁ + V₂   |   R_eq = R₁ + R₂",
        ],
      },
      {
        heading: "Step 2: Parallel Circuits (Voltage Same, Current Splits)",
        speech: "In parallel, every branch connects across the same potential difference V. Equivalent resistance is found using reciprocals: 1 over R_eq equals 1 over R1 plus 1 over R2.",
        boardLines: [
          "2. Parallel Combination:",
          "   • V is SAME across all branches",
          "   • 1 / R_eq = 1 / R₁ + 1 / R₂  →  R_eq = (R₁·R₂)/(R₁+R₂)",
        ],
      },
      {
        heading: "Step 3: Solved Example (6 Ω and 3 Ω in Parallel)",
        speech: "For 6 Ohms and 3 Ohms in parallel across 6 Volts: R_eq is 18 divided by 9, which is 2 Ohms. Total battery current is 6 Volts divided by 2 Ohms, giving 3 Amperes.",
        boardLines: [
          "3. Worked Example:",
          "   Given: R₁ = 6 Ω, R₂ = 3 Ω in parallel across V = 6 V",
          "   R_eq = (6 × 3) / (6 + 3) = 18 / 9 = 2 Ω",
          "   I_total = V / R_eq = 6 V / 2 Ω = 3 A",
        ],
      },
      {
        heading: "Step 4: #1 Board Exam Trap",
        speech: "Never add parallel resistances directly! And remember to take the reciprocal at the final step after adding 1/R1 + 1/R2.",
        boardLines: [
          "4. Exam Trap Alert:",
          "   ⚠ Wrong: 1/6 + 1/3 = 3/6 → R_eq = 0.5 Ω (forgot to flip!)",
          "   ✓ Right: 1/R_eq = 3/6 → Flip fraction → R_eq = 6/3 = 2 Ω",
        ],
      },
    ],
  },
  P8: {
    title: "Joule Heating & Electric Power",
    formula: "H = I²Rt  |  P = VI = I²R = V²/R",
    numerical: "Q: 100 W and 60 W bulbs in parallel at 220 V. Which glows brighter?\nStep 1: Voltage V is fixed across both.\nStep 2: P = V²/R → 100 W bulb has lower R, draws more current, glows brighter!",
    trap: "In parallel (fixed V), use P = V²/R (100W glows brighter). In series (fixed I), use P = I²R (60W glows brighter)!",
    steps: [
      {
        heading: "Step 1: Joule's Law of Heating",
        speech: "Heat dissipated in a resistor is H equals I squared R t. Notice heat grows with the square of current!",
        boardLines: [
          "1. Joule Heating:",
          "   • H = I² · R · t  (in Joules)",
        ],
      },
      {
        heading: "Step 2: Three Forms of Electric Power",
        speech: "Power P equals V I, which also equals I squared R for series circuits and V squared over R for parallel circuits across fixed voltage.",
        boardLines: [
          "2. Electric Power Formulas:",
          "   • P = V · I  =  I² · R  =  V² / R",
          "   • Commercial Energy: 1 kWh = 3.6 × 10⁶ Joules",
        ],
      },
      {
        heading: "Step 3: Parallel Bulbs Brightness Comparison",
        speech: "When a 100 Watt bulb and a 60 Watt bulb are connected in parallel across 220 Volts, voltage V is fixed. Using P equals V squared over R, the 100 Watt bulb has lower resistance and glows brighter!",
        boardLines: [
          "3. Bulb Brightness in Parallel (Fixed 220 V):",
          "   • R = V² / P_rated → 100 W bulb has LOWER resistance",
          "   • P_actual = V² / R → 100 W bulb glows BRIGHTER!",
        ],
      },
      {
        heading: "Step 4: #1 Board Exam Trap",
        speech: "In parallel, use P = V²/R so the 100 Watt bulb glows brighter. In series, current I is the same, so use P = I²R!",
        boardLines: [
          "4. Exam Trap Alert:",
          "   • Parallel (Fixed V) → Use P = V²/R → Higher Watt glows brighter",
          "   • Series (Fixed I)   → Use P = I²R  → Higher R (Lower Watt) glows brighter",
        ],
      },
    ],
  },
  P9: {
    title: "Magnetic Fields & Right-Hand Thumb Rule",
    formula: "B ∝ I / r  (concentric field circles)",
    numerical: "Q: Vertical wire carries current upwards. Find field direction from above.\nStep 1: Point right thumb UPWARDS.\nStep 2: Fingers curl ANTICLOCKWISE.",
    trap: "Right-Hand Thumb Rule gives magnetic FIELD direction; Fleming's Left-Hand Rule gives mechanical FORCE direction!",
    steps: [
      {
        heading: "Step 1: Properties of Magnetic Field Lines",
        speech: "Magnetic field lines emerge from North and enter South outside a magnet, forming closed continuous loops. Two field lines never intersect because a compass cannot point in two directions at once.",
        boardLines: [
          "1. Magnetic Field Line Rules:",
          "   • Outside: North → South  |  Inside: South → North",
          "   • Field lines NEVER intersect each other",
        ],
      },
      {
        heading: "Step 2: Maxwell's Right-Hand Thumb Rule",
        speech: "Hold a straight current-carrying wire in your right hand with your thumb pointing along the current. Your curled fingers show the direction of concentric magnetic field circles.",
        boardLines: [
          "2. Right-Hand Thumb Rule:",
          "   • Thumb  → Direction of Conventional Current",
          "   • Fingers → Direction of Circular Magnetic Field Lines",
        ],
      },
      {
        heading: "Step 3: Field Inside a Long Solenoid",
        speech: "Inside a long current-carrying solenoid, the magnetic field lines are parallel, equidistant straight lines, meaning the magnetic field is uniform at all points inside.",
        boardLines: [
          "3. Solenoid Magnetic Field:",
          "   • Inside solenoid: Parallel straight lines = UNIFORM field",
          "   • Strength increases with turns/length (n) and current (I)",
        ],
      },
      {
        heading: "Step 4: Exam Trap Alert",
        speech: "Do not confuse Right-Hand Thumb Rule which finds magnetic field direction with Fleming's Left-Hand Rule which finds mechanical force.",
        boardLines: [
          "4. Exam Trap Alert:",
          "   • Right-Hand Thumb Rule → Finds Magnetic FIELD direction",
          "   • Fleming's Left-Hand Rule → Finds Mechanical FORCE direction",
        ],
      },
    ],
  },
  P10: {
    title: "Force on Current & Fleming's Left-Hand Rule",
    formula: "F = B·I·L·sin(θ)",
    numerical: "Q: Wire carries current West-to-East in a downward magnetic field. Find force direction.\nStep 1: Forefinger (Field) = Down.\nStep 2: Middle finger (Current) = East.\nStep 3: Thumb (Force) = Towards North!",
    trap: "When current flows parallel (0°) or anti-parallel (180°) to magnetic field lines, magnetic force F = 0 N!",
    steps: [
      {
        heading: "Step 1: Magnetic Force on a Conductor",
        speech: "A current-carrying conductor placed in a magnetic field experiences a force F equals B I L sine theta. Force is maximum at 90 degrees and zero when parallel at 0 degrees.",
        boardLines: [
          "1. Magnetic Force Magnitude:",
          "   • F = B · I · L · sin(θ)",
          "   • θ = 90° (Perpendicular) → Maximum Force",
          "   • θ = 0° or 180° (Parallel) → ZERO Force",
        ],
      },
      {
        heading: "Step 2: Fleming's Left-Hand Rule",
        speech: "Stretch your left hand's thumb, forefinger, and middle finger mutually perpendicular: Forefinger is Field, Middle finger is Current, and Thumb gives Force or Motion.",
        boardLines: [
          "2. Fleming's Left-Hand Rule (FBI Mnemonic):",
          "   • Forefinger    → Magnetic Field (N → S)",
          "   • Middle Finger → Conventional Current (+ → -)",
          "   • Thumb         → Force / Motion on Conductor",
        ],
      },
      {
        heading: "Step 3: Electron Beam Direction Trick",
        speech: "Remember: negatively charged electrons moving left-to-right correspond to conventional current flowing right-to-left! Always reverse electron velocity to get conventional current.",
        boardLines: [
          "3. Charged Particle Rule:",
          "   • Proton / Alpha (+): Current = Same direction as velocity",
          "   • Electron (-): Current = OPPOSITE direction to velocity",
        ],
      },
      {
        heading: "Step 4: #1 Board Exam Trap",
        speech: "Always check if the question mentions an electron versus conventional current, and check whether the wire is parallel to the field which gives zero force!",
        boardLines: [
          "4. Exam Trap Alert:",
          "   ⚠ Parallel current & field → F = 0 N (No deflection!)",
        ],
      },
    ],
  },
};

  P11: {
    title: "Human Eye & Vision Defects (NCERT Ch 10)",
    formula: "P = 1 / f(m)  (Myopia: Concave -f | Hypermetropia: Convex +f)",
    numerical: "Q: Myopic far point = 80 cm. Find corrective lens power.\nStep 1: u = -∞, v = -80 cm => f = -80 cm = -0.80 m.\nStep 2: P = 1 / (-0.80) = -1.25 D (Concave lens).",
    trap: "Myopia (nearsightedness) requires a diverging CONCAVE (-) lens; Hypermetropia (farsightedness) requires a converging CONVEX (+) lens!",
    steps: [
      {
        heading: "Step 1: Power of Accommodation",
        speech: "The crystalline eye lens adjusts its focal length using ciliary muscles—relaxing to view distant objects at infinity and contracting to view near objects down to 25 centimeters.",
        boardLines: [
          "1. Power of Accommodation:",
          "   • Near Point (Least Distance of Distinct Vision) = 25 cm",
          "   • Far Point of Normal Eye = Infinity (∞)",
        ],
      },
      {
        heading: "Step 2: Myopia vs Hypermetropia Correction",
        speech: "In myopia, distant images form in front of the retina and are corrected with a concave lens. In hypermetropia, near images form behind the retina and are corrected with a convex lens.",
        boardLines: [
          "2. Refractive Vision Defects:",
          "   • Myopia (Nearsightedness): Image before retina → Concave lens (-f)",
          "   • Hypermetropia (Farsightedness): Image behind retina → Convex lens (+f)",
        ],
      },
      {
        heading: "Step 3: Solved Power Calculation",
        speech: "If a myopic student's far point is 2 meters, the corrective concave lens must have focal length minus 2 meters, giving power P equals 1 over minus 2, or minus 0.5 Dioptres.",
        boardLines: [
          "3. Worked Board Problem:",
          "   Given: Far point = 2 m → f = -2.0 m",
          "   Power P = 1 / f = 1 / (-2.0) = -0.50 D (Concave Lens)",
        ],
      },
      {
        heading: "Step 4: Exam Trap Alert",
        speech: "Always convert far-point or near-point distances from centimeters into meters before computing Dioptre power!",
        boardLines: [
          "4. Exam Trap Alert:",
          "   ⚠ Always convert cm → m before using P = 1 / f(m)",
        ],
      },
    ],
  },
  P12: {
    title: "Prism Dispersion & Atmospheric Scattering (NCERT Ch 10)",
    formula: "δ ∝ 1/λ  |  Rayleigh Scattering ∝ 1/λ⁴",
    numerical: "Q: Why does violet light bend most in a glass prism?\nAns: Violet has the shortest visible wavelength (~400 nm) and highest refractive index in glass, so it slows down and deviates most.",
    trap: "The blue color of the clear sky is caused by Rayleigh scattering of short wavelengths by air molecules—NOT reflection of the ocean!",
    steps: [
      {
        heading: "Step 1: Dispersion Through a Glass Prism",
        speech: "White light splits into seven colors (VIBGYOR) because different wavelengths travel at different speeds in glass. Violet bends the most and red bends the least.",
        boardLines: [
          "1. Dispersion of White Light (VIBGYOR):",
          "   • Red (Longest λ): Fastest in glass → Minimum deviation",
          "   • Violet (Shortest λ): Slowest in glass → Maximum deviation",
        ],
      },
      {
        heading: "Step 2: Atmospheric Refraction Phenomena",
        speech: "Continuous refraction through shifting atmospheric layers causes stars to twinkle, while extended planets do not twinkle because their variations average out.",
        boardLines: [
          "2. Atmospheric Refraction:",
          "   • Twinkling of stars & advanced sunrise / delayed sunset (~2 min each)",
          "   • Planets do not twinkle (extended light sources average out)",
        ],
      },
      {
        heading: "Step 3: Scattering of Light & Tyndall Effect",
        speech: "Very fine atmospheric particles scatter shorter blue wavelengths far more strongly than red light, making the clear sky appear blue and danger signals red.",
        boardLines: [
          "3. Scattering of Light:",
          "   • Clear sky = Blue (fine molecules scatter short λ strongly)",
          "   • Danger signals = Red (longest λ scatters least in fog/smoke)",
        ],
      },
      {
        heading: "Step 4: Exam Trap Alert",
        speech: "In vacuum or air, all colors of light travel at the exact same speed; dispersion happens only inside dispersive media like glass or water droplets.",
        boardLines: [
          "4. Exam Trap Alert:",
          "   ✓ All colors have the SAME speed in vacuum (3.0 × 10⁸ m/s)",
        ],
      },
    ],
  },
  P13: {
    title: "Domestic Circuits, Fuse & Earthing (NCERT Ch 12)",
    formula: "220 V AC (50 Hz)  |  I_safe = P / V",
    numerical: "Q: A 2.2 kW heater runs on 220 V with a 5 A fuse. Find current drawn.\nStep 1: I = P / V = 2200 W / 220 V = 10 A.\nStep 2: 10 A > 5 A rating → Fuse melts and disconnects live circuit.",
    trap: "Safety fuses and switches must ALWAYS be connected in the LIVE (red/brown) wire—never in the neutral wire!",
    steps: [
      {
        heading: "Step 1: Live, Neutral & Earth Wires",
        speech: "Indian domestic mains supply 220 Volts AC at 50 Hertz using three insulated wires: Live at 220 Volts, Neutral at 0 Volts, and the green Earth wire connected to a metal plate underground.",
        boardLines: [
          "1. Domestic Supply (220 V AC, 50 Hz):",
          "   • Live Wire (Red/Brown): 220 V potential",
          "   • Neutral Wire (Black/Blue): 0 V potential",
          "   • Earth Wire (Green): Low-resistance safety path for metallic bodies",
        ],
      },
      {
        heading: "Step 2: Why Household Appliances Are Wired in Parallel",
        speech: "All household sockets are connected in parallel so every appliance receives the full 220 Volts and can be switched on or off independently.",
        boardLines: [
          "2. Parallel Domestic Wiring:",
          "   • Every appliance gets full 220 V & independent switch control",
        ],
      },
      {
        heading: "Step 3: Overloading, Short-Circuiting & Safety Fuse",
        speech: "A fuse wire has low melting point and is placed in series with the live wire. When current exceeds the fuse rating during overloading or a short circuit, Joule heating melts the fuse.",
        boardLines: [
          "3. Fuse Rating & Protection:",
          "   • Compute I = P / V and pick a fuse slightly above I",
          "   • High resistance + low melting point alloy breaks live circuit",
        ],
      },
      {
        heading: "Step 4: Exam Trap Alert",
        speech: "Never place a fuse or switch on the neutral wire—if placed on neutral, the appliance remains live at 220 Volts even when switched off!",
        boardLines: [
          "4. Exam Trap Alert:",
          "   ⚠ Fuse & Switch MUST be on the LIVE wire, never Neutral!",
        ],
      },
    ],
  },

let activeLectureTopic = "P2";
let activeStepIdx = 0;
let isLecturePlaying = false;
let isLecturePaused = false;
let pausedAtCharOffset = 0;
let currentUtteranceBaseOffset = 0;
let lectureTimer = null;

function initLectureStudio() {
  loadLectureTopic("P2", false);
}

function loadWeakestTopicForLecture() {
  if (appState && appState.next_recommendation && appState.next_recommendation.concept_id) {
    const cid = appState.next_recommendation.concept_id;
    const sel = document.getElementById("lecture-topic-select");
    if (sel) sel.value = cid;
    loadLectureTopic(cid, true);
  } else {
    loadLectureTopic("P2", true);
  }
}

function loadLectureTopic(topicId, autoPlay = false) {
  stopLecturePlayback(true);
  activeLectureTopic = LECTURE_CURRICULUM[topicId] ? topicId : "P2";
  activeStepIdx = 0;
  pausedAtCharOffset = 0;
  isLecturePaused = false;
  updateLectureStatusBadge("ready", "Ready to Explain");
  renderLectureStep();
  if (autoPlay) {
    playOrResumeLecture();
  }
}

function renderLectureStep() {
  const curriculum = LECTURE_CURRICULUM[activeLectureTopic];
  const step = curriculum.steps[activeStepIdx];

  document.getElementById("lecture-step-badge").textContent =
    `Step ${activeStepIdx + 1} of ${curriculum.steps.length}`;
  document.getElementById("lecture-step-heading").textContent = step.heading;

  // Render live transcript with visual highlight showing spoken vs remaining text
  const transcriptEl = document.getElementById("lecture-live-transcript");
  if (pausedAtCharOffset > 0 && pausedAtCharOffset < step.speech.length) {
    const spokenPart = step.speech.slice(0, pausedAtCharOffset);
    const remainingPart = step.speech.slice(pausedAtCharOffset);
    transcriptEl.innerHTML =
      `<span class="text-slate-400">${escapeHtml(spokenPart)}</span>` +
      `<span class="bg-amber-500/25 text-amber-200 px-1 rounded underline decoration-amber-400">${escapeHtml(remainingPart)}</span>`;
  } else {
    transcriptEl.textContent = step.speech;
  }

  // Step progress pills
  const pillsEl = document.getElementById("lecture-step-pills");
  pillsEl.innerHTML = curriculum.steps
    .map(
      (s, i) => `
      <button onclick="jumpToLectureStep(${i})"
              class="px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                i === activeStepIdx
                  ? "bg-indigo-600 text-white shadow"
                  : i < activeStepIdx
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }">
        ${i + 1}. ${s.heading.replace(/^Step \d+:\s*/, "").slice(0, 18)}
      </button>`
    )
    .join("");

  // Smart Board Notes
  const boardEl = document.getElementById("lecture-smart-board");
  boardEl.innerHTML = step.boardLines
    .map((line, idx) =>
      idx === 0
        ? `<div class="text-sm font-bold text-cyan-300 mb-2">${escapeHtml(line)}</div>`
        : `<div class="text-xs sm:text-sm font-mono text-slate-100 pl-2 py-0.5">${escapeHtml(line)}</div>`
    )
    .join("");

  // Update Main Play/Resume Button & Doubt Panel Resume Button
  const playBtn = document.getElementById("btn-lecture-play");
  const resumeBtn = document.getElementById("btn-resume-lecture");
  const hasResumePoint = isLecturePaused && pausedAtCharOffset > 0;

  if (playBtn) {
    if (isLecturePlaying) {
      playBtn.textContent = "🔊 Speaking...";
    } else if (hasResumePoint) {
      playBtn.textContent = "▶ Resume From Where Left";
      playBtn.className = "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/25";
    } else {
      playBtn.textContent = "▶ Play Explanation";
      playBtn.className = "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/25";
    }
  }

  if (resumeBtn) {
    resumeBtn.classList.toggle("hidden", !isLecturePaused);
    resumeBtn.textContent = hasResumePoint
      ? `▶ Resume From Paused Word (Step ${activeStepIdx + 1})`
      : `▶ Resume Lecture (Step ${activeStepIdx + 1})`;
  }
}

function updateLectureStatusBadge(state, text) {
  const badge = document.getElementById("lecture-status-badge");
  const avatarBox = document.getElementById("aria-lecturer-card");
  if (!badge) return;

  badge.textContent = text;
  badge.className = "text-xs font-semibold px-3 py-1 rounded-full ";
  if (state === "speaking") {
    badge.className += "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
    if (avatarBox) avatarBox.classList.add("speaking");
  } else if (state === "paused-doubt") {
    badge.className += "bg-amber-500/20 text-amber-300 border border-amber-500/40";
    if (avatarBox) avatarBox.classList.remove("speaking");
  } else {
    badge.className += "bg-slate-800 text-slate-300 border border-slate-700";
    if (avatarBox) avatarBox.classList.remove("speaking");
  }
}

function playOrResumeLecture() {
  const curriculum = LECTURE_CURRICULUM[activeLectureTopic];
  const step = curriculum.steps[activeStepIdx];

  // Snap resume offset cleanly to the start of the word where we paused
  let startOffset = pausedAtCharOffset;
  if (startOffset > 0 && startOffset < step.speech.length) {
    while (startOffset > 0 && step.speech[startOffset - 1] !== " ") {
      startOffset--;
    }
  } else {
    startOffset = 0;
  }

  const textToSpeak = step.speech.slice(startOffset);
  currentUtteranceBaseOffset = startOffset;
  isLecturePlaying = true;
  isLecturePaused = false;
  renderLectureStep();
  updateLectureStatusBadge(
    "speaking",
    startOffset > 0
      ? `🔊 Resuming Step ${activeStepIdx + 1} From Paused Point...`
      : `🔊 Prof. Aria Explaining Step ${activeStepIdx + 1}...`
  );

  const rate = Number(document.getElementById("lecture-speed-select")?.value || 1.0);

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(textToSpeak);
    utter.rate = rate;
    utter.pitch = 1.04;

    // Track exact spoken character offset on every word boundary!
    utter.onboundary = (event) => {
      if (isLecturePlaying && typeof event.charIndex === "number") {
        pausedAtCharOffset = currentUtteranceBaseOffset + event.charIndex;
      }
    };

    utter.onend = () => {
      if (!isLecturePlaying || isLecturePaused) return;
      pausedAtCharOffset = 0;
      if (activeStepIdx < curriculum.steps.length - 1) {
        activeStepIdx++;
        renderLectureStep();
        playOrResumeLecture();
      } else {
        isLecturePlaying = false;
        isLecturePaused = false;
        renderLectureStep();
        updateLectureStatusBadge("ready", "✓ Lecture Complete — Ask Any Doubt!");
      }
    };

    utter.onerror = () => {
      if (isLecturePlaying && !isLecturePaused) {
        scheduleAutoAdvanceFallback(textToSpeak, rate);
      }
    };

    window.speechSynthesis.speak(utter);
  } else {
    scheduleAutoAdvanceFallback(textToSpeak, rate);
  }
}

function scheduleAutoAdvanceFallback(text, rate) {
  clearTimeout(lectureTimer);
  const startTime = Date.now();
  const totalMs = Math.max(3000, (text.length * 55) / rate);

  lectureTimer = setInterval(() => {
    if (!isLecturePlaying || isLecturePaused) {
      clearInterval(lectureTimer);
      return;
    }
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / totalMs);
    pausedAtCharOffset = currentUtteranceBaseOffset + Math.floor(text.length * progress);

    if (progress >= 1) {
      clearInterval(lectureTimer);
      pausedAtCharOffset = 0;
      const curriculum = LECTURE_CURRICULUM[activeLectureTopic];
      if (activeStepIdx < curriculum.steps.length - 1) {
        activeStepIdx++;
        renderLectureStep();
        playOrResumeLecture();
      } else {
        isLecturePlaying = false;
        renderLectureStep();
        updateLectureStatusBadge("ready", "✓ Lecture Complete");
      }
    }
  }, 250);
}

// Pauses playback while preserving exact pausedAtCharOffset so Resume continues from where it left off!
function stopLecturePlayback(resetPosition = false) {
  isLecturePlaying = false;
  clearInterval(lectureTimer);
  clearTimeout(lectureTimer);

  if (resetPosition) {
    pausedAtCharOffset = 0;
    isLecturePaused = false;
  } else {
    isLecturePaused = true;
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  renderLectureStep();
  updateLectureStatusBadge(
    "paused-doubt",
    pausedAtCharOffset > 0
      ? `⏸ Paused at Step ${activeStepIdx + 1} (Ready to Resume)`
      : "⏸ Paused"
  );
}

function jumpToLectureStep(idx) {
  const wasPlaying = isLecturePlaying;
  stopLecturePlayback(true);
  activeStepIdx = idx;
  renderLectureStep();
  if (wasPlaying) playOrResumeLecture();
}

function prevLectureStep() {
  if (activeStepIdx > 0) jumpToLectureStep(activeStepIdx - 1);
}

function nextLectureStep() {
  const curriculum = LECTURE_CURRICULUM[activeLectureTopic];
  if (activeStepIdx < curriculum.steps.length - 1) jumpToLectureStep(activeStepIdx + 1);
}

// Interrupts lecture at exact word position when student focuses on doubt box or clicks a doubt button
function interruptLectureForDoubt() {
  if (isLecturePlaying) {
    stopLecturePlayback(false);
    updateLectureStatusBadge("paused-doubt", `✋ Paused at Step ${activeStepIdx + 1} for Your Doubt`);
  }
}

function generateLocalDoubtReply(topicId, step, doubtText) {
  const curr = LECTURE_CURRICULUM[topicId] || LECTURE_CURRICULUM.P2;
  const dLow = doubtText.toLowerCase();

  if (dLow.includes("why") || dLow.includes("work") || dLow.includes("intuition")) {
    return {
      reply: `Great question on ${curr.title}! In ${step.heading}, the governing relationship is ${curr.formula}. ${step.speech} Always remember: ${curr.trap}`,
      boardNote: `${topicId} Formula: ${curr.formula}`,
    };
  }
  if (dLow.includes("numerical") || dLow.includes("example") || dLow.includes("solve")) {
    return {
      reply: `Here is a worked board-exam numerical for ${curr.title}:\n${curr.numerical}`,
      boardNote: curr.numerical.split("\n")[0],
    };
  }
  if (dLow.includes("trap") || dLow.includes("mistake") || dLow.includes("exam")) {
    return {
      reply: `#1 Board Exam Trap in ${curr.title}: ${curr.trap}`,
      boardNote: `⚠ Trap: ${curr.trap}`,
    };
  }
  if (dLow.includes("again") || dLow.includes("repeat") || dLow.includes("simple")) {
    return {
      reply: `Let me re-explain ${step.heading} simply: ${step.speech} Key formula: ${curr.formula}.`,
      boardNote: `Recap: ${curr.formula}`,
    };
  }
  return {
    reply: `Regarding "${doubtText}" in ${curr.title} (${step.heading}): Apply ${curr.formula}. ${step.speech} Watch out: ${curr.trap}`,
    boardNote: `${topicId} Key Rule: ${curr.formula}`,
  };
}

async function askProfAriaDoubt(presetDoubt = null) {
  const input = document.getElementById("lecture-doubt-input");
  const doubtText = (presetDoubt !== null ? presetDoubt : input.value).trim();
  if (!doubtText) return;
  if (presetDoubt === null) input.value = "";

  // Pause lecture at current word position so user can resume right after!
  if (isLecturePlaying) {
    stopLecturePlayback(false);
  }
  updateLectureStatusBadge("paused-doubt", "🤔 Prof. Aria Answering Your Doubt...");

  const curriculum = LECTURE_CURRICULUM[activeLectureTopic];
  const currentStep = curriculum.steps[activeStepIdx];

  appendLectureDoubtBubble("You (Live Doubt)", doubtText, false);

  let replyText = "";
  let boardNote = "";

  try {
    const res = await fetch("/api/lecture-doubt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: typeof currentStudentId !== "undefined" ? currentStudentId : "guest",
        topic_id: activeLectureTopic,
        step_heading: currentStep.heading,
        step_speech: currentStep.speech,
        doubt: doubtText,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      replyText = data.reply || "";
      boardNote = data.board_note || "";
    }
  } catch (_) {
    // Network/server fallback handled below
  }

  // Fallback to local context-aware physics engine if backend route returned empty/404
  if (!replyText) {
    const local = generateLocalDoubtReply(activeLectureTopic, currentStep, doubtText);
    replyText = local.reply;
    boardNote = local.boardNote;
  }

  appendLectureDoubtBubble("Prof. Aria", replyText, true);

  const boardEl = document.getElementById("lecture-smart-board");
  if (boardEl && boardNote) {
    const existingNote = document.getElementById("lecture-doubt-board-note");
    if (existingNote) existingNote.remove();
    const noteDiv = document.createElement("div");
    noteDiv.id = "lecture-doubt-board-note";
    noteDiv.className = "mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-xs font-mono text-amber-200";
    noteDiv.textContent = `💡 Doubt Clarification: ${boardNote}`;
    boardEl.appendChild(noteDiv);
  }

  // Speak Prof. Aria's answer aloud without overwriting pausedAtCharOffset!
  updateLectureStatusBadge("speaking", "🔊 Prof. Aria Answering Your Doubt...");
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(replyText);
    utter.rate = 1.02;
    utter.onend = () => {
      updateLectureStatusBadge("paused-doubt", "✋ Answered — Click 'Resume From Where Left' to Continue");
    };
    utter.onerror = () => {
      updateLectureStatusBadge("paused-doubt", "✋ Answered — Click 'Resume From Where Left' to Continue");
    };
    window.speechSynthesis.speak(utter);
  } else {
    updateLectureStatusBadge("paused-doubt", "✋ Answered — Click 'Resume From Where Left' to Continue");
  }
}

function appendLectureDoubtBubble(sender, text, isAria) {
  const thread = document.getElementById("lecture-doubt-thread");
  if (!thread) return;
  const card = document.createElement("div");
  card.className = isAria
    ? "p-3 rounded-xl bg-indigo-950/75 border border-indigo-500/40 text-indigo-100 text-xs space-y-1"
    : "p-3 rounded-xl bg-slate-800/90 text-white text-xs ml-6 space-y-1";
  card.innerHTML = `
    <div class="font-bold text-[11px] ${isAria ? "text-cyan-300" : "text-emerald-300"}">${escapeHtml(sender)}</div>
    <div class="leading-relaxed whitespace-pre-line">${escapeHtml(text)}</div>
  `;
  thread.appendChild(card);
  thread.scrollTop = thread.scrollHeight;
}
