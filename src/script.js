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

// Contact Form

document
  .getElementById("contactForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    if (typeof turnstile !== "undefined") {
      const token = turnstile.getResponse();
      if (token) {
        formData.set("cf-turnstile-response", token);
      }
    }

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
        if (typeof turnstile !== "undefined") {
          turnstile.reset();
        }
      } else {
        alert(
          "Error: " +
            (result.error || "Something went wrong. Please try again."),
        );
        if (typeof turnstile !== "undefined") {
          turnstile.reset();
        }
      }
    } catch (error) {
      alert(
        "A connection error occurred. Please check your internet connection.",
      );
    }
  });

// Fallback Form Status Handler

window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get("status");
  const msgType = urlParams.get("msg");

  if (status) {
    const aboutEl = document.getElementById("about");
    const publicationsEl = document.getElementById("publications");
    const contactEl = document.getElementById("contact");

    if (aboutEl && publicationsEl && contactEl) {
      aboutEl.style.display = "none";
      publicationsEl.style.display = "none";
      contactEl.style.display = "block";
    }

    const banner = document.getElementById("formStatusBanner");
    if (banner) {
      if (status === "success") {
        banner.innerHTML = `<div style="background-color: #d4edda; color: #155724; padding: 10px; margin-bottom: 15px; border-radius: 4px; border: 1px solid #c3e6cb;">
                              Thank you! Your message has been sent.
                            </div>`;
      } else if (status === "error") {
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

    const cleanUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname;
    window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
  }
});

// WebGL Morphing 3D Shape Shader Background

window.addEventListener("load", () => {
  const canvas = document.getElementById("webgl-background");
  if (!canvas) return;

  const gl = canvas.getContext("webgl2");

  if (!gl) {
    console.warn(
      "WebGL not supported or context creation failed. Triggering image fallback.",
    );

    // 1. Hide the canvas element safely
    canvas.classList.add("hidden");

    // 2. Add the fallback class to the body to load the static image background
    document.body.classList.add("webgl-fallback");
  } else {
    // Vertex Shader source (Pass-through for a full-screen quad)
    const vsSource = `#version 300 es
      in vec2 position;
      out vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader source (Raymarching + Morphing Shapes + Wireframe Grid)
    const fsSource = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform vec2 uResolution;
      uniform float uTime;

      out vec4 fragColor;

      // Optimized rotation helper using pre-computed values
      mat3 getRotationMatrix(float angleX, float angleY) {
        float cx = cos(angleX), sx = sin(angleX);
        float cy = cos(angleY), sy = sin(angleY);
        
        mat3 rx = mat3(1, 0, 0, 0, cx, -sx, 0, sx, cx);
        mat3 ry = mat3(cy, 0, sy, 0, 1, 0, -sy, 0, cy);
        return ry * rx;
      }

      float sdSphere(vec3 p, float r) {
        return length(p) - r;
      }

      float sdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
      }

      // Eliminated rotation from map entirely to save operations in the loop
      float map(vec3 p, float morphFactor) {
        float dSphere = sdSphere(p, 1.2);
        float dBox = sdBox(p, vec3(1.0));
        return mix(dSphere, dBox, morphFactor);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

        // Pre-calculate rotation matrices ONCE per pixel instead of inside the loop
        mat3 rot = getRotationMatrix(uTime * 0.3, uTime * 0.4);

        // Rotate the ray origin and ray direction instead of the scene geometry
        vec3 ro = rot * vec3(0.0, 0.0, 3.5); 
        vec3 rd = rot * normalize(vec3(uv, -1.0)); 

        // Pre-calculate the morph factor outside the loop
        float morphFactor = smoothstep(0.0, 1.0, sin(uTime * 1.0) * 0.5 + 0.5);

        float t = 0.0;
        vec3 p;
        bool hit = false;

        // Reduced max loop steps from 64 to 32 for massive speedups on weak GPUs
        for (int i = 0; i < 32; i++) {
          p = ro + rd * t;
          float d = map(p, morphFactor);
          if (d < 0.001) {
            hit = true;
            break;
          }
          t += d;
          if (t > 8.0) break; // Reduced max distance slightly
        }

        vec3 bgColor = vec3(0.15, 0.18, 0.20);
        vec3 finalColor = bgColor;

        if (hit) {
          // Reconstruct the stable local position for the wireframe grid
          // rot matrix transforms camera space to object space; we invert the look direction
          vec3 localP = ro + rd * t;
          localP = transpose(rot) * localP; // Transpose acts as the inverse for rotation matrices
          vec3 fw = fwidth(localP); 
          vec3 grid = abs(fract(localP * 2.0 - 0.5) - 0.5) / (fw * 2.0);
          float line = min(min(grid.x, grid.y), grid.z);
          float edge = 1.0 - smoothstep(0.0, 1.0, line);
          finalColor = mix(bgColor, vec3(1.0, 1.0, 1.0), edge * 0.45);
        }

        fragColor = vec4(finalColor, 1.0);
      }
    `;

    // Helper function to create and compile shaders
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Link Shaders into Program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Could not initialize shaders");
    } else {
      gl.useProgram(program);

      // Setup full-screen quad geometric coordinates (-1 to 1)
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        ]),
        gl.STATIC_DRAW,
      );

      const positionLocation = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Get uniforms pointers
      const resolutionLocation = gl.getUniformLocation(program, "uResolution");
      const timeLocation = gl.getUniformLocation(program, "uTime");

      // Handle responsive resize updates safely with performance limits
      function resizeCanvas() {
        // Cap the pixel ratio at 1.0 for backgrounds to save older GPUs
        const dpr = 1.0; 
        const targetWidth = Math.floor(window.innerWidth * dpr);
        const targetHeight = Math.floor(window.innerHeight * dpr);

        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          // Style coordinates remain full screen via CSS, but rendering buffer shrinks
          canvas.style.width = window.innerWidth + "px";
          canvas.style.height = window.innerHeight + "px";
          
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
      }

      // Render loop
      function render(time) {
        resizeCanvas();

        // Convert millisecond timestamps to seconds
        gl.uniform1f(timeLocation, time * 0.001);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
      }
      // Reveal the canvas now that WebGL is fully compiled and ready to draw
      canvas.style.opacity = "1";
      // Kick off the animation loop
      requestAnimationFrame(render);
    }
  }
});

// Lazy-load Google Tag Manager
window.addEventListener("load", () => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    dataLayer.push(arguments);
  };

  gtag("js", new Date());
  gtag("config", "G-2945KEEG0G");

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-2945KEEG0G";

  document.head.appendChild(script);
});
