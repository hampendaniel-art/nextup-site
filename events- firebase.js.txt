// js/events-firebase.js
import { db } from '../firebase-init.js';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// Local cache for searching/filtering
let lastEvents = [];

function formatDate(d){
  if(!d) return '';
  // Firestore Timestamp -> Date
  if(typeof d.toDate === 'function') d = d.toDate();
  return new Date(d).toLocaleString();
}

function updateSavedCount(){
  const saved = JSON.parse(localStorage.getItem('nextup_saved') || '{}');
  const el = document.getElementById('savedCount');
  if(el) el.textContent = Object.keys(saved).length;
}

function toggleSave(id, ev) {
  const saved = JSON.parse(localStorage.getItem('nextup_saved') || '{}');
  if (saved[id]) delete saved[id];
  else saved[id] = ev;
  localStorage.setItem('nextup_saved', JSON.stringify(saved));
  updateSavedCount();
}

function renderEvents(events){
  lastEvents = events;
  const grid = document.getElementById('eventsGrid');
  if(!grid) return;
  grid.innerHTML = '';
  const tpl = document.getElementById('cardTpl');
  events.forEach(ev => {
    // normalize start/end if Timestamp
    if(ev.start && typeof ev.start.toDate === 'function') ev._startISO = ev.start.toDate().toISOString();
    else if(ev.start) ev._startISO = new Date(ev.start).toISOString();

    const copy = tpl.content.cloneNode(true);
    const img = copy.querySelector('img');
    img.src = ev.image || 'static/placeholder.jpg';
    img.alt = ev.title || 'Event image';
    copy.querySelector('.category').textContent = ev.category || '';
    copy.querySelector('.date').textContent = ev._startISO ? new Date(ev._startISO).toLocaleDateString() : '';
    copy.querySelector('.title').textContent = ev.title || '';
    copy.querySelector('.location').textContent = ev.location || '';
    copy.querySelector('.price').textContent = (ev.free ? 'Free' : (ev.price ? ('$'+ev.price) : ''));
    const view = copy.querySelector('.btnView');
    view.href = `event.html?id=${encodeURIComponent(ev.id)}`;
    view.addEventListener('click', ()=> location.href = view.href);

    const favBtn = copy.querySelector('.favBtn');
    favBtn.addEventListener('click', ()=> {
      toggleSave(ev.id, ev);
      // small UI feedback
      favBtn.classList.add('opacity-70');
      setTimeout(()=> favBtn.classList.remove('opacity-70'), 500);
    });

    grid.appendChild(copy);
  });
  updateSavedCount();
}

// search button -> filter lastEvents
document.getElementById('searchBtn')?.addEventListener('click', ()=> {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  if(!q) return renderEvents(lastEvents);
  const filtered = lastEvents.filter(e=>{
    const hay = (e.title + ' ' + (e.location||'') + ' ' + (e.category||'') + ' ' + (e.tags||'')).toLowerCase();
    return hay.includes(q);
  });
  renderEvents(filtered);
});

// Map / Filters placeholders
document.getElementById('mapToggle')?.addEventListener('click', ()=> alert('Map view: integrate Google Maps/Mapbox for production.'));
document.getElementById('filterToggle')?.addEventListener('click', ()=> alert('Filters: build UI for date/distance/category/price.'));


// Real-time subscription to Firestore "events" collection
const eventsCol = collection(db, 'events');
const q = query(eventsCol, orderBy('start'));
onSnapshot(q, snapshot => {
  const events = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  renderEvents(events);
}, err => {
  console.error('Firestore snapshot error:', err);
});
