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

const canvas = document.getElementById("webgl-background");
const gl = canvas.getContext("webgl");

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
  const vsSource = `
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment Shader source (Raymarching + Morphing Shapes + Wireframe Grid)
  const fsSource = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uResolution;
    uniform float uTime;

    // Rotation matrix helper
    mat3 rotX(float a) {
      float c = cos(a), s = sin(a);
      return mat3(1, 0, 0, 0, c, -s, 0, s, c);
    }
    mat3 rotY(float a) {
      float c = cos(a), s = sin(a);
      return mat3(c, 0, s, 0, 1, 0, -s, 0, c);
    }

    // Signed Distance Functions (SDFs)
    float sdSphere(vec3 p, float r) {
      return length(p) - r;
    }

    float sdBox(vec3 p, vec3 b) {
      vec3 q = abs(p) - b;
      return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }

    float sdPyramid(vec3 p, float h) {
      // Approximate clean representation of a triangular prism/pyramid shape
      float m2 = h*h + 0.25;
      p.xz = abs(p.xz);
      if( p.z>p.x ) p.xz = p.zx;
      p.x -= 0.5;
      p.z -= 0.5;
      vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y );
      float s = max(-q.x, 0.0);
      float t = clamp( (q.y-0.5*p.z)/(m2+0.25), 0.0, 1.0 );
      float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;
      float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);
      float d = min(a,b);
      return sqrt(d)*sign(max(q.z,-p.y));
    }

    // Map function that morphs shapes based on time
    float map(vec3 p) {
      // Rotate the coordinate space continuously over time
      p = rotY(uTime * 0.4) * rotX(uTime * 0.3) * p;

      float dSphere = sdSphere(p, 1.2);
      float dBox = sdBox(p, vec3(1.0));
      // Readjust position slightly for pyramid center alignment
      float dPyramid = sdPyramid(p + vec3(0.0, 0.4, 0.0), 1.2);

      // Create a smooth continuous cycle: 0 -> 1 -> 2 -> 0
      float cycle = mod(uTime * 0.5, 3.0);
      float d = 0.0;

      if (cycle < 1.0) {
        d = mix(dSphere, dBox, smoothstep(0.0, 1.0, cycle));
      } else if (cycle < 2.0) {
        d = mix(dBox, dPyramid, smoothstep(0.0, 1.0, cycle - 1.0));
      } else {
        d = mix(dPyramid, dSphere, smoothstep(0.0, 1.0, cycle - 2.0));
      }
      return d;
    }

    void main() {
      // Normalize aspect ratio coordinates
      vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

      // Ray setup
      vec3 ro = vec3(0.0, 0.0, 3.5); // Camera position
      vec3 rd = normalize(vec3(uv, -1.0)); // Ray direction

      float t = 0.0;
      int maxSteps = 64;
      vec3 p;
      bool hit = false;

      // Raymarching Loop
      for (int i = 0; i < 64; i++) {
        p = ro + rd * t;
        float d = map(p);
        if (d < 0.001) {
          hit = true;
          break;
        }
        t += d;
        if (t > 10.0) break;
      }

      // Base color layer (Dark Slate Gray background matching CSS fallback)
      vec3 bgColor = vec3(0.15, 0.18, 0.20);
      vec3 finalColor = bgColor;

      if (hit) {
        // Compute surface coordinate lines for elegant wireframe grid effect
        vec3 localP = rotY(uTime * 0.4) * rotX(uTime * 0.3) * p;
        
        // Use high-frequency sine waves to check proximity to grid lines
        float gridThickness = 0.96; 
        float lx = smoothstep(gridThickness, 1.0, sin(localP.x * 12.0));
        float ly = smoothstep(gridThickness, 1.0, sin(localP.y * 12.0));
        float lz = smoothstep(gridThickness, 1.0, sin(localP.z * 12.0));
        
        float edge = max(lx, max(ly, lz));

        // Blend the elegant thin white wireframe over the dark base background
        finalColor = mix(bgColor, vec3(1.0, 1.0, 1.0), edge * 0.65);
      }

      gl_FragColor = vec4(finalColor, 1.0);
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

    // Handle responsive resize updates safely
    function resizeCanvas() {
      if (
        canvas.width !== window.innerWidth ||
        canvas.height !== window.innerHeight
      ) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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

    // Kick off the animation loop
    requestAnimationFrame(render);
  }
}

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
