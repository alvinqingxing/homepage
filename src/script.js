const about = document.getElementById("about");
const publications = document.getElementById("publications");
const code = document.getElementById("code");
const contact = document.getElementById("contact");
const savvygranny = document.getElementById("savvygranny");
const mrcocktail = document.getElementById("mrcocktail");

about.style.display = "block";
publications.style.display = "none";
code.style.display = "none";
contact.style.display = "none";

const aboutToggle = document.getElementById("aboutMenuItem");
const publicationsToggle = document.getElementById("publicationsMenuItem");
const codeToggle = document.getElementById("codeMenuItem");
const contactToggle = document.getElementById("contactMenuItem");
const savvygrannyToggle = document.getElementById("savvygrannyToggle");
const mrcocktailToggle = document.getElementById("mrcocktailToggle");

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
  savvygranny.style.display = "block";
  savvygrannyToggle.style.opacity = "1";
  mrcocktail.style.display = "none";
  mrcocktailToggle.style.opacity = "0.3";
});

savvygrannyToggle.addEventListener("click", () => {
  savvygranny.style.display = "block";
  mrcocktail.style.display = "none";
  mrcocktailToggle.style.opacity = "0.3";
  savvygrannyToggle.style.opacity = "1";
});

mrcocktailToggle.addEventListener("click", () => {
  savvygranny.style.display = "none";
  mrcocktail.style.display = "block";
  mrcocktailToggle.style.opacity = "1";
  savvygrannyToggle.style.opacity = "0.3";
});

contactToggle.addEventListener("click", () => {
  about.style.display = "none";
  publications.style.display = "none";
  code.style.display = "none";
  contact.style.display = "block";
});