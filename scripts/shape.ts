import { solvedCube, applyAlg, invertAlg } from "../src/lib/cube";
function show(alg: string) {
  const c = applyAlg(applyAlg(solvedCube(), "z2"), invertAlg(alg));
  const g: string[][] = [[".",".","."],[".",".","."],[".",".","."]];
  for (const s of c) if (s.n[1] === -1) g[s.p[2]+1][s.p[0]+1] = s.c === 1 ? "Y" : "x";
  console.log(alg + "\n" + g.map(r=>r.join(" ")).join("\n") + "\n");
}
["F R U R' U' F'","f R U R' U' f'","F U R U' R' F'","R U R' U R U2 R'","R U2 R' U' R U' R'","r U R' U' r' F R F'","F R' F' r U R U' r'","R U R' U' R' F R F'","F R U R' U' F' f R U R' U' f'"].forEach(show);
