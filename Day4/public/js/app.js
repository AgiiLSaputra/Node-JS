// ============================
// TICKETING SYSTEM - Frontend
// ============================

const API_BASE = "/api";
let currentUser = null;
let currentTicketPage = 1;

// ==================== AUTH ====================

function showLogin() {
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("register-form").classList.add("hidden");
}

function showRegister() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("register-form").classList.remove("hidden");
}

async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showToast("Email dan password harus diisi");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message);
      return;
    }

    localStorage.setItem("token", data.data.token);
    currentUser = data.data.user;
    showApp();
    showToast("Login berhasil");
  } catch (error) {
    showToast("Terjadi kesalahan");
  }
}

async function register() {
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  if (!name || !email || !password) {
    showToast("Semua field harus diisi");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message);
      return;
    }

    localStorage.setItem("token", data.data.token);
    currentUser = data.data.user;
    showApp();
    showToast("Registrasi berhasil");
  } catch (error) {
    showToast("Terjadi kesalahan");
  }
}

function logout() {
  localStorage.removeItem("token");
  currentUser = null;
  document.getElementById("app-view").classList.add("hidden");
  document.getElementById("auth-view").classList.remove("hidden");
  showToast("Berhasil keluar");
}

// ==================== APP ====================

function showApp() {
  document.getElementById("auth-view").classList.add("hidden");
  document.getElementById("app-view").classList.remove("hidden");

  // Update user info
  document.getElementById("user-name").textContent = currentUser.name;
  document.getElementById("user-avatar").textContent = currentUser.name.charAt(0).toUpperCase();

  // Show/hide analytics nav
  if (currentUser.role === "ADMIN" || currentUser.role === "STAFF") {
    document.getElementById("nav-analytics").classList.remove("hidden");
  }

  loadDashboard();
}

// ==================== PAGES ====================

function showPage(page) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));

  // Show selected page
  document.getElementById(`page-${page}`).classList.remove("hidden");

  // Update nav active state
  document.querySelectorAll(".header-nav a").forEach((a) => {
    a.classList.remove("active");
    if (a.dataset.page === page) {
      a.classList.add("active");
    }
  });

  // Load page data
  switch (page) {
    case "dashboard":
      loadDashboard();
      break;
    case "tickets":
      loadTickets();
      break;
    case "analytics":
      loadAnalytics();
      break;
  }
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/analytics/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      logout();
      return;
    }

    const data = await res.json();

    if (data.success) {
      const { tickets } = data.data;
      document.getElementById("stat-total").textContent = tickets.totalTickets;
      document.getElementById("stat-open").textContent = tickets.openTickets;
      document.getElementById("stat-progress").textContent = tickets.inProgressTickets;
      document.getElementById("stat-resolved").textContent = tickets.resolvedTickets;
    }
  } catch (error) {
    console.error("Load dashboard error:", error);
  }

  // Load recent tickets
  loadRecentTickets();
}

async function loadRecentTickets() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/tickets?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (data.success) {
      renderTicketsTable(data.data.tickets, "recent-tickets", false);
    }
  } catch (error) {
    console.error("Load recent tickets error:", error);
  }
}

// ==================== TICKETS ====================

async function loadTickets(page = 1) {
  currentTicketPage = page;
  const status = document.getElementById("filter-status").value;
  const priority = document.getElementById("filter-priority").value;
  const search = document.getElementById("filter-search").value;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
  });

  if (status) params.append("status", status);
  if (priority) params.append("priority", priority);
  if (search) params.append("search", search);

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/tickets?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (data.success) {
      renderTicketsTable(data.data.tickets, "tickets-list", true);
      renderPagination(data.data.pagination);
    }
  } catch (error) {
    console.error("Load tickets error:", error);
  }
}

function renderTicketsTable(tickets, tbodyId, showAuthor) {
  const tbody = document.getElementById(tbodyId);

  if (tickets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${showAuthor ? 7 : 5}" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
          <h3>Belum ada tiket</h3>
          <p>Buat tiket baru untuk memulai</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = tickets
    .map(
      (ticket) => `
    <tr style="cursor: pointer;" onclick="viewTicket(${ticket.id})">
      <td><span style="font-family: var(--font-mono); font-size: var(--text-xs);">#${ticket.id}</span></td>
      <td>
        <div style="font-weight: 500; color: var(--gray-900);">${escapeHtml(ticket.title)}</div>
        ${ticket.category ? `<div style="font-size: var(--text-xs); color: var(--gray-400); margin-top: 2px;">${escapeHtml(ticket.category)}</div>` : ""}
      </td>
      <td><span class="badge badge-${ticket.status.toLowerCase()}">${formatStatus(ticket.status)}</span></td>
      <td><span class="badge badge-${ticket.priority.toLowerCase()}">${ticket.priority}</span></td>
      ${showAuthor ? `<td style="font-size: var(--text-sm);">${ticket.author?.name || "-"}</td>` : ""}
      <td style="font-size: var(--text-sm);">${ticket._count?.comments || 0}</td>
      <td style="font-size: var(--text-sm); color: var(--gray-400);">${formatDate(ticket.createdAt)}</td>
    </tr>
  `
    )
    .join("");
}

function renderPagination(pagination) {
  const container = document.getElementById("tickets-pagination");
  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = "";

  html += `<button class="pagination-btn" onclick="loadTickets(${page - 1})" ${page <= 1 ? "disabled" : ""}>&laquo;</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === page) {
      html += `<button class="pagination-btn active">${i}</button>`;
    } else if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      html += `<button class="pagination-btn" onclick="loadTickets(${i})">${i}</button>`;
    } else if (i === page - 3 || i === page + 3) {
      html += `<button class="pagination-btn" disabled>...</button>`;
    }
  }

  html += `<button class="pagination-btn" onclick="loadTickets(${page + 1})" ${page >= totalPages ? "disabled" : ""}>&raquo;</button>`;

  container.innerHTML = html;
}

// ==================== TICKET DETAIL ====================

async function viewTicket(id) {
  showPage("ticket-detail");

  const container = document.getElementById("ticket-detail-content");
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.success) {
      container.innerHTML = '<div class="empty-state"><h3>Tiket tidak ditemukan</h3></div>';
      return;
    }

    const ticket = data.data.ticket;
    renderTicketDetail(ticket);
  } catch (error) {
    container.innerHTML = '<div class="empty-state"><h3>Terjadi kesalahan</h3></div>';
  }
}

function renderTicketDetail(ticket) {
  const container = document.getElementById("ticket-detail-content");
  const canEdit = currentUser.role !== "CUSTOMER" || ticket.authorId === currentUser.id;

  container.innerHTML = `
    <div class="ticket-header">
      <div>
        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2);">
          <span style="font-family: var(--font-mono); font-size: var(--text-sm); color: var(--gray-400);">#${ticket.id}</span>
          <span class="badge badge-${ticket.status.toLowerCase()}">${formatStatus(ticket.status)}</span>
          <span class="badge badge-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
        </div>
        <h2 style="margin-bottom: var(--space-2);">${escapeHtml(ticket.title)}</h2>
        <div class="ticket-meta">
          <span>Dibuat oleh ${ticket.author?.name || "Unknown"}</span>
          <span>&middot;</span>
          <span>${formatDate(ticket.createdAt)}</span>
          ${ticket.assignee ? `<span>&middot;</span><span>Ditugaskan ke ${ticket.assignee.name}</span>` : ""}
        </div>
      </div>
      ${canEdit ? `
        <div style="display: flex; gap: var(--space-2);">
          <select onchange="updateTicketStatus(${ticket.id}, this.value)" class="form-select" style="width: auto;">
            <option value="OPEN" ${ticket.status === "OPEN" ? "selected" : ""}>Open</option>
            <option value="IN_PROGRESS" ${ticket.status === "IN_PROGRESS" ? "selected" : ""}>In Progress</option>
            <option value="WAITING" ${ticket.status === "WAITING" ? "selected" : ""}>Waiting</option>
            <option value="RESOLVED" ${ticket.status === "RESOLVED" ? "selected" : ""}>Resolved</option>
            <option value="CLOSED" ${ticket.status === "CLOSED" ? "selected" : ""}>Closed</option>
          </select>
          <button onclick="deleteTicket(${ticket.id})" class="btn btn-danger btn-sm">Hapus</button>
        </div>
      ` : ""}
    </div>

    <div class="ticket-description">${escapeHtml(ticket.description)}</div>

    <!-- Comments Section -->
    <div class="comments-section">
      <h3 style="margin-bottom: var(--space-4);">Komentar (${ticket.comments?.length || 0})</h3>

      <div id="comments-list">
        ${(ticket.comments || [])
          .map(
            (comment) => `
          <div class="comment">
            <div class="comment-header">
              <span class="comment-author">${comment.author?.name || "Unknown"}</span>
              <span class="comment-time">${formatDate(comment.createdAt)}</span>
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
          </div>
        `
          )
          .join("")}
      </div>

      <div style="margin-top: var(--space-4);">
        <div class="form-group">
          <textarea id="comment-content" class="form-textarea" placeholder="Tulis komentar..." style="min-height: 80px;"></textarea>
        </div>
        <button onclick="addComment(${ticket.id})" class="btn btn-primary btn-sm">Kirim Komentar</button>
      </div>
    </div>

    <!-- Audit Log Section -->
    ${ticket.auditLogs && ticket.auditLogs.length > 0 ? `
      <div class="divider"></div>
      <div style="margin-top: var(--space-4);">
        <h3 style="margin-bottom: var(--space-4);">Riwayat Perubahan</h3>
        <div id="audit-list">
          ${ticket.auditLogs
            .map(
              (log) => `
            <div class="audit-item">
              <div class="audit-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  ${getAuditIcon(log.action)}
                </svg>
              </div>
              <div class="audit-content">
                <div class="audit-action">
                  <strong>${log.user?.name || "System"}</strong> melakukan ${log.action} pada ${log.entity}
                </div>
                <div class="audit-time">${formatDate(log.createdAt)}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    ` : ""}
  `;
}

async function addComment(ticketId) {
  const content = document.getElementById("comment-content").value;

  if (!content.trim()) {
    showToast("Komentar harus diisi");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message);
      return;
    }

    showToast("Komentar berhasil ditambahkan");
    viewTicket(ticketId);
  } catch (error) {
    showToast("Terjadi kesalahan");
  }
}

async function updateTicketStatus(ticketId, status) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/tickets/${ticketId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message);
      return;
    }

    showToast("Status tiket diperbarui");
    viewTicket(ticketId);
  } catch (error) {
    showToast("Terjadi kesalahan");
  }
}

async function deleteTicket(ticketId) {
  if (!confirm("Yakin ingin menghapus tiket ini?")) {
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/tickets/${ticketId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message);
      return;
    }

    showToast("Tiket berhasil dihapus");
    showPage("tickets");
  } catch (error) {
    showToast("Terjadi kesalahan");
  }
}

// ==================== CREATE TICKET ====================

function openCreateTicketModal() {
  document.getElementById("ticket-title").value = "";
  document.getElementById("ticket-description").value = "";
  document.getElementById("ticket-priority").value = "MEDIUM";
  document.getElementById("ticket-category").value = "";
  openModal("create-ticket-modal");
}

async function createTicket() {
  const title = document.getElementById("ticket-title").value;
  const description = document.getElementById("ticket-description").value;
  const priority = document.getElementById("ticket-priority").value;
  const category = document.getElementById("ticket-category").value;

  if (!title || !description) {
    showToast("Judul dan deskripsi harus diisi");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, priority, category }),
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message);
      return;
    }

    closeModal("create-ticket-modal");
    showToast("Tiket berhasil dibuat");
    loadTickets();
  } catch (error) {
    showToast("Terjadi kesalahan");
  }
}

// ==================== ANALYTICS ====================

async function loadAnalytics() {
  try {
    const token = localStorage.getItem("token");

    // Load stats
    const statsRes = await fetch(`${API_BASE}/analytics/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const statsData = await statsRes.json();

    if (statsData.success) {
      document.getElementById("analytics-users").textContent = statsData.data.users.totalUsers;
      document.getElementById("analytics-comments").textContent = statsData.data.comments.activeComments;
      document.getElementById("analytics-audit").textContent = statsData.data.audit.totalAuditLogs;
    }

    // Load resolution time
    const resolutionRes = await fetch(`${API_BASE}/analytics/resolution-time`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const resolutionData = await resolutionRes.json();

    if (resolutionData.success && resolutionData.data.resolutionTime) {
      const hours = resolutionData.data.resolutionTime.avgHoursMin;
      document.getElementById("analytics-resolution").textContent = hours ? `${hours}j` : "-";
    }

    // Load by status
    const statusRes = await fetch(`${API_BASE}/analytics/by-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const statusData = await statusRes.json();

    if (statusData.success) {
      renderBarChart("chart-status", statusData.data.byStatus, "status", "count");
    }

    // Load by priority
    const priorityRes = await fetch(`${API_BASE}/analytics/by-priority`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const priorityData = await priorityRes.json();

    if (priorityData.success) {
      renderBarChart("chart-priority", priorityData.data.byPriority, "priority", "count");
    }

    // Load recent audit
    const auditRes = await fetch(`${API_BASE}/analytics/recent-audit?limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const auditData = await auditRes.json();

    if (auditData.success) {
      renderAuditLogs(auditData.data.recentAudit);
    }
  } catch (error) {
    console.error("Load analytics error:", error);
  }
}

function renderBarChart(containerId, data, labelKey, valueKey) {
  const container = document.getElementById(containerId);

  if (!data || data.length === 0) {
    container.innerHTML = '<p style="color: var(--gray-400); font-size: var(--text-sm);">Tidak ada data</p>';
    return;
  }

  const max = Math.max(...data.map((d) => d[valueKey]));

  container.innerHTML = data
    .map((item) => {
      const percentage = max > 0 ? (item[valueKey] / max) * 100 : 0;
      const label = item[labelKey];
      return `
        <div style="margin-bottom: var(--space-3);">
          <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-1);">
            <span style="font-size: var(--text-sm); color: var(--gray-700);">${formatStatus(label)}</span>
            <span style="font-size: var(--text-sm); font-weight: 500; color: var(--gray-900);">${item[valueKey]}</span>
          </div>
          <div style="height: 8px; background: var(--gray-100); border-radius: 4px;">
            <div style="height: 100%; width: ${percentage}%; background: var(--gray-800); border-radius: 4px;"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderAuditLogs(logs) {
  const container = document.getElementById("audit-logs");

  if (!logs || logs.length === 0) {
    container.innerHTML = '<p style="color: var(--gray-400); font-size: var(--text-sm);">Belum ada riwayat</p>';
    return;
  }

  container.innerHTML = logs
    .map(
      (log) => `
      <div class="audit-item">
        <div class="audit-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${getAuditIcon(log.action)}
          </svg>
        </div>
        <div class="audit-content">
          <div class="audit-action">
            <strong>${log.userName}</strong> melakukan ${log.action} pada ${log.entity} #${log.entityId}
          </div>
          <div class="audit-time">${formatDate(log.createdAt)}</div>
        </div>
      </div>
    `
    )
    .join("");
}

// ==================== PROFILE ====================

function showProfile() {
  document.getElementById("profile-name").value = currentUser.name;
  document.getElementById("profile-email").value = currentUser.email;
  openModal("profile-modal");
  toggleDropdown();
}

async function updateProfile() {
  const name = document.getElementById("profile-name").value;
  const email = document.getElementById("profile-email").value;

  if (!name || !email) {
    showToast("Nama dan email harus diisi");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message);
      return;
    }

    currentUser = { ...currentUser, name, email };
    document.getElementById("user-name").textContent = name;
    document.getElementById("user-avatar").textContent = name.charAt(0).toUpperCase();

    closeModal("profile-modal");
    showToast("Profil berhasil diperbarui");
  } catch (error) {
    showToast("Terjadi kesalahan");
  }
}

// ==================== HELPERS ====================

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

function openModal(id) {
  document.getElementById(id).classList.add("active");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

function toggleDropdown() {
  document.getElementById("user-dropdown").classList.toggle("active");
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function formatStatus(status) {
  const map = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    WAITING: "Waiting",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
    CREATE: "Create",
    UPDATE: "Update",
    DELETE: "Delete",
    BULK_UPDATE: "Bulk Update",
  };
  return map[status] || status;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes}m lalu`;
  if (hours < 24) return `${hours}j lalu`;
  if (days < 7) return `${days}h lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getAuditIcon(action) {
  switch (action) {
    case "CREATE":
      return '<path d="M12 5v14M5 12h14"/>';
    case "UPDATE":
      return '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>';
    case "DELETE":
      return '<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>';
    default:
      return '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>';
  }
}

// ==================== INIT ====================

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const token = localStorage.getItem("token");
  if (token) {
    // Verify token
    fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          currentUser = data.data.user;
          showApp();
        } else {
          localStorage.removeItem("token");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
      });
  }

  // Search on Enter key
  document.getElementById("filter-search")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loadTickets();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("user-dropdown");
    if (dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });

  // Close modals when clicking outside
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });
});
