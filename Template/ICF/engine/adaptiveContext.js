// Pure, deterministic ranking. Providers verify access before supplying candidates.
function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(label + " must be an object.");
  }
}

function requireText(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(label + " must be a nonempty string.");
  }
}

function requireNumber(value, minimum, maximum, label) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(label + " must be a finite number from " + minimum + " to " + maximum + ".");
  }
}

function validateContextPolicy(policy) {
  requireObject(policy, "Policy");
  requireText(policy.id, "Policy ID");
  requireText(policy.intentType, "Intent type");
  requireText(policy.scope, "Policy scope");
  if (!Number.isSafeInteger(policy.version) || policy.version < 1) {
    throw new Error("Policy version must be a positive safe integer.");
  }
  if (!Number.isSafeInteger(policy.maxCandidates) || policy.maxCandidates < 1 || policy.maxCandidates > 100) {
    throw new Error("Context budget must be an integer from 1 to 100.");
  }
  requireNumber(policy.minimumScore, 0, 100, "Minimum score");
  if (typeof policy.requireSelection !== "boolean") {
    throw new Error("Declare requireSelection explicitly.");
  }
  if (!Array.isArray(policy.allowedSources) || policy.allowedSources.length === 0) {
    throw new Error("Declare at least one allowed source.");
  }
  policy.allowedSources.forEach(function validateSource(source) { requireText(source, "Source"); });
  requireObject(policy.categories, "Categories");
  if (Object.keys(policy.categories).length === 0) { throw new Error("Declare at least one category."); }
  Object.keys(policy.categories).forEach(function validateCategory(name) {
    requireText(name, "Category name");
    var rule = policy.categories[name];
    var path = "categories." + name;
    requireObject(rule, path);
    requireNumber(rule.baseScore, 0, 100, path + ".baseScore");
    requireObject(rule.factors, path + ".factors");
    Object.keys(rule.factors).forEach(function validateFactor(factor) {
      requireText(factor, "Factor name");
      requireNumber(rule.factors[factor], -100, 100, path + ".factors." + factor);
    });
  });
  return policy;
}

function scoreContextCandidate(rule, signals) {
  requireNumber(rule.baseScore, 0, 100, "Base score");
  requireObject(rule.factors, "Factors");
  requireObject(signals, "Signals");
  var total = rule.baseScore;
  var contributions = [];
  Object.keys(rule.factors).sort().forEach(function applyFactor(name) {
    var weight = rule.factors[name];
    requireNumber(weight, -100, 100, "Factor weight");
    var missing = !Object.hasOwn(signals, name);
    var value = 0;
    if (!missing) { value = signals[name]; }
    requireNumber(value, -1, 1, "Signal " + name);
    var adjustment = weight * value;
    total = total + adjustment;
    contributions.push({ factor: name, weight: weight, value: value, adjustment: adjustment, missing: missing });
  });
  return { baseScore: rule.baseScore, score: Math.max(0, Math.min(100, total)), contributions: contributions };
}

function compareRankedCandidates(first, second) {
  if (first.score !== second.score) { return second.score - first.score; }
  return compareCandidateIds(first, second);
}

function compareCandidateIds(first, second) {
  if (first.id < second.id) { return -1; }
  if (first.id > second.id) { return 1; }
  return 0;
}

// The failure travels through the pipeline's errors array. Keep candidate data out of it.
function explainEmptySelection(trace) {
  var message = "No eligible context meets the selection policy.";
  if (trace.length === 0) {
    return message + " No candidates were supplied.";
  }
  var counts = {};
  for (var entry of trace) {
    var reason = entry.reason;
    if (!Object.hasOwn(counts, reason)) { counts[reason] = 0; }
    counts[reason] += 1;
  }
  var reasons = Object.keys(counts).sort().map(function describeCount(reason) {
    return reason + "=" + counts[reason];
  });
  return message + " Exclusions: " + reasons.join(", ") + ".";
}

function rankContextCandidates(candidates, signals, policy, execution) {
  validateContextPolicy(policy);
  requireObject(execution, "Execution");
  requireNumber(execution.evaluatedAt, 0, Number.MAX_SAFE_INTEGER, "Evaluation time");
  requireText(execution.signalSnapshotId, "Signal snapshot ID");
  if (execution.intentType !== policy.intentType || execution.scope !== policy.scope) {
    throw new Error("Policy does not match this intent and scope.");
  }
  requireObject(signals, "Signals");
  Object.keys(signals).forEach(function validateSignal(name) { requireNumber(signals[name], -1, 1, "Signal " + name); });
  if (!Array.isArray(candidates)) { throw new Error("Candidates must be an array."); }
  var seen = new Set();
  var ranked = [];
  var trace = [];
  candidates.forEach(function evaluateCandidate(candidate) {
    requireObject(candidate, "Candidate");
    requireText(candidate.id, "Candidate ID");
    requireText(candidate.revision, "Candidate revision");
    requireText(candidate.source, "Candidate source");
    requireText(candidate.category, "Candidate category");
    requireText(candidate.scope, "Candidate scope");
    requireNumber(candidate.observedAt, 0, Number.MAX_SAFE_INTEGER, "Observation time");
    requireNumber(candidate.expiresAt, candidate.observedAt, Number.MAX_SAFE_INTEGER, "Expiry time");
    // Duplicate identities may conceal conflicting revisions; fail instead of choosing by input order.
    if (seen.has(candidate.id)) { throw new Error("Duplicate candidate ID: " + candidate.id); }
    seen.add(candidate.id);
    var reason = "";
    if (candidate.accessible !== true) { reason = "inaccessible"; }
    else if (candidate.scope !== execution.scope) { reason = "out-of-scope"; }
    else if (!policy.allowedSources.includes(candidate.source)) { reason = "unsupported-source"; }
    else if (!Object.hasOwn(policy.categories, candidate.category)) { reason = "unsupported-category"; }
    else if (candidate.observedAt > execution.evaluatedAt) { reason = "future-observation"; }
    else if (candidate.expiresAt <= execution.evaluatedAt) { reason = "expired"; }
    if (reason) {
      trace.push({ id: candidate.id, revision: candidate.revision, reason: reason });
      return;
    }
    var score = scoreContextCandidate(policy.categories[candidate.category], signals);
    ranked.push({ id: candidate.id, revision: candidate.revision, source: candidate.source,
      category: candidate.category, baseScore: score.baseScore, score: score.score,
      contributions: score.contributions, candidate: candidate });
  });
  // Sources may deliver the same evidence in different orders. Keep both parts of the trace replayable.
  trace.sort(compareCandidateIds);
  ranked.sort(compareRankedCandidates);
  var selected = [];
  ranked.forEach(function selectCandidate(entry) {
    var reason = "selected";
    if (entry.score < policy.minimumScore) { reason = "below-threshold"; }
    else if (selected.length >= policy.maxCandidates) { reason = "budget"; }
    else { selected.push({ id: entry.id, score: entry.score, candidate: structuredClone(entry.candidate) }); }
    trace.push({ id: entry.id, revision: entry.revision, source: entry.source,
      baseScore: entry.baseScore, score: entry.score, contributions: entry.contributions, reason: reason });
  });
  if (policy.requireSelection && selected.length === 0) {
    throw new Error(explainEmptySelection(trace));
  }
  return { policyId: policy.id, policyVersion: policy.version, evaluatedAt: execution.evaluatedAt,
    signalSnapshotId: execution.signalSnapshotId, selected: selected, decisionTrace: trace };
}

export { validateContextPolicy, scoreContextCandidate, rankContextCandidates };
