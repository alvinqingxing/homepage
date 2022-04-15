const showcase = document.querySelector(".showcase");
const about = document.getElementById("about");
const publications = document.getElementById("publications");
const code = document.getElementById("code");
const contact = document.getElementById("contact");
const header = document.querySelector("header");
const aboutToggle = document.getElementById("aboutMenuItem");
const publicationsToggle = document.getElementById("publicationsMenuItem");
const codeToggle = document.getElementById("codeMenuItem");
const contactToggle = document.getElementById("contactMenuItem");
const menuToggle = document.querySelector(".toggle");

header.style.display = "flex";
about.style.display = "block";
publications.style.display = "none";
code.style.display = "none";
contact.style.display = "none";

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  showcase.classList.toggle("active");
});

aboutToggle.addEventListener("click", () => {
  about.style.display = "block";
  publications.style.display = "none";
  code.style.display = "none";
  contact.style.display = "none";
});

publicationsToggle.addEventListener("click", () => {
  about.style.display = "none";
  publications.style.display = "block";
  code.style.display = "none";
  contact.style.display = "none";
});

codeToggle.addEventListener("click", () => {
  about.style.display = "none";
  publications.style.display = "none";
  code.style.display = "block";
  contact.style.display = "none";
});

contactToggle.addEventListener("click", () => {
  about.style.display = "none";
  publications.style.display = "none";
  code.style.display = "none";
  contact.style.display = "block";
});