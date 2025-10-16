//------------------------------------------------
// Change these as desired:
const excludePartialSupport = 1; // exclude edos with non-coprime period & gen, e.g. unsplit 15edo
const maxEDO = 1200; // biggest edo the edo-slider can handle (one must type in edos > 72)
const maxEDOfraction = 50; // max fraction when edo-slider > 0, arbitrary, too big slows the app
//------------------------------------------------

/**
 * Ex: round(1.5) = 2, round(-1.5) = -1.
 * Rounds towards infinity
 */
function round(x) {
  return Math.floor(x + 0.5);
}

/**
 * Ex: roundDown(1.5) = 1, roundDown(-1.5) = -2.
 * Rounds towards negative infinity
 */
function roundDown(x) {
  return -Math.floor(-x + 0.5);
}

/**
 * Ex: roundOut(1.5) = 2, roundOut(-1.5) = -2.
 * Rounds outwards away from zero
 */
function roundOut(x) {
  return Math.sign(x) * Math.floor(Math.abs(x) + 0.5);
}

/**
 * Ex: ceiling(1.5) = 2, ceiling(-1.5) = -1
 * Ex: floor(1.5) = 1, floor(-1.5) = -2
 */
function ceiling(x) {
  return -Math.floor(-x);
}

/**
 * Ex: -3 modulo 10 is 7, but -3 % 10 = 3
 * Ex: 13.3 modulo 10 = 3.3, but 13.3 % 10 = 3
 * Ex: x mod -y = -(-x mod y)
 */
function mod(num, base) {
  return num - base * Math.floor(num / base);
}

/**
 * Returns the smaller of i or its inverse
 * Ex: mod2(7, 10) = 3 not 7
 */
function mod2(i, j) {
  i = mod(i, j);
  if (i > j / 2) {
    i = j - i;
  }
  return i;
}

/**
 * Returns the greatest common divisor of a & b.
 * Ensures the GCD is always positive.
 * Ensures GCD (a, 0) = a and GCD (0, b) = b
 */
function GCD(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b === 0) b = a;

  while (a > 0) {
    // If a is smaller, swap a and b
    if (a < b) {
      let c = a;
      a = b;
      b = c;
    }
    // Don't use a %= b, screws up for large a and b
    a = mod(a, b);
  }
  // GCD (0, 0) = 0
  return Math.max(a, b);
}

//maxFraction -> parameter for makeList
const w12cents = (1200 * Math.log(3)) / Math.log(2); // 1902 cents
//const twoTo52 = 2 ^ 52;                       // for writeNum

// Keyspans is used to convert a stepspan and a 12-edo keyspan to a quality
// quality = keyspan - Keyspans [stepspan], see function writeQuality
// for 12-edo, Keyspans = [0, 1.5, 3.5, 5, 7, 8.5, 10.5, 12] = P1 n2 n3 P4 P5 n6 n7 P8
let Keyspans = [
  0, // average 1sn = perfect 1sn = 0 semitones
  1.5, // average 2nd = neutral 2nd = 1.5 semitones
  3.5, // average 3rd = neutral 3rd
  5, // average 4th = perfect 4th
  7, // average 5th = perfect 5th
  8.5, // average 6th = neutral 6th
  10.5, // average 7th = neutral 7th
  12 // average 8ve = perfect 8ve
];

// Twelfth is a list of the best 12th = 3/1 for each edo, Twelfth[5] = 8, Twelfth[7] = 11, Twelfth[12] = 19
let Twelfth = new Array(maxEDO + 1);
for (let i = 0; i < Twelfth.length; i++) {
  Twelfth[i] = round((i * w12cents) / 1200);
}
Twelfth[1] = 20; // EDO #1 = 13b
Twelfth[2] = 28; // EDO #2 = 18b

/**
 * (a, b) = a 3-limit monzo
 */
function edosteps(a, b, edo) {
  // If no edo, use 12edo
  if (edo === 0) {
    return 12 * a + 19 * b;
  }
  // Return monzo's keyspan in the edo
  return edo * a + Twelfth[edo] * b;
}

/**
 * (a, b) = a 3-limit monzo
 */
function edosteps2(a, b, edo2) {
  // Return monzo's keyspan in the edo
  // If edo2 = 0, edosteps2 is always 0
  return edo2 * a + Twelfth[edo2] * b;
}

let Bezout = new Array(2);

/**
 * Uses the extended Euclidean algorithm, returns the least Bezout coefficient pair,
 * which is equal to the least Stern-Brocot ancestor, reversed.
 * For more information google "Bezout's identity" or "Bezout's lemma".
 */
function findBezout(a, b) {
  let i = Math.abs(b),
    oldI = Math.abs(a);
  let j = 0,
    oldJ = 1;
  let k = 1,
    oldK = 0;
  let m, n;

  while (i !== 0) {
    n = Math.floor(oldI / i);
    m = i;
    i = oldI - n * i;
    oldI = m;
    m = j;
    j = oldJ - n * j;
    oldJ = m;
    m = k;
    k = oldK - n * k;
    oldK = m;
  }

  // Ensure we get the smaller pair -- not needed?
  // It seems we always get the smaller pair anyway
  if (Math.abs(oldJ) > Math.abs(b / 2)) {
    oldJ += Math.sign(a) * b;
    oldK -= Math.sign(b) * a;
  }

  // Favor the lower primes over the higher ones
  if (Math.abs(a) === Math.abs(b)) {
    oldJ = 1;
    oldK = 0;
  }

  // a,0 returns 1,0 and 0,b returns 0,1
  // 0,0 -> 0,0  a,1 -> 0,1  1,b -> 1,0  a,a -> 1,0
  Bezout[0] = Math.abs(oldJ);
  Bezout[1] = Math.abs(oldK);
  return oldI;
}

// Pergens is a list of period-generator names, e.g. (P8/2, cP5/3) or (P8, y3)
// the period is a fraction of an octave, the generator is a fraction of a "multi-gen" M
// the multi-gen is usually 3-limit, it uses only the 2-limit rung and the first soft-linked rung
// assuming prime 3 is soft-linked, if 8ve = xP and 5th = yP + zG, then P = 8ve/x, G = {i*z-y, x} / x*z
// {i*z-y, x} is an 8ve-reduced monzo on 2.3/2, the usual monzo on 2.3 is {i*z-y-x, x}
// x is always positive, z is always nonzero, but y can be anything
// i ranges from -x to x, creates alternate generators by adding/subtracting periods, 5th = (y-iz)P + zG
// as a 2.3 monzo, G = (iz-y-x, x) / x*z
// the best multi-gen is one that minimizes the fraction, use minimizing the cents as a tiebreaker
// except that the 5th is preferred over the 4th (but not the half-5th over the half-4th, or 7/3 over 9/7)
//
// format: 0-3  periodFraction, genFraction, multi-gen-2-exp, multi-gen-3-exp (the 3-limit monzo)
//         4-5  multi-gen:     keyspan and stepspan
//        6-10  period:        keyspan and stepspan,    enharmonic #1: keyspan, stepspan and count
//       11-15  generator:     keyspan and stepspan,    enharmonic #2: keyspan, stepspan and count
//       16-20  alt generator: keyspan and stepspan,    enharmonic #3: keyspan, stepspan and count
//       21-23  alt multi-gen: keyspan, stepspan and fraction
//       24-25  alt period:    keyspan and stepspan (fraction = periodFraction, enharmonic = alt-E')
//          26  alt-period's count x', mP' + x'E" = 8ve, if the pergen is a true double, x' = 0
//       27-29  original gen:  keyspan and stepspan and count x"
//
let Pergens = [];
const PergensRowLength = 30; // length of each row, the array is endless

// TO FIND THE PERIOD, THE GENERATOR, AND THE ENHARMONIC INTERVALS:
// re-express all 3-limit monzos (a,b) as a 12-tone keyspan and a heptatonic stepspan: [k,s]
//    k = 12a + 19b   <-->   a = -11k + 19s
//    s =  7a + 11b   <-->   b =   7k - 12s
// this works because the matrix is unimodular, because 12-edo is on the 4\7 kite in the scale tree
// [k,s] = k * A1 + s * d2, because A1 increases keyspan but not stepspan, and d2 stepspan but not keyspan
//
// mP + xE = 8ve = [12,7], 0 < |x| <= m/2, x is the enharmonic count = # of enharmonics per 8ve
// the period P = [Pk,Ps], where Pk = roundDown (12/m) and Ps = roundDown (7/m)
// roundDown (1.5) = 1, round down so that P can also be P+E, not P-E (e.g. P8/2, P+E = vA4 + ^^d2 = ^d5)
// because it's easier mentally to add than subtract
// let [a,b] = 8ve - mP = xE, then x = sign (b) * GCD (a, b), and E = [a/x, b/x], Es must be >= 0
//
// nG + yE' = M = [Mk,Ms], 0 < |y| <= n/2, y = the 2nd count = # of enharmonics per multi-gen
// the gen G = [Gk,Gs], where Gk = roundDown (Mk/n) and Gs = roundDown (Ms/n), G' = G + E'
// let [a,b] = M - nG = yE', then y = sign (b) * GCD (a, b), and E' = [a/y, b/y]
//
// this solution will have minimal keyspans and stepspans for xE & yE', but not always for E & E'
// for other solutions, explore other keyspans/stepspans for the generator: Gk + i, Gs + j
//
// To unreduce, change (P,G) to (P,P-G) and simplify, to get the alt-multi-gen M' and the alt-gen G'
// ALT-MULTIGEN: (P8/m, M/n) --> (P8/m, P8/m - M/n) = (P8/m, (n*P8 - m*M)/mn) = (P8/m, M'/n')
// if M = (a,b), the 3-exp of M' is m*b/GCD(m,n)
// n' = LCM (m,n), M' = n'G' + zE", use the new enharmonic with the old multigen: M = nG" + z'E"
// deduce z' from M and n: (M - z'E") mod n = 0, minimize |z'|, and G" = (M - z'E") / n
// usually, n' is bigger than n, M' is more complex than M, but G' is simpler than G"
//
// search for the best enharmonic E" = the least stepspan Es"
// M' = n'G' + zE", G' = [k+i,s+j], zE" = [Mk'-n'k-n'i,Ms'-n's-n'j], |z| = GCD (Mk'-n'k-n'i,Ms'-n's-n'j)
// examples:
// for (P8/3, P5/5), M'/n' = cccm3/15 = [39,23]/15, Gk' = [3+i,2+j], zE = [-15i-6,-15j-7],
// the best i,j is 1,0, zE = [-21,-7] = -7[3,1], E = A2. if i,j = -2,-1, zE = [24,8], E = A2
// (P8/2, P4/3) --> G' = cM9/6 = [26,15]/6, G' = [4+i,2+j], zE" = [2-6i,3-6j] = [{-10,-4,2,8}, {-9,-3,3,9}]
// zEs" is always threeven, zEk" never is, so the best Es" is 3, either d4 = [4,3] or ddd4 = [2,3]
// E = v6ddd4  --> P = ^3A3, G" = ^^A1 = v4dd4, C - E#^3=Abbv3 - C, C - C#^^ - Fbvv - F, ^1 = 33� - 3.67c
// or E = v6d4 --> P = ^3M3, G" = vvm3 = -v4m2, C - E^^^=Abvvv - C, C - Ebvv - D^^ - F,  ^1 = 67� - 1.33c
//
// to construct a comma: M' = n'*G', where G' is any 2.3.5 or 2.3.7 interval of appropriate cents
// if GCD (m,n) = 1, then n' = m*n, and M' = m*n*G'
// M' = n*P8 - m*M, thus n*P8 = M' + m*M = m*n*G' + m*M = m*I, and I = (n/m)*P8
// find a bezout pair a,b such that am + bn = 1, then m(a*P8 + b*I) = amP8 + bmI = (1-bn)P8 + bnP8 = P8
// P8 is split into m parts, and the M'=n'*G' comma creates both splits, thus the pergen is single-comma
//
// the half-step glitch (e.g. P4/6 or P5/8) is better notated with double-pair notation
// same with when the enharmonic must be a 3rd, e.g. P11/4
// however this program doesn't do that, you have to solve these pergens manually
//
// a good test case for optimizeEnharmonic function is (P8/5, P5/8) --> c^4m9/40 = [61,36]/40
// 1st  solution is E" = [19,4] = v40(A^12)5, P = v16[10,3], G = v15[8,2], x = -2, y = -3
// best solution is E" = [-1,4] = ^40(d^8)5, P = ^16ddd4 = ^16[2,3], G = v5A1 = [1,0]
// x = -2, y = 1, ^1 = 2.5� + 1.375c, crazy chains, double-pair notation is better

/**
 * Used for all 3 enharmonics.
 * Also works with keyspan and stepspan exchanged, but doesn't find any 2nds, and backfires sometimes.
 * let x = GCD (Es,n), therefore x = GCD (Ms,n), because Ms = n * Gs + Es
 * in any valid pergen, Mk and Ms are coprime, thus if x > 1, Mk mod x > 0 and GCD (Mk, x) = 1.
 * Es mod x = 0, but since Ek = Mk  - n * Gk and n mod x = 0, it follows that Ek mod x > 0
 * can't prove it, but it seems GCD (Es, Ek + i * n) > 1 for some i only if x = 1
 */
function optimizeEnharmonic(Ek, Es, n) {
  // n = the multigen's splitting fraction
  // default Ek is the smallest xEk
  // k = metric for best keyspan, 1 0 2 -1 3 -2...
  // i = 1's to subtract from Gk, n's to add to Ek
  // try different values for Ek
  // look around for a bigger GCD = a smaller Es
  // best to worst: m2, d2, M2, dd2, A2, ddd2, AA2...
  // best 3rds: dd3, dddd3, m3, d6 3, A3, d8 3, AAA3
  // found a better enharmonic? remember it
  // a better Ek will reduce Es more...
  // seems to be one iff Ms and n are coprime
  // return the # of keys to subtract from G
  let bestI = 0;
  let bestGCD = GCD(Ek, Es);
  let s = Math.sign(Es);
  let bestK = Math.abs(s * Ek - 0.7) / bestGCD;
  let i = roundOut(Es / 2);

  for (let loop = 1; loop <= Math.abs(Es) + 1; loop++) {
    let j = GCD(Ek + i * n, Es);
    let k = Math.abs(s * (Ek + i * n) - 0.7) / j;
    if (j > bestGCD || (j === bestGCD && k < bestK)) {
      bestI = i;
      bestK = k;
      bestGCD = j;
    }
    i -= s;
  }
  return bestI;
}

/**
 * Analyze the current pergen
 */
function findPeriodsAndGens() {
  // A = alias for Pergens [m]
  //Since JS can't point memory to an array segment, the baseIndex is used instead
  let A = Pergens;
  let baseIndex = numPergens * PergensRowLength;

  // PERIOD AND E, m = octave's fraction
  let m = A[baseIndex + 0];

  // [k,s] = period = fractions of 8ve
  let k = roundDown(12 / m);
  let s = roundDown(7 / m);

  // [Ek,Es] = E = enharmonic #1, E = P1 if m = 1
  let Ek = 12 - m * k;
  let Es = 7 - m * s;

  // look for a better Ek that may reduce Es
  let c = optimizeEnharmonic(Ek, Es, m);
  // update keyspans k and Ek
  k -= c;
  Ek += c * m;

  // no better Ek? look for better Es that reduces Ek
  if (c === 0) {
    // bad example: P8/28, E = (d16)8 not P8
    c = optimizeEnharmonic(Es, Ek, m);

    // x = the new Es, simplified
    let x = Math.abs(Es + c * m);
    x /= GCD(Ek, x);

    // don't let Es increase, don't bother w large Es
    if (x <= Math.abs(Es) / GCD(Ek, Es) && x < 7) {
      // update stepspans s and Es
      s -= c;
      Es += c * m;
    }
  }
  // c = the count, c = 0 if m = 1, c < 0 if m*P > 8ve
  c = Es !== 0 ? Math.sign(Es) : Math.sign(Ek);
  // simplify it, invert to avoid neg 2nd or dim 1sn
  c *= GCD(Ek, Es);
  if (c !== 0) {
    Ek /= c;
    Es /= c;
  }

  // keyspan and stepspan of P
  A[baseIndex + 6] = k;
  A[baseIndex + 7] = s;
  // keyspan, stepspan and count of E
  A[baseIndex + 8] = Ek;
  A[baseIndex + 9] = Es;
  A[baseIndex + 10] = c;

  // MULTI-GEN, GEN, AND ENHARMONIC2 (M, G and E')
  // [Mk,Ms] = M, [k,s] = G, n = multigen's fraction
  let n = A[baseIndex + 1];
  let Mk = A[baseIndex + 4];
  let Ms = A[baseIndex + 5];
  k = roundDown(Mk / n);
  s = roundDown(Ms / n);
  // [Ek,Es] = E' = enharmonic #2, E' = P1 if n = 1
  Ek = Mk - n * k;
  Es = Ms - n * s;
  // look for a better Ek that may reduce Es
  c = optimizeEnharmonic(Ek, Es, n);
  // update keyspans k and Ek
  k -= c;
  Ek += c * n;

  // no better Ek? look for better Es that reduces Ek
  if (c === 0) {
    // good examples: P5/10, P11/12, bad example: c3P5/10
    c = optimizeEnharmonic(Es, Ek, n);
    // x = the new Es, simplified
    let x = Math.abs(Es + c * n);
    x /= GCD(Ek, x);
    // don't let Es increase, don't bother if unchanged
    if (x < Math.abs(Es) / GCD(Ek, Es)) {
      // update stepspans s and Es
      s -= c;
      Es += c * n;
    }
  }

  // c = the count, c = 0 if n = 1, c < 0 if n*G > M
  c = Es !== 0 ? Math.sign(Es) : Math.sign(Ek);
  // simplify it, invert to avoid neg 2nd or dim 1sn
  c *= GCD(Ek, Es);
  if (c !== 0) {
    Ek /= c;
    Es /= c;
  }
  // keyspan and stepspan of G
  A[baseIndex + 11] = k;
  A[baseIndex + 12] = s;
  // keyspan, stepspan and count of E'
  A[baseIndex + 13] = Ek;
  A[baseIndex + 14] = Es;
  A[baseIndex + 15] = c;

  // x,y = possibly fractional keyspan of period/gen
  x = 12 / m;
  y = A[baseIndex + 4] / n;

  // numP = approximate periods per generator
  let numP = roundDown(y / x);

  // don't let G' = G, make G' = P - G
  if (numP == 0) numP = 1;

  // avoid multigens that simplify, e.g. #16, 27, 62
  while (GCD(numP, m) > 1) {
    numP -= 1;
  }

  // UNREDUCED MULTI-GEN = [Mk,Ms] = M'
  // M' = numP * n * P8 - sign (numP) * m * M
  // G' = M'/mn = numP * P - sign (numP) * G
  Mk = 12 * numP * n - Math.sign(numP) * m * A[baseIndex + 4];
  Ms = 7 * numP * n - Math.sign(numP) * m * A[baseIndex + 5];

  // simplify M', invert to avoid neg 2nd or dim 1sn
  c *= GCD(Mk, Ms);
  if (c !== 0) {
    Mk /= c;
    Ms /= c;
  }

  // if inverting M', invert numP too
  numP *= Math.sign(c);

  // lcm = least common multiple = fraction for M'
  lcm = (m * n) / GCD(m, n);

  // keyspan, stepspan and fraction of M'
  A[baseIndex + 21] = Mk;
  A[baseIndex + 22] = Ms;
  A[baseIndex + 23] = lcm;

  // single-split pergen? no alt-gen
  if (m == 1 || n == 1) {
    A[baseIndex + 26] = 0;
  } else {
    // UNREDUCED ALT-GEN = [k,s] = G' = M' / lcm
    k = roundDown(Mk / lcm);
    s = roundDown(Ms / lcm);

    // UNREDUCED ENHARMONIC = [Ek,Es] = E"
    Ek = Mk - lcm * k;
    Es = Ms - lcm * s;

    // look for a better Ek that may reduce Es
    c = optimizeEnharmonic(Ek, Es, lcm);

    // update keyspans k and Ek
    k -= c;
    Ek += c * lcm;

    // no better Ek? look for a better Es that reduces Ek
    if (c == 0) {
      // good examples: (P8/3, P11/5), (P8/5, P5/4)
      c = optimizeEnharmonic(Es, Ek, lcm);

      // x = the new Es, simplified, must be < an 8ve
      x = Math.abs(Es + c * lcm);
      x /= GCD(Ek, x);

      // bad examples: (P8/7, P4/2), (P8/7, P5/3)
      if (x <= Math.abs(Es) / GCD(Ek, Es) && x < 7) {
        // update stepspans s and Es
        s -= c;
        Es += c * lcm;
      }
    }

    // c = the count, c < 0 if n*G' > M'
    if (Es != 0) {
      c = Math.sign(Es);
    } else {
      c = Math.sign(Ek);
    }

    // simplify it, invert to avoid neg 2nd or dim 1sn
    c *= GCD(Ek, Es);
    Ek /= c;
    Es /= c;

    // keyspan and stepspan of alt-gen G'
    A[baseIndex + 16] = k;
    A[baseIndex + 17] = s;

    // keyspan, stepspan and count of enharm3 E"
    A[baseIndex + 18] = Ek;
    A[baseIndex + 19] = Es;
    A[baseIndex + 20] = c;

    // UNREDUCED PERIOD = P', (x,y) = monzo of E"
    x = -11 * Ek + 19 * Es;
    y = 7 * Ek - 12 * Es;

    // c = the octave-count of E", mP' + cE" = P8
    c = 1;

    // if the search fails, c = m, which becomes 0
    while (mod(c * x, m) != 1 && c < m) {
      c += 1;
    }

    // favor small negative values over large pos ones
    if (c > m / 2) {
      c -= m;
    }

    // [k,s] = the unreduced period P'
    k = (12 - c * Ek) / m;
    s = (7 - c * Es) / m;

    // avoid periods with negative degrees
    while (s < 0) {
      k += Ek;
      s += Es;
    }

    // check that the 3-exponent is divisible by m...
    if (mod(c * y, m) != 0) {
      c = 0;
    }

    // if it's a true double, c = 0, won't be displayed
    A[baseIndex + 24] = k;
    A[baseIndex + 25] = s;
    A[baseIndex + 26] = c;

    // UNREDUCED GEN, adds up to the original multi-gen
    k = Math.abs(numP) * k - Math.sign(numP) * A[baseIndex + 16];

    // G = |numP| * P - sign(numP) * G'
    s = Math.abs(numP) * s - Math.sign(numP) * A[baseIndex + 17];

    // avoid negative degrees
    while (s < 0) {
      k += Ek;
      s += Es;
    }

    // M = nG + xE, so x = (Ms - n*Gs) / Es
    c = (A[baseIndex + 5] - n * s) / Es;

    // if stepspan fails, try the keyspan
    if (c == 0) {
      c = (A[baseIndex + 4] - n * k) / Ek;
    }

    // minimize |c|,
    if (c > n / 2) {
      k += Ek;
      s += Es;
      c -= n;
    }

    // but avoid negative degrees
    if (c < -n / 2 && s >= Es) {
      k -= Ek;
      s -= Es;
      c += n;
    }

    // keyspan and stepspan of G
    A[baseIndex + 27] = k;
    A[baseIndex + 28] = s;
    A[baseIndex + 29] = c;
  }
}

/**
 * Currently only works for rank-2
 * the alt. gen = the gen plus i periods
 */
function findPergen(x, y, z, maxFraction, edo, edo2) {
  let c, i, j, k, m, bestI, bestFraction, bestCents;

  // if i = 0, the generator = (-y, x) / xz
  bestI = 0;
  j = GCD(y, x);

  // (-y,x)/j is the multigen that gets split
  bestFraction = Math.abs(x * z) / j;

  // the cents of the untempered multigen
  bestCents = (-y * 1200 + x * w12cents) / j;

  // loop thru each alt. gen = (i*z-y, x) / xz
  i = -x;
  for (let loopCount = 1; loopCount <= 2 * x + 1; loopCount++) {
    // j = the simplifying factor
    j = GCD(i * z - y, x);

    // k = the alt. fraction, be sure to divide last
    k = Math.abs(x * z) / j;

    // is the splitting fraction the same or smaller?
    if (k <= bestFraction) {
      // c = the alt. multigen's cents
      c = ((i * z - y) / j) * 1200 + (x / j) * w12cents;

      // is this an improvement?
      if (k < bestFraction || Math.abs(c) < Math.abs(bestCents)) {
        // remember it
        bestI = i;
        bestFraction = k;
        bestCents = c;
      }
    }

    // for each i, the new mapping = [x, y-iz, z]
    i += 1;
  }

  // j = the simplifying factor
  y -= bestI * z;
  j = GCD(y, x);

  // m = index into Pergens
  m = PergensRowLength * numPergens;

  // 8ve's splitting fraction
  Pergens[m] = x;

  // multi-gen's splitting fraction
  Pergens[m + 1] = bestFraction;

  // 2-exp of multi-gen's unreduced monzo
  Pergens[m + 2] = (-Math.sign(bestCents) * y) / j;

  // 3-exp of multi-gen's unreduced monzo
  Pergens[m + 3] = (Math.sign(bestCents) * x) / j;

  // is the multi-gen the 4th?
  // and not split? invert it to a P5
  if (Pergens[m + 2] == 2 && Pergens[m + 3] == -1 && bestFraction == 1) {
    Pergens[m + 2] = -1;
    Pergens[m + 3] = 1;
  }

  // multi-gen's 12-edo keyspan
  Pergens[m + 4] = 12 * Pergens[m + 2] + 19 * Pergens[m + 3];

  // multi-gen's stepspan
  Pergens[m + 5] = 7 * Pergens[m + 2] + 11 * Pergens[m + 3];

  // c = flag to not filter out this pergen
  c = bestFraction <= maxFraction;

  // filter out unsupported pergens
  if (edo > 0) {
    // period can't be 1 edostep, no room for genchain
    c &= x < edo || (edo2 > 1 && edo2 != edo);

    // edo's octave must be divisible by m
    c &= GCD(edo, x) == x;

    // i = multi-gen's keyspan in the edo
    i = edosteps(Pergens[m + 2], Pergens[m + 3], edo);

    // multigen must be divisible by n
    c &= GCD(i, bestFraction) == bestFraction;

    // require that the edo not be multi-ring?
    if (excludePartialSupport) {
      // keyspans of period and gen must be coprime
      c &= GCD(edo / x, i / bestFraction) == 1;
    }
  }

  // EDO PAIR
  if (edo > 0 && edo2 > 1 && edo != edo2) {
    // the edo pair determines m
    c &= x == GCD(edo, edo2);

    // 2nd edo's octave must be divisible by m
    c &= GCD(edo2, x) == x;

    // j = multi-gen's keyspan in the 2nd edo
    j = edosteps2(Pergens[m + 2], Pergens[m + 3], edo2);

    // multigen must be divisible by n
    c &= GCD(j, bestFraction) == bestFraction;

    // require that the edo not be multi-ring?
    if (excludePartialSupport) {
      // keyspans of period and gen must be coprime
      c &= GCD(edo2 / x, j / bestFraction) == 1;
    }

    // k = n * (gen's keyspan in the 1st edo)
    k = bestFraction * Bezout[1];

    // k must equal the multigen's keyspan
    c &= mod2(i, edo / x) == mod2(k, edo / x);

    // do the same for the 2nd edo
    k = bestFraction * Bezout[0];
    c &= mod2(j, edo2 / x) == mod2(k, edo2 / x);
  }

  // i = index into Pergens, start at the end
  i = m - PergensRowLength;

  // j = max (m,n) = block #
  j = Math.max(Pergens[m], Pergens[m + 1]);

  // k = min (m,n) = section #
  k = Math.min(Pergens[m], Pergens[m + 1]);

  // find the right spot for this pergen
  while (c > 0 && i >= 0) {
    // find the right block, (4,3) is quarters block
    c = Math.max(Pergens[i], Pergens[i + 1]) - j;

    // find the right section, (4,3) is 3rd section
    if (c == 0) {
      c = Math.min(Pergens[i], Pergens[i + 1]) - k;
    }

    // find the right half, (4,3) is the 1st half
    if (c == 0) {
      c = Pergens[i + 1] - Pergens[m + 1];
    }

    // compare stepspans of the multigens
    if (c == 0) {
      c = Pergens[i + 5] - Pergens[m + 5];
    }

    // compare keyspans of the multigens
    if (c == 0) {
      c = Pergens[i + 4] - Pergens[m + 4];
    }

    // c > 0 means keep going, c = 0 means dupe found,
    // c < 0 means spot found for insertion
    if (c > 0) {
      i -= PergensRowLength;
    }
  }

  // in case it needs to go in the 1st spot
  if (c > 0 && i < 0) {
    c = -1;
  }

  // for debugging, returns all pergens, unsorted
  //c=-1;i=m-PergensRowLength;

  // for debugging, returns split multigens only
  //Pergens[m]==1&&

  // for debugging, returns split octaves only
  //Pergens[m+1]==1&&

  // for debugging, returns imperfect multigens only
  //abs(Pergens[m+3])>1&&

  // for debugging, combined with the next line,
  //Pergens[m]>1&&Pergens[m+1]>1&&

  // see previous line, returns false doubles only
  //GCD(Pergens[m],Pergens[m+1])==abs(Pergens[m+3])&&

  // valid pergen?
  if (c < 0) {
    // analyze it
    findPeriodsAndGens();

    // i = the spot it will go to
    k = PergensRowLength;
    i += k;

    // make space for it
    memcpy(Pergens, i + k, Pergens, i, m - i + k);

    // move it in
    memcpy(Pergens, i, Pergens, m + k, k);

    numPergens += 1;

    // count the imperfect multigens
    if (Math.abs(Pergens[i + 3]) > 1) {
      numImperfect += 1;
    }

    // j,k = 12edo keyspans of P,G
    j = 12 / Pergens[i];

    // j & k may be fractional
    k = Pergens[i + 4] / Pergens[i + 1];

    // period-reduce & invert j to minimize it
    while (k > j / 2) {
      k -= j;
    }
    if (k < 0) {
      k = -k;
    }

    // count the generators < 50¢
    if (k < 0.5) {
      numSmallGens += 1;
    }
  }
}

/**
 * F = 5th = yP + zG, y = F/P - zG/P = xF/O - xz*G/O
 * 600¢ < F < 800¢, 0¢ < G < 600¢
 */
function makeMapping(x, z, maxFraction, edo, edo2) {
  let y, minY, maxY;

  // since z > 0, minimum is F = 600¢ and G = 600¢
  minY = ceiling(x / 2 - (x * z) / 2);

  // since z > 0, maximum is F = 800¢ and G = 0¢
  maxY = Math.floor((x * 2) / 3);

  // try every possible value of y
  y = minY;
  for (let loopCount = 1; loopCount <= maxY - minY + 1; loopCount++) {
    // convert from 5ths to 12ths for unreduced monzo
    findPergen(x, x + y, z, maxFraction, edo, edo2);

    // every x,y,z mapping combo makes a valid pergen,
    // but some are duplicates, they get filtered out later
    y += 1;
  }

  // explore negative values for z too
  z = -z;

  // since z < 0, minimum is F = 600¢ and G = 0¢
  minY = ceiling(x / 2);

  // since z < 0, maximum is F = 800¢ and G = 600¢
  maxY = Math.floor((x * 2) / 3 - (x * z) / 2);

  y = minY;
  for (let loopCount = 1; loopCount <= maxY - minY + 1; loopCount++) {
    // x + y, not y, to convert from 5ths to 12ths,
    // because the rest of the code uses unreduced monzos
    findPergen(x, x + y, z, maxFraction, edo, edo2);
    y += 1;
  }
}

let numPergens, numImperfect, numSmallGens;

/**
 * Mapping: octave = xP, fifth = yP + zG.
 * Loop thru all the combinations of x & z in such a way that larger values come last.
 * Ex: 1-1, 2-1 1-2 2-2, 3-1 1-3 3-2 2-3 3-3, etc.
 * Then try all valid values of y, avoiding ones incompatible with the edo.
 */
function makeList(maxFraction, edo, edo2) {
  numPergens = numImperfect = numSmallGens = 0;
  Pergens = [];

  for (let i = 1; i <= maxFraction; i++) {
    for (let j = 1; j <= i - 1; j++) {
      if (GCD(edo, i) === i) makeMapping(i, j, maxFraction, edo, edo2);
      if (GCD(edo, j) === j) makeMapping(j, i, maxFraction, edo, edo2);
    }
    if (GCD(edo, i) === i) makeMapping(i, i, maxFraction, edo, edo2);
  }

  // Convert it to a percentage
  if (numPergens > 0) {
    numImperfect = (numImperfect * 100) / numPergens;
    numSmallGens = (numSmallGens * 100) / numPergens;
  }

  //Bezout [0] == the P4 of edo2 and Bezout [1] == the P4 of edo
  if (
    Bezout[0] == 2 * edo2 - Twelfth[edo2] &&
    Bezout[1] == 2 * edo - Twelfth[edo]
  ) {
    Bezout[0] = edo2 - Bezout[0];
    Bezout[1] = edo - Bezout[1];
  }
}

function makeList2(firstPergenDisplayed, maxFraction, edoFilter, edoFilter2) {
  console.log("Make list called with:", {
    firstPergenDisplayed,
    maxFraction,
    edoFilter,
    edoFilter2
  });
  const data = [
    {
      pergen: "(P8, P5)",
      per: 1200,
      gen: 700,
      unreducedPergen: "(P8, P4)",
      mapping: "1 1 1"
    },
    {
      pergen: "(P8, M3)",
      per: 1200,
      gen: 700,
      unreducedPergen: "(P8, M2)",
      mapping: "1 1 1"
    }
  ];
  return data;
}

/**
 * JavaScript equivalent of JSFX memcpy function
 * Copies a region of memory from source to destination
 * @param {Array} dest - destination array
 * @param {number} destOffset - starting index in destination
 * @param {Array} source - source array
 * @param {number} sourceOffset - starting index in source
 * @param {number} length - number of elements to copy
 */
function memcpy(dest, destOffset, source, sourceOffset, length) {
  // Handle overlapping regions by copying in the right direction
  if (
    dest === source &&
    destOffset > sourceOffset &&
    destOffset < sourceOffset + length
  ) {
    // Overlapping copy: copy backwards to avoid overwriting
    for (let i = length - 1; i >= 0; i--) {
      dest[destOffset + i] = source[sourceOffset + i];
    }
  } else {
    // Non-overlapping or safe overlapping: copy forwards
    for (let i = 0; i < length; i++) {
      dest[destOffset + i] = source[sourceOffset + i];
    }
  }
}

function writeNum(val, dec) {
  return val?.toFixed(dec) || "";
}

/**
 * writeChars function - writes a char v, w times, using exponents for w > 2
 */
function writeChars(v, w) {
  w = Math.floor(w);

  if (w > 2) {
    // Musical notation with proper superscript
    let result = `${v}<sup>${writeNum(w, 0)}</sup>`;
    return result;
  } else if (w > 0) {
    return v.repeat(w);
  }

  return "";
}

function drawDown() {
  return "v";
}

function drawDowns(w) {
  if (w == 1) return drawDown();
  else if (w == 2) return drawDown() + drawDown();
  else if (w > 2) return drawDown() + "<sup>" + writeNum(w, 0) + "</sup>";
  return "";
}

/**
 * numQualityChars function
 */
function numQualityChars(ksp, step, ht) {
  let q, i;

  i = Math.floor(step / 7);

  // 9th/10th/11th/12th? reduce it
  ksp -= 12 * i;
  step -= 7 * i;

  // quality = # of keys from average keyspan
  q = ksp - Keyspans[step];

  // 1 space for M or m
  if (Math.abs(q) == 0.5) {
    q = 1;
  }

  // q = # of chars in the displayed quality
  q = Math.floor(Math.abs(q));

  // perfect is only included if height is 0
  if (q == 0 && ht == 0) {
    q = 1;
  }

  if (q > 9) {
    q = 3;
  } else if (q > 2) {
    q = 2;
  }

  return q;
}

/**
 * writeQuality function
 */
function writeQuality(ksp, step, ht) {
  let quality, i;

  // quality = the # of keys from that degree's average keyspan
  // average keyspan = Keyspans = [0, 1.5, 3.5, 5, 7, 8.5, 10.5, 12]
  // perfect: -2=dd, -1=d, 0=P, 1=A, 2=AA
  // imperfect: -2.5=dd, -1.5=d, -0.5=m, 0.5=M, 1.5=A, 2.5=AA

  if (step < 0) {
    ksp = -ksp;
    step = -step;
  }

  // i = octaves in the interval
  i = Math.floor(step / 7);

  // 9th/10th/11th/12th? reduce it
  ksp -= 12 * i;
  step -= 7 * i;

  // quality = # of keys from average keyspan
  quality = ksp - Keyspans[step];

  let result = "";

  // aug or double-aug if quality >= 1
  result += writeChars("A", quality);

  // major
  if (quality == 0.5) {
    result += "M";
  }

  // perfect, omit "P" if there are ups or downs
  if (quality == 0 && ht == 0) {
    result += "P";
  }

  // minor
  if (quality == -0.5) {
    result += "m";
  }

  // dim or double-dim if quality <= -1
  result += writeChars("d", -quality);

  return result;
}

/**
 * writeInterval function - writes right-justified
 * max 11 chars: ^99c99d9912
 */
function writeInterval(keyspan, stepspan, height, choice) {
  let width, p, q;

  // width = # of 8ves interval is widened by
  width = Math.floor(stepspan / 7);

  // but c1/c2/c3/c4/c5 are 8/9/10/11/12
  // and cc1/ccc1/cccc1 is c8/cc8/ccc8
  // and cc2/ccc2/cccc2 is c9/cc9/ccc9
  if (stepspan <= 11) {
    width = 0;
  } else if (stepspan % 7 == 0 && width > 0) {
    width -= 1;
  } else if (stepspan % 7 == 1 && width > 0) {
    width -= 1;
  }

  keyspan -= 12 * width;
  stepspan -= 7 * width;

  // p = # of spaces to indent by
  q = Math.abs(height);
  p = 0;

  // height: ^nn, ^n or ^^, ^, or nothing
  if (q == 0) {
    p += 3;
  } else if (q == 1) {
    p += 2;
  } else if (q < 10) {
    p += 1;
  }

  q = Math.abs(width);

  // width: cnn, cn or cc, c, or nothing
  if (q == 0) {
    p += 3;
  } else if (q == 1) {
    p += 2;
  } else if (q < 10) {
    p += 1;
  }

  // quality: dnn, dn or dd, P, or nothing
  p += 3 - numQualityChars(keyspan, stepspan, height);

  // degree: nn or -n, or n
  if (Math.abs(stepspan) < 9 && stepspan >= 0) {
    p += 1;
  }

  // choice = -1 means don't right-justify
  let result = "";

  // red to warn of negative degrees
  if (stepspan < 0) {
    //TODO: handle red text
    result += "-";
  }

  // height, -1 or 0 = ^ or v, 1 = / or \
  if (choice <= 0) {
    // use ups and downs
    result += writeChars("^", height);
    result += drawDowns(-height);
  } else {
    // or else, use lifts and drops
    result += writeChars("/", height);
    result += writeChars("\\", -height);
  }

  // width = # of times compounded
  result += writeChars("c", width);

  // quality
  result += writeQuality(keyspan, stepspan, height);

  // q converts stepspan to degree
  if (stepspan == 0) {
    q = 1;
  } else {
    q = Math.sign(stepspan);
  }

  // degree, can be negative
  result += writeNum(Math.abs(stepspan + q), 0);

  return result;
}

/**
 * writeCents function
 */
function writeCents(frac, Ek, Es, dec, size, edo) {
  let p, q;

  if (edo == 0) {
    // CENTS OF ^1, derived from E

    // q = 3-exponent of E = the "c" part
    q = 7 * Ek - 12 * Es;

    let result = "";

    // indent if "c" multiplier is 1 or -1
    if (Math.abs(q) == frac) {
      result += "  "; // equivalent to moveby(16, 0)
    }

    // numeric part = 100 * (Ek / frac) cents
    if (Ek != 0) {
      result += writeNum(Math.abs((100 * Ek) / frac), 0);
    } else {
      // indent if there is no numeric part
      result += " ".repeat(size); // equivalent to moveby(8 * size, 0)
    }

    // flip the "c" part if E is upped
    if (Ek <= 0) {
      q = -q;
    }

    // divide it by the splitting fraction
    q /= frac;

    // write "+" if needed
    if (q > 0 && Ek != 0) {
      result += "+";
    }

    // indent if needed
    if (q > 0 && Ek == 0) {
      result += " ";
    }

    // write "c", not "1*c"
    if (q == 1) {
      result += "c";
    }
    // write "-c", not "-1*c"
    else if (q == -1) {
      result += "-c";
    }
    // don't write "0*c" for the period's cents
    else if (q != 0) {
      // dec = decimal places
      result += writeNum(q, dec) + "*c";
    }

    return result;
  } else {
    // EDOSTEPS OF ^1

    // p = 2-exponent of E
    p = -11 * Ek + 19 * Es;

    // q = 3-exponent of E
    q = 7 * Ek - 12 * Es;

    // p = edosteps of E / frac
    p = edosteps(p, q, edo) / frac;

    let result = "";
    result += writeNum(Math.abs(p), 0);

    // use '\', because "\" causes errors
    result += "\\" + writeNum(edo, 0);

    return result;
  }
}

//--------------------------------------------------------------------
// Function getData replaces the original writeList(), with some adaptation
// and other helper functions to render the data
//--------------------------------------------------------------------

function getData(firstPergenDisplayed, edo) {
  const data = [];

  // p = number of this pergen
  let p = firstPergenDisplayed - 1;
  let q = p * PergensRowLength;

  // max of m and n, identifies the block
  let maxMN = Math.max(Pergens[q], Pergens[q + 1]);

  // show a screenful of pergens
  for (let loop = 1; loop <= Math.min(numPergens - p, 50); loop++) {
    // q = index into array
    q = p * PergensRowLength;

    // new block of pergens?
    let blockStartType = 0; // 0 = none, 1 = new block, 2 = gray line
    if (Math.max(Pergens[q], Pergens[q + 1]) > maxMN) {
      // remember the new maximum
      maxMN = Math.max(Pergens[q], Pergens[q + 1]);
      blockStartType = 1;
    } else if (p % 3 == 0) {
      // draw light gray guide lines
      blockStartType = 2;
    }

    const pergenName = getPergenName(q, edo);
    const per = writeCents(Pergens[q], 12, 7, 0, 4, edo);
    const gen = getGen(q, edo);
    const periodDetails = getPeriodDetails(q, edo);
    const generatorDetails = getGeneratorDetails(q, edo);
    const unPergenDetails = getUnreducedPergenDetails(q, edo);
    const item = {
      index: p + 1,
      blockStartType,
      pergenName,
      per,
      gen,
      periodDetails,
      generatorDetails,
      unPergenDetails
    };
    data.push(item);

    p += 1;
  }

  return data;
}

function getPergenName(q, edo) {
  let period = "P8";

  // fractional period?
  if (Pergens[q] !== 1) {
    period += "/" + Pergens[q]; // "/2"
  }

  // write imperfect multigens in green
  let isImperfect = false;
  if (Math.abs(Pergens[q + 3]) > 1) isImperfect = true;

  let gen = writeInterval(Pergens[q + 4], Pergens[q + 5], 0, -1);

  // fractional generator?
  let fracGen = "";
  if (Pergens[q + 1] > 1) {
    fracGen = "/" + Pergens[q + 1]; // "/3"
  }

  // h = multi-gen's keyspan in the edo
  let h = edosteps(Pergens[q + 2], Pergens[q + 3], edo);

  // if period and gen aren't coprime,
  // show edo's partial support with a red *
  let partialSupport = false;
  if (edo > 0 && GCD(edo / Pergens[q], h / Pergens[q + 1]) > 1)
    partialSupport = true;

  return {
    period,
    gen,
    fracGen,
    isImperfect,
    partialSupport
  };
}

function getGen(q, edo) {
  // GENERATOR CENTS
  let result = "";
  let isSmallGenerator = false;
  let h, r;
  if (edo == 0) {
    // h = multigen's cents if c = 0
    // h = gen's cents,
    h = 1200 * Pergens[q + 2] + 1900 * Pergens[q + 3];
    h /= Pergens[q + 1];
    // r = period's cents
    r = 1200 / Pergens[q];
    if (Pergens[q] > 1) while (h > r / 2) h -= r; // if m > 1, period-reduce h to minimize it
    // invert h if negative, set r = 0 as a flag
    if (h < 0) {
      h = -h;
      r = 0;
    }
    // show generators < 50° in red
    if (h < 50) isSmallGenerator = true;

    result = writeNum(h, 0);
    h = Pergens[q + 1] / Pergens[q + 3]; // h = fraction of c = n/b
    if (r == 0) h = -h; // if gen was inverted, invert h too
    if (h > 0) {
      result += "+c";
    } else {
      result += "-c";
    }
    if (Math.abs(h) > 1) {
      result += "/";
      result += writeNum(Math.abs(h), 0);
    }
  } else {
    // h = edosteps of the multigen
    // h = gen's edosteps,
    h = edosteps(Pergens[q + 2], Pergens[q + 3], edo);
    h /= Pergens[q + 1];
    r = edo / Pergens[q]; // r = period's edosteps
    if (Pergens[q] > 1) while (h > r / 2) h -= r; // if m > 1, period-reduce h to minimize it
    if (h < 0) h = -h; // invert h if negative
    if (24 * h < edo) isSmallGenerator = true; // show generators < 50° in red
    result = writeNum(h, 0);
    result += "\\"; // use "\\" instead of $'\'
    result += writeNum(edo, 0);
  }

  return {
    result,
    isSmallGenerator
  };
}

function getPeriodDetails(q, edo) {
  let h;

  // PERIOD, h = height = count of E = x
  h = Pergens[q + 10];

  // is E upped? flip the height
  if (Pergens[q + 8] <= 0) {
    h = -h;
  }

  // write the period, indent if it's "P8"
  let period = writeInterval(Pergens[q + 6], Pergens[q + 7], h, 0);
  let isRedEnharmonic = false;
  let enharmonic = "";
  let cents = "";

  // ENHARMONIC, is it something not P1?
  if (!(Pergens[q + 8] === 0 && Pergens[q + 9] === 0)) {
    // A1, m2, M2 downed, d2, dd2, etc. upped
    if (Pergens[q + 8] > 0) {
      h = -Pergens[q];
    } else {
      h = Pergens[q];
    }

    // show enharmonic 3rds & 4ths in red
    if (Pergens[q + 9] > 1) {
      isRedEnharmonic = true;
    }

    // write the enharmonic
    enharmonic = writeInterval(Pergens[q + 8], Pergens[q + 9], h, 0);

    // CENTS OF ^1, derived from E
    // c-factor is always an integer
    cents = writeCents(Pergens[q], Pergens[q + 8], Pergens[q + 9], 0, 2, edo);
  }

  return {
    period,
    enharmonic,
    isRedEnharmonic,
    cents
  };
}

function getGeneratorDetails(q, edo) {
  let h, r;

  // GENERATOR, h = height of G = count of E'
  h = Pergens[q + 15];

  // is E' upped? flip the height
  if (Pergens[q + 13] <= 0) {
    h = -h;
  }

  r = Pergens[q] > 1;

  // write the generator, use /\ not ^v
  let generator = writeInterval(Pergens[q + 11], Pergens[q + 12], h, r);
  let isRedEnharmonic = false;
  let enharmonic = "";
  let cents = "";

  // is the E' count != 0?
  if (Pergens[q + 15] !== 0) {
    // ENHARMONIC, upped if keyspan <= 0
    h = Pergens[q + 1];

    // is Ek' > 0, E' downed? flip the height
    if (Pergens[q + 13] > 0) {
      h = -h;
    }

    // show enharmonic 3rds & 4ths in red
    if (Pergens[q + 14] > 1) {
      isRedEnharmonic = true;
    }

    // write the enharmonic E'
    enharmonic = writeInterval(Pergens[q + 13], Pergens[q + 14], h, r);

    // CENTS OF ^1, derived from E'
    // c-factor is never an integer
    cents = writeCents(
      Pergens[q + 1],
      Pergens[q + 13],
      Pergens[q + 14],
      2,
      2,
      edo
    );
  }
  return {
    generator,
    enharmonic,
    isRedEnharmonic,
    cents
  };
}

function getUnreducedPergenDetails(q, edo) {
  //TODO: Troubleshoot this because it looks like the output is not correct.
  let h;
  let isTrueDouble = false;
  const pergenName = getUnreducedPergenName(q);

  let period = "";
  let generator = "";
  let isFailedSearch = false;
  if (Pergens[q + 26] != 0) {
    // UNREDUCED PERIOD = P', h = height of P'
    // h = count of E' = x' * n' / m
    h = (Pergens[q + 26] * Pergens[q + 23]) / Pergens[q];
    // in case of failed search
    if (Pergens[q + 26] == 0) {
      h = 0;
      isFailedSearch = true;
    }
    period = writeInterval(Pergens[q + 24], Pergens[q + 25], h, 0);

    // UNREDUCED GEN, height = lcm (m,n) / n
    h = Pergens[q + 23] / Pergens[q + 1];
    h *= Pergens[q + 29];

    // direction depends on the keyspan of E"
    if (Pergens[q + 18] <= 0) {
      h = -h;
    }
    // write the unreduced generator
    generator = writeInterval(Pergens[q + 27], Pergens[q + 28], h, 0);
  } else {
    isTrueDouble = true;
  }

  return {
    pergenName,
    period,
    isTrueDouble,
    period, 
    generator,
    isFailedSearch
  };
}

function getUnreducedPergenName(q) {
  // UNREDUCED PERGEN
  let result = "(P8";

  // fractional period?
  if (Pergens[q] === 1) {
    result += ",  ";
  } else {
    result += "/";
    result += writeNum(Pergens[q], 0, 1); // "/2"
    result += ", ";
  }

  // write the alt-multi-gen
  result += writeInterval(Pergens[q + 21], Pergens[q + 22], 0, -1);

  // not (P8, P4)?
  if (Pergens[q + 23] > 1) {
    result += "/";
    result += writeNum(Pergens[q + 23], 0, 1); // alt-multi-gen's fraction = LCM (m,n)
  }

  result += ")";
  return result;
}
