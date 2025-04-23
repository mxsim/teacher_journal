/* client_group_subjects.js */

console.log("hihi")
document.addEventListener("DOMContentLoaded", () => {
  // DOM References
  const addModal = document.getElementById("add-group-modal");
  const editModal = document.getElementById("edit-group-modal");
  const deleteModal = document.getElementById("delete-group-modal");
  const addBtn = document.getElementById("add-group-btn");
  const searchInput = document.getElementById("group-search");
  const sortSelect = document.getElementById("group-sort");
  const groupsContainer = document.getElementById("groups-container");

  // Dropdown toggle logic
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      document
        .querySelectorAll(".dropdown-menu")
        .forEach((menu) => (menu.style.display = "none"));
    }
    if (e.target.classList.contains("dots-btn")) {
      const dropdown = e.target.nextElementSibling;
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
      e.stopPropagation();
    }
  });

  // Modal open/close functions
  function openModal(modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeModal(modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
    if (modal === addModal) {
      document.getElementById("add-group-form").reset();
      document.getElementById("add-photo-preview").innerHTML = "";
    }
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => openModal(addModal));
  }

  document.querySelectorAll(".close-btn, .cancel-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      closeModal(e.target.closest(".modal"));
    });
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Image preview logic
  document
    .getElementById("add-group-photo")
    ?.addEventListener("change", handleImagePreview("add-photo-preview"));
  document
    .getElementById("edit-group-photo")
    ?.addEventListener("change", handleImagePreview("edit-photo-preview"));

  function handleImagePreview(previewId) {
    return function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (evt) {
        document.getElementById(
          previewId
        ).innerHTML = `<img src="${evt.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    };
  }

  // Search and sort logic for groups
  searchInput?.addEventListener("input", filterGroups);
  sortSelect?.addEventListener("change", filterGroups);

  function filterGroups() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortOrder = sortSelect.value;
    const groupCards = document.querySelectorAll(".group-card");

    groupCards.forEach((card) => {
      const name = card.querySelector(".group-name").textContent.toLowerCase();
      card.style.display = name.includes(searchTerm) ? "block" : "none";
    });

    // Sorting visible cards based on group name
    const visibleCards = Array.from(groupCards).filter(
      (card) => card.style.display !== "none"
    );
    visibleCards.sort((a, b) => {
      const nameA = a.querySelector(".group-name").textContent.toLowerCase();
      const nameB = b.querySelector(".group-name").textContent.toLowerCase();
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
    visibleCards.forEach((card) => groupsContainer.appendChild(card));
  }

  // Event delegation for edit and delete buttons
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-group-btn")) handleEditClick(e);
    if (e.target.classList.contains("delete-group-btn")) handleDeleteClick(e);
  });

async function handleEditClick(e) {
  const card = e.target.closest(".group-card");
  const groupId = card.dataset.id;

  try {
    const response = await fetch(`/groups/${groupId}`);
    if (!response.ok) throw new Error("Failed to fetch group data");

    const group = await response.json();

    // Get all elements first
    const editGroupId = document.getElementById("edit-group-id");
    const editGroupName = document.getElementById("edit-group-name");
    const editSubjectId = document.getElementById("edit-subject-id");
    const editCurrentPhoto = document.getElementById("edit-current-photo");
    const preview = document.getElementById("edit-photo-preview");

    // Set values
    editGroupId.value = group.subject_group_id;
    editGroupName.value = group.group_name;
    editSubjectId.value = group.subject_id;
    editCurrentPhoto.value = group.subject_group_photo || "";

    // Update image preview
    if (group.subject_group_photo) {
      preview.innerHTML = `
        <img src="/uploads/subject_groups/subject_group_photos/${group.subject_group_photo}" 
             alt="Current Image">
      `;
    } else {
      preview.innerHTML = "";
    }

    openModal(editModal);
  } catch (err) {
    console.error("Error in handleEditClick:", err);
    alert(`Error: ${err.message}\nPlease check console for details.`);
  }
}





  function handleDeleteClick(e) {
    const card = e.target.closest(".group-card");
    const groupId = card.dataset.id;
    const groupName = card.querySelector(".group-name").textContent;
    document.getElementById("delete-group-id").value = groupId;
    document.getElementById("delete-group-name").textContent = groupName;
    openModal(deleteModal);
  }




  // Form submission handlers
  // Add Group Form
document
  .getElementById("add-group-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch("/groups/add", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        window.location.reload();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error adding group:", error);
      alert("Failed to add group. Check console for details.");
    }
  });

  document
    .getElementById("edit-group-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const groupId = document.getElementById("edit-group-id").value;
      try {
        const response = await fetch(`/groups/${groupId}`, {
          method: "PUT",
          body: formData,
        });
        if (response.ok) window.location.reload();
      } catch (error) {
        console.error("Error updating group:", error);
      }
    });

  document
    .getElementById("delete-group-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const groupId = document.getElementById("delete-group-id").value;
      try {
        const response = await fetch(`/groups/${groupId}`, {
          method: "DELETE",
        });
        if (response.ok) window.location.reload();
      } catch (error) {
        console.error("Error deleting group:", error);
      }
    });
});
