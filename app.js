let papers=[],selectedTag="";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function text(p){return [p.title,p.short_title,p.authors,p.venue,p.summary,...(p.tags||[]),...(p.topics||[])].join(" ").toLowerCase()}
function filtered(){
  const q=$("search").value.trim().toLowerCase(),year=$("year-filter").value,sort=$("sort").value;
  let x=papers.filter(p=>(!q||text(p).includes(q))&&(!year||String(p.year)===year)&&(!selectedTag||(p.tags||[]).includes(selectedTag)));
  x.sort((a,b)=>sort==="year-desc"?(b.year||0)-(a.year||0):sort==="year-asc"?(a.year||0)-(b.year||0):sort==="title"?a.title.localeCompare(b.title):Date.parse(b.updated_at||b.date_added)-Date.parse(a.updated_at||a.date_added));
  return x;
}
function renderTags(){
  const m=new Map();papers.forEach(p=>(p.tags||[]).forEach(t=>m.set(t,(m.get(t)||0)+1)));
  $("tag-list").innerHTML=[...m].sort((a,b)=>b[1]-a[1]).map(([t,n])=>`<button class="tag-button ${selectedTag===t?"active":""}" data-tag="${esc(t)}">${esc(t)} · ${n}</button>`).join("");
  document.querySelectorAll(".tag-button").forEach(b=>b.onclick=()=>{selectedTag=selectedTag===b.dataset.tag?"":b.dataset.tag;renderTags();render()});
}
function card(p){return `<article class="paper-card"><div class="card-meta"><span>${esc(p.year)} · ${esc(p.venue)}</span><span>${esc(p.paper_version)}</span></div><h3 class="short-title">${esc(p.short_title||p.title)}</h3><p class="full-title">${esc(p.title)}</p><p class="summary">${esc(p.summary)}</p><div class="card-tags">${(p.tags||[]).map(t=>`<span>${esc(t)}</span>`).join("")}</div><div class="card-footer"><small>${esc(p.authors)}</small><a class="read-link" href="${encodeURI(p.url)}">阅读笔记 →</a></div></article>`}
function render(){const x=filtered();$("paper-list").innerHTML=x.map(card).join("");$("result-count").textContent=`${x.length} / ${papers.length}`;$("empty").hidden=!!x.length}
async function init(){
  papers=await (await fetch("./papers.json",{cache:"no-store"})).json();
  const years=[...new Set(papers.map(p=>p.year).filter(Boolean))].sort((a,b)=>b-a),tags=new Set(papers.flatMap(p=>p.tags||[]));
  $("paper-count").textContent=papers.length;$("tag-count").textContent=tags.size;$("year-count").textContent=years.length;
  $("year-filter").innerHTML='<option value="">All years</option>'+years.map(y=>`<option value="${y}">${y}</option>`).join("");
  renderTags();render();
  $("search").oninput=render;$("year-filter").onchange=render;$("sort").onchange=render;
  $("clear-tags").onclick=()=>{selectedTag="";$("search").value="";$("year-filter").value="";renderTags();render()}
}
init();