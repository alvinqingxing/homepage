const showcase = document.querySelector(".showcase");
const about = document.getElementById("about");
const publications = document.getElementById("publications");
const code = document.getElementById("code");
const contact = document.getElementById("contact");
const aboutToggle = document.getElementById("aboutMenuItem");
const publicationsToggle = document.getElementById("publicationsMenuItem");
const codeToggle = document.getElementById("codeMenuItem");
const contactToggle = document.getElementById("contactMenuItem");

about.style.display = "block";
publications.style.display = "none";
code.style.display = "none";
contact.style.display = "none";

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