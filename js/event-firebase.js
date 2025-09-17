// js/event-firebase.js
import { db } from '../firebase-init.js';
import { doc, getDoc, serverTimestamp, updateDoc, addDoc, collection } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

async function loadEventById(id){
  const docRef = doc(db, 'events', id);
  const snap = await getDoc(docRef);
  if(!snap.exists()) return null;
  const ev = { id: snap.id, ...snap.data() };
  // convert Firestore Timestamp to JS date strings
  if(ev.start && typeof ev.start.toDate === 'function') ev._startISO = ev.start.toDate().toISOString();
  if(ev.end && typeof ev.end.toDate === 'function') ev._endISO = ev.end.toDate().toISOString();
  return ev;
}

function renderEvent(ev){
  // reuse your existing renderEvent implementation but accept Firestore data format
  // For brevity: call the same render function you already have in event.html
  if(window.renderEventFromData) return window.renderEventFromData(ev);
  console.warn('renderEventFromData not found');
}

(async ()=>{
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id) {
    document.getElementById('content').innerHTML = '<p>No event id provided.</p>';
    return;
  }
  const ev = await loadEventById(id);
  if(!ev) {
    document.getElementById('content').innerHTML = '<p>Event not found.</p>';
    return;
  }
  // call into the page's existing renderer (the event.html we prepared earlier has renderEvent)
  if(typeof window.renderEvent === 'function') window.renderEvent(ev);
  else renderEvent(ev);
})();
