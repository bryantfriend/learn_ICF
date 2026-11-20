import { createBooking } from './booking.mjs';

const form = document.getElementById('booking');
const status = document.getElementById('status');
const trace = document.getElementById('trace');
const button = form.querySelector('button');
let reserve;

async function start() {
  try {
    const response = await fetch('./seats.json');
    if (!response.ok) throw new Error('Could not load seats.');
    const catalog = await response.json();
    reserve = createBooking(catalog.seats);
    button.disabled = false;
    status.textContent = 'Ready. Pick a seat and book it.';
  } catch (error) {
    status.textContent = 'Could not load seats. Check that the local server is running and reload the page.';
    console.error(error);
  }
}

form.addEventListener('submit', async function submit(event) {
  event.preventDefault();
  if (!reserve || button.disabled) return;
  button.disabled = true;
  try {
    const fields = new FormData(form);
    const result = await reserve({seatId:fields.get('seatId'), memberId:fields.get('memberId')});
    status.textContent = result.ok ? 'Booked ' + result.data.seatId + '.' : result.errors[0];
    trace.textContent = result.meta.pipelineTrace.map(step => step.stage + '.' + step.step + ' · ' + (step.ok ? 'Passed' : 'Stopped')).join('\n');
  } catch (error) {
    status.textContent = 'Booking failed. Try again.';
    console.error(error);
  } finally {
    button.disabled = false;
  }
});
start();
