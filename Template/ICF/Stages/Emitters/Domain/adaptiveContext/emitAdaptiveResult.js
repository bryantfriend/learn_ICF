function emitAdaptiveResult(intent) {
  intent.context.events = [{ type: intent.type + "Completed", data: structuredClone(intent.context.resultData) }];
  return { ok: true, intent: intent };
}
export { emitAdaptiveResult };
