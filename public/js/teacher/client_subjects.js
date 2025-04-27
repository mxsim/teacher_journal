// client_subjects.js
document.addEventListener("DOMContentLoaded", () => {
  // DOM References
  const addModal = document.getElementById("add-subject-modal");
  const editModal = document.getElementById("edit-subject-modal");
  const deleteModal = document.getElementById("delete-subject-modal");
  const addBtn = document.getElementById("add-subject-btn");
  const searchInput = document.getElementById("search");
  const sortSelect = document.getElementById("sort");
  const groupFilter = document.getElementById("groupFilter");
  const subjectsContainer = document.getElementById("subjects-container");
  const filterForm = document.getElementById("filter-form");
  
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
      document.getElementById("add-subject-form").reset();
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
    .getElementById("add-subject-photo")
    ?.addEventListener("change", handleImagePreview("add-photo-preview"));
  document
    .getElementById("edit-subject-photo")
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



 
  // Event delegation for edit and delete buttons
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) handleEditClick(e);
    if (e.target.classList.contains("delete-btn")) handleDeleteClick(e);
  });

  // Update the handleEditClick function in client_subjects.js
  async function handleEditClick(e) {
    const card = e.target.closest(".subject-card");
    const subjectId = card.dataset.id;

    try {
      const response = await fetch(`/subjects/${subjectId}`);
      if (!response.ok) throw new Error("Failed to fetch subject");

      const subject = await response.json();

      // Ensure elements exist before setting values
      const editSubjectId = document.getElementById("edit-subject-id");
      const editSubjectName = document.getElementById("edit-subject-name");
      const editDepartment = document.getElementById("edit-department");
      const editCurrentPhoto = document.getElementById("edit-current-photo");
      const preview = document.getElementById("edit-photo-preview");

      if (
        !editSubjectId ||
        !editSubjectName ||
        !editDepartment ||
        !editCurrentPhoto ||
        !preview
      ) {
        throw new Error("Required form elements not found");
      }

      editSubjectId.value = subject.subject_id;
      editSubjectName.value = subject.subject_name;
      editDepartment.value = subject.department_id;
      editCurrentPhoto.value = subject.subject_photo || "";

      preview.innerHTML = subject.subject_photo
        ? `<img src="${subject.subject_photo}" alt="Current Image">`
        : "";


        

        // Prevent form submission when clicking add button
        if (addBtn && filterForm) {
          addBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal(addModal);
          });
        }

      openModal(editModal);
    } catch (err) {
      console.error("Error loading subject:", err);
      alert("Failed to load subject data: " + err.message);
    }
  }

  // Add this to initialize the filter form submission
  document
    .getElementById("filter-form")
    ?.addEventListener("change", function () {
      this.submit();
    });

  function handleDeleteClick(e) {
    const card = e.target.closest(".subject-card");
    const subjectId = card.dataset.id;
    const subjectName = card.querySelector(".subject-name").textContent;
    document.getElementById("delete-subject-id").value = subjectId;
    document.getElementById("delete-subject-name").textContent = subjectName;
    openModal(deleteModal);
  }

  // Form submission handlers
  // Add Subject Form
  document
    .getElementById("add-subject-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      try {
        const response = await fetch("/subjects/add", {
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
        console.error("Error adding subject:", error);
        alert("Failed to add subject. Check console for details.");
      }
    });

  // Edit Subject Form
  document
    .getElementById("edit-subject-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const subjectId = document.getElementById("edit-subject-id").value;
      try {
        const response = await fetch(`/subjects/${subjectId}`, {
          method: "PUT",
          body: formData,
        });
        if (response.ok) window.location.reload();
      } catch (error) {
        console.error("Error updating subject:", error);
      }
    });

  // Delete Subject Form
  document
    .getElementById("delete-subject-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const subjectId = document.getElementById("delete-subject-id").value;
      try {
        const response = await fetch(`/subjects/${subjectId}`, {
          method: "DELETE",
        });
        if (response.ok) window.location.reload();
      } catch (error) {
        console.error("Error deleting subject:", error);
      }
    });
});
