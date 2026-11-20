import { chapters } from './tutorial-lessons.mjs';
import { lessons as activities, tracks } from './academy-course.mjs';
import { guide } from './academy-content.mjs';
import { mountExample, mountPlayground } from './tutorial-playground.mjs';
import { drawDiagram } from './tutorial-diagram.mjs';
import { icon } from './tutorial-icons.mjs';
import { escapeHTML, prose, link, kicker, pageIntro, listRow, codeBlock, copyCode } from './tutorial-ui.mjs';
import { exampleGroups, examples, apiGroups, apiEntries, wikiNav, wikiPage, wikiSearch } from './tutorial-wiki.mjs';
import { mountTryExample } from './tutorial-try.mjs';

const overview = '#overview';
const firstLesson = '#lesson/what-is-icf';
const namedChapters = {
  foundations: 'Getting started', stages: 'The six stages', composition: 'Putting steps together',
  reliability: 'Fixing and testing code', adaptive: 'Adaptive Context', applications: 'Project examples'
};
const chapterIcons = ['book-open', 'blocks', 'route', 'shield', 'sliders', 'box'];
const stageCards = [
  ['validate', 'Validate', 'Check the input', 'check-box', 'teal'],
  ['normalize', 'Normalize', 'Clean the data', 'sliders', 'blue'],
  ['add-context', 'AddContext', 'Look up facts', 'database', 'violet'],
  ['authorize', 'Authorize', 'Check permission', 'shield', 'amber'],
  ['process', 'Process', 'Make the change', 'bolt', 'rose'],
  ['emit', 'Emit', 'Share the result', 'radio', 'sky']
];
const chapterDescriptions = {
  foundations: 'See what goes in a request and what the app sends back.',
  stages: 'See what each step does and when it can stop a request.',
  composition: 'Put the steps together and show the app how to make a new request.',
  reliability: 'Find where a request stopped. Check what saved before you try again.',
  adaptive: 'See how clues like recent mistakes can change which lesson the app picks.',
  applications: 'Try ICF in a library app or a Roblox game.'
};
const readings = [];
const chapterFor = new Map();
for (const chapter of chapters) {
  for (const lesson of chapter.lessons) {
    readings.push(lesson);
    chapterFor.set(lesson.id, chapter);
  }
}
const view = document.getElementById('view');
const reader = document.getElementById('reader');
const nav = document.getElementById('tutorialNav');
const dialog = document.getElementById('searchDialog');
const searchInput = document.getElementById('searchInput');
const expanded = new Set(['foundations','stages']);
const storedAnswers = new Map();
let currentRoute = '';
let stopExample = null;
function lessonURL(lesson) { return '#lesson/' + lesson.id; }
function sectionName(chapter) { return namedChapters[chapter.id] || chapter.title; }
function buttonLink(href, label, symbol, style) {
  return '<a class="action ' + style + '" href="' + href + '">' + icon(symbol) + escapeHTML(label) + '</a>';
}
function breadcrumb(parts) {
  const items = ['<a href="#overview" aria-label="Academy home">' + icon('home') + '</a>'];
  for (const [title, href] of parts) {
    items.push(icon('chevron'), href ? link(href, title) : '<span aria-current="page">' + escapeHTML(title) + '</span>');
  }
  document.getElementById('breadcrumb').innerHTML = items.join('');
}
const sidebarSections = [
  {title:'', nodes:[
    {label:'Wiki overview',href:overview,symbol:'home'},
    {label:'Set up and use offline',href:'#setup',symbol:'box'},
    {label:'Build a complete feature',href:'#build',symbol:'route'},
    ...wikiNav,
    {id:'field-guide',label:'Concept reference',href:'#reference',count:guide.length,children:guide.map(function term(entry) { return {label:entry[1],href:'#reference/'+entry[0]}; })}
  ]},
  {title:'Framework topics',nodes:chapters.map(function chapterItem(c) {
    return {id:c.id,label:sectionName(c),href:'#chapter/'+c.id,children:c.lessons.map(function lessonItem(l) {
      const stage = stageCards.find(function match(s) { return s[0] === l.id; });
      return {label:stage ? stage[1] : l.title,href:lessonURL(l)};
    })};
  })},
  {title:'Practice and tools',nodes:[
    {id:'studio',label:'Studio activities',href:'#exercises',count:activities.length,children:tracks.map(function trackItem(t) {
      return {id:'track-'+t.id,label:t.title,href:'#exercises/'+t.id,children:activities.filter(function match(a) { return a.track === t.id; }).map(function activity(a) { return {label:a.title,href:'studio.html#'+a.id}; })};
    })},
    {label:'Pipeline playground',href:'#playground',symbol:'terminal'},
    {label:'Library sandbox',href:'reference.html#mission',symbol:'blocks'},
    {label:'My academy progress',href:'academy.html',symbol:'activity'}
  ]}
];
function containsPage(item,url) {
  return item.href === url || Boolean(item.children && item.children.some(function match(child) { return containsPage(child,url); }));
}
function navItem(item,depth) {
  const selected = item.href === currentRoute;
  const active = selected ? ' aria-current="page"' : '';
  const badge = item.count ? '<span class="nav-count">'+item.count+'</span>' : '';
  if (!item.children) return '<a class="nav-item" href="'+escapeHTML(item.href)+'"'+active+'>'+ (item.symbol ? icon(item.symbol) : '') +'<span>'+escapeHTML(item.label)+'</span></a>';
  const open = expanded.has(item.id);
  return '<div class="nav-group depth-'+depth+'"><div class="nav-group-head"><a href="'+item.href+'"'+active+'>'+escapeHTML(item.label)+badge+'</a><button class="group-toggle" aria-label="Toggle '+escapeHTML(item.label)+'" data-group="'+item.id+'" aria-controls="group-'+item.id+'" aria-expanded="'+open+'">'+icon('down')+'</button></div><div class="group-links" id="group-'+item.id+'"'+(open ? '' : ' hidden')+'>' +
    item.children.map(function child(e) { return navItem(e,depth+1); }).join('') + '</div></div>';
}
function revealPath(node) {
  if (!node.children || !containsPage(node,currentRoute)) return;
  expanded.add(node.id);
  node.children.forEach(revealPath);
}
function renderSidebar() {
  const filter = document.getElementById('navFilter');
  const term = filter.value.trim().toLowerCase();
  if (term) {
    const matches = rankedItems(term);
    nav.innerHTML = '<div class="nav-results"><p class="side-label" role="status">' + matches.length + ' matches</p>' + matches.map(function match(r) {
      return '<a class="nav-result" href="'+escapeHTML(r.href)+'"><strong>'+escapeHTML(r.title)+'</strong><small>'+escapeHTML(r.category)+'</small></a>';
    }).join('') + (matches.length ? '' : '<p>Try a stage, helper, or error message.</p>') + '</div>';
    return;
  }
  nav.innerHTML = sidebarSections.map(function section(s) {
    return (s.title ? '<p class="nav-section-label">'+escapeHTML(s.title)+'</p>' : '') + s.nodes.map(function item(n) { return navItem(n,0); }).join('');
  }).join('');
}
nav.addEventListener('click',function toggleGroup(event) {
  const button = event.target.closest('button[data-group]');
  if (!button) return;
  const id = button.dataset.group;
  if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
  button.setAttribute('aria-expanded',String(expanded.has(id)));
  document.getElementById('group-'+id).hidden = !expanded.has(id);
});
document.getElementById('navFilter').addEventListener('input',renderSidebar);
function cardForChapter(chapter, index) {
  const lessons = chapter.lessons;
  return '<a class="chapter-card" href="#chapter/' + chapter.id + '"><span class="chapter-symbol">' + icon(chapterIcons[index]) + '</span><div><p class="small-meta">' + lessons.length + ' topics</p><h3>' + escapeHTML(sectionName(chapter)) + '</h3><p>' + escapeHTML(chapterDescriptions[chapter.id] || '') + '</p></div></a>';
}
function renderHome() {
  breadcrumb([['Wiki', '#overview'], ['Overview']]);
  const cards = stageCards.map(function stageCard([id, title, caption, symbol, color], index) {
    return '<a href="#lesson/' + id + '" class="stage-card ' + color + '"><div class="stage-top"><span class="stage-icon">' + icon(symbol) + '</span><span class="stage-index">' + String(index + 1).padStart(2,'0') + '</span></div><strong>' + title + '</strong><span>' + caption + '</span></a>';
  });
  const picks = ['parse-price','verify-draft-owner','inspect-emit-failure'].map(function findExample(id) { return examples.find(function match(e) { return e.id === id; }); });
  view.innerHTML = '<section class="hero"><div class="hero-copy"><p class="hero-kicker"><i></i>Intent-Centric Framework</p><h1>ICF Wiki</h1><p class="hero-description">What happens after you click Borrow, Buy, or Save? ICF gives the app six steps to follow. Learn each step, try it with code, and find out where to look when something goes wrong.</p><div class="hero-actions">' +
    buttonLink('#examples', 'Browse examples', 'code', 'bright') + buttonLink('#build', 'Build a feature', 'route', 'ghost') +
    '</div></div><div class="hero-art"><canvas id="heroDiagram" width="430" height="270" role="img" aria-label="Three connected layers of the framework: Intent, Context, and Flow."></canvas></div></section>' +
    '<section class="home-section"><div class="section-heading"><h2>The six-stage pipeline</h2>' + link('#chapter/stages', 'Stage guide', 'sub-link') + '</div><p class="section-description">The runner is the code that calls these six steps in order. If a step fails, the runner stops. Pick a step to see what it does.</p><div class="stage-grid">' + cards.join('') + '</div></section>' +
    '<section class="home-section"><div class="section-heading"><h2>Find a worked example</h2>' + link('#examples','All '+examples.length+' examples','sub-link') + '</div><div class="featured-examples">' + picks.map(function featured(e) { return '<a href="#example/'+e.id+'"><span class="feature-symbol">'+icon('code')+'</span><div><strong>'+escapeHTML(e.title)+'</strong><p>'+escapeHTML(e.task)+'</p></div></a>'; }).join('') + '</div></section>' +
    '<section class="home-section example-section"><div class="section-heading"><div>' + kicker('Interactive example') + '<h2>Run your first Intent</h2></div></div><div class="example-layout"><div><p class="section-description">Ask the app what to study next and see which lesson it chooses.</p><div id="homeExample"></div></div><aside class="example-guide"><span class="guide-icon">' + icon('route') + '</span><h3>Follow the request</h3><ol><li><strong>Make the request</strong><span>A learner asks the app what to study next.</span></li><li><strong>Run the pipeline</strong><span>Six stages check and carry out the request.</span></li><li><strong>Read the result</strong><span>Look for the lesson the app picked in <code>result.data</code>.</span></li></ol>' + link('#playground', 'Try other inputs', 'sub-link') + '</aside></div></section>' +
    '<section class="home-section"><div class="section-heading"><h2>Browse by topic</h2>' + link('#curriculum','All topics','sub-link') + '</div><p class="section-description">' + readings.length + ' guides on making requests, fixing errors, and building apps and games.</p><div class="chapter-grid">' + chapters.map(cardForChapter).join('') + '</div></section>';
  drawDiagram(document.getElementById('heroDiagram'));
  mountExample(document.getElementById('homeExample'));
}
function renderCurriculum(chapter) {
  breadcrumb(chapter ? [['Topics','#curriculum'],[sectionName(chapter)]] : [['Topics']]);
  if (!chapter) {
    view.innerHTML = pageIntro('Wiki contents', 'All topics', 'Pick a topic to see what it means, try an example, and practice in the studio.') +
      chapters.map(function group(item) {
        return '<section class="listing"><h2>' + link('#chapter/' + item.id, sectionName(item)) + '</h2>' + item.lessons.map(function entry(lesson) { return listRow(lessonURL(lesson), lesson.title, lesson.summary, 'file'); }).join('') + '</section>';
      }).join('');
    return;
  }
  view.innerHTML = pageIntro('Wiki topics', sectionName(chapter), chapterDescriptions[chapter.id]) +
    '<div class="listing">' + chapter.lessons.map(function entry(lesson) { return listRow(lessonURL(lesson), lesson.title, lesson.summary, 'file'); }).join('') + '</div>';
}
function renderLesson(lesson) {
  const chapter = chapterFor.get(lesson.id);
  breadcrumb([['Topics','#curriculum'],[sectionName(chapter),'#chapter/' + chapter.id],[lesson.title]]);
  const idx = readings.indexOf(lesson);
  const sections = lesson.sections.map(function section(item, i) {
    const paragraphs = String(item.body).split(/\n\s*\n/).map(function paragraph(p) { return '<p>' + prose(p) + '</p>'; }).join('');
    const code = item.code ? codeBlock(item.code,item.language) : '';
    return '<section class="lesson-section" id="section-' + i + '"><h2>' + escapeHTML(item.title) + '</h2>' + paragraphs + code + '</section>';
  }).join('');
  const options = lesson.question.options.map(function option(value, i) {
    return '<label class="quiz-choice"><input type="radio" name="answer" value="' + i + '"><span>' + prose(value) + '</span></label>';
  }).join('');
  const previous = readings[idx - 1], next = readings[idx + 1];
  const practice = activities.find(function activity(item) { return item.id === lesson.practice; });
  view.innerHTML = pageIntro(sectionName(chapter), lesson.title, lesson.summary) +
    '<div class="article-layout"><article class="lesson-text">' + sections + '<form class="knowledge-check" id="quiz">' + kicker('Knowledge check') + '<fieldset><legend>' + prose(lesson.question.prompt) + '</legend>' + options + '</fieldset><button type="submit" class="action primary">Check answer</button><p class="quiz-feedback" role="status"></p></form>' +
    (practice ? '<section class="practice-callout">' + kicker('Practice in the studio') + listRow('studio.html#' + practice.id,practice.title,practice.summary,'terminal') + '</section>' : '') +
    '<nav class="lesson-pager" aria-label="Lesson navigation"><a href="' + (previous ? lessonURL(previous) : overview) + '"><small>Previous</small>' + escapeHTML(previous ? previous.title : 'Tutorial overview') + '</a><a href="' + (next ? lessonURL(next) : '#exercises') + '"><small>Next</small>' + escapeHTML(next ? next.title : 'Exercise library') + '</a></nav></article>' +
    '<aside class="contents"><p class="side-label">On this page</p>' + lesson.sections.map(function toc(item,i) { return '<button data-scroll="section-' + i + '">' + escapeHTML(item.title) + '</button>'; }).join('') + '<button data-scroll="quiz">Knowledge check</button></aside></div>';
  const relatedExamples = examples.filter(function match(e) { return e.related === lesson.id; });
  const form = document.getElementById('quiz');
  if (relatedExamples.length) {
    form.insertAdjacentHTML('beforebegin','<section class="listing topic-examples"><h2>Worked examples</h2>'+relatedExamples.map(function row(e) { return listRow('#example/'+e.id,e.title,e.task,'code'); }).join('')+'</section>');
  }
  function displayAnswer(index) {
    const ok = index === lesson.question.answer;
    const feedback = form.querySelector('.quiz-feedback');
    feedback.className = 'quiz-feedback ' + (ok ? 'correct' : 'incorrect');
    feedback.textContent = (ok ? 'Correct. ' : 'Try again. ') + lesson.question.explanation.replaceAll(String.fromCharCode(96), '');
  }
  if (storedAnswers.has(lesson.id)) {
    const answer = storedAnswers.get(lesson.id);
    form.elements.answer.value = String(answer);
    displayAnswer(answer);
  }
  form.addEventListener('submit', function checkAnswer(event) {
    event.preventDefault();
    if (form.elements.answer.value === '') {
      form.querySelector('.quiz-feedback').textContent = 'Choose an answer first.';
      return;
    }
    const index = Number(form.elements.answer.value);
    storedAnswers.set(lesson.id, index);
    displayAnswer(index);
  });
  for (const button of view.querySelectorAll('[data-scroll]')) {
    button.addEventListener('click', function goToSection() { document.getElementById(button.dataset.scroll).scrollIntoView({block:'start'}); });
  }
}
const resources = [
  ['Template quick start', 'Copy the project template and run its first Intent.', 'Template/README.md'],
  ['Current framework contract', 'Read the stage responsibilities, folder layout, and response shapes.', 'Template/ICF.md'],
  ['Adaptive Context guide', 'Inspect the evidence rules and versioned policy contract.', 'Template/ADAPTIVE_CONTEXT.md'],
  ['Original specification v1.0', 'Read the original design. The current template guide documents its implemented behavior.', 'ICF_Formal_Specification_v1.0.pdf'],
  ['Library pipeline sandbox', 'Step through a loan and inspect its state after each stage.', 'reference.html#mission']
];
function renderReference(id) {
  const entry = guide.find(function findEntry(row) { return row[0] === id; });
  breadcrumb(entry ? [['Reference','#reference'],[entry[1]]] : [['Reference']]);
  if (entry) {
    view.innerHTML = pageIntro('Framework reference',entry[1],entry[2]) + '<section class="listing"><h2>Keep reading</h2>' +
      resources.slice(0,3).map(function row(r) { return listRow(r[2],r[0],r[1],'book'); }).join('') + '</section>' + link('#reference','All reference entries','sub-link');
    return;
  }
  view.innerHTML = pageIntro('Field guide','Framework reference','Look up a term or see how the ICF code works.') +
    '<section class="listing"><h2>Standards and source material</h2>' + resources.map(function row(r) { return listRow(r[2],r[0],r[1],'book'); }).join('') + '</section><section class="listing"><h2>Reference entries</h2>' +
    guide.map(function row(r) { return '<div class="reference-entry"><h3>' + link('#reference/' + r[0], r[1]) + '</h3><p>' + prose(r[2]) + '</p></div>'; }).join('') + '</section>';
}
function renderExercises(track) {
  breadcrumb(track ? [['Exercises','#exercises'],[track.title]] : [['Exercises']]);
  const intro = track ? track.description : 'Choose from ' + activities.length + ' coding exercises, concept checks, and project plans. The studio saves progress in this browser.';
  let html = pageIntro('Hands-on practice',track ? track.title : 'Exercise library',intro);
  if (!track) {
    html += '<div class="progress-strip">' + icon('activity') + '<div><strong>Your academy progress</strong><p>Resume an activity or export your saved work.</p></div>' + link('academy.html','Open dashboard','sub-link') + '</div><div class="listing"><h2>Practice tracks</h2>' +
      tracks.map(function row(t) {
        const count = activities.filter(function inTrack(a) { return a.track === t.id; }).length;
        return listRow('#exercises/' + t.id,t.title,t.description + ' · ' + count + ' activities','terminal');
      }).join('') + '</div>';
  } else {
    html += '<div class="listing">' + activities.filter(function match(a) { return a.track === track.id; }).map(function row(a) {
      return listRow('studio.html#' + a.id,a.title,a.summary,'terminal');
    }).join('') + '</div>';
  }
  view.innerHTML = html;
}
function closeMenu() {
  document.body.classList.remove('menu-open');
  reader.inert = false;
  document.getElementById('menuOpen').setAttribute('aria-expanded','false');
  document.getElementById('menuScrim').hidden = true;
}
function renderRoute() {
  if (dialog.open) dialog.close();
  if (stopExample) { stopExample(); stopExample = null; }
  const route = location.hash || overview;
  const [category, id] = route.slice(1).split('/');
  let title = '', tab = 'tutorial';
  const lesson = readings.find(function match(r) { return r.id === id; });
  const chapter = chapters.find(function match(c) { return c.id === id; });
  currentRoute = route;
  closeMenu();
  const wiki = wikiPage(category,id);
  if (wiki) {
    title = wiki.title; tab = wiki.tab;
    breadcrumb(wiki.trail); view.innerHTML = wiki.html;
    const tryHost = document.getElementById('tryRecipe');
    if (tryHost) stopExample = mountTryExample(tryHost,examples.find(function match(e) { return e.id === id; }));
  } else if (category === 'lesson' && lesson) {
    expanded.add(chapterFor.get(id).id);
    renderLesson(lesson); title = lesson.title;
  } else if (category === 'curriculum' || category === 'chapter' && chapter) {
    if (chapter) expanded.add(chapter.id);
    renderCurriculum(chapter); title = chapter ? sectionName(chapter) : 'All topics';
  } else if (category === 'exercises') {
    const track = tracks.find(function match(t) { return t.id === id; });
    renderExercises(track); title = track ? track.title : 'Exercise library'; tab = 'exercises';
  } else if (category === 'reference') {
    renderReference(id); const entry = guide.find(function match(r) { return r[0] === id; });
    title = entry ? entry[1] : 'Framework reference'; tab = 'reference';
  } else if (category === 'playground') {
    breadcrumb([['Playground']]); view.innerHTML = pageIntro('Interactive lab','Pipeline playground','Try a request and watch which steps run, where it stops, and what it returns.') + '<div id="fullPlayground"></div>';
    mountPlayground(document.getElementById('fullPlayground')); title = 'Pipeline playground'; tab = 'playground';
  } else {
    currentRoute = overview; renderHome(); title = 'ICF Wiki';
  }
  for (const section of sidebarSections) section.nodes.forEach(revealPath);
  renderSidebar();
  for (const item of document.querySelectorAll('[data-tab]')) {
    if (item.dataset.tab === tab) item.setAttribute('aria-current','page');
    else item.removeAttribute('aria-current');
  }
  document.title = title + (currentRoute === overview ? ' · Intent-Centric Framework' : ' · ICF Wiki');
  window.scrollTo(0,0);
}
const searchItems = [];
function searchItem(title, category, href, detail, symbol) {
  searchItems.push({title,category,href,detail:detail.toLowerCase(),symbol});
}
for (const item of readings) {
  searchItem(item.title, sectionName(chapterFor.get(item.id)) + ' · Topic', lessonURL(item),
    item.summary + ' ' + item.sections.map(function content(s) { return s.title + ' ' + s.body; }).join(' '),'file');
}
for (const [id,title,summary] of guide) searchItem(title,'Reference','#reference/' + id,summary,'book-open');
for (const item of wikiSearch) searchItem(item.title,item.category,item.href,item.detail,item.symbol);
for (const c of chapters) searchItem(sectionName(c),'Topic collection','#chapter/'+c.id,chapterDescriptions[c.id],'book-open');
for (const t of tracks) searchItem(t.title,'Practice track','#exercises/'+t.id,t.description,'terminal');
for (const activity of activities) searchItem(activity.title,'Exercise · ' + activity.unit, 'studio.html#' + activity.id,activity.summary,'terminal');
searchItem('Pipeline playground','Interactive lab','#playground','Run a recommendation and inspect each stage','terminal');
let resultIndex = -1;
function rankedItems(query) {
    if (!query) return searchItems.filter(function suggested(item) { return ['#examples','#api','#build','#setup'].includes(item.href); });
    const terms = query.split(/\s+/);
    return searchItems.map(function rank(item) {
      const title = item.title.toLowerCase(), cat = item.category.toLowerCase(), text = title + ' ' + cat + ' ' + item.detail;
      let score = title === query ? 100 : title.includes(query) ? 30 : 0;
      for (const term of terms) {
        if (!text.includes(term)) return {item,score:0};
        score += title.includes(term) ? 6 : cat.includes(term) ? 3 : 1;
      }
      return {item,score};
    }).filter(function positive(match) { return match.score > 0; }).sort(function byScore(a,b) { return b.score - a.score; }).map(function unwrap(match) { return match.item; });
}
function renderSearch() {
  const query = searchInput.value.trim().toLowerCase();
  const matches = rankedItems(query);
  const results = document.getElementById('searchResults');
  resultIndex = -1;
  results.innerHTML = '<p class="side-label" role="status">' + (query ? matches.length + (matches.length === 1 ? ' result' : ' results') : 'Suggested pages') + '</p>' + (matches.length ? matches.map(function result(r) {
    return '<a href="' + escapeHTML(r.href) + '">' + icon(r.symbol) + '<span><strong>' + escapeHTML(r.title) + '</strong><small>' + escapeHTML(r.category) + '</small></span>' + icon('chevron') + '</a>';
  }).join('') : '<p class="empty-state">Try a stage name, a topic such as “retries”, or an exercise title.</p>');
  results.scrollTop = 0;
}
function openSearch() {
  closeMenu();
  if (dialog.open) return;
  dialog.showModal();
  searchInput.value = '';
  renderSearch();
  searchInput.focus();
}
document.getElementById('openSearch').addEventListener('click',openSearch);
view.addEventListener('click',function actOnContent(event) {
  const copy = event.target.closest('.copy-code'), jump = event.target.closest('[data-jump]');
  if (copy) copyCode(copy);
  if (jump) document.getElementById(jump.dataset.jump).scrollIntoView({block:'start'});
});
document.getElementById('closeSearch').addEventListener('click',function close() { dialog.close(); });
searchInput.addEventListener('input',renderSearch);
dialog.addEventListener('click',function select(event) {
  if (event.target.closest('a') || event.target === dialog) dialog.close();
});
dialog.addEventListener('keydown',function searchKeys(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    dialog.close();
    return;
  }
  const results = Array.from(document.querySelectorAll('#searchResults a'));
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (!results.length) return;
    const offset = event.key === 'ArrowDown' ? 1 : -1;
    const from = document.activeElement === searchInput ? -1 : results.indexOf(document.activeElement);
    resultIndex = from < 0 ? (offset > 0 ? 0 : results.length - 1) : (from + offset + results.length) % results.length;
    results[resultIndex].focus();
  } else if (event.key === 'Enter' && document.activeElement === searchInput && results.length) {
    event.preventDefault(); results[0].click();
  }
});
document.getElementById('menuOpen').addEventListener('click',function toggleMenu() {
  if (document.body.classList.contains('menu-open')) return closeMenu();
  document.body.classList.add('menu-open');
  reader.inert = true;
  this.setAttribute('aria-expanded','true');
  document.getElementById('menuScrim').hidden = false;
  document.getElementById('navFilter').focus();
});
document.getElementById('sidebar').addEventListener('click',function closeAfterSelection(event) {
  if (event.target.closest('a') && document.body.classList.contains('menu-open')) {
    closeMenu();
    reader.focus({preventScroll:true});
  }
});
document.getElementById('menuScrim').addEventListener('click',function dismissMenu() {
  closeMenu();
  document.getElementById('menuOpen').focus();
});
window.matchMedia('(max-width: 800px)').addEventListener('change',function changeLayout(event) {
  if (!event.matches) closeMenu();
});
document.addEventListener('keydown',function shortcuts(event) {
  if (event.key === 'Tab' && document.body.classList.contains('menu-open')) {
    const opener = document.getElementById('menuOpen');
    const items = Array.from(document.querySelectorAll('#sidebar input, #sidebar a, #sidebar button')).filter(function visible(item) { return item.getClientRects().length > 0; });
    const last = items[items.length - 1];
    if (document.activeElement === last && !event.shiftKey || document.activeElement === items[0] && event.shiftKey) {
      event.preventDefault(); opener.focus();
    } else if (document.activeElement === opener) {
      event.preventDefault(); (event.shiftKey ? last : items[0]).focus();
    }
  }
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) { closeMenu(); document.getElementById('menuOpen').focus(); }
  const editing = event.target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName);
  if (!dialog.open && ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' || event.key === '/' && !editing)) {
    event.preventDefault(); openSearch();
  }
});
document.getElementById('skipLink').addEventListener('click',function skip(event) { event.preventDefault(); reader.focus(); });
for (const node of document.querySelectorAll('[data-icon]')) node.innerHTML = icon(node.dataset.icon);
window.addEventListener('hashchange',function changeRoute() { renderRoute(); reader.focus({preventScroll:true}); });
renderRoute();
