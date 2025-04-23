// Display the Add Form
var addForm = document.getElementById("gradeAddForm");
addForm.style.display = "block";
document.getElementById("gradeLessonTypeAddDropdown").style.display = "none";

// Function to toggle the display of the grade form container and show the Add Form
function toggleGradeForm() {
  var container = document.getElementById("gradeContainer");
  container.classList.toggle("collapsed");



  // If the container is not collapsed, show the Add Form and hide other forms
  if (!container.classList.contains("collapsed")) {
    // Hide all forms
    var forms = document.querySelectorAll("#gradeContainer .forms > div");
    forms.forEach(function (form) {
      form.style.display = "none";
    });

    // Display the Add Form
    var addForm = document.getElementById("gradeAddForm");
    addForm.style.display = "block";
  }
}


function handleActionButtonClick(event, formType) {
  // Remove active class from all action buttons
  var buttons = document.querySelectorAll("#gradeContainer .grade-action-btn");
  buttons.forEach(function (button) {
    button.classList.remove("active");
  });

  // Add active class to the clicked button
  event.target.classList.add("active");

  // Hide all forms
  var forms = document.querySelectorAll("#gradeContainer .forms > div");
  forms.forEach(function (form) {
    form.style.display = "none";
  });

  // Display the corresponding form based on the formType
  var selectedForm = document.getElementById(
    "grade" + formType.charAt(0).toUpperCase() + formType.slice(1) + "Form"
  );
  selectedForm.style.display = "block";
}
















// Function to fetch and populate student groups for the selected subject
function populateStudentGroups(subjectName) {
  fetch(`/grades/get_student_groups?subjectName=${subjectName}`)
    .then((response) => response.json())
    .then((studentGroups) => {
      const studentGroupList = document.getElementById("gradeStudentGroupList");
      studentGroupList.innerHTML = "";

      studentGroups.forEach((group) => {
        const option = document.createElement("li");
        option.textContent = group.collaborative_group_name;
        studentGroupList.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching student groups:", error));
}

// Function to fetch and populate students for the selected student group
function populateStudents(studentGroupName) {
  console.log("populate subjects based on: ",studentGroupName);
  fetch(`/grades/get_students?studentGroupName=${studentGroupName}`)
    .then((response) => response.json())
    .then((students) => {
      console.log("client get students: ", students)
      const studentList = document.getElementById("gradeStudentList");
      studentList.innerHTML = "";

      students.forEach((student) => {
        const option = document.createElement("li");
        option.textContent = student.student;
        studentList.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching students:", error));
}


// Function to fetch and populate lesson types for the add, update, and delete forms
function populateLessonTypes() {
  fetch("/grades/get_lesson_types")
    .then((response) => response.json())
    .then((lessonTypes) => {
      const addDropdown = document.getElementById("gradeLessonTypeAddList");
      const updateDropdown = document.getElementById("gradeLessonTypeUpdateList");
      const deleteDropdown = document.getElementById("gradeLessonTypeDeleteList");

      addDropdown.innerHTML = "";
      updateDropdown.innerHTML = "";
      deleteDropdown.innerHTML = "";

      lessonTypes.forEach((type) => {
        const optionAdd = document.createElement("li");
        optionAdd.textContent = type.lesson_type;
        optionAdd.addEventListener("click", function () {
          document.getElementById("LessonTypeAddInput").value = type.lesson_type;
          toggleLessonTypeAddDropdown();
        });
        addDropdown.appendChild(optionAdd);

        const optionUpdate = document.createElement("li");
        optionUpdate.textContent = type.lesson_type;
        optionUpdate.addEventListener("click", function () {
          document.getElementById("LessonTypeUpdateInput").value = type.lesson_type;
          toggleLessonTypeUpdateDropdown();
        });
        updateDropdown.appendChild(optionUpdate);

        const optionDelete = document.createElement("li");
        optionDelete.textContent = type.lesson_type;
        optionDelete.addEventListener("click", function () {
          document.getElementById("LessonTypeDeleteInput").value = type.lesson_type;
          toggleLessonTypeDeleteDropdown();
        });
        deleteDropdown.appendChild(optionDelete);
      });
    })
    .catch((error) => console.error("Error fetching lesson types:", error));
}

// Call the function to populate lesson types when the page loads
populateLessonTypes();

// Function to toggle the display of the add lesson type dropdown
function toggleLessonTypeAddDropdown() {
  console.log("Toggling add lesson type dropdown");
  const dropdown = document.getElementById("gradeLessonTypeAddDropdown");
  const input = document.getElementById("LessonTypeAddInput");

  dropdown.style.display = input === document.activeElement ? "block" : "none";
}
// Event listener for input in the add lesson type input field
const addLessonTypeInput = document.getElementById("LessonTypeAddInput");
addLessonTypeInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const options = document.querySelectorAll("#gradeLessonTypeAddList li");

  options.forEach((option) => {
    const optionText = option.textContent.toLowerCase();
    if (optionText.includes(searchValue)) {
      option.style.display = "block";
    } else {
      option.style.display = "none";
    }
  });

  toggleLessonTypeAddDropdown();
});

// Event listener to toggle the add lesson type dropdown based on input focus
addLessonTypeInput.addEventListener("focus", toggleLessonTypeAddDropdown);

// Function to toggle the display of the delete lesson type dropdown
function toggleLessonTypeDeleteDropdown() {
  const dropdown = document.getElementById("gradeLessonTypeDeleteDropdown");
  const input = document.getElementById("LessonTypeDeleteInput");

  dropdown.style.display = input === document.activeElement ? "block" : "none";
}

// Event listener for input in the delete lesson type input field
const deleteLessonTypeInput = document.getElementById("LessonTypeDeleteInput");
deleteLessonTypeInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const options = document.querySelectorAll("#gradeLessonTypeDeleteList li");

  options.forEach((option) => {
    const optionText = option.textContent.toLowerCase();
    if (optionText.includes(searchValue)) {
      option.style.display = "block";
    } else {
      option.style.display = "none";
    }
  });

  toggleLessonTypeDeleteDropdown();
});

// Event listener to toggle the delete lesson type dropdown based on input focus
deleteLessonTypeInput.addEventListener("focus", toggleLessonTypeDeleteDropdown);

// Function to toggle the display of the update lesson type dropdown
function toggleLessonTypeUpdateDropdown() {
  const dropdown = document.getElementById("gradeLessonTypeUpdateDropdown");
  const input = document.getElementById("LessonTypeUpdateInput");

  dropdown.style.display = input === document.activeElement ? "block" : "none";
}

// Event listener for input in the update lesson type input field
const updateLessonTypeInput = document.getElementById("LessonTypeUpdateInput");
updateLessonTypeInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const options = document.querySelectorAll("#gradeLessonTypeUpdateList li");

  options.forEach((option) => {
    const optionText = option.textContent.toLowerCase();
    if (optionText.includes(searchValue)) {
      option.style.display = "block";
    } else {
      option.style.display = "none";
    }
  });

  toggleLessonTypeUpdateDropdown();
});

// Event listener to toggle the update lesson type dropdown based on input focus
updateLessonTypeInput.addEventListener("focus", toggleLessonTypeUpdateDropdown);



















// Function to add a grade to the database
function addGrade() {
  // Get values from input fields
  var subject = document.getElementById("gradeSubjectSearchInput").value;

  var student = document.getElementById("gradeStudentSearchInput").value;
  var dateInput = document.getElementById("add-grade-date").value;
  var lessonType = document.getElementById("LessonTypeAddInput").value;
  var grade = document.getElementById("add-grade-grade").value;

  // Validate date format (MM/DD/YYYY)
  var dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
  if (!dateRegex.test(dateInput)) {
    console.error("Invalid date format. Please use MM/DD/YYYY.");
    return; // Exit function if date format is invalid
  }

  // Convert date format to YYYY-MM-DD
  var dateParts = dateInput.split("/");
  var formattedDate =
    dateParts[2] +
    "-" +
    dateParts[0].padStart(2, "0") +
    "-" +
    dateParts[1].padStart(2, "0");

  // Validate grade is not negative and not zero
  if (parseFloat(grade) <= 0) {
    console.error("Grade must be a positive number.");
    return; // Exit function if grade is negative or zero
  }

  // Prepare data to send to the server
  var data = {
    subject: subject,
    student: student,
    date: formattedDate,
    lessonType: lessonType,
    grade: parseFloat(grade),
  };

  // Send POST request to add route
  fetch("/grades/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        // Grade added successfully
        console.log("Grade added successfully.");
        // You can perform additional actions here if needed
      } else {
        // Error adding grade
        console.error("Error adding grade:", response.statusText);
        // You can handle the error here
      }
    })
    .catch((error) => {
      console.error("Error adding grade:", error);
      // You can handle the error here
    });
}

// Event listener for the grade-add-button click
var addGradeButton = document.getElementById("grade-add-button");
addGradeButton.addEventListener("click", addGrade);


// Function to update a grade in the database
function updateGrade() {
  // Get values from input fields
  var subject = document.getElementById("gradeSubjectSearchInput").value;
  var student = document.getElementById("gradeStudentSearchInput").value;
  var dateInput = document.getElementById("update-grade-date").value;
  var lessonType = document.getElementById("LessonTypeUpdateInput").value;
  var newGrade = document.getElementById("update-grade-grade").value;

  // Validate date format (MM/DD/YYYY)
  var dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
  if (!dateRegex.test(dateInput)) {
    console.error("Invalid date format. Please use MM/DD/YYYY.");
    return; // Exit function if date format is invalid
  }

  // Convert date format to YYYY-MM-DD
  var dateParts = dateInput.split("/");
  var formattedDate =
    dateParts[2] +
    "-" +
    dateParts[0].padStart(2, "0") +
    "-" +
    dateParts[1].padStart(2, "0");

  // Validate grade is not negative and not zero
  if (parseFloat(newGrade) <= 0) {
    console.error("Grade must be a positive number.");
    return; // Exit function if grade is negative or zero
  }

  // Prepare data to send to the server
  var data = {
    subject: subject,
    student: student,
    date: formattedDate,
    lessonType: lessonType,
    newGrade: parseFloat(newGrade),
  };

  // Send PUT request to update route
  fetch("/grades/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        // Grade updated successfully
        console.log("Grade updated successfully.");
        // You can perform additional actions here if needed
      } else {
        // Error updating grade
        console.error("Error updating grade:", response.statusText);
        // You can handle the error here
      }
    })
    .catch((error) => {
      console.error("Error updating grade:", error);
      // You can handle the error here
    });
}

// Event listener for the grade-update-button click
var updateGradeButton = document.getElementById("grade-update-button");
updateGradeButton.addEventListener("click", updateGrade);



// Function to remove a grade from the database
function removeGrade() {
  // Get values from input fields
  var student = document.getElementById("gradeStudentSearchInput").value;
  var subject = document.getElementById("gradeSubjectSearchInput").value;
  var dateInput = document.getElementById("delete-grade-date").value;
  var lessonType = document.getElementById("LessonTypeDeleteInput").value;

  // Validate date format (MM/DD/YYYY)
  var dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
  if (!dateRegex.test(dateInput)) {
    console.error("Invalid date format. Please use MM/DD/YYYY.");
    return; // Exit function if date format is invalid
  }

  // Convert date format to YYYY-MM-DD
  var dateParts = dateInput.split("/");
  var formattedDate =
    dateParts[2] +
    "-" +
    dateParts[0].padStart(2, "0") +
    "-" +
    dateParts[1].padStart(2, "0");

  // Prepare data to send to the server
  var data = {
    subject: subject,
    student: student,
    date: formattedDate,
    lessonType: lessonType,
  };

  // Send DELETE request to delete route
  fetch("/grades/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        // Grade deleted successfully
        console.log("Grade deleted successfully.");
        // You can perform additional actions here if needed
      } else {
        // Error deleting grade
        console.error("Error deleting grade:", response.statusText);
        // You can handle the error here
      }
    })
    .catch((error) => {
      console.error("Error deleting grade:", error);
      // You can handle the error here
    });
}

// Event listener for the grade-delete-button click
var deleteGradeButton = document.getElementById("grade-delete-button");
deleteGradeButton.addEventListener("click", removeGrade);












































// Function to toggle the display of the subject dropdown
function toggleSubjectDropdown() {
  const subjectDropdown = document.getElementById("gradeSubjectDropdown");
  const searchInput = document.getElementById("gradeSubjectSearchInput");

  subjectDropdown.style.display =
    searchInput === document.activeElement ? "block" : "none";
}

// Function to handle selection of subject
function selectSubject(event) {
  if (event.target.tagName === "LI") {
    const selectedSubject = event.target.textContent;
    const searchInput = document.getElementById("gradeSubjectSearchInput");
    searchInput.value = selectedSubject;

    // Clear subject group and student inputs
    document.getElementById("gradeStudentGroupSearchInput").value = "";
    document.getElementById("gradeStudentSearchInput").value = "";

    populateStudentGroups(selectedSubject);
    toggleSubjectDropdown();
  }
}

// Function to fetch subjects from the server and populate the subject dropdown
function populateSubjects() {
  fetch("/grades/get_subjects")
    .then((response) => response.json())
    .then((subjects) => {
      const subjectList = document.getElementById("gradeSubjectList");
      subjectList.innerHTML = "";

      subjects.forEach((subject) => {
        const option = document.createElement("li");
        option.textContent = subject.subject_name;
        subjectList.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching subjects:", error));
}

populateSubjects();

// Event listener to handle click on the subject list
const subjectList = document.getElementById("gradeSubjectList");
subjectList.addEventListener("click", selectSubject);

// Event listener for input in the subject search input field
const searchSubjectInput = document.getElementById("gradeSubjectSearchInput");
searchSubjectInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const subjects = document.querySelectorAll("#gradeSubjectList li");

  subjects.forEach((subject) => {
    const subjectName = subject.textContent.toLowerCase();
    if (subjectName.includes(searchValue)) {
      subject.style.display = "block";
    } else {
      subject.style.display = "none";
    }
  });

  toggleSubjectDropdown();
});

// Event listener to toggle the subject dropdown based on input focus
searchSubjectInput.addEventListener("focus", toggleSubjectDropdown);

// Function to toggle the display of the student group dropdown
function toggleStudentGroupDropdown() {
  const studentGroupDropdown = document.getElementById(
    "gradeStudentGroupDropdown"
  );
  const searchStudentGroupInput = document.getElementById(
    "gradeStudentGroupSearchInput"
  );

  studentGroupDropdown.style.display =
    searchStudentGroupInput === document.activeElement ? "block" : "none";
}

// Function to handle selection of student group
function selectStudentGroup(event) {
  if (event.target.tagName === "LI") {
    const selectedStudentGroup = event.target.textContent;
    const searchStudentGroupInput = document.getElementById(
      "gradeStudentGroupSearchInput"
    );
    searchStudentGroupInput.value = selectedStudentGroup;

    // Clear student input
    document.getElementById("gradeStudentSearchInput").value = "";

    populateStudents(selectedStudentGroup);
    toggleStudentGroupDropdown();
  }
}
// Event listener to handle click on the student group list
const studentGroupList = document.getElementById("gradeStudentGroupList");
studentGroupList.addEventListener("click", selectStudentGroup);

// Event listener for input in the student group search input field
const searchStudentGroupInput = document.getElementById(
  "gradeStudentGroupSearchInput"
);
searchStudentGroupInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const studentGroups = document.querySelectorAll("#gradeStudentGroupList li");

  studentGroups.forEach((group) => {
    const groupName = group.textContent.toLowerCase();
    if (groupName.includes(searchValue)) {
      group.style.display = "block";
    } else {
      group.style.display = "none";
    }
  });

  toggleStudentGroupDropdown();
});

// Event listener to toggle the student group dropdown based on input focus
searchStudentGroupInput.addEventListener("focus", toggleStudentGroupDropdown);

// Function to toggle the display of the student dropdown
function toggleStudentDropdown() {
  const studentDropdown = document.getElementById("gradeStudentDropdown");
  const searchStudentInput = document.getElementById("gradeStudentSearchInput");

  studentDropdown.style.display =
    searchStudentInput === document.activeElement ? "block" : "none";
}

// Function to handle selection of student
function selectStudent(event) {
  if (event.target.tagName === "LI") {
    const selectedStudent = event.target.textContent;
    const searchStudentInput = document.getElementById(
      "gradeStudentSearchInput"
    );
    searchStudentInput.value = selectedStudent;
    toggleStudentDropdown();
  }
}

// Event listener to handle click on the student list
const studentList = document.getElementById("gradeStudentList");
studentList.addEventListener("click", selectStudent);

// Event listener for input in the student search input field
const searchStudentInput = document.getElementById("gradeStudentSearchInput");
searchStudentInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const students = document.querySelectorAll("#gradeStudentList li");

  students.forEach((student) => {
    const studentName = student.textContent.toLowerCase();
    if (studentName.includes(searchValue)) {
      student.style.display = "block";
    } else {
      student.style.display = "none";
    }
  });

  toggleStudentDropdown();
});

// Event listener to toggle the student dropdown based on input focus
searchStudentInput.addEventListener("focus", toggleStudentDropdown);











// Event listener to hide the dropdowns when clicking outside the input and dropdown areas
document.body.addEventListener("click", function (event) {
  const isSubjectInput = event.target === searchSubjectInput;
  const isSubjectList = event.target === subjectList;
  const isSubjectDropdown =
    event.target === document.getElementById("gradeSubjectDropdown");

  const isStudentGroupInput = event.target === searchStudentGroupInput;
  const isStudentGroupList = event.target === studentGroupList;
  const isStudentGroupDropdown =
    event.target === document.getElementById("gradeStudentGroupDropdown");

  const isStudentInput = event.target === searchStudentInput;
  const isStudentList = event.target === studentList;
  const isStudentDropdown =
    event.target === document.getElementById("gradeStudentDropdown");

  const isAddLessonTypeInput = event.target === addLessonTypeInput;
  const isAddLessonTypeDropdown = event.target === document.getElementById("gradeLessonTypeAddDropdown");

  const isUpdateLessonTypeInput = event.target === updateLessonTypeInput;
  const isUpdateLessonTypeDropdown = event.target === document.getElementById("gradeLessonTypeUpdateDropdown");

  const isDeleteLessonTypeInput = event.target === deleteLessonTypeInput;
  const isDeleteLessonTypeDropdown = event.target === document.getElementById("gradeLessonTypeDeleteDropdown");

  if (!isSubjectInput && !isSubjectList && !isSubjectDropdown) {
    document.getElementById("gradeSubjectDropdown").style.display = "none";
  }

  if (!isStudentGroupInput && !isStudentGroupList && !isStudentGroupDropdown) {
    document.getElementById("gradeStudentGroupDropdown").style.display = "none";
  }

  if (!isStudentInput && !isStudentList && !isStudentDropdown) {
    document.getElementById("gradeStudentDropdown").style.display = "none";
  }

  if (!isAddLessonTypeInput && !isAddLessonTypeDropdown) {
    document.getElementById("gradeLessonTypeAddDropdown").style.display = "none";
  }

  if (!isUpdateLessonTypeInput && !isUpdateLessonTypeDropdown) {
    document.getElementById("gradeLessonTypeUpdateDropdown").style.display = "none";
  }

  if (!isDeleteLessonTypeInput && !isDeleteLessonTypeDropdown) {
    document.getElementById("gradeLessonTypeDeleteDropdown").style.display = "none";
  }
});