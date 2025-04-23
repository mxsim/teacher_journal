// client_subject_profile.js
document.addEventListener("DOMContentLoaded", () => {
  // Navigation toggle
  document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
      });
      document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      document.getElementById(button.dataset.target).classList.add('active');
    });
  });

  // Initially show first content section
  document.querySelector('.nav-button.active').click();
});

function toggleSection(sectionId) {
  const content = document.getElementById(`${sectionId}-content`);
  const icon = content.previousElementSibling.querySelector('.toggle-icon');
  content.classList.toggle('active');
  icon.textContent = content.classList.contains("active") ? "▼" : "▷";
}


async function deleteMaterial(materialId) {
  if (confirm("Ви впевнені, що хочете видалити цей матеріал?")) {
    try {
      const response = await fetch(`/subjects/materials/${materialId}`, {
        method: 'DELETE'
      });
      if (response.ok) location.reload();
    } catch (err) {
      console.error('Error deleting material:', err);
    }
  }
}

function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Handle description form
document.getElementById('descriptionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  try {
    const response = await fetch(`/subjects/${subjectId}/description`, {
      method: 'POST',
      body: new URLSearchParams(formData)
    });
    
    if (response.ok) {
      closeModal('editDescriptionModal');
      location.reload();
    }
  } catch (err) {
    console.error('Error updating description:', err);
  }
});

// Handle material form
document.getElementById('materialForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  try {
    const response = await fetch(`/subjects/${subjectId}/materials`, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      closeModal('addMaterialModal');
      location.reload();
    }
  } catch (err) {
    console.error('Error uploading material:', err);
  }
});


// for server functionalities i think

async function updateDescription() {
  const description = document.getElementById("subjectDescription").value;
  try {
    const response = await fetch(`/subjects/${subjectId}/description`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });

    if (response.ok) {
      alert("Опис успішно оновлено!");
      location.reload();
    }
  } catch (err) {
    console.error("Помилка оновлення опису:", err);
  }
}

// Material Deletion
async function confirmDelete(materialId) {
  if (confirm("Ви впевнені, що хочете видалити цей матеріал?")) {
    try {
      const response = await fetch(`/subjects/materials/${materialId}`, {
        method: "DELETE",
      });
      if (response.ok) location.reload();
    } catch (err) {
      console.error("Помилка видалення:", err);
    }
  }
}

// Group Management
async function confirmDeleteGroup(groupId) {
  if (confirm("Ви впевнені, що хочете видалити цю групу?")) {
    try {
      const response = await fetch(`/subjects/groups/${groupId}`, {
        method: "DELETE",
      });
      if (response.ok) location.reload();
    } catch (err) {
      console.error("Помилка видалення групи:", err);
    }
  }
}