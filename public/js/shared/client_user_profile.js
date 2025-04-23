// client_user_profile.js

// Function to display error message
function displayErrorMessage(message) {
  const errorElement = document.querySelector("#error-msg");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}




document.getElementById("edit-desc-btn")?.addEventListener("click", () => {
  document.getElementById("desc-form").style.display = "block";
});

document.getElementById("desc-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const description = document.getElementById("desc-input").value;

  const response = await fetch("/user_profile/update-description", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });

  if (response.ok) {
    console.log(
      "CLIENT | client_user_profile.js | Description updated successfully"
    );
    location.reload();
  } else {
    console.error(
      "CLIENT | client_user_profile.js | Failed to update description"
    );
  }
});

document
  .getElementById("picture-form")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this); // Form containing image input field
    await fetch("/user_profile/update-picture", {
      method: "POST",
      body: formData,
    });
    location.reload();
  });

document
  .querySelector(".image-overlay")
  ?.addEventListener("click", function () {
    document.getElementById("upload-image").click();
  });

document
  .getElementById("upload-image")
  ?.addEventListener("change", async function () {
    const formData = new FormData();
    formData.append("profile_picture", this.files[0]);

    await fetch("/user_profile/update-picture", {
      method: "POST",
      body: formData,
    });
    location.reload();
  });