import pipeline from './Template/ICF/engine/pipeline.js';
import intentRegistry from './Template/ICF/engine/intentRegistry.js';

function createLibraryIntent(actor, payload, options) {
  return { type: 'BorrowBookIntent', actor: actor, payload: payload, context: {}, meta: { source: 'academy-mission' }, stages: options.stages };
}
intentRegistry.registerIntent('BorrowBookIntent', createLibraryIntent);

var stageNames = pipeline.REQUIRED_STAGE_NAMES;
var librarySteps = {
  Validate: 'requireBookId', Normalize: 'trimBookId', AddContext: 'loadLibraryRecord',
  Authorize: 'authorizeLoan', Process: 'recordLoan', Emit: 'notifyBorrower'
};
var scenarios = {
  success: 'A member borrows an available book', invalid: 'Missing book ID',
  denied: 'Not a library member', unavailable: 'Book already on loan',
  'emit-failure': 'Notification fails after the loan saves'
};
var generation = 0;
var advance = null;
var currentIntent = { type: 'BorrowBookIntent', actor: { id: 'ava' }, payload: { bookId: ' moon-atlas ' }, context: {} };
var library = { available: 1, loans: 0 };
var statuses = [];
var descriptions = [
  ['Is the request usable?', 'Check that bookId is text and contains a book ID. This step only checks the request.'],
  ['Make the input consistent.', 'Trim the spaces from “ moon-atlas ”. Normalize tidies up the input after Validate checks it.'],
  ['Load facts we can trust.', 'Look up Ava’s membership and the book’s availability in the library records. Check the library records to know whether Ava is a member.'],
  ['Is Ava allowed to do this?', 'Only a library member can borrow an available book. A valid request can still be denied.'],
  ['Make the important change.', 'Record Ava’s loan and remove the book from the available shelf. In a real app, check that the book is still free as part of saving the loan. That way two people cannot borrow the same copy.'],
  ['Share the outcome.', 'Send Ava a message with the loan details. If the message fails, the loan is still saved. Try sending the message again without making a new loan.']
];
function drawPipeline() {
  document.getElementById('pipeline').innerHTML = stageNames.map(function (name, index) {
    var status = statuses[index] || 'waiting';
    return '<li class="' + status + '">' + (index + 1) + '. ' + name + '<small>' + status + '</small></li>';
  }).join('');
}
function drawSnapshot() {
  document.getElementById('intentSnapshot').textContent = JSON.stringify({ type: currentIntent.type, actor: currentIntent.actor, payload: currentIntent.payload, context: currentIntent.context }, null, 2);
  document.getElementById('libraryState').textContent = 'Shelf: ' + library.available + ' book · Ava’s loans: ' + library.loans;
}
async function startMission() {
  generation += 1;
  var runId = generation;
  if (advance) { advance(); advance = null; }
  var scenario = document.getElementById('scenario').value;
  var runLibrary = { available: scenario === 'unavailable' ? 0 : 1, loans: 0 };
  library = runLibrary;
  statuses = [];
  var intent = {
    type: 'BorrowBookIntent', actor: { id: 'ava' },
    payload: { bookId: scenario === 'invalid' ? '' : ' moon-atlas ' },
    context: {}, meta: { source: 'academy-mission' }, stages: {}
  };
  // Named lesson steps pause for inspection; the real template runner controls their order.
  stageNames.forEach(function (name, index) {
    intent.stages[name] = { [librarySteps[name]]: async function (value) {
      if (runId !== generation) { return { ok: false, errors: ['Run replaced.'] }; }
      currentIntent = value;
      statuses[index] = 'active';
      drawPipeline(); drawSnapshot();
      document.getElementById('stageCounter').textContent = 'STAGE ' + (index + 1) + ' OF 6 · ' + name;
      document.getElementById('stageTitle').textContent = descriptions[index][0];
      document.getElementById('stageExplanation').textContent = descriptions[index][1];
      document.getElementById('nextStage').disabled = false;
      document.getElementById('nextStage').textContent = 'Run ' + name + ' →';
      await new Promise(function (resolve) { advance = resolve; });
      if (runId !== generation) { return { ok: false, errors: ['Run replaced.'] }; }
      var error = '';
      if (name === 'Validate' && !value.payload.bookId.trim()) { error = 'A book ID is required. Fix the request before trying again.'; }
      if (name === 'Normalize') { value.payload.bookId = value.payload.bookId.trim(); }
      if (name === 'AddContext') { value.context = { member: scenario !== 'denied', available: runLibrary.available > 0 }; }
      if (name === 'Authorize' && !value.context.member) { error = 'Ava needs a library membership. Valid input does not grant permission.'; }
      if (name === 'Authorize' && !value.context.available) { error = 'This book is already on loan. No new loan was recorded.'; }
      if (name === 'Process') { runLibrary.available -= 1; runLibrary.loans += 1; value.context.resultData = { bookId: value.payload.bookId, borrower: value.actor.id }; }
      if (name === 'Emit' && scenario === 'emit-failure') { error = 'The loan is saved, but the notification failed. Retry delivery separately; do not repeat the loan.'; }
      if (name === 'Emit' && !error) { value.context.events = [{ type: 'BookBorrowed', bookId: value.payload.bookId }]; }
      statuses[index] = error ? 'failed' : 'passed';
      drawPipeline(); drawSnapshot();
      return error ? { ok: false, errors: [error] } : { ok: true, intent: value };
    } };
  });
  document.getElementById('missionFeedback').textContent = 'Run started: ' + scenarios[scenario] + '.';
  document.getElementById('runResult').textContent = 'Run in progress…';
  var created = intentRegistry.createIntent('BorrowBookIntent', intent.actor, intent.payload, { stages: intent.stages });
  var result = created.ok ? await pipeline.run(created.intent) : created;
  if (runId !== generation) { return; }
  advance = null;
  document.getElementById('nextStage').disabled = true;
  document.getElementById('nextStage').textContent = 'Run finished';
  document.getElementById('runResult').textContent = JSON.stringify(result, function (key, value) { return key === 'stages' ? '[six named stage groups]' : value; }, 2);
  var failedAt = result.step ? result.stage + '.' + result.step : result.stage;
  document.getElementById('missionFeedback').textContent = result.ok ? 'Ava has the book! All six stages passed. Try a failing situation next and compare the shelf.' : 'Stopped at ' + failedAt + '. ' + result.errors.join(' ');
}
document.getElementById('startMission').addEventListener('click', startMission);
document.getElementById('nextStage').addEventListener('click', function () {
  if (advance) { var resolve = advance; advance = null; document.getElementById('nextStage').disabled = true; resolve(); }
});
drawPipeline(); drawSnapshot();


import {guide} from './academy-content.mjs';
function filterGuide(){
  var query=document.getElementById('guideSearch').value.toLowerCase().trim();var visible=0;
  document.querySelectorAll('#guideEntries details').forEach(function(entry){entry.hidden=!entry.textContent.toLowerCase().includes(query);if(!entry.hidden)visible++;});
  document.getElementById('noResults').hidden=visible>0;
}
guide.forEach(function(entry){var details=document.createElement('details');details.id='guide-'+entry[0];var summary=document.createElement('summary');summary.textContent=entry[1];var p=document.createElement('p');p.textContent=entry[2];details.append(summary,p);document.getElementById('guideEntries').append(details);});
document.getElementById('guideSearch').addEventListener('input',filterGuide);
function openTarget(){var target=document.getElementById(location.hash.slice(1));if(target&&target.tagName==='DETAILS'){target.open=true;target.scrollIntoView();}}
window.addEventListener('hashchange',openTarget);openTarget();
