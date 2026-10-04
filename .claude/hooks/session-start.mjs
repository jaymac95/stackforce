// SessionStart: orient Claude with the project's current phase. Output is added to context, so keep it short.
import { readInput, readJson, gateStatus } from "./lib.mjs";

await readInput();
const s = readJson(".stackforce/state.json", null);
if (!s || s.phase === "start") {
  console.log("Stackforce: no project set up yet. Suggest /start for a new project or /adopt for an existing one.");
} else {
  const st = s.stories ?? {};
  const failed = Object.entries(s.gates ?? {}).filter(([, g]) => gateStatus(g) === "fail").map(([k]) => k);
  console.log(
    `Stackforce: ${s.project ?? "project"} | track ${s.track} | stack ${s.stack ?? "none"} | phase ${s.phase}` +
      ` | stories ${st.done ?? 0}/${st.total ?? 0}${st.current ? ` | current ${st.current}` : ""}` +
      (failed.length ? ` | failing gates: ${failed.join(", ")}` : ""),
  );
}
