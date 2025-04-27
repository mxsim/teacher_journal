document.addEventListener("DOMContentLoaded", function () {
  // 1. Modal toggle function
  window.toggleModal = function (modalId, show = true) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = show ? "block" : "none";
  };

  // 2. Debounce helper
  const debounce = (func, delay = 300) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // 3. Search functionality
  // Speciality search
  document.getElementById("specialitySearch")?.addEventListener(
    "input",
    debounce(async (e) => {
      const query = e.target.value;
      if (!query) {
        document.getElementById("specialityResults").innerHTML = "";
        return;
      }
      try {
        const response = await fetch(
          `/group/api/specialities/search?q=${encodeURIComponent(
            query
          )}&limit=5`
        );
        const specialities = await response.json();

        const results = specialities
          .map((spec) => {
            const safeName = spec.speciality_name
              .replace(/'/g, "\\'")
              .replace(/"/g, '\\"');
            return `<div class="search-item" data-id="${spec.speciality_id}" data-name="${safeName}">
              ${spec.speciality_name}
            </div>`;
          })
          .join("");

        document.getElementById("specialityResults").innerHTML = results;
      } catch (error) {
        console.error("Search error:", error);
      }
    })
  );

  // Student search
  document.getElementById("studentSearch")?.addEventListener(
    "input",
    debounce(async (e) => {
      const query = e.target.value;
      const specialityId = document.getElementById("specialityId").value;
      if (!query || !specialityId) return;
      try {
        const response = await fetch(
          `/group/api/students/search?q=${encodeURIComponent(
            query
          )}&specialityId=${specialityId}&limit=5`
        );
        const students = await response.json();
        const results = students
          .map(
            (student) =>
              `<div class="search-item" data-id="${student.student_id}" data-name="${student.surname} ${student.name}">
                ${student.surname} ${student.name} ${student.parent_name}
              </div>`
          )
          .join("");
        document.getElementById("studentResults").innerHTML = results;
      } catch (error) {
        console.error("Student search error:", error);
      }
    })
  );

  // 4. Event delegation for search results
  document
    .getElementById("specialityResults")
    ?.addEventListener("click", (e) => {
      const item = e.target.closest(".search-item");
      if (item) {
        selectSpeciality(item.dataset.id, item.dataset.name);
      }
    });

  document.getElementById("studentResults")?.addEventListener("click", (e) => {
    const item = e.target.closest(".search-item");
    if (item) {
      selectStudent(item.dataset.id, item.dataset.name);
    }
  });

  // 5. Delete functionality
  document.addEventListener("click", function (e) {
    // Delete button click
    if (e.target.classList.contains("delete-btn")) {
      e.preventDefault();
      const form = e.target.closest("form");
      const actionParts = form.action.split("/");
      const groupId = actionParts[4];
      const userId = actionParts[6];

      document.getElementById("delete-group-id").value = groupId;
      document.getElementById("delete-student-id").value = userId;
      toggleModal("delete-student-modal");
    }

    // Add member form submission
    if (
      e.target.classList.contains("submit-btn") &&
      e.target.form?.id === "addMemberForm"
    ) {
      e.preventDefault();
      const form = e.target.form;
      const studentId = document.getElementById("studentId").value;
      const groupId = form.action.split("/")[4];

      if (!studentId) {
        alert("Будь ласка, виберіть студента");
        return;
      }

      fetch(`/group/${groupId}/member/${studentId}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            window.location.reload();
          } else {
            return response.json().then((err) => {
              throw err;
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert(error.error || "Сталася помилка");
        });
    }
  });

  // Delete form submission
  document
    .getElementById("delete-student-form")
    ?.addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const groupId = formData.get("group_id");
      const studentId = formData.get("student_id");

      try {
        const response = await fetch(
          `/group/${groupId}/members/${studentId}/delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              _method: "DELETE",
            }),
          }
        );

        if (response.ok) {
          window.location.reload();
        } else {
          alert("Помилка при видаленні студента");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Сталася помилка");
      }
    });

  // Selection handlers
  window.selectSpeciality = (id, name) => {
    document.getElementById("specialitySearch").value = name;
    document.getElementById("specialityId").value = id;
    document.getElementById("specialityResults").innerHTML = "";
    document.getElementById("studentSearch").disabled = false;
    document.getElementById("studentSearch").value = "";
    document.getElementById("studentId").value = "";
  };

  window.selectStudent = (id, fullName) => {
    document.getElementById("studentSearch").value = fullName;
    document.getElementById("studentId").value = id;
    document.getElementById("studentResults").innerHTML = "";
  };
});
