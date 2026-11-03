export interface Alg {
  id: string;
  set: "OLL" | "PLL";
  name: string;
  group: string;
  alg: string;
  twoLook?: boolean; // ضمن طريقة المرحلتين
}

const pll = (name: string, group: string, alg: string, twoLook = false): Alg => ({
  id: `PLL-${name}`,
  set: "PLL",
  name,
  group,
  alg,
  twoLook,
});
const oll = (n: number, group: string, alg: string, twoLook = false): Alg => ({
  id: `OLL-${n}`,
  set: "OLL",
  name: String(n),
  group,
  alg,
  twoLook,
});

export const PLL: Alg[] = [
  pll("Aa", "تبديل الزوايا", "x R' U R' D2 R U' R' D2 R2 x'", true),
  pll("Ab", "تبديل الزوايا", "x R2 D2 R U R' D2 R U' R x'"),
  pll("E", "تبديل الزوايا", "x' R U' R' D R U R' D' R U R' D R U' R' D' x"),
  pll("Ua", "تبديل الحواف", "M2 U M U2 M' U M2", true),
  pll("Ub", "تبديل الحواف", "M2 U' M U2 M' U' M2", true),
  pll("H", "تبديل الحواف", "M2 U M2 U2 M2 U M2", true),
  pll("Z", "تبديل الحواف", "M' U M2 U M2 U M' U2 M2", true),
  pll("Ja", "تبديل زاويتين وحافتين متجاورتين", "x R2 F R F' R U2 r' U r U2 x'"),
  pll("Jb", "تبديل زاويتين وحافتين متجاورتين", "R U R' F' R U R' U' R' F R2 U' R'"),
  pll("T", "تبديل زاويتين وحافتين متجاورتين", "R U R' U' R' F R2 U' R' U' R U R' F'"),
  pll("Ra", "تبديل زاويتين وحافتين متجاورتين", "R U' R' U' R U R D R' U' R D' R' U2 R'"),
  pll("Rb", "تبديل زاويتين وحافتين متجاورتين", "R2 F R U R U' R' F' R U2 R' U2 R"),
  pll("F", "تبديل زاويتين وحافتين متجاورتين", "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R"),
  pll("V", "تبديل زاويتين وحافتين قطرياً", "R' U R' U' y R' F' R2 U' R' U R' F R F"),
  pll("Y", "تبديل زاويتين وحافتين قطرياً", "F R U' R' U' R U R' F' R U R' U' R' F R F'"),
  pll("Na", "تبديل زاويتين وحافتين قطرياً", "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'"),
  pll("Nb", "تبديل زاويتين وحافتين قطرياً", "R' U R U' R' F' U' F R U R' F R' F' R U' R"),
  pll("Ga", "تبديل ثلاثي (دورة G)", "R2 U R' U R' U' R U' R2 U' D R' U R D'"),
  pll("Gb", "تبديل ثلاثي (دورة G)", "R' U' R U D' R2 U R' U R U' R U' R2 D"),
  pll("Gc", "تبديل ثلاثي (دورة G)", "R2 U' R U' R U R' U R2 D' U R U' R' D"),
  pll("Gd", "تبديل ثلاثي (دورة G)", "R U R' U' D R2 U' R U' R' U R' U R2 D'"),
];

export const OLL: Alg[] = [
  oll(1, "نقطة", "R U2 R2 F R F' U2 R' F R F'"),
  oll(2, "نقطة", "F R U R' U' F' f R U R' U' f'", true),
  oll(3, "نقطة", "f R U R' U' f' U' F R U R' U' F'"),
  oll(4, "نقطة", "f R U R' U' f' U F R U R' U' F'"),
  oll(5, "مربع", "r' U2 R U R' U r"),
  oll(6, "مربع", "r U2 R' U' R U' r'"),
  oll(7, "شكل ثعبان (W)", "r U R' U R U2 r'"),
  oll(8, "شكل ثعبان (W)", "r' U' R U' R' U2 r"),
  oll(9, "شكل P", "R U R' U' R' F R2 U R' U' F'"),
  oll(10, "شكل P", "R U R' U R' F R F' R U2 R'"),
  oll(11, "شكل P", "r U R' U R' F R F' R U2 r'"),
  oll(12, "شكل P", "F R U R' U' F' U F R U R' U' F'"),
  oll(13, "شكل خط عريض", "F U R U2 R' U' R U R' F'"),
  oll(14, "شكل خط عريض", "R' F R U R' F' R F U' F'"),
  oll(15, "شكل خط عريض", "r' U' r R' U' R U r' U r"),
  oll(16, "شكل خط عريض", "r U r' R U R' U' r U' r'"),
  oll(17, "نقطة", "R U R' U R' F R F' U2 R' F R F'"),
  oll(18, "نقطة", "r U R' U R U2 r' F R U R' U' F'"),
  oll(19, "نقطة", "r' R U R U R' U' M' R' F R F'"),
  oll(20, "نقطة", "r U R' U' M2 U R U' R' U' M'"),
  oll(21, "صليب", "R U2 R' U' R U R' U' R U' R'", true),
  oll(22, "صليب", "R U2 R2 U' R2 U' R2 U2 R", true),
  oll(23, "صليب", "R2 D R' U2 R D' R' U2 R'", true),
  oll(24, "صليب", "r U R' U' r' F R F'", true),
  oll(25, "صليب", "F' r U R' U' r' F R", true),
  oll(26, "صليب", "R U2 R' U' R U' R'", true),
  oll(27, "صليب", "R U R' U R U2 R'", true),
  oll(28, "شكل خط", "r U R' U' r' R U R U' R'"),
  oll(29, "شكل خط", "R U R' U' R U' R' F' U' F R U R'"),
  oll(30, "شكل خط", "F R' F R2 U' R' U' R U R' F2"),
  oll(31, "شكل P", "R' U' F U R U' R' F' R"),
  oll(32, "شكل مربع صغير", "R U B' U' R' U R B R'"),
  oll(33, "شكل T", "R U R' U' R' F R F'", true),
  oll(34, "شكل C", "R U R2 U' R' F R U R U' F'"),
  oll(35, "شكل خط", "R U2 R2 F R F' R U2 R'"),
  oll(36, "شكل W", "R' U' R U' R' U R U R B' R' B"),
  oll(37, "شكل خط", "F R' F' R U R U' R'"),
  oll(38, "شكل W", "R U R' U R U' R' U' R' F R F'"),
  oll(39, "شكل خط", "R U R' F' U' F U R U2 R'"),
  oll(40, "شكل خط", "R' F R U R' U' F' U R"),
  oll(41, "شكل خط", "R U R' U R U2 R' F R U R' U' F'"),
  oll(42, "شكل خط", "R' U' R U' R' U2 R F R U R' U' F'"),
  oll(43, "شكل P", "R' U' F' U F R"),
  oll(44, "شكل P", "f R U R' U' f'"),
  oll(45, "شكل T", "F R U R' U' F'", true),
  oll(46, "شكل C", "R' U' R' F R F' U R"),
  oll(47, "شكل خط", "R' U' R' F R F' R' F R F' U R"),
  oll(48, "شكل خط", "F R U R' U' R U R' U' F'"),
  oll(49, "شكل خط", "R B' R2 F R2 B R2 F' R"),
  oll(50, "شكل خط", "R' F R2 B' R2 F' R2 B R'"),
  oll(51, "شكل خط", "F U R U' R' U R U' R' F'"),
  oll(52, "شكل خط", "R U R' U R d' R U' R' F'"),
  oll(53, "شكل خط", "r' U' R U' R' U R U' R' U2 r"),
  oll(54, "شكل خط", "r U R' U R U' R' U R U2 r'"),
  oll(55, "شكل خط", "R U2 R2 U' R U' R' U2 F R F'"),
  oll(56, "شكل خط", "r U r' U R U' R' U R U' R' r U' r'"),
  oll(57, "شكل خط", "R U R' U' M' U R U' r'"),
];

export const ALL_ALGS: Alg[] = [...OLL, ...PLL];
export const ALG_BY_ID: Record<string, Alg> = Object.fromEntries(ALL_ALGS.map((a) => [a.id, a]));
