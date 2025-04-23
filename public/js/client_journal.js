console.log("hello from client script")
let selectedMonth = "";
let selectedYear = "";
let selectedGroup = "";
let selectedSubject = "";

const monthSelect = document.getElementById("month");
const yearSelect = document.getElementById("year");
const groupSelect = document.getElementById("group");
const subjectSelect = document.getElementById("subject");

monthSelect.addEventListener("change", handleDropdownChange);
yearSelect.addEventListener("change", handleDropdownChange);
groupSelect.addEventListener("change", handleDropdownChange);
subjectSelect.addEventListener("change", handleDropdownChange);

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


function fillTable(journalData, testSumData, overallSumData) {
  console.log("Test Sum Data:", testSumData);
  console.log("Overall Sum Data:", overallSumData);

  const tableContainer = document.getElementById("table-container");
  const table = document.createElement("table");

  const uniqueDates = [
    ...new Set(journalData.map((entry) => entry.lesson_date)),
  ];
  const uniqueLessonTypes = [
    ...new Set(journalData.map((entry) => entry.lesson_type)),
  ];

  const firstRow = document.createElement("tr");
  firstRow.classList.add("table-header");

  const studentHeader = document.createElement("th");
  studentHeader.setAttribute("rowspan", "2");
  studentHeader.textContent = "Students";
  studentHeader.classList.add("rowspan-header");
  firstRow.appendChild(studentHeader);



  uniqueDates.forEach((date) => {
    const dateCell = document.createElement("th");
    dateCell.classList.add("date-cell");
    const formattedDate = new Date(date)
      .toLocaleDateString()
      .replace(/\//g, ".");
    dateCell.textContent = formattedDate;
    firstRow.appendChild(dateCell);
  });



  const lessonTypeRow = document.createElement("tr");
  lessonTypeRow.classList.add("table-header");
  uniqueDates.forEach((date) => {
    const lessonType = journalData.find((entry) => entry.lesson_date === date);
    const lessonTypeCell = document.createElement("th");
    lessonTypeCell.textContent = lessonType ? lessonType.lesson_type : "";
    lessonTypeRow.appendChild(lessonTypeCell);
    lessonTypeCell.classList.add("lesson-type-cell");
  });

  const testSumHeader = document.createElement("th");
  testSumHeader.setAttribute("rowspan", "2");
  testSumHeader.textContent = "Test Sum";
  testSumHeader.classList.add("test-sum-header");
  firstRow.appendChild(testSumHeader);

  const sumHeader = document.createElement("th");
  sumHeader.setAttribute("rowspan", "2");
  sumHeader.textContent = "Sum";
  sumHeader.classList.add("sum-header");
  firstRow.appendChild(sumHeader);

  // Append both rows to the table
  table.appendChild(firstRow);
  table.appendChild(lessonTypeRow);

  // Get unique students
  const uniqueStudents = [
    ...new Set(journalData.map((entry) => entry.students)),
  ].sort((a, b) => a.localeCompare(b));

  uniqueStudents.forEach((student, rowIndex) => {
    const row = document.createElement("tr");
    row.classList.add("student-row");

    const nameCell = document.createElement("td");
    nameCell.textContent = student;
    row.appendChild(nameCell);

    // Loop through each date to fill the grades
    uniqueDates.forEach((date, columnIndex) => {
      const gradeCell = document.createElement("td");
      const gradeEntry = journalData.find(
        (entry) => entry.lesson_date === date && entry.students === student
      );
      gradeCell.textContent = gradeEntry ? gradeEntry.grade : ""; // Fill with empty string if no grade entry exists
      row.appendChild(gradeCell);
      gradeCell.classList.add("grade-cell");

      console.log(
      `Inserting ${gradeCell.textContent} to ${student} at row ${rowIndex} column name ${date}`
      );
    });

    // Add Test Sum grade for the student
    const testSumEntry = testSumData.find(
      (entry) => entry.students === student
    );
    const testSumCell = document.createElement("td");
    testSumCell.textContent = testSumEntry ? testSumEntry.test_sum : "";
    row.appendChild(testSumCell);
    testSumCell.classList.add("grade-cell", "test-sum-grade");

    console.log(
      "Inserting ${testSumCell.textContent} to ${student} at row ${rowIndex} column name Test Sum"
    );

    // Add Overall Sum grade for the student
    const overallSumEntry = overallSumData.find(
      (entry) => entry.students === student
    );
    const overallSumCell = document.createElement("td");
    overallSumCell.textContent = overallSumEntry
      ? overallSumEntry.overall_sum
      : "";
    row.appendChild(overallSumCell);
    overallSumCell.classList.add("grade-cell", "overall-sum-grade");

    console.log(
      `Inserting ${overallSumCell.textContent} to ${student} at row ${rowIndex} column name Sum`
    );

    // Append the row to the table
    table.appendChild(row);
  });

  tableContainer.innerHTML = ""; // Clear container before appending new table
  tableContainer.appendChild(table);
}











function displayJournal() {
  console.log("Display data in table...");

  const month = document.getElementById("month").value;
  const year = document.getElementById("year").value;
  const group = document.getElementById("group").value;
  const subject = document.getElementById("subject").value;

  console.log("Selected Month:", month);
  console.log("Selected Year:", year);
  console.log("Selected Group:", group);
  console.log("Selected Subject:", subject);

  // Fetch journal data including test sum and overall sum
  fetch(
    `/journal/data?month=${month}&year=${year}&group=${group}&subject=${subject}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Received data:", data);

      const { journalData, testSumData, overallSumData } = data;

      // Check if journal data is available
      if (journalData && journalData.length > 0) {
        // If data is available, fill the table with it
        fillTable(journalData, testSumData, overallSumData);
        document.getElementById("table-container").style.display = "block";
      } else {
        // If no journal data is available, display a message
        document.getElementById("table-container").style.display = "none";
        alert("No journal data available for the selected criteria.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("table-container").style.display = "none";
      alert("Failed to fetch data. Please try again later.");
    });
}


function displayAllPeriodData() {
  console.log("Display data in table...");

  const month = document.getElementById("month").value;
  const year = document.getElementById("year").value;
  const group = document.getElementById("group").value;
  const subject = document.getElementById("subject").value;

  console.log("Selected Month:", month);
  console.log("Selected Year:", year);
  console.log("Selected Group:", group);
  console.log("Selected Subject:", subject);

  // Fetch journal data including test sum and overall sum
  fetch(
    `/journal/all_data?year=${year}&group=${group}&subject=${subject}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Received all period data:", data);

      const { allPeriodData, testSumData, overallSumData } = data;

      // Check if journal data is available
      if (allPeriodData && allPeriodData.length > 0) {
        // If data is available, fill the table with it
        fillTable(allPeriodData, testSumData, overallSumData);
        document.getElementById("table-container").style.display = "block";
      } else {
        // If no journal data is available, display a message
        document.getElementById("table-container").style.display = "none";
        alert("No journal data available for the selected criteria.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("table-container").style.display = "none";
      alert("Failed to fetch data. Please try again later.");
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



function validateAndDisplay() {
  const month = document.getElementById("month").value;
  const year = document.getElementById("year").value;
  const group = document.getElementById("group").value;
  const subject = document.getElementById("subject").value;

    console.log("Selected Month:", month);
    console.log("Selected Year:", year);
    console.log("Selected Group:", group);
    console.log("Selected Subject:", subject);

if (month === "" && year === "" && group === "" && subject === "") {
    alert("Please select appropriate year, month, subject, and group.");
  } else if (month === "") {
    // If month is empty, it means "All Period" option is selected
    displayAllPeriodData();
  } else {
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

  // Create monthSelect variable
  const monthSelect = document.getElementById("month");

  // Add option for "All Period" in the month dropdown
  const allPeriodOption = document.createElement("option");
  allPeriodOption.value = ""; // You can set the value to empty or something like "all"
  allPeriodOption.textContent = "All Period";
  monthSelect.appendChild(allPeriodOption);

  // Populate month dropdown
  for (const month of months) {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    monthSelect.appendChild(option);
  }

  // Populate year dropdown
  const yearSelect = document.getElementById("year");
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });

  // Populate subject dropdown
  const subjectSelect = document.getElementById("subject");

  // Add default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Subject";
  subjectSelect.appendChild(defaultOption);

  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    subjectSelect.appendChild(option);
  });
}

function handleDropdownChange(event) {
  const { id, value } = event.target;
  switch (id) {
    case "month":
      selectedMonth = value === "" ? null : value; // Set selectedMonth to null for "All Period" option
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


// Add event listener to the subject dropdown menu
subjectSelect.addEventListener("change", async () => {
  const selectedSubjectId = subjectSelect.value; // Get the selected subject value
  try {
    // Fetch subject groups based on the selected subject
    const response = await fetch(
      `/journal/updateSubjectGroups?subjectId=${selectedSubjectId}`
    );
    const subjectGroups = await response.json();
    
    // Update the subject group dropdown menu with the fetched subject groups
    updateSubjectGroups(subjectGroups);
  } catch (error) {
    console.error("Error fetching subject groups:", error);
    // Handle error if necessary
  }
});

// Function to update the subject group dropdown menu
function updateSubjectGroups(subjectGroups) {
  // Clear existing options
  groupSelect.innerHTML = "";
  
  // Add default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Group";
  groupSelect.appendChild(defaultOption);

  // Add subject groups as options
  subjectGroups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.group_name;
    option.textContent = group.group_name;
    groupSelect.appendChild(option);
  });
}






























// lesson
























populateSelectOptions();

const displayBtn = document.getElementById("display-btn");
displayBtn.addEventListener("click", validateAndDisplay);