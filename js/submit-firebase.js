// js/submit-firebase.js
import { db } from '../firebase-init.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const form = document.getElementById('submitForm');
const result = document.getElementById('result');

form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  // Normalize small things
  data.free = (data.price === '0' || data.price === '0.00' || data.free === 'on' || data.free === true) ? true : false;
  data.createdAt = serverTimestamp();
  data.status = 'pending'; // moderation required
  try {
    await addDoc(collection(db, 'submissions'), data);
    result.innerHTML = '<div class="p-4 rounded bg-green-50 text-green-800">Thanks — your event was submitted for review.</div>';
    form.reset();
  } catch (err) {
    console.error(err);
    result.innerHTML = '<div class="p-4 rounded bg-red-50 text-red-800">Submit failed. Check console.</div>';
  }
});
