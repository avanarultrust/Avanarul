import { API_URL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // If no token, redirect immediately to home
    window.location.href = '/index.html';
    return;
  }

  try {
    // Verify token with backend
    const response = await fetch(`${API_URL}/api/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.valid) {
      // Show user data
      document.getElementById('loading-indicator').style.display = 'none';
      document.getElementById('profile-content').style.display = 'block';
      
      document.getElementById('display-name').textContent = data.user.name || 'Member';
      document.getElementById('display-email').textContent = data.user.email || 'N/A';
      document.getElementById('display-mobile').textContent = data.user.mobile || 'Not Provided';
      
      // Robust ID Display
      const userId = data.user.id || data.user._id || 'unknown';
      const shortId = (userId !== 'admin' && userId.length > 6) 
                      ? userId.substring(userId.length - 6) 
                      : userId;
      document.getElementById('display-id').textContent = `#${shortId}`;

      // Fetch Donation History
      fetchDonations(token);
      
    } else {
      // Invalid token, force logout
      forceLogout();
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    forceLogout();
  }
});

async function fetchDonations(token) {
  const listContainer = document.getElementById('donation-list');
  try {
    const response = await fetch(`${API_URL}/api/user/donations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const donations = await response.json();

    if (donations.length === 0) {
      listContainer.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 20px;">No donations found yet.</p>';
      return;
    }

    listContainer.innerHTML = donations.map(d => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(184,134,11,0.04); border-radius: 8px; margin-bottom: 8px; border-left: 3px solid var(--gold-bright);">
        <div>
          <div style="font-weight: 700; font-size: 1rem; color: var(--text);">₹${d.amount.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(d.timestamp).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</div>
        </div>
        <div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--success); background: rgba(45,122,58,0.1); padding: 4px 10px; border-radius: 50px;">
          ${d.status}
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error fetching donations:', err);
    listContainer.innerHTML = '<p style="font-size: 0.85rem; color: #c0392b; text-align: center; padding: 20px;">Failed to load donations.</p>';
  }
}

// Logout Handler
const btnLogout = document.getElementById('btn-profile-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    forceLogout();
  });
}

function forceLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}
