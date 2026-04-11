import { API_URL } from './config.js';

// Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Security Check: Only allow if logged in as admin
    if (!token || !user || user.email !== 'avanarultrust@gmail.com') {
        window.location.href = '/index.html';
        return;
    }

    // Load Initial Data
    loadDashboardData();

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });

    // Project Form Submission
    const projectForm = document.getElementById('project-form');
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', document.getElementById('proj-title').value);
        formData.append('description', document.getElementById('proj-desc').value);
        
        const imageFiles = document.getElementById('proj-images').files;
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]);
        }

        try {
            const btn = projectForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Uploading...';

            const response = await fetch(`${API_URL}/api/admin/projects`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                alert('Project Published Successfully!');
                projectForm.reset();
                toggleAddForm(); // hide add form
                loadDashboardData();
            } else {
                const err = await response.json();
                alert('Error: ' + err.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Server error during upload.');
        } finally {
            const btn = projectForm.querySelector('button[type="submit"]');
            btn.disabled = false;
            btn.textContent = 'Publish to Journey';
        }
    });

    // Mobile Sidebar Toggle
    const adminToggle = document.getElementById('admin-toggle');
    const adminSidebar = document.getElementById('admin-sidebar');
    if (adminToggle) {
        adminToggle.addEventListener('click', () => {
            adminSidebar.classList.toggle('open');
            adminToggle.querySelector('i').classList.toggle('fa-bars');
            adminToggle.querySelector('i').classList.toggle('fa-times');
        });
    }
});

// ===== LOAD ALL DATA =====
async function loadDashboardData() {
    const token = localStorage.getItem('token');

    try {
        // Fetch All Transactions
        const resTrans = await fetch(`${API_URL}/api/admin/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const transactions = await resTrans.json();

        // Update Stats
        const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);
        document.getElementById('total-donations').textContent = `₹ ${total.toLocaleString('en-IN')}`;
        document.getElementById('donor-count').textContent = transactions.length;

        // Populate Transaction Table
        const tbody = document.getElementById('transactions-body');
        tbody.innerHTML = transactions.map(t => `
            <tr>
                <td>${new Date(t.timestamp).toLocaleDateString()}</td>
                <td>${t.name}</td>
                <td>${t.email}</td>
                <td style="color: var(--accent); font-weight: 700;">₹${t.amount.toLocaleString('en-IN')}</td>
                <td><button class="btn" style="padding: 6px 14px; font-size: 0.8rem;" onclick="viewDetails('${t._id}')">Details</button></td>
            </tr>
        `).join('');

        // Cache transactions for modal view
        window.currentTransactions = transactions;

        // Fetch Projects
        const resProj = await fetch(`${API_URL}/api/projects`);
        const projects = await resProj.json();
        document.getElementById('project-count').textContent = projects.length;

        // Render Project List
        renderProjectList(projects);

    } catch (err) {
        console.error('Data load error:', err);
    }
}

// ===== RENDER PROJECT LIST =====
function renderProjectList(projects) {
    const container = document.getElementById('projects-list');
    
    if (!projects || projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No projects published yet. Click "Add New" to create your first project.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `<div class="project-grid">${projects.map(p => {
        const imgPath = p.images[0] || 'https://images.unsplash.com/photo-1541339905195-4360e7746c70?auto=format&fit=crop&w=600&q=80';
        const fullImg = imgPath.startsWith('http') ? imgPath : `${API_URL}${imgPath}`;
        
        return `
        <div class="project-item">
            <img src="${fullImg}" 
                 alt="${p.title}" 
                 class="project-item-image">
            <div class="project-item-body">
                <h4>${p.title}</h4>
                <div class="project-item-meta">
                    <i class="fas fa-calendar-alt"></i>
                    ${new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    ${p.images.length > 1 ? `<span style="margin-left: auto;"><i class="fas fa-images"></i> ${p.images.length} photos</span>` : ''}
                </div>
                <p>${p.description}</p>
            </div>
            <div class="project-actions">
                <button class="btn-edit" onclick="openEditModal('${p._id}', \`${p.title.replace(/`/g, '\\`').replace(/'/g, "\\'")}\`, \`${p.description.replace(/`/g, '\\`').replace(/'/g, "\\'").replace(/\n/g, '\\n')}\`)">
                    <i class="fas fa-pen" style="margin-right: 5px;"></i>Edit
                </button>
                <button class="btn-delete" onclick="openDeleteModal('${p._id}')">
                    <i class="fas fa-trash" style="margin-right: 5px;"></i>Delete
                </button>
            </div>
        </div>`;
    }).join('')}</div>`;
}

// ===== TAB SWITCHING =====
    document.querySelector('.header h1').textContent = titles[tabId] || tabId;

    // Auto-close sidebar on mobile after tab switch
    if (window.innerWidth <= 992) {
        const adminSidebar = document.getElementById('admin-sidebar');
        const adminToggle = document.getElementById('admin-toggle');
        adminSidebar.classList.remove('open');
        if (adminToggle) {
            adminToggle.querySelector('i').classList.add('fa-bars');
            adminToggle.querySelector('i').classList.remove('fa-times');
        }
    }
}

// ===== TOGGLE ADD FORM =====
function toggleAddForm() {
    const section = document.getElementById('add-project-section');
    const isVisible = section.style.display !== 'none';
    section.style.display = isVisible ? 'none' : 'block';
}

// ===== TRANSACTION DETAIL MODAL =====
function viewDetails(id) {
    const t = window.currentTransactions.find(item => item._id === id);
    if (!t) return;

    const detailsDiv = document.getElementById('modal-details');
    detailsDiv.innerHTML = `
        <div><strong>Phone:</strong> ${t.phone || 'N/A'}</div>
        <div><strong>Email:</strong> ${t.email}</div>
        <div><strong>Address:</strong><br>
            ${t.address?.line || 'N/A'}<br>
            ${t.address?.city || ''}, ${t.address?.state || ''} - ${t.address?.pincode || ''}<br>
            ${t.address?.country || ''}
        </div>
        <div><strong>Payment ID:</strong> ${t.paymentId || 'Local Record'}</div>
        <div><strong>Status:</strong> ${t.status}</div>
    `;

    document.getElementById('trans-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('trans-modal').style.display = 'none';
}

// ===== EDIT PROJECT MODAL =====
function openEditModal(id, title, description) {
    document.getElementById('edit-project-id').value = id;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-desc').value = description;
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

async function saveProjectEdit() {
    const token = localStorage.getItem('token');
    const id = document.getElementById('edit-project-id').value;
    const title = document.getElementById('edit-title').value.trim();
    const description = document.getElementById('edit-desc').value.trim();

    if (!title || !description) {
        alert('Title and description are required.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/admin/projects/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            alert('Project updated successfully!');
            closeEditModal();
            loadDashboardData();
        } else {
            const err = await response.json();
            alert('Error: ' + err.message);
        }
    } catch (error) {
        console.error('Edit error:', error);
        alert('Server error during update.');
    }
}

// ===== DELETE PROJECT MODAL =====
function openDeleteModal(id) {
    document.getElementById('delete-project-id').value = id;
    document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
}

async function confirmDelete() {
    const token = localStorage.getItem('token');
    const id = document.getElementById('delete-project-id').value;

    try {
        const response = await fetch(`${API_URL}/api/admin/projects/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Project deleted successfully!');
            closeDeleteModal();
            loadDashboardData();
        } else {
            const err = await response.json();
            alert('Error: ' + err.message);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Server error during deletion.');
    }
}

// Attach functions to window for inline onclicks
window.switchTab = switchTab;
window.viewDetails = viewDetails;
window.closeModal = closeModal;
window.toggleAddForm = toggleAddForm;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveProjectEdit = saveProjectEdit;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
