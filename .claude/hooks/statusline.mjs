// Status line: project, track, stack, phase, story progress and context used.
import { readInput, readJson, gateStatus } from "./lib.mjs";

const input = await readInput();
const s = readJson(".stackforce/state.json", null);
const model = input?.model?.display_name ? ` · ${input.model.display_name}` : "";

// Context used: prefer Claude Code's own percentage, else derive it from the current usage.
const cw = input?.context_window ?? {};
let pct = cw.used_percentage;
if (typeof pct !== "number" && cw.current_usage && cw.context_window_size) {
  const u = cw.current_usage;
  const used = (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
  pct = (used / cw.context_window_size) * 100;
}
const ctx = typeof pct === "number" ? ` · ctx ${Math.round(pct)}%` : "";

if (!s || s.phase === "start") {
  console.log(`Stackforce · not set up (run /start)${model}${ctx}`);
} else {
  const LABELS = { website: "Website", webapp: "Web app", mobile: "Mobile", api: "API" };
  const st = s.stories ?? {};
  const story = st.total ? ` · story ${st.done ?? 0}/${st.total}` : "";
  const cur = st.current ? ` (${st.current})` : "";
  const failing = Object.values(s.gates ?? {}).filter((g) => gateStatus(g) === "fail").length;
  const gates = failing ? ` · ${failing} gate${failing > 1 ? "s" : ""} failing` : "";
  console.log(`Stackforce · ${LABELS[s.track] ?? s.track} · ${s.stack ?? "no stack"} · ${s.phase}${story}${cur}${gates}${model}${ctx}`);
}
