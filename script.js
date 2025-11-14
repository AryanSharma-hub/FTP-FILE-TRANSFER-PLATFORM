// -----------------------------
// Mini FTP File Transfer Platform Script
// Developed by Aryan Sharma (24BCE5037)
// Guided by Dr. Swaminathan Annadurai
// -----------------------------

document.addEventListener("DOMContentLoaded", () => {

const SERVER_URL = window.location.origin;

// Elements
const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const progressBar = document.getElementById("progressBar");
const statusEl = document.getElementById("status");
const fileList = document.getElementById("fileList");

// Modals (Project Details removed)
const modals = {
  about: document.getElementById("aboutModal"), // Still used by Learn button
  dev: document.getElementById("devModal"),
  help: document.getElementById("helpModal"),
};

// Modal open/close helpers
function openModal(m) {
  m.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal(m) {
  m.classList.remove("show");
  document.body.style.overflow = "";
}

// Close on click
document.querySelectorAll("[data-close]").forEach(b =>
  b.addEventListener("click", e => closeModal(e.target.closest(".modal")))
);

// Close modal if click outside content
Object.values(modals).forEach(m =>
  m.addEventListener("click", e => { if (e.target === m) closeModal(m); })
);

// Button bindings
document.getElementById("aboutBtn").onclick = () => openModal(modals.about); // "Learn" button
document.getElementById("devBtn").onclick = () => openModal(modals.dev);
document.getElementById("helpBtn").onclick = () => openModal(modals.help);
// ... previous deleteFile and other code ...
// ===== GET IP Button =====
const getIpBtn = document.getElementById("getIpBtn");
const ipDisplay = document.getElementById("ipDisplay");

if (getIpBtn) {
  getIpBtn.addEventListener("click", async () => {
    ipDisplay.innerHTML = "Fetching IP...";
    try {
      const res = await fetch(`${SERVER_URL}/get-ip`);
      const data = await res.json();
      const ip = data.ip || "localhost";
      const link = `http://${ip}:3000`;
      ipDisplay.innerHTML = `
        <strong>🌐 Open this on another device:</strong> 
        <a href="${link}" target="_blank" style="color:#6aa6ff">${link}</a><br>
        <small>(If using hotspot, this is your Wi-Fi IPv4)</small>
      `;
    } catch (err) {
      ipDisplay.innerHTML = "❌ Could not fetch IP. Run <code>ipconfig</code> manually.";
    }
  });
}
// ================== Upload with Progress ==================
uploadForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file first!");

  const fd = new FormData();
  fd.append("file", file);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${SERVER_URL}/upload`);

  document.getElementById("progressContainer").style.display = "flex";
  statusEl.textContent = "Uploading...";
  statusEl.style.color = "#a9b4c2";

  xhr.upload.onprogress = (ev) => {
    if (ev.lengthComputable) {
      const pct = Math.round((ev.loaded / ev.total) * 100);
      progressBar.value = pct;
      statusEl.textContent = `Uploading... ${pct}%`;
    }
  };

  xhr.onload = async () => {
    if (xhr.status === 200) {
      try {
        const json = JSON.parse(xhr.responseText);
        statusEl.textContent = json.message || "Uploaded";
      } catch {
        statusEl.textContent = "Uploaded";
      }
      statusEl.style.color = "#2ecc71";
      fileInput.value = "";
      await loadFiles();
      setTimeout(() => {
        progressBar.value = 0;
        statusEl.textContent = "";
      }, 900);
    } else {
      statusEl.textContent = "Upload failed";
      statusEl.style.color = "#ff5b6b";
    }
  };

  xhr.onerror = () => {
    statusEl.textContent = "Network error";
    statusEl.style.color = "#ff5b6b";
  };

  xhr.send(fd);
});

// ================== Load Files ==================
async function loadFiles() {
  try {
    const res = await fetch(`${SERVER_URL}/files`);
    if (!res.ok) throw new Error("Failed to load files");
    const files = await res.json();
    fileList.innerHTML = "";
    if (!files.length) {
      fileList.innerHTML = "<li style='color:#a9b4c2;padding:10px'>No files uploaded yet.</li>";
      return;
    }
    files.forEach(name => {
      const li = document.createElement("li");

      const left = document.createElement("div");
      left.textContent = name;
      left.style.flex = "1";

      const actions = document.createElement("div");
      actions.className = "file-actions";

      const dl = document.createElement("a");
      dl.href = `${SERVER_URL}/download/${encodeURIComponent(name)}`;
      dl.className = "icon-btn download";
      dl.innerHTML = "⬇";
      dl.title = "Download";
      dl.setAttribute("download", name);

      const del = document.createElement("button");
      del.className = "icon-btn delete";
      del.innerHTML = "🗑";
      del.title = "Delete";
      del.onclick = () => deleteFile(name);

      actions.append(dl, del);
      li.append(left, actions);
      fileList.append(li);
    });
  } catch (err) {
    console.error(err);
    fileList.innerHTML = "<li style='color:#ff5b6b;padding:10px'>Error loading files.</li>";
  }
}

// ================== Delete File ==================
async function deleteFile(name) {
  if (!confirm(`Delete "${name}"?`)) return;
  try {
    const res = await fetch(`${SERVER_URL}/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: name })
    });
    const data = await res.json();
    alert(data.message);
    loadFiles();
  } catch (err) {
    alert("Delete failed");
    console.error(err);
  }
}

// ================== Inner Guided By Button ==================
const innerGuideBtn = document.getElementById("innerGuideBtn");
const innerGuideSection = document.getElementById("innerGuideSection");

if (innerGuideBtn) {
  innerGuideBtn.addEventListener("click", () => {
    innerGuideSection.style.display = "block";
    innerGuideSection.style.opacity = 0;
    innerGuideSection.style.transition = "opacity 0.6s ease";
    setTimeout(() => (innerGuideSection.style.opacity = 1), 50);
    innerGuideBtn.style.display = "none";
  });
}

// ================== Initial Load ==================
loadFiles();

}); // end DOMContentLoaded