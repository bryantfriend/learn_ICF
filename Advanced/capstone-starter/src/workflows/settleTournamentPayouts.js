const classifyFailure = require("../reliability/classifyFailure");
const shouldRetry = require("../reliability/shouldRetry");
const buildAuditRecord = require("../observability/buildAuditRecord");
const finalizeSettlement = require("../finalize/finalizeSettlement");

function settleTournamentPayouts(workflowInput, dependencies) {
  const workflowMap = [
    "reserveFunds",
    "writePayouts",
    "emitNotifications"
  ];

  try {
    dependencies.reserveFunds(workflowInput);
    dependencies.writePayouts(workflowInput);
    dependencies.emitNotifications(workflowInput);

    return {
      ok: true,
      workflowMap,
      audit: buildAuditRecord("settleTournamentPayouts", "success"),
      result: finalizeSettlement({
        status: "complete",
        workflowInput
      })
    };
  } catch (error) {
    const failure = classifyFailure(error);
    return {
      ok: false,
      workflowMap,
      audit: buildAuditRecord("settleTournamentPayouts", failure.level),
      retry: shouldRetry(failure),
      escalationRoute: failure.escalationRoute
    };
  }
}

module.exports = settleTournamentPayouts;
