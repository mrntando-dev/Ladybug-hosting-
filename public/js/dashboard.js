const API_URL = window.location.origin;
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || '{}');

// Check authentication
if (!token) {
    window.location.href = '/';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateUserInfo();
    loadServers();
    
    // Auto-refresh servers and coins every 30 seconds
    setInterval(() => {
        loadServers();
        updateUserCoins();
    }, 30000);
});

function updateUserInfo() {
    document.getElementById('username').textContent = user.username || 'User';
    document.getElementById('coins').textContent = `💰 ${user.coins || 0} Coins`;
}

async function updateUserCoins() {
    try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            user.coins = data.coins;
            localStorage.setItem('user', JSON.stringify(user));
            updateUserInfo();
        }
    } catch (error) {
        console.error('Error updating coins:', error);
    }
}

function showMessage(text, type = 'success') {
    const msgEl = document.getElementById('message');
    msgEl.textContent = text;
    msgEl.className = `message ${type}`;
    msgEl.style.display = 'block';
    setTimeout(() => msgEl.style.display = 'none', 4000);
}

// Create Server
document.getElementById('create-server-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const serverName = document.getElementById('server-name').value;
    const serverType = document.getElementById('server-type').value;

    if (user.coins < 10) {
        showMessage('Not enough coins to create a server! You need 10 coins.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/servers/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ serverName, serverType })
        });

        const data = await res.json();
        
        if (res.ok) {
            showMessage('Server created successfully!', 'success');
            document.getElementById('create-server-form').reset();
            user.coins -= 10;
            updateUserInfo();
            loadServers();
        } else {
            showMessage(data.error || 'Failed to create server', 'error');
        }
    } catch (error) {
        showMessage('Error creating server', 'error');
    }
});

// Load Servers
async function loadServers() {
    try {
        const res = await fetch(`${API_URL}/api/servers/my-servers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            const servers = await res.json();
            displayServers(servers);
        } else {
            showMessage('Failed to load servers', 'error');
        }
    } catch (error) {
        console.error('Error loading servers:', error);
    }
}

function displayServers(servers) {
    const serversList = document.getElementById('servers-list');
    
    if (servers.length === 0) {
        serversList.innerHTML = '<div class="empty-state">No servers yet. Create your first server!</div>';
        return;
    }

    serversList.innerHTML = servers.map(server => `
        <div class="server-card">
            <h3>${server.serverName}</h3>
            <div class="server-info">
                <p><strong>Type:</strong> ${server.serverType}</p>
                <p><strong>Status:</strong> <span class="status-badge ${server.status}">${server.status}</span></p>
                <p><strong>Cost:</strong> ${server.coinsPerHour} coins/hour</p>
                <p><strong>Server ID:</strong> ${server.sillyServerId}</p>
                <p><strong>Created:</strong> ${new Date(server.createdAt).toLocaleString()}</p>
            </div>
            <div class="server-actions">
                ${server.status === 'stopped' || server.status === 'suspended' ? 
                    `<button class="btn-start" onclick="startServer('${server._id}')">▶ Start</button>` : 
                    `<button class="btn-stop" onclick="stopServer('${server._id}')">⏸ Stop</button>`
                }
                <button class="btn-delete" onclick="deleteServer('${server._id}')">🗑 Delete</button>
            </div>
        </div>
    `).join('');
}

// Start Server
async function startServer(serverId) {
    if (user.coins < 1) {
        showMessage('Not enough coins to start server!', 'error');
        return;
    }

    try {
        const res = await fetch(`$${API_URL}/api/servers/start/$$ {serverId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        
        if (res.ok) {
            showMessage('Server started successfully!', 'success');
            loadServers();
        } else {
            showMessage(data.error || 'Failed to start server', 'error');
        }
    } catch (error) {
        showMessage('Error starting server', 'error');
    }
}

// Stop Server
async function stopServer(serverId) {
    try {
        const res = await fetch(`$${API_URL}/api/servers/stop/$$ {serverId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        
        if (res.ok) {
            showMessage('Server stopped successfully!', 'success');
            loadServers();
        } else {
            showMessage(data.error || 'Failed to stop server', 'error');
        }
    } catch (error) {
        showMessage('Error stopping server', 'error');
    }
}

// Delete Server
async function deleteServer(serverId) {
    if (!confirm('Are you sure you want to delete this server? This action cannot be undone.')) {
        return;
    }

    try {
        const res = await fetch(`$${API_URL}/api/servers/$$ {serverId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        
        if (res.ok) {
            showMessage('Server deleted successfully!', 'success');
            loadServers();
        } else {
            showMessage(data.error || 'Failed to delete server', 'error');
        }
    } catch (error) {
        showMessage('Error deleting server', 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}
