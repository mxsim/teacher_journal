// Function to show the create group form
function showCreateGroupForm() {
  document.getElementById("createGroupForm").style.display = "block";
}

// Function to show the edit group form
function showEditGroupForm() {
  document.getElementById("editGroupForm").style.display = "block";
}

// Function to show the delete group form
function showDeleteGroupForm() {
  document.getElementById("deleteGroupForm").style.display = "block";
}

// Add event listeners to the buttons to show the corresponding forms
document
  .getElementById("createGroupBtn")
  .addEventListener("click", showCreateGroupForm);
document
  .getElementById("editGroupBtn")
  .addEventListener("click", showEditGroupForm);
document
  .getElementById("deleteGroupBtn")
  .addEventListener("click", showDeleteGroupForm);
