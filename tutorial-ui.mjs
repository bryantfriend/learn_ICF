import { icon } from './tutorial-icons.mjs';

export function escapeHTML(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
export function prose(value) {
  const tick = String.fromCharCode(96);
  return escapeHTML(value).replace(new RegExp(tick + '([^' + tick + ']+)' + tick,'g'),'<code>$1</code>');
}
export function link(href,label,className) {
  return '<a href="' + escapeHTML(href) + '" class="' + (className || '') + '">' + escapeHTML(label) + '</a>';
}
export function kicker(text) { return '<p class="kicker">' + escapeHTML(text) + '</p>'; }
export function pageIntro(category,title,description) {
  return '<header class="page-intro">' + kicker(category) + '<h1>' + escapeHTML(title) + '</h1><p>' + prose(description) + '</p></header>';
}
export function listRow(href,title,subheading,symbol) {
  return '<a class="list-row" href="' + escapeHTML(href) + '"><span class="row-symbol">' + icon(symbol) + '</span><span><strong>' + escapeHTML(title) + '</strong><small>' + prose(subheading) + '</small></span>' + icon('chevron') + '</a>';
}
export function codeBlock(value, label) {
  return '<div class="lesson-code"><div class="code-header"><span>' + escapeHTML(label || 'Example') + '</span><button type="button" class="copy-code">Copy</button></div><pre tabindex="0"><code>' + escapeHTML(value) + '</code></pre></div>';
}
export async function copyCode(button) {
  const code = button.closest('.lesson-code').querySelector('code');
  try {
    await navigator.clipboard.writeText(code.textContent);
    button.textContent = 'Copied';
  } catch {
    const selection = window.getSelection(), range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    button.textContent = 'Code selected';
  }
}
