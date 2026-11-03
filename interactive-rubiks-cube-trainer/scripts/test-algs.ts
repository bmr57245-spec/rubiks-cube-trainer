import { OLL, PLL } from "../src/lib/algs";
import { solvedCube, applyAlg, f2lSolved, ollSolved, isSolved, pllSolved, invertAlg } from "../src/lib/cube";

let bad = 0;
for (const a of PLL) {
  const c = applyAlg(applyAlg(solvedCube(), "z2"), a.alg);
  const ok = ollSolved(c) && !isSolved(c);
  // inverse then alg returns to solved
  const back = applyAlg(applyAlg(applyAlg(solvedCube(), "z2"), invertAlg(a.alg)), a.alg);
  if (!ok || !isSolved(back)) { console.log("PLL BAD", a.id, ollSolved(c), f2lSolved(c)); bad++; }
}
for (const a of OLL) {
  const c = applyAlg(applyAlg(solvedCube(), "z2"), a.alg);
  const ok = f2lSolved(c) && !isSolved(c);
  if (!ok) { console.log("OLL BAD", a.id, a.alg); bad++; }
}
const lessonAlgs = ["F R U R' U' F'","R U R' U R U2 R'","R U2 R' U' R U' R'","U R U' L' U R' U' L","R U' R U R U R U' R' U' R2","R U R' U R U2 R' U","R U2 R' U' R U R'","f R U R' U' f'","F R U R' U' F' f R U R' U' f'","F R' F' r U R U' r'","R U R' U' R' F R F'","M2 U M U2 M' U M2","R U R' U' R U R' U' R U R' U'"];
for (const al of lessonAlgs) { const c = applyAlg(applyAlg(solvedCube(), "z2"), al); console.log(al, "f2l:", f2lSolved(c)); }
// sanity: R R' = solved, 4 x R = solved, sexy move 6x
console.log("R4", isSolved(applyAlg(applyAlg(solvedCube(), "z2"), "R R R R")), "sexy6", isSolved(applyAlg(applyAlg(solvedCube(), "z2"), "R U R' U' ".repeat(6))));
console.log("bad", bad);
