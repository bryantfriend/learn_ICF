import pipeline from '../Template/ICF/engine/pipeline.js';

const members = new Set(['ava', 'bo']);

export function createBooking(seatIds) {
  const owners = new Map(seatIds.map(id => [id, null]));

  function checkSeat(intent) {
    const id = intent.payload.seatId;
    if (typeof id !== 'string' || !id.trim()) return {ok:false, errors:['Enter a seat ID.']};
    return {ok:true};
  }

  function cleanSeat(intent) {
    intent.payload.seatId = intent.payload.seatId.trim().toUpperCase();
    return {ok:true, intent};
  }

  function readSeat(intent) {
    const id = intent.payload.seatId;
    if (!owners.has(id)) return {ok:false, errors:['Seat not found. Try A1 or B2.']};
    intent.context.owner = owners.get(id);
    intent.context.isMember = members.has(intent.actor.id);
    return {ok:true, intent};
  }

  function canBook(intent) {
    if (!intent.context.isMember) return {ok:false, errors:['Only sample members can book a seat.']};
    if (intent.context.owner !== null) return {ok:false, errors:['That seat is already booked.']};
    return {ok:true};
  }

  function saveSeat(intent) {
    const seatId = intent.payload.seatId;
    // Check and write together in this one browser. A real database needs its own transaction.
    if (owners.get(seatId) !== null) return {ok:false, errors:['That seat is already booked.']};
    owners.set(seatId, intent.actor.id);
    intent.context.resultData = {seatId};
    return {ok:true, intent};
  }

  function makeReceipt(intent) {
    intent.context.events = [{type:'SeatReserved', seatId:intent.context.resultData.seatId}];
    return {ok:true, intent};
  }

  return function reserve({seatId, memberId}) {
    return pipeline.run({
      type:'StudySeatIntent',
      actor:{id:memberId || 'guest'},
      payload:{seatId},
      context:{},
      meta:{source:'seat-project'},
      stages:{
        Validate:{checkSeat}, Normalize:{cleanSeat}, AddContext:{readSeat},
        Authorize:{canBook}, Process:{saveSeat}, Emit:{makeReceipt}
      }
    });
  };
}
