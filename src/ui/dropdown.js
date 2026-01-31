// Dropdown menu setup and event handlers

export function setupDropdownMenu(btn, menu, container) {
  if (btn && menu && container) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) menu.style.display = "none";
    });
  }
}
