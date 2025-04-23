document.addEventListener("DOMContentLoaded", () => {
  // =======================
  // DOM REFERENCES
  // =======================
  const addModal = document.getElementById("add-subject-modal");
  const editModal = document.getElementById("edit-subject-modal");
  const deleteModal = document.getElementById("delete-subject-modal");
  const addBtn = document.getElementById("add-subject-btn");
  const searchInput = document.getElementById("search");
  const sortSelect = document.getElementById("sort");
  const groupFilter = document.getElementById("groupFilter");

  // =======================
  // UI INTERACTIONS
  // =======================

  // Dropdown toggle handler
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      document
        .querySelectorAll(".dropdown-menu")
        .forEach((menu) => (menu.style.display = "none"));
    }

    if (e.target.classList.contains("dots-btn")) {
      const dropdown = e.target.nextElementSibling;
      const isVisible = dropdown.style.display === "block";
      document
        .querySelectorAll(".dropdown-menu")
        .forEach((menu) => (menu.style.display = "none"));
      dropdown.style.display = isVisible ? "none" : "block";
      e.stopPropagation();
    }
  });

  // Modal open/close logic
  function openModal(modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
    if (modal === addModal) {
      document.getElementById("add-subject-form").reset();
      document.getElementById("add-image-preview").innerHTML = "";
    }
  }

  addBtn.addEventListener("click", () => openModal(addModal));
  document.querySelectorAll(".close-btn, .cancel-btn").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      closeModal(e.target.closest(".modal"))
    );
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Image preview logic
  document
    .getElementById("add-subject-image")
    .addEventListener("change", handleImagePreview("add-image-preview"));
  document
    .getElementById("edit-subject-image")
    .addEventListener("change", handleImagePreview("edit-image-preview"));

  function handleImagePreview(previewId) {
    return function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById(
          previewId
        ).innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    };
  }

  // Search & filter logic
  searchInput.addEventListener("input", filterSubjects);
  sortSelect.addEventListener("change", filterSubjects);
  groupFilter.addEventListener("change", filterSubjects);

  function filterSubjects() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortOrder = sortSelect.value;
    const selectedGroup = groupFilter.value;

    const subjectCards = document.querySelectorAll(".subject-card");

    subjectCards.forEach((card) => {
      const name = card
        .querySelector(".subject-name")
        .textContent.toLowerCase();
      const groups = card.dataset.groups ? card.dataset.groups.split(",") : [];
      const matchesSearch = name.includes(searchTerm);
      const matchesGroup = !selectedGroup || groups.includes(selectedGroup);
      card.style.display = matchesSearch && matchesGroup ? "block" : "none";
    });

    const container = document.getElementById("subjects-container");
    const visibleCards = [...subjectCards].filter(
      (card) => card.style.display !== "none"
    );

    visibleCards.sort((a, b) => {
      const nameA = a.querySelector(".subject-name").textContent.toLowerCase();
      const nameB = b.querySelector(".subject-name").textContent.toLowerCase();
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    visibleCards.forEach((card) => container.appendChild(card));
  }

  // =======================
  // SERVER INTERACTIONS
  // =======================

  // Unified click listener for edit/delete buttons
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) handleEditClick(e);
    if (e.target.classList.contains("delete-btn")) handleDeleteClick(e);
  });

  async function handleEditClick(e) {
    const card = e.target.closest(".subject-card");
    const subjectId = card.dataset.id;

    try {
      const response = await fetch(`/subjects/${subjectId}`);
      const subject = await response.json();

      document.getElementById("edit-subject-id").value = subject.subject_id;
      document.getElementById("edit-subject-name").value = subject.subject_name;
      document.getElementById("edit-department").value = subject.department_id;
      document.getElementById("edit-description").value =
        subject.description || "";

      const preview = document.getElementById("edit-image-preview");
      preview.innerHTML = subject.subject_photo
        ? `<img src="${subject.subject_photo}" alt="Current Image">`
        : "";

      openModal(editModal);
    } catch (err) {
      console.error("Error fetching subject:", err);
      alert("Failed to load subject data.");
    }
  }

  function handleDeleteClick(e) {
    const card = e.target.closest(".subject-card");
    const subjectId = card.dataset.id;
    const subjectName = card.querySelector(".subject-name").textContent;

    document.getElementById("delete-subject-id").value = subjectId;
    document.getElementById("delete-subject-name").textContent = subjectName;

    openModal(deleteModal);
  }

  document
    .getElementById("add-subject-form")
    .addEventListener("submit", handleFormSubmit("POST"));
  document
    .getElementById("edit-subject-form")
    .addEventListener("submit", handleFormSubmit("PUT"));
  document
    .getElementById("delete-subject-form")
    .addEventListener("submit", handleDeleteSubmit);

  // Add Subject Form Submission
  document
    .getElementById("add-subject-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      try {
        const response = await fetch("/subjects/add", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });

  // Edit Subject Form Submission
  document
    .getElementById("edit-subject-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const subjectId = document.getElementById("edit-subject-id").value;

      try {
        const response = await fetch(`/subjects/${subjectId}`, {
          method: "PUT",
          body: formData,
        });

        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });


    
});
