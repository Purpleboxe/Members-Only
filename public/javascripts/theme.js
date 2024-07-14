document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("theme-toggle");
  const currentTheme = localStorage.getItem("theme");
  const root = document.documentElement;

  if (currentTheme === "dark-mode") {
    setDarkMode();
  } else {
    setLightMode();
  }

  toggleButton.addEventListener("click", () => {
    if (localStorage.getItem("theme") === "dark-mode") {
      setLightMode();
    } else {
      setDarkMode();
    }
  });

  function setDarkMode() {
    root.style.setProperty("--background", "var(--background-dark)");
    root.style.setProperty("--font", "var(--font-dark)");
    root.style.setProperty("--lighter-font", "var(--lighter-font-dark)");
    root.style.setProperty("--shadow", "var(--shadow-dark)");
    root.style.setProperty("--shadow2", "var(--shadow2-dark)");
    root.style.setProperty("--white", "var(--black)");
    toggleButton.classList.add("dark-mode");
    localStorage.setItem("theme", "dark-mode");
  }

  function setLightMode() {
    root.style.removeProperty("--background");
    root.style.removeProperty("--font");
    root.style.removeProperty("--lighter-font");
    root.style.removeProperty("--shadow");
    root.style.removeProperty("--shadow2");
    root.style.removeProperty("--white");
    toggleButton.classList.remove("dark-mode");
    localStorage.setItem("theme", "light-mode");
  }
});
