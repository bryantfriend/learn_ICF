import pipeline from "./Template/ICF/engine/pipeline.js";
import { createLessonRecommendationFactory } from "./Template/ICF/Intents/RecommendNextLessonIntent.js";
import { createDemoLessonServices } from "./Template/ICF/examples/lessonServices.js";

const presets = {
  baseline: { label: "First recommendation", actorId: "learner", allowed: true },
  review: { label: "Learner needs review", actorId: "learner", allowed: true, repeatedErrors: true, shortSession: true },
  denied: { label: "Recommendation denied", actorId: "learner", allowed: false },
  unknown: { label: "Unknown learner", actorId: "guest", allowed: true },
  missing: { label: "Missing actor ID", actorId: "", allowed: true }
};

async function runRecommendation(settings) {
  const signals = {};
  if (settings.repeatedErrors) signals.repeatedErrors = 1;
  if (settings.shortSession) signals.shortSession = 1;

  const services = createDemoLessonServices({ signals, allowed: settings.allowed });
  const recommendLesson = createLessonRecommendationFactory(services);
  const intent = recommendLesson({ id: settings.actorId, role: "student" }, {});
  return pipeline.run(intent);
}

const exampleLines = [
  '<span class="pg-keyword">const</span> intent = <span class="pg-call">recommendLesson</span>(',
  '  { id: <span class="pg-string">"learner"</span>, role: <span class="pg-string">"student"</span> },',
  '  {}',
  ');',
  '',
  '<span class="pg-comment">// Execute the six-stage pipeline</span>',
  '<span class="pg-keyword">const</span> result = <span class="pg-keyword">await</span> pipeline.<span class="pg-call">run</span>(intent);',
  'console.<span class="pg-call">log</span>(result.data.lessonId);'
];

export function mountExample(element) {
  element.innerHTML = `
    <section class="pg-example" aria-label="Runnable JavaScript example">
      <div class="pg-editor-bar"><span class="pg-file"><b aria-hidden="true">JS</b> recommend-lesson.js</span><span class="pg-language">JavaScript</span></div>
      <div class="pg-editor-code" tabindex="0" role="region" aria-label="Example source code"><code></code></div>
      <div class="pg-editor-actions"><button type="button" class="pg-run"><span class="pg-play" aria-hidden="true"></span>Run example</button><output class="pg-example-status" aria-live="polite">Ready to run</output></div>
    </section>`;
  const code = element.querySelector("code");
  exampleLines.forEach(function appendLine(tokens, index) {
    const line = document.createElement("span");
    line.className = "pg-line";
    line.innerHTML = '<span class="pg-line-number" aria-hidden="true">' + (index + 1) + '</span><span>' + tokens + '</span>';
    code.append(line);
  });
  const button = element.querySelector("button");
  const status = element.querySelector("output");
  button.addEventListener("click", async function runExample() {
    button.disabled = true;
    status.textContent = "Running…";
    try {
      const result = await runRecommendation(presets.baseline);
      status.textContent = result.ok ? "Output: " + result.data.lessonId : result.errors.join(" ");
    } catch (error) {
      status.textContent = "Run failed. " + error.message;
    } finally {
      button.disabled = false;
    }
  });
}

function renderTrace(list, result) {
  list.replaceChildren();
  pipeline.REQUIRED_STAGE_NAMES.forEach(function appendStage(name) {
    const steps = result ? result.meta.pipelineTrace.filter(function inStage(entry) {
      return entry.stage === name;
    }) : [];
    const failed = steps.some(function stepFailed(step) { return !step.ok; });
    let status = result ? "Skipped" : "Ready";
    if (steps.length) status = failed ? "Failed" : "Passed";
    const row = document.createElement("li");
    row.className = "pg-stage pg-" + status.toLowerCase();
    const nameLabel = document.createElement("strong");
    nameLabel.textContent = name;
    const state = document.createElement("span");
    state.className = "pg-state";
    state.textContent = status;
    row.append(nameLabel, state);
    if (steps.length) {
      const stepNames = document.createElement("code");
      stepNames.textContent = steps.map(function describeStep(step) { return step.step; }).join(" · ");
      row.append(stepNames);
    }
    list.append(row);
  });
}

export function mountPlayground(element) {
  element.innerHTML = `
    <div class="pg-lab">
      <p class="pg-intro">Try a sample lesson request. Change who asks or what clues the app sees. Then check which steps run and what answer they give.</p>
      <div class="pg-lab-grid">
        <form class="pg-inputs">
          <h2>Run settings</h2>
          <label class="pg-control">Scenario<select aria-label="Scenario" name="scenario"></select></label>
          <label class="pg-control">Actor ID<input type="text" autocomplete="off" spellcheck="false" name="actorId"></label>
          <fieldset><legend>Clues about the lesson</legend>
            <label class="pg-check"><input type="checkbox" name="repeatedErrors">Repeated errors</label>
            <label class="pg-check"><input type="checkbox" name="shortSession">Short session</label>
          </fieldset>
          <fieldset><legend>What the learner is allowed to do</legend>
            <label class="pg-check"><input type="checkbox" name="allowed">Can recommend lessons</label>
          </fieldset>
          <button class="pg-run" type="submit"><span class="pg-play" aria-hidden="true"></span>Run pipeline</button>
        </form>
        <section class="pg-trace-panel" aria-label="Steps that ran">
          <h2>Steps that ran</h2>
          <p class="pg-trace-status" role="status"></p>
          <ol class="pg-trace"></ol>
          <details class="pg-details" hidden><summary>Full answer and list of steps</summary><pre tabindex="0"></pre></details>
        </section>
      </div>
    </div>`;
  const form = element.querySelector("form");
  const fields = form.elements;
  const scenario = fields.namedItem("scenario");
  Object.entries(presets).forEach(function addScenario([key, preset]) {
    scenario.add(new Option(preset.label, key));
  });
  const custom = new Option("Custom inputs", "custom");
  custom.disabled = true;
  scenario.add(custom);

  const list = element.querySelector(".pg-trace");
  const status = element.querySelector(".pg-trace-status");
  const raw = element.querySelector(".pg-details");
  const runButton = form.querySelector("button");
  let revision = 0;

  function resetTrace(message) {
    revision += 1;
    runButton.disabled = false;
    status.textContent = message;
    status.dataset.outcome = "waiting";
    renderTrace(list, null);
    raw.hidden = true;
    raw.open = false;
    raw.querySelector("pre").textContent = "";
  }

  async function run() {
    resetTrace("Running pipeline…");
    const current = revision;
    runButton.disabled = true;
    try {
      const result = await runRecommendation({
        actorId: fields.namedItem("actorId").value,
        repeatedErrors: fields.namedItem("repeatedErrors").checked,
        shortSession: fields.namedItem("shortSession").checked,
        allowed: fields.namedItem("allowed").checked
      });
      if (current !== revision) return;
      renderTrace(list, result);
      status.dataset.outcome = result.ok ? "success" : "failed";
      status.textContent = result.ok
        ? "Recommended " + result.data.lessonId + " with a score of " + result.data.score + "."
        : "Stopped at " + result.stage + ". " + result.errors.join(" ");
      const output = result.ok
        ? { ok: true, data: result.data, events: result.events }
        : { ok: false, stage: result.stage, step: result.step, errors: result.errors };
      output.meta = result.meta;
      raw.querySelector("pre").textContent = JSON.stringify(output, null, 2);
      raw.hidden = false;
    } catch (error) {
      if (current === revision) {
        status.textContent = "Run failed. " + error.message;
        status.dataset.outcome = "failed";
      }
    } finally {
      if (current === revision) runButton.disabled = false;
    }
  }

  function applyPreset() {
    const preset = presets[scenario.value];
    fields.namedItem("actorId").value = preset.actorId;
    ["allowed", "repeatedErrors", "shortSession"].forEach(function applyFlag(name) {
      fields.namedItem(name).checked = Boolean(preset[name]);
    });
    run();
  }
  scenario.addEventListener("change", applyPreset);
  form.addEventListener("input", function markCustom(event) {
    if (event.target === scenario) return;
    scenario.value = "custom";
    resetTrace("Run the steps to see what happens with these settings.");
  });
  form.addEventListener("submit", function submit(event) {
    event.preventDefault();
    run();
  });
  applyPreset();
}
