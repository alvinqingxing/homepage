const about = document.getElementById("about");
const publications = document.getElementById("publications");
const code = document.getElementById("code");
const contact = document.getElementById("contact");
const sourceCode = document.getElementById("source-code");

about.style.display = "block";
publications.style.display = "none";
code.style.display = "none";
contact.style.display = "none";
sourceCode.style.color = "floralwhite";
sourceCode.style.fontFamily = "Courier";
sourceCode.style.fontSize = "18px";
sourceCode.style.fontWeight = "800";

sourceCode.addEventListener("mouseover", () => {
  sourceCode.style.color = "gold";
});

sourceCode.addEventListener("mouseout", () => {
  sourceCode.style.color = "floralwhite";
});

const aboutToggle = document.getElementById("aboutMenuItem");
const publicationsToggle = document.getElementById("publicationsMenuItem");
const contactToggle = document.getElementById("contactMenuItem");

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

contactToggle.addEventListener("click", () => {
  about.style.display = "none";
  publications.style.display = "none";
  code.style.display = "none";
  contact.style.display = "block";
});

const codeToggle = document.getElementById("codeMenuItem");
const savvygranny = document.getElementById("savvygranny");
const mrcocktail = document.getElementById("mrcocktail");
const savvygrannyToggle = document.getElementById("savvygrannyToggle");
const mrcocktailToggle = document.getElementById("mrcocktailToggle");

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
