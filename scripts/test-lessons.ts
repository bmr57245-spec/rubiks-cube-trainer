import { LESSONS } from "../src/lib/lessons";
import { solvedCube, applyAlg, f2lSolved, parseAlg, parseMove } from "../src/lib/cube";
for (const l of LESSONS) for (const s of l.sections) for (const d of s.demos ?? []) {
  const bad = parseAlg(d.alg).filter(t => !parseMove(t));
  const c = applyAlg(applyAlg(solvedCube(), "z2"), d.alg);
  if (bad.length || (d.ll && !f2lSolved(c))) console.log("BAD", l.id, d.title, d.alg, bad);
}
console.log("done");
