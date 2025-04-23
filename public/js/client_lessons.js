// client_lessons.js
const lessonSaveButton = document.querySelector(".lesson-save-button");

const lessonDeleteButton = document.querySelector(".lesson-delete-button");

const lessonUpdateButton = document.querySelector(".lesson-update-button");

var lessonAddForm = document.getElementById("lessonAddForm");
lessonAddForm.style.display = "block";

// Function to display the container
function displayLessonContainer(container) {
  var contentHeight = container.scrollHeight + "px"; // Get the content height
  container.classList.remove("collapsed");
  container.style.height = contentHeight; // Set height to content height
}

// Function to hide the container
function hideLessonContainer(container) {
  container.classList.add("collapsed");
  container.style.height = "0"; // Set height to 0
  container.addEventListener(
    "transitionend",
    function () {
      container.style.height = ""; // Reset height after animation
    },
    { once: true }
  );
}

// Function to toggle the display of the lesson form container and show the Add Form
function toggleLessonForm() {
  var container = document.getElementById("lessonContainer");
  var foldButton = document.querySelector(".lesson-fold-btn");
  var buttons = document.querySelectorAll(
    "#lessonContainer .lesson-action-btn"
  );
  var activeLessonAddButton = document.querySelector(
    ".lesson-action-btn[data-form='add']"
  );
  buttons.forEach(function (button) {
    button.classList.remove("active");
  });

  // Toggle the collapsed state of the container
  container.classList.toggle("collapsed");

  // Toggle the rotation of the fold button based on the collapsed state of the container
  if (container.classList.contains("collapsed")) {
    foldButton.classList.remove("rotate"); // Remove rotation if collapsed
  } else {
    foldButton.classList.add("rotate"); // Add rotation if not collapsed
  }

  // Manage the display of forms based on the state of the container
  if (!container.classList.contains("collapsed")) {
    // Hide all forms
    var forms = document.querySelectorAll("#lessonContainer .forms > div");
    forms.forEach(function (form) {
      form.style.display = "none";
    });

    // Display the Add Form
    var lessonAddForm = document.getElementById("lessonAddForm");
    lessonAddForm.style.display = "block";
    activeLessonAddButton.classList.add("active");
  }
}

function handleLessonActionButtonClick(event, formType) {
  // Remove active class from all action buttons
  var buttons = document.querySelectorAll(
    "#lessonContainer .lesson-action-btn"
  );
  buttons.forEach(function (button) {
    button.classList.remove("active");
  });

  // Add active class to the clicked button
  event.target.classList.add("active");

  // Hide all forms
  var forms = document.querySelectorAll("#lessonContainer .forms > div");
  forms.forEach(function (form) {
    form.style.display = "none";
  });

  // Display the corresponding form based on the formType
  var selectedForm = document.getElementById(
    "lesson" + formType.charAt(0).toUpperCase() + formType.slice(1) + "Form"
  );
  selectedForm.style.display = "block";
}

function displayLessonErrorMessage(message, type) {
  console.log("from lessons message display");

  var errorMessageElement = document.querySelector(".lesson-message-container");
  if (errorMessageElement) {
    errorMessageElement.textContent = message; // Set message text
    errorMessageElement.style.color = type === "error" ? "red" : "green"; // Set message color based on type
    errorMessageElement.style.opacity = "1"; // Ensure message is fully visible

    setTimeout(function () {
      errorMessageElement.style.opacity = "0"; // Fade out the message
    }, 3000); // 3 seconds duration
  }
}

function addLesson() {
  var subject = document.getElementById("lessonSubjectSearchInput").value;
  var lessonDate = document.getElementById("add-lesson-date").value;
  var lessonType = document.getElementById("add-lesson-type").value;
  console.log("client ; lesson: add - [subject]", subject);
  console.log("client ; lesson: add - [lesson_date]", lessonDate);
  console.log("client ; lesson: add - [lesson_type]", lessonType);
  // Validate lesson date format
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!datePattern.test(lessonDate)) {
    displayLessonErrorMessage(
      "Invalid date format. Please use MM/DD/YYYY.",
      "error"
    );
    return;
  }

  const requestData = {
    lesson_subject: subject,
    lesson_date: lessonDate,
    lesson_type: lessonType,
  };

  fetch("/lessons/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        displayLessonErrorMessage(data.error, "error");
      } else {
        displayLessonErrorMessage("Lesson added successfully.", "success");
      }
    })
    .catch((error) => {
      console.error("Error adding lesson:", error);
      displayLessonErrorMessage(
        "Failed to add lesson. Please try again later.",
        "error"
      );
    });
}

lessonSaveButton.addEventListener("click", addLesson);

function deleteLesson() {
  var subject = document.getElementById("lessonSubjectSearchInput").value;

  const lessonDate = document.getElementById("delete-lesson-date").value;
  const lessonType = document.getElementById("delete-lesson-type").value;
  console.log("client ; lesson: delete - [subject]", subject);
  console.log("client ; lesson: delete - [lesson_date]", lessonDate);
  console.log("client ; lesson: delete - [lesson_type]", lessonType);

  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!datePattern.test(lessonDate)) {
    displayLessonErrorMessage(
      "Invalid date format. Please use MM/DD/YYYY.",
      "error"
    );
    return;
  }

  const requestData = {
    lesson_subject: subject,
    lesson_date: lessonDate,
    lesson_type: lessonType,
  };

  fetch("/lessons/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        displayLessonErrorMessage(data.error, "error");
      } else {
        displayLessonErrorMessage("Lesson removed successfully.", "success");
      }
    })
    .catch((error) => {
      console.error("Error adding lesson:", error);
      displayLessonErrorMessage(
        "Failed to add lesson. Please try again later.",
        "error"
      );
    });
}

lessonDeleteButton.addEventListener("click", deleteLesson);

function updateLesson() {
  var subject = document.getElementById("lessonSubjectSearchInput").value;

  const fromLessonDate = document.getElementById(
    "update-from-lesson-date"
  ).value;
  const toLessonDate = document.getElementById("update-to-lesson-date").value;
  const fromLessonType = document.getElementById(
    "update-from-lesson-type"
  ).value;
  const toLessonType = document.getElementById("update-to-lesson-type").value;

  console.log("client ; lesson: delete - [subject]", subject);
  console.log("client ; lesson: delete - [to_lesson_date]", toLessonDate);
  console.log("client ; lesson: delete - [from_lesson_date]", fromLessonDate);
  console.log("client ; lesson: delete - [to_lesson_type]", toLessonType);
  console.log("client ; lesson: delete - [from_lesson_type]", fromLessonType);


  // Validate lesson date formats
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!datePattern.test(fromLessonDate) || !datePattern.test(toLessonDate)) {
    displayLessonErrorMessage(
      "Invalid date format. Please use MM/DD/YYYY.",
      "error"
    );
    return;
  }

  const requestData = {
    lesson_subject: subject,
    from_lesson_date: fromLessonDate,
    to_lesson_date: toLessonDate,
    from_lesson_type: fromLessonType,
    to_lesson_type: toLessonType,
  };

  fetch("/lessons/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        displayLessonErrorMessage(data.error, "error");
      } else {
        displayLessonErrorMessage("Lesson updated successfully.", "success");
      }
    })
    .catch((error) => {
      console.error("Error updating lesson:", error);
      displayLessonErrorMessage(
        "Failed to update lesson. Please try again later.",
        "error"
      );
    });
}

lessonUpdateButton.addEventListener("click", updateLesson);

// Function to populate options for a select element
function populateSelectOptions(selectElement, options) {
  if (selectElement) {
    selectElement.innerHTML = ""; // Clear existing options
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.textContent = option;
      selectElement.appendChild(optionElement);
    });
  } else {
    console.error("Select element not found.");
  }
}

// Function to fetch and populate lesson types for the add, update, and delete forms
function populateLessonTypes() {
  fetch("/lessons/get_lesson_types")
    .then((response) => response.json())
    .then((lessonTypes) => {
      const addLessonTypeSelect = document.getElementById("add-lesson-type");
      const updateFromLessonTypeSelect = document.getElementById(
        "update-from-lesson-type"
      );
      const updateToLessonTypeSelect = document.getElementById(
        "update-to-lesson-type"
      );
      const deleteLessonTypeSelect =
        document.getElementById("delete-lesson-type");

      populateSelectOptions(addLessonTypeSelect, lessonTypes);
      populateSelectOptions(updateFromLessonTypeSelect, lessonTypes);
      populateSelectOptions(updateToLessonTypeSelect, lessonTypes);
      populateSelectOptions(deleteLessonTypeSelect, lessonTypes);
    })
    .catch((error) => console.error("Error fetching lesson types:", error));
}

// Call the function to populate lesson types when the page loads
populateLessonTypes();

// Function to toggle the display of the subject dropdown
function toggleLessonSubjectDropdown() {
  const subjectDropdown = document.getElementById("lessonSubjectDropdown");
  const searchInput = document.getElementById("lessonSubjectSearchInput");

  subjectDropdown.style.display =
    searchInput === document.activeElement ? "block" : "none";
}

// Function to fetch and populate students for the selected student group
function populateStudents(studentGroupName) {
  console.log("populate subjects based on: ", studentGroupName);
  fetch(`/lessons/get_students?studentGroupName=${studentGroupName}`)
    .then((response) => response.json())
    .then((students) => {
      console.log("client get students: ", students);
      const studentList = document.getElementById("lessonStudentList");
      studentList.innerHTML = "";

      students.forEach((student) => {
        const option = document.createElement("li");
        option.textContent = student.student;
        studentList.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching students:", error));
}

// Function to fetch subjects from the server and populate the subject dropdown
function populateSubjects() {
  fetch("/lessons/get_subjects")
    .then((response) => response.json())
    .then((subjects) => {
      const lessonSubjectList = document.getElementById("lessonSubjectList");
      lessonSubjectList.innerHTML = "";

      subjects.forEach((subject) => {
        const option = document.createElement("li");
        option.textContent = subject.subject_name;
        lessonSubjectList.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching subjects:", error));
}

populateSubjects();

// Event listener to handle click on the subject list
const lessonSubjectList = document.getElementById("lessonSubjectList");
lessonSubjectList.addEventListener("click", selectSubject);

// Event listener for input in the subject search input field
const lessonSearchSubjectInput = document.getElementById(
  "lessonSubjectSearchInput"
);
lessonSearchSubjectInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const subjects = document.querySelectorAll("#lessonSubjectList li");

  subjects.forEach((subject) => {
    const subjectName = subject.textContent.toLowerCase();
    if (subjectName.includes(searchValue)) {
      subject.style.display = "block";
    } else {
      subject.style.display = "none";
    }
  });

  toggleLessonSubjectDropdown();
});

// Event listener to toggle the subject dropdown based on input focus
lessonSearchSubjectInput.addEventListener("focus", toggleLessonSubjectDropdown);

// Function to handle selection of subject
function selectSubject(event) {
  if (event.target.tagName === "LI") {
    const selectedSubject = event.target.textContent;
    const searchInput = document.getElementById("lessonSubjectSearchInput");
    searchInput.value = selectedSubject;

    toggleLessonSubjectDropdown();
  }
}

// Event listener to hide the dropdowns when clicking outside the input and dropdown areas
document.body.addEventListener("click", function (event) {
  const isSubjectInput = event.target === lessonSearchSubjectInput;
  const isSubjectList = event.target === lessonSubjectList;
  const isSubjectDropdown =
    event.target === document.getElementById("lessonSubjectDropdown");

  if (!isSubjectInput && !isSubjectList && !isSubjectDropdown) {
    document.getElementById("lessonSubjectDropdown").style.display = "none";
  }
});