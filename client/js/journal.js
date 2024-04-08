// Define global variables to hold selected values
let selectedMonth = "";
let selectedYear = "";
let selectedGroup = "";
let selectedSubject = "";

// Add change event listeners to dropdown menus
const monthSelect = document.getElementById("month");
const yearSelect = document.getElementById("year");
const groupSelect = document.getElementById("group");
const subjectSelect = document.getElementById("subject");

monthSelect.addEventListener("change", handleDropdownChange);
yearSelect.addEventListener("change", handleDropdownChange);
groupSelect.addEventListener("change", handleDropdownChange);
subjectSelect.addEventListener("change", handleDropdownChange);

// Function to handle change in dropdown menu selection
function handleDropdownChange(event) {
  const { id, value } = event.target;
  switch (id) {
    case "month":
      selectedMonth = value;
      break;
    case "year":
      selectedYear = value;
      break;
    case "group":
      selectedGroup = value;
      break;
    case "subject":
      selectedSubject = value;
      break;
    default:
      break;
  }
}

function editTable() {
  // Implement functionality to allow users to edit the table and update grades
  console.log("Editing table...");
  const tableRows = document.querySelectorAll(".journal-table tbody tr");
  tableRows.forEach((row) => {
    const studentName = row.querySelector("td:first-child").textContent;
    const gradeCells = row.querySelectorAll("td:not(:first-child)");
    gradeCells.forEach((cell, index) => {
      // Implement logic to allow users to edit grades
      const gradeInput = document.createElement("input");
      gradeInput.type = "text";
      gradeInput.value = cell.textContent;
      cell.textContent = "";
      cell.appendChild(gradeInput);
    });
  });
}

function displayJournal() {
  console.log("Displaying journal...");
  const month = document.getElementById("month").value;
  const year = document.getElementById("year").value;
  const group = document.getElementById("group").value;
  const subject = document.getElementById("subject").value;

  console.log("Selected Month:", month);
  console.log("Selected Year:", year);
  console.log("Selected Group:", group);
  console.log("Selected Subject:", subject);

  fetch(
    `/journal/data?month=${month}&year=${year}&group=${group}&subject=${subject}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Received data:", data);
      // Check if data is available
      if (data && data.length > 0) {
        // If data is available, populate the table
        populateTable(data);
      } else {
        // If no data is available, display a message
        const tableBody = document.querySelector(".journal-table tbody");
        if (tableBody) {
          tableBody.innerHTML =
            '<tr><td colspan="5">No data available</td></tr>';
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching journal data:", error);
    });
}

function populateTable(journalData) {
  console.log("Populating table...");
  const tableBody = document.querySelector(".journal-table tbody");
  if (!tableBody) {
    console.error("Table body element not found.");
    return;
  }

  tableBody.innerHTML = "";

  journalData.forEach((entry) => {
    const row = document.createElement("tr");
    Object.values(entry).forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });
}

function saveGrades() {
  const tableRows = document.querySelectorAll(".journal-table tbody tr");
  const updatedGrades = [];
  tableRows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const studentId = cells[0].getAttribute("data-student-id");
    const subjectId = cells[2].getAttribute("data-subject-id");
    const gradeValue = cells[3].textContent; // Assuming grade is in the 4th column
    const gradeDate = new Date().toISOString().split("T")[0]; // Current date

    updatedGrades.push({ studentId, subjectId, gradeValue, gradeDate });
  });

  fetch("/journal/update-grades", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedGrades),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Grades updated successfully");
      } else {
        console.error("Failed to update grades");
      }
    })
    .catch((error) => {
      console.error("Error updating grades:", error);
    });
}

function validateAndDisplay() {
  const month = document.getElementById("month").value;
  const year = document.getElementById("year").value;
  const group = document.getElementById("group").value;
  const subject = document.getElementById("subject").value;
  if (!month || !year || !group || !subject) {
    alert("Please select appropriate year, month, subject, and group.");
  } else {
    displayJournal();
  }
}

function editOrSave() {
  const editBtn = document.getElementById("edit-btn");
  if (editBtn.textContent === "Edit") {
    alert("No data in table.");
  } else {
    saveGrades();
    displayJournal();
  }
}

function populateSelectOptions() {
  // Extract data from data attributes
  const months = JSON.parse(
    document.getElementById("month").getAttribute("data-months")
  );
  const years = JSON.parse(
    document.getElementById("year").getAttribute("data-years")
  );
  const groups = JSON.parse(
    document.getElementById("group").getAttribute("data-groups")
  );
  const subjects = JSON.parse(
    document.getElementById("subject").getAttribute("data-subjects")
  );

  // Populate month dropdown
  const monthSelect = document.getElementById("month");
  months.forEach((month) => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  // Populate year dropdown
  const yearSelect = document.getElementById("year");
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });

  // Populate group dropdown
  const groupSelect = document.getElementById("group");
  groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    groupSelect.appendChild(option);
  });

  // Populate subject dropdown
  const subjectSelect = document.getElementById("subject");
  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    subjectSelect.appendChild(option);
  });
}

// Call populateSelectOptions function on page load
populateSelectOptions();

// Add event listener to the "Display" button
const displayBtn = document.getElementById("display-btn");
displayBtn.addEventListener("click", validateAndDisplay);

// Add event listener to the "Edit" button
const editBtn = document.getElementById("edit-btn");
editBtn.addEventListener("click", editOrSave);
