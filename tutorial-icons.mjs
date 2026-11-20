const shapes = {
  home: '<path d="m3 10 9-7 9 7v10h-6v-7H9v7H3z"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.8"/><path d="m16 16 4.8 4.8"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  github: '<path fill="currentColor" stroke="none" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.06c-3.11.68-3.77-1.32-3.77-1.32-.51-1.29-1.25-1.63-1.25-1.63-1.01-.69.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 .72 1.72 1.39 3.27.99.1-.73.4-1.22.71-1.5-2.49-.28-5.1-1.25-5.1-5.54 0-1.22.44-2.22 1.16-3-.12-.28-.51-1.42.11-2.96 0 0 .94-.3 3.05 1.15A10.7 10.7 0 0 1 12 6.24c.94 0 1.88.13 2.77.37 2.12-1.45 3.05-1.15 3.05-1.15.62 1.54.23 2.68.12 2.96a4.33 4.33 0 0 1 1.15 3c0 4.3-2.62 5.25-5.12 5.53.41.35.77 1.02.77 2.06v2.99c0 .3.2.64.77.53A11.1 11.1 0 0 0 12 .9Z"/>',
  book: '<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v19H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h13M9 6h7M9 9h5"/>',
  'book-open':'<path d="M12 6c-3-2.3-6-2.4-10-1v14c4-1.4 7-1.3 10 1 3-2.3 6-2.4 10-1V5c-4-1.4-7-1.3-10 1zM12 6v14"/>',
  blocks: '<path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  'check-box':'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/>',
  sliders: '<path d="M3 6h8m4 0h6M3 17h3m4 0h11"/><circle cx="13" cy="6" r="2"/><circle cx="8" cy="17" r="2"/>',
  database: '<ellipse cx="12" cy="5.5" rx="8" ry="3.5"/><path d="M4 5.5v13c0 4.6 16 4.6 16 0v-13M4 12c0 4.6 16 4.6 16 0"/>',
  shield: '<path d="M12 2 20.5 5v6c0 5-3.7 8.8-8.5 11-4.8-2.2-8.5-6-8.5-11V5z"/><path d="m8 12 3 3 5-6"/>',
  cog: '<path d="m9.5 3 .6-1h3.8l.6 2 2 .9 2-.6 1.9 3.3-1.5 1.5.2 2.3 1.7 1.4-1.4 3.6-2.2-.2-1.8 1.4-.2 2.2-3.8.7-1-1.9-2.2-.5-1.9 1.1-2.7-2.7 1.1-1.9-.5-2.2-1.9-1 .7-3.8 2.2-.2L6.7 7l-.2-2.2L10.1 3"/><circle cx="12" cy="11.7" r="3"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 10-13h-7z"/>',
  radio: '<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4m8.4-8.4a6 6 0 0 1 0 8.4M4.3 4.3a11 11 0 0 0 0 15.4M19.7 4.3a11 11 0 0 1 0 15.4"/>',
  terminal: '<rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="m6 9 3.5 3L6 15m6 .5h5"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.1M3 12h.1M3 18h.1"/>',
  route: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M6 9v7a2 2 0 0 0 2 2h7M9 6h7a2 2 0 0 1 2 2v3"/>',
  pencil: '<path d="m3 16 12-12 5 5L8 21l-6 1zM12 7l5 5"/>',
  activity: '<path d="M3 20h18M5 16v-5m6 5V6m6 10V3"/>',
  file: '<path d="M5 2h9l5 5v15H5zM14 2v6h5M8 12h8m-8 4h6"/>',
  external: '<path d="M14 3h7v7m0-7L11 13M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  box: '<path d="m12 2 9 5v10l-9 5-9-5V7zm0 10L3 7m9 5 9-5m-9 5v10"/>'
};
export function icon(name) {
  return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (shapes[name] || shapes.file) + '</svg>';
}
