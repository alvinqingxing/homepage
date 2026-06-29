// Initialize Menu

const about = document.getElementById("about");
const publications = document.getElementById("publications");
const contact = document.getElementById("contact");

about.style.display = "block";
publications.style.display = "none";
contact.style.display = "none";

// Menu Event Listeners

const aboutToggle = document.getElementById("aboutMenuItem");
const publicationsToggle = document.getElementById("publicationsMenuItem");
const contactToggle = document.getElementById("contactMenuItem");

aboutToggle.addEventListener("click", () => {
  about.style.display = "block";
  publications.style.display = "none";
  contact.style.display = "none";
});

publicationsToggle.addEventListener("click", () => {
  about.style.display = "none";
  publications.style.display = "block";
  contact.style.display = "none";
});

contactToggle.addEventListener("click", () => {
  about.style.display = "none";
  publications.style.display = "none";
  contact.style.display = "block";
});

// Contact Form

document
  .getElementById("contactForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Message sent successfully!");
        form.reset();
      } else {
        alert(
          "Error: " +
            (result.error || "Something went wrong. Please try again."),
        );
      }
    } catch (error) {
      alert(
        "A connection error occurred. Please check your internet connection.",
      );
    }
  });

// --- Fallback Form Status Handler ---

window.addEventListener("DOMContentLoaded", () => {
  // 1. Parse the URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get("status");
  const msgType = urlParams.get("msg");

  if (status) {
    // 2. Fetch DOM elements inside the block to guarantee scope reference availability
    const aboutEl = document.getElementById("about");
    const publicationsEl = document.getElementById("publications");
    const contactEl = document.getElementById("contact");

    // 3. Automatically switch the active menu tab to show the Contact view
    if (aboutEl && publicationsEl && contactEl) {
      aboutEl.style.display = "none";
      publicationsEl.style.display = "none";
      contactEl.style.display = "block";
    }

    // 4. Target the message banner div we added to the HTML
    const banner = document.getElementById("formStatusBanner");
    if (banner) {
      if (status === "success") {
        banner.innerHTML = `<div style="background-color: #d4edda; color: #155724; padding: 10px; margin-bottom: 15px; border-radius: 4px; border: 1px solid #c3e6cb;">
                              Thank you! Your message has been sent.
                            </div>`;
      } else if (status === "error") {
        // Map the short backend message codes to friendly explanations
        let friendlyMessage = "Something went wrong. Please try again.";
        if (msgType === "missing_fields")
          friendlyMessage = "Error: Missing required fields.";
        if (msgType === "missing_token" || msgType === "verification_failed") {
          friendlyMessage = "Security verification failed. Please try again.";
        }
        if (msgType === "email_failed" || msgType === "server_error") {
          friendlyMessage = "A server error occurred. Please try again later.";
        }

        banner.innerHTML = `<div style="background-color: #f8d7da; color: #721c24; padding: 10px; margin-bottom: 15px; border-radius: 4px; border: 1px solid #f5c6cb;">
                              ${friendlyMessage}
                            </div>`;
      }
    }

    // 5. Clean up the URL in the browser address bar so refreshing doesn't replay the message
    const cleanUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname;
    window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
  }
});

// Blur Effect

const sourceCode = document.getElementById("source-code");
const social = document.getElementById("social");

sourceCode.addEventListener("pointerenter", () => {
  social.style.filter = "blur(1px)";
});

sourceCode.addEventListener("pointerleave", () => {
  social.style.filter = "blur(0)";
});

social.addEventListener("pointerenter", () => {
  sourceCode.style.filter = "blur(1px)";
});

social.addEventListener("pointerleave", () => {
  sourceCode.style.filter = "blur(0)";
});

// Boop

const alvin = document.getElementById("alvin");

alvin.addEventListener("pointerenter", () => {
  alvin.classList.add("boop");
});

alvin.addEventListener("animationend", (e) => {
  alvin.classList.remove("boop");
});
