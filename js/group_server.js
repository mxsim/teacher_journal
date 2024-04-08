// teacher_group.js - Route handler for teacher group
const express = require("express");
const router = express.Router();
const connection = require('../config/db'); // Import your MySQL connection

// Route handler for /teacher_group
router.get("/", async (req, res) => {
  try {
    // Fetch list of groups from the database
    const groups = await Group.getAllGroups(); // Example function to get all groups

    // Render the teacher_group.hbs file and pass the list of groups as data
    res.render("teacher_group", { groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;


// Function to show the create group form
function showCreateGroupForm() {
  document.getElementById('createGroupForm').style.display = 'block';
}

// Function to show the edit group form
function showEditGroupForm() {
  document.getElementById('editGroupForm').style.display = 'block';
}

// Function to show the delete group form
function showDeleteGroupForm() {
  document.getElementById('deleteGroupForm').style.display = 'block';
}

// Add event listeners to the buttons to show the corresponding forms
document.getElementById('createGroupBtn').addEventListener('click', showCreateGroupForm);
document.getElementById('editGroupBtn').addEventListener('click', showEditGroupForm);
document.getElementById('deleteGroupBtn').addEventListener('click', showDeleteGroupForm);