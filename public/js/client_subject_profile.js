// client_subject_profile.js

function toggleModal(id) {
  document.getElementById(id).style.display = "block";
}
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function toggleSection(key) {
  document.getElementById(key + "-content").classList.toggle("active");
}

// ---- Description AJAX (optional) ----
document
  .getElementById("descriptionForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const res = await fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)),
    });
    const msg = document.getElementById("descriptionMessage");
    msg.textContent = res.ok ? "Збережено!" : "Помилка";
  });

// ---- Add Material is plain form submit ----
// ---- Edit Material ----
function showEditMaterialModal(id, name, type) {
  const form = document.getElementById("editMaterialForm");
  form.action = `/subject/materials/${id}/rename`;
  document.getElementById("edit-file-name").value = name;
  document.getElementById("edit-material-type").value = type;
  toggleModal("editMaterialModal");
}

// ---- Delete Material ----
function confirmDeleteMaterial(id, name) {
  const form = document.getElementById("deleteMaterialForm");
  form.action = `/subject/materials/${id}/delete`;
  document.getElementById("delete-material-name").textContent = name;
  toggleModal("deleteMaterialModal");
}

// ---- Delete Group ----
function confirmDeleteGroup(id, groupName) {
  const form = document.getElementById("deleteGroupForm");
  form.action = `/subject/groups/${id}/delete`;
  document.getElementById("delete-group-name").textContent = groupName;
  toggleModal("deleteGroupModal");
}

// ---- Tab switching (no page reload) ----
document.querySelectorAll(".nav-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".content-section, .nav-button")
      .forEach((el) => el.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});
