// client_users.js

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  const sortSelect = document.getElementById("sort");

  // Реалізація пошуку: при натисканні Enter або зміні значення виконуємо редірект з параметрами
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  sortSelect.addEventListener("change", () => {
    performSearch();
  });

  function performSearch() {
    const searchQuery = searchInput.value.trim();
    const selectedRole = sortSelect.value;
    // Формуємо URL із параметрами пошуку
    let url = "/users?";
    if (searchQuery) {
      url += `search=${encodeURIComponent(searchQuery)}&`;
    }
    url += `role=${encodeURIComponent(selectedRole)}`;
    window.location.href = url;
  }
});
