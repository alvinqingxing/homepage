document.querySelector("nav").style.display = "flex";

const about = document.getElementById("about");
const code = document.getElementById("code");
const contact = document.getElementById("contact")

about.style.display = "block";
code.style.display = "none";
contact.style.display = "none";

document.getElementById("nav-about").addEventListener("click", function () {
	about.style.display = "block";
	code.style.display = "none";
	contact.style.display = "none";
});

document.getElementById("nav-code").addEventListener("click", function () {
	about.style.display = "none";
	code.style.display = "block";
	contact.style.display = "none";
});

document.getElementById("nav-contact").addEventListener("click", function () {
	about.style.display = "none";
	code.style.display = "none";
	contact.style.display = "block";
});