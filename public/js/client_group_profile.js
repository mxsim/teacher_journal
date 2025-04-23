// Пошук та сортування
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("studentSearch");
  const sortSelect = document.getElementById("sortStudents");
  const studentItems = document.querySelectorAll(".student-item");

  searchInput.addEventListener("input", filterStudents);
  sortSelect.addEventListener("change", sortStudents);

  function filterStudents() {
    const searchTerm = searchInput.value.toLowerCase();

    studentItems.forEach((item) => {
      const studentName = item
        .querySelector(".student-info span")
        .textContent.toLowerCase();
      const speciality = item.dataset.speciality.toLowerCase();

      if (studentName.includes(searchTerm) || speciality.includes(searchTerm)) {
        item.style.display = "grid";
      } else {
        item.style.display = "none";
      }
    });
  }

  function sortStudents() {
    const sortBy = sortSelect.value;
    const container = document.querySelector(".students-list");
    const items = Array.from(document.querySelectorAll(".student-item"));

    items.sort((a, b) => {
      const nameA = a.querySelector(".student-info span").textContent;
      const nameB = b.querySelector(".student-info span").textContent;
      const specA = a.dataset.speciality;
      const specB = b.dataset.speciality;

      switch (sortBy) {
        case "asc":
          return nameA.localeCompare(nameB);
        case "desc":
          return nameB.localeCompare(nameA);
        case "speciality":
          return specA.localeCompare(specB) || nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

    items.forEach((item) => container.appendChild(item));
  }
});

// Додавання/видалення студентів
function toggleStudentSearch() {
  const modal = document.getElementById("studentSearchModal");
  modal.style.display = modal.style.display === "block" ? "none" : "block";
}

async function searchStudents() {
  const query = document.getElementById("searchStudentInput").value;
  if (query.length < 2) return;

  try {
    const response = await fetch(`/api/students/search?q=${query}`);
    const results = await response.json();

    const resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";

    results.forEach((student) => {
      const div = document.createElement("div");
      div.className = "search-result-item";
      div.innerHTML = `
        <span>${student.surname} ${student.name} (${student.speciality_abbreviation})</span>
        <button onclick="addStudent(${student.user_id})">Додати</button>
      `;
      resultsContainer.appendChild(div);
    });
  } catch (err) {
    console.error("Search error:", err);
  }
}

async function addStudent(studentId) {
  const groupId = new URLSearchParams(window.location.search).get("id");

  try {
    const response = await fetch(`/group/${groupId}/add-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });

    if (response.ok) {
      location.reload();
    }
  } catch (err) {
    console.error("Add student error:", err);
  }
}

async function removeStudent(groupId, studentId) {
  if (!confirm("Ви впевнені, що хочете видалити студента з групи?")) return;

  try {
    const response = await fetch(
      `/group/${groupId}/remove-student/${studentId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      location.reload();
    }
  } catch (err) {
    console.error("Remove student error:", err);
  }
}
