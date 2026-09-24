// ==================== MODAL PENJELASAN ====================

const modalOverlay = document.getElementById("modal-overlay");
const modalBadge = document.getElementById("modal-badge");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const modalClose = document.getElementById("modal-close");

function openTopic(key) {
  const topic = LEARN_TOPICS[key];
  if (!topic) return;

  modalBadge.textContent = topic.group;
  modalTitle.textContent = topic.title;
  modalContent.innerHTML = topic.body;
  modalOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ==================== RENDER CHIPS ====================

function renderChips(containerId, keys) {
  const el = document.getElementById(containerId);
  keys.forEach((key) => {
    const btn = document.createElement("button");
    btn.className = "chip";
    const short = key.split(" ")[0];
    if (METHOD_TONES[short]) {
      btn.classList.add("chip-method");
      btn.dataset.tone = METHOD_TONES[short];
    }
    btn.textContent = key;
    btn.addEventListener("click", () => openTopic(key));
    el.appendChild(btn);
  });
}

renderChips("chips-stack", TOPIC_GROUPS.stack);
renderChips("chips-rest", TOPIC_GROUPS.rest);
renderChips("chips-status", TOPIC_GROUPS.status);
renderChips("chips-prisma", TOPIC_GROUPS.prisma);

// ==================== API TESTER ====================

const methodSelect = document.getElementById("tester-method");
const pathInput = document.getElementById("tester-path");
const bodyWrap = document.getElementById("tester-body-wrap");
const bodyInput = document.getElementById("tester-body");
const btnSend = document.getElementById("btn-send");
const resultBox = document.getElementById("tester-result");
const resultStatus = document.getElementById("result-status");
const resultTime = document.getElementById("result-time");
const resultBody = document.getElementById("result-body");
const btnCopy = document.getElementById("btn-copy");

const NO_BODY_METHODS = ["GET", "DELETE"];

function syncBodyVisibility() {
  const method = methodSelect.value;
  bodyWrap.classList.toggle("hidden", NO_BODY_METHODS.includes(method));
}

methodSelect.addEventListener("change", syncBodyVisibility);
syncBodyVisibility();

// Quick action buttons
document.querySelectorAll(".chip-quick").forEach((btn) => {
  btn.addEventListener("click", () => {
    methodSelect.value = btn.dataset.method;
    pathInput.value = btn.dataset.path;
    syncBodyVisibility();
    sendRequest();
  });
});

async function sendRequest() {
  const method = methodSelect.value;
  const path = pathInput.value.trim();

  if (!path.startsWith("/")) {
    showToast("Path harus diawali /", true);
    return;
  }

  const opts = { method, headers: {} };
  if (!NO_BODY_METHODS.includes(method)) {
    const raw = bodyInput.value.trim();
    if (raw) {
      try {
        JSON.parse(raw);
      } catch {
        showToast("Body JSON tidak valid", true);
        return;
      }
      opts.headers["Content-Type"] = "application/json";
      opts.body = raw;
    }
  }

  btnSend.disabled = true;
  btnSend.textContent = "Mengirim...";
  const start = performance.now();

  try {
    const res = await fetch(path, opts);
    const duration = Math.round(performance.now() - start);

    let text = await res.text();
    let pretty = text;
    try {
      pretty = text ? JSON.stringify(JSON.parse(text), null, 2) : "(tanpa body)";
    } catch {
      /* biarkan apa adanya */
    }

    resultStatus.textContent = `${res.status} ${res.statusText || ""}`.trim();
    resultStatus.className = `status-badge s${String(res.status)[0]}`;
    resultStatus.onclick = () => openStatusCodeTopic(res.status);
    resultTime.textContent = `${duration} ms`;
    resultBody.textContent = pretty;
    resultBox.classList.remove("hidden");

    if (path.startsWith("/api/books")) loadBooks();
  } catch (err) {
    resultStatus.textContent = "NETWORK ERROR";
    resultStatus.className = "status-badge s5";
    resultStatus.onclick = null;
    resultTime.textContent = "";
    resultBody.textContent = String(err);
    resultBox.classList.remove("hidden");
  } finally {
    btnSend.disabled = false;
    btnSend.textContent = "Send";
  }
}

btnSend.addEventListener("click", sendRequest);

btnCopy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultBody.textContent);
    showToast("Response disalin");
  } catch {
    showToast("Gagal menyalin", true);
  }
});

const STATUS_TOPIC_MAP = {
  200: "200 OK",
  201: "201 Created",
  204: "204 No Content",
  400: "400 Bad Request",
  404: "404 Not Found",
  500: "500 Internal Server Error",
};

function openStatusCodeTopic(status) {
  const key = STATUS_TOPIC_MAP[status];
  if (key) openTopic(key);
}

// ==================== DAFTAR BUKU ====================

const bookList = document.getElementById("book-list");
const filterSearch = document.getElementById("filter-search");
const btnLoad = document.getElementById("btn-load");

async function loadBooks() {
  const q = filterSearch.value.trim();
  const url = q ? `/api/books?search=${encodeURIComponent(q)}` : "/api/books";

  try {
    const res = await fetch(url);
    const json = await res.json();
    const books = json.data || [];

    if (books.length === 0) {
      bookList.innerHTML = '<p class="empty">Tidak ada buku ditemukan.</p>';
      return;
    }

    bookList.innerHTML = books
      .map(
        (b) => `
      <div class="book-item">
        <div class="book-info">
          <h4>${escapeHtml(b.title)}</h4>
          <div class="book-meta">${escapeHtml(b.author)} · ${b.year}</div>
          ${b.genre ? `<span class="book-genre">${escapeHtml(b.genre)}</span>` : ""}
        </div>
        <span class="book-id">#${b.id}</span>
      </div>`
      )
      .join("");
  } catch {
    bookList.innerHTML = '<p class="empty">Gagal memuat data. Pastikan server berjalan.</p>';
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

btnLoad.addEventListener("click", loadBooks);

let searchTimer;
filterSearch.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadBooks, 350);
});

// ==================== TOAST ====================

function showToast(message, isError = false) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " error" : ""}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ==================== INIT ====================

loadBooks();
