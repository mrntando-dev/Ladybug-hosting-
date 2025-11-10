const API_URL = window.location.origin;
let adminCredentials = JSON.parse(localStorage.getItem('adminCredentials') || '{}');

// Check admin authentication
if (!adminCredentials.url) {
    window.location.href = '/';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayCredentials();
    loadUsers();
    loadServers();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadUsers();
        loadServers();
    }, 30000);
});

function displayCredentials() {
    document.getElementById('panel-url').textContent = adminCredentials.url;
    document.getElementById('panel-username').textContent = adminCredentials.username;
    document.getElementById('panel-password').textContent = adminCredentials.password;
}

function openPanel() {
    window.open(adminCredentials.url, '_blank');
}

function showMessage(text, type = 'success') {
    const msgEl = document.getElementById('message');
    msgEl.textContent = text;
    msgEl.className = `message ${type}`;
    msgEl.style.display = 'block';
    setTimeout(() => msgEl.style.display = 'none', 4000);
}

// Load Users
async function loadUsers() {
    try {
        // Note: In production, you'd need proper admin token authentication
        // For now, we'll mock this or handle it differently
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '<div class="loading">Loading users...</div>';
        
        // Mock data for demonstration
        // In production, implement proper admin API authentication
        setTimeout(() => {
            usersList.innerHTML = `
                <div class="user-card">
                    <div class="user-card-info">
                        <h3>Demo User</h3>
                        <p>Email: demo@example.com</p>
                        <p>Coins: <span class="coins">💰 50</span></p>
                        <p>Servers: 2</p>
                    </div>
                    <div class="user-card-actions">
                        <input type="number" class="coin-input" placeholder="Coins" id="coins-demo">
                        <button class="btn-small" onclick="addCoins('demo', document.getElementById('coins-demo').value)">Add Coins</button>
                    </div>
                </div>
            `;
        }, 500);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load Servers
async function loadServers() {
    try {
        const serversList = document.getElementById('admin-servers-list');
        serversList.innerHTML = '<div class="loading">Loading servers...</div>';
        
        // Mock data for demonstration
        setTimeout(() => {
            serversList.innerHTML = `
                <div class="admin-server-card">
                    <h3>Demo Server 1</h3>
                    <p><strong>Owner:</strong> demo@example.com</p>
                    <p><strong>Type:</strong> Minecraft</p>
                    <p><strong>Status:</strong> <span class="status-badge active">Active</span></p>
                    <p><strong>Server ID:</strong> silly_123456</p>
                    <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <div class="admin-server-card">
                    <h3>Demo Server 2</h3>
                    <p><strong>Owner:</strong> demo@example.com</p>
                    <p><strong>Type:</strong> Node.js</p>
                    <p><strong>Status:</strong> <span class="status-badge stopped">Stopped</span></p>
                    <p><strong>Server ID:</strong> silly_789012</p>
                    <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `;
        }, 500);
    } catch (error) {
        console.error('Error loading servers:', error);
    }
}

function addCoins(userId, amount) {
    amount = parseInt(amount);
    if (isNaN(amount) || amount <= 0) {
        showMessage('Please enter a valid coin amount', 'error');
        return;
    }

    showMessage(`Added ${amount} coins to user!`, 'success');
    loadUsers();
}

function logout() {
    localStorage.removeItem('adminCredentials');
    localStorage.removeItem('user');
    window.location.href = '/';
}
