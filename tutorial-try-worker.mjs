// Each run owns this worker, its module registry, and its local fixture state.
const chapterRoot = new URL("./", import.meta.url);
const send = self.postMessage.bind(self);
const maxText = 12000;
const maxLines = 90;

function resolveExampleImports(code) {
  // A blob has no directory. Resolve the example's leading ES module imports
  // against the installed wiki so they also work at /owner/project/ offline.
  const declaration = /((?:\s+|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*import\s+(?:(?:[\w$*,{}\s]+?)\s+from\s+)?)(["'])([^"'\r\n]+)\2([ \t]*;?)/y;
  let from = 0;
  let source = "";
  let match;
  while ((match = declaration.exec(code))) {
    const specifier = match[3];
    const url = specifier.startsWith("./") || specifier.startsWith("../")
      ? new URL(specifier, chapterRoot).href : specifier;
    source += match[1] + JSON.stringify(url) + match[4];
    from = declaration.lastIndex;
  }
  return source + code.slice(from);
}

function display(value, indent) {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.name + ": " + value.message;
  if (typeof value !== "object" || value === null) return String(value);
  try {
    const text = JSON.stringify(value, function represent(key, item) {
      if (typeof item === "bigint") return String(item) + "n";
      return item;
    }, indent);
    return text === undefined ? String(value) : text;
  } catch {
    return String(value);
  }
}

self.onmessage = async function run(event) {
  const lines = [];
  let lineCount = 0;
  let length = 0;
  let omitted = false;

  function capture(args, indent = 0) {
    const line = args.map(function format(value) { return display(value, indent); }).join(" ").slice(0, maxText);
    lineCount++;
    lines.push(line);
    length += line.length + 1;
    while (lines.length > 1 && (length > maxText || lines.length > maxLines)) {
      length -= lines.shift().length + 1;
      omitted = true;
    }
    // Stream initial lines so a loop that times out still has diagnostic output.
    if (lineCount <= maxLines && !omitted) send({ type: "line", text: line });
  }

  console.log = console.debug = function log(...args) { capture(args); };
  console.table = function table(value) { capture([value], 2); };
  console.error = function error(...args) { capture(args); };
  console.info = console.warn = function note(...args) {
    if (typeof args[0] === "string" && args[0].startsWith("[ICF]")) return;
    capture(args);
  };

  const source = resolveExampleImports(event.data.code);
  const objectURL = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
  let failure = "";
  try {
    await import(objectURL);
  } catch (error) {
    failure = display(error, 0);
  } finally {
    URL.revokeObjectURL(objectURL);
  }
  if (omitted) lines.unshift("… earlier output omitted");
  send({ type: "done", output: lines.join("\n"), error: failure });
};
