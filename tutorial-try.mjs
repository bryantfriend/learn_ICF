const workerURL = new URL("./tutorial-try-worker.mjs", import.meta.url);
const timeLimit = 10000;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function mountTryExample(host, recipe) {
  const details = element("details", "try-example");
  const summary = element("summary", "try-example-toggle", "Try this example");
  const body = element("div", "try-example-body");
  const label = element("label", "try-example-label", "JavaScript editor");
  const editor = element("textarea", "try-example-code");
  editor.value = recipe.code;
  editor.rows = Math.min(16, Math.max(6, recipe.code.split("\n").length));
  editor.spellcheck = false;
  editor.setAttribute("autocapitalize", "off");
  editor.setAttribute("autocomplete", "off");
  editor.wrap = "off";
  label.append(editor);
  const actions = element("div", "try-example-actions");
  const run = element("button", "try-example-run", "Run");
  const reset = element("button", "try-example-reset", "Reset");
  run.type = reset.type = "button";
  run.title = "Run the current code (Ctrl or Command + Enter)";
  const status = element("span", "try-example-status");
  status.setAttribute("role", "status");
  const output = element("pre", "try-example-output");
  output.setAttribute("aria-label", "Console output");
  output.setAttribute("role", "region");
  output.tabIndex = 0;
  output.hidden = true;
  actions.append(run, reset, status);
  body.append(label, actions, output);
  details.append(summary, body);
  host.append(details);
  let worker;
  let timer;

  function stop() {
    clearTimeout(timer);
    if (worker) worker.terminate();
    worker = null;
    run.disabled = false;
  }

  function finish(message, failed = false) {
    stop();
    status.textContent = message;
    output.classList.toggle("try-example-error", failed);
    output.hidden = !output.textContent;
  }

  function execute() {
    stop();
    output.textContent = "";
    output.hidden = true;
    output.classList.remove("try-example-error");
    status.textContent = "Running…";
    run.disabled = true;
    try {
      const current = new Worker(workerURL, { type: "module" });
      worker = current;
      current.onmessage = function show(event) {
        if (current !== worker) return;
        const data = event.data;
        if (data.type === "line") {
          output.textContent += (output.textContent ? "\n" : "") + data.text;
          output.hidden = false;
        }
        if (data.type === "done") {
          output.textContent = [data.output, data.error].filter(Boolean).join("\n");
          finish(data.error ? "Execution failed." : data.output ? "Finished." : "Finished with no console output.", Boolean(data.error));
        }
      };
      current.onerror = function failed(event) {
        if (current !== worker) return;
        output.textContent += (output.textContent ? "\n" : "") +
          (event.message || "The example worker could not start. Open the wiki through its local HTTP server or GitHub Pages.");
        finish("Execution failed.", true);
      };
      timer = setTimeout(function expired() {
        if (current === worker) finish("Stopped after 10 seconds.", true);
      }, timeLimit);
      current.postMessage({ code: editor.value });
    } catch (error) {
      output.textContent = error.message;
      finish("Execution failed.", true);
    }
  }

  run.addEventListener("click", execute);
  reset.addEventListener("click", function restore() {
    stop();
    editor.value = recipe.code;
    output.textContent = "";
    finish("Original code restored.");
  });
  editor.addEventListener("keydown", function shortcut(event) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      execute();
    }
  });
  details.addEventListener("toggle", function onToggle() {
    if (!details.open && worker) finish("Stopped.");
  });
  return function unmount() {
    stop();
    details.remove();
  };
}
