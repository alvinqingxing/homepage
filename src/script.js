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

// WebGL Distributed 3D Shapes Shader Background with Interactive Proximity & Rotation Direction
window.addEventListener("load", () => {
  const canvas = document.getElementById("webgl-background");
  if (!canvas) return;

  const gl = canvas.getContext("webgl2");

  if (!gl) {
    console.warn(
      "WebGL not supported or context creation failed. Triggering image fallback.",
    );
    canvas.classList.add("hidden");
    document.body.classList.add("webgl-fallback");
  } else {
    // Keep track of the mouse position
    let pointerX = -1000.0;
    let pointerY = -1000.0;

    // Physical state tracking for rotation manipulation
    let lastPointerX = null;
    let lastPointerY = null;
    let targetDirectionX = 1.0; // Default baseline spin direction
    let targetDirectionY = 1.0;
    let currentDirectionX = 1.0; // Interpolated smooth matching state
    let currentDirectionY = 1.0;

    // Accumulators that act as custom timelines replacing pure uTime
    let rotTimelineX = 0.0;
    let rotTimelineY = 0.0;
    let lastTimestamp = 0;

    const vsSource = `#version 300 es
      in vec2 position;
      out vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader source
    const fsSource = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform vec2 uResolution;
      uniform vec2 uRotTimelines; // Swapped out single float uTime for dynamic rotation tracking vectors
      uniform vec2 uMouse;

      out vec4 fragColor;

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

      float sdPyramid(vec3 p, float size, float h) {
        vec3 aP = abs(p);
        float sides = max(aP.x + p.y * (size / h) - size, aP.z + p.y * (size / h) - size);
        float bottom = -p.y - 0.1;
        float top = p.y - h;
        return max(max(sides, bottom), top);
      }

      float getSolidGrid(vec3 localP, float scale) {
        vec3 waves = abs(sin(localP * scale * 3.14159));
        float threshold = 0.06; 
        
        float lineX = smoothstep(threshold, 0.0, waves.x);
        float lineY = smoothstep(threshold, 0.0, waves.y);
        float lineZ = smoothstep(threshold, 0.0, waves.z);
        
        return max(max(lineX, lineY), lineZ);
      }

      float map(vec3 p, out float outLine, out int hitId) {
        // Shapes now rotate using the interactive timelines rather than hardcoded global clock ticks
        mat3 rotPyramid = getRotationMatrix(uRotTimelines.x * 0.4, uRotTimelines.y * 0.2);
        mat3 rotCube    = getRotationMatrix(uRotTimelines.x * 0.3, uRotTimelines.y * 0.5);
        mat3 rotSphere  = getRotationMatrix(uRotTimelines.x * 0.2, uRotTimelines.y * 0.4);

        vec3 pPyramid = rotPyramid * (p - vec3(-2.6, -0.2, 0.0));
        vec3 pCube    = rotCube * (p - vec3(0.0, 0.0, 0.0));
        vec3 pSphere  = rotSphere * (p - vec3(2.6, 0.0, 0.0));

        float dPyramid = sdPyramid(pPyramid, 0.6, 0.9);
        float dCube    = sdBox(pCube, vec3(0.6));
        float dSphere  = sdSphere(pSphere, 0.7);

        float linePyramid = getSolidGrid(pPyramid, 2.0);
        float lineCube    = getSolidGrid(pCube, 2.0);
        float lineSphere  = getSolidGrid(pSphere, 3.0);

        float d = 1e5;
        outLine = 0.0;
        hitId = 0;

        if (dPyramid < d) {
          d = dPyramid;
          outLine = linePyramid;
          hitId = 1;
        }
        if (dCube < d) {
          d = dCube;
          outLine = lineCube;
          hitId = 2;
        }
        if (dSphere < d) {
          d = dSphere;
          outLine = lineSphere;
          hitId = 3;
        }

        return d;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

        vec3 ro = vec3(0.0, 0.0, 6.0); 
        vec3 rd = normalize(vec3(uv, -1.8)); 

        float t = 0.0;
        float finalLine = 0.0;
        bool hit = false;

        for (int i = 0; i < 64; i++) {
          vec3 p = ro + rd * t;
          float localLine;
          int hitId;
          float d = map(p, localLine, hitId);
          if (d < 0.001) {
            hit = true;
            finalLine = localLine;
            break;
          }
          t += d;
          if (t > 10.0) break;
        }

        vec3 bgColor = vec3(0.15, 0.18, 0.20);
        vec3 finalColor = bgColor;

        if (hit) {
          float distToPointer = distance(gl_FragCoord.xy, uMouse);
          float proximity = smoothstep(150.0, 40.0, distToPointer);

          vec3 whiteColor = vec3(1.0, 1.0, 1.0);
          vec3 goldColor  = vec3(1.0, 0.84, 0.0);

          vec3 targetLineColor = mix(whiteColor, goldColor, proximity);
          finalColor = mix(bgColor, targetLineColor, finalLine * 0.85);
        }

        fragColor = vec4(finalColor, 1.0);
      }
    `;

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

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Could not initialize shaders");
    } else {
      gl.useProgram(program);

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

      const resolutionLocation = gl.getUniformLocation(program, "uResolution");
      const rotTimelinesLocation = gl.getUniformLocation(
        program,
        "uRotTimelines",
      );
      const mouseLocation = gl.getUniformLocation(program, "uMouse");

      function updatePointer(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        const newPointerX = (clientX - rect.left) * (canvas.width / rect.width);
        const newPointerY =
          (rect.height - (clientY - rect.top)) * (canvas.height / rect.height);

        // Calculate velocity vector if this isn't the first captured point
        if (lastPointerX !== null && lastPointerY !== null) {
          const dx = newPointerX - lastPointerX;
          const dy = newPointerY - lastPointerY;
          const motionThreshold = 0.5; // Filters shaky noise inputs

          // Update physics targets based on physical drag vector
          if (Math.abs(dx) > motionThreshold) {
            targetDirectionX = Math.sign(dx);
          }
          if (Math.abs(dy) > motionThreshold) {
            targetDirectionY = Math.sign(dy);
          }
        }

        pointerX = newPointerX;
        pointerY = newPointerY;
        lastPointerX = newPointerX;
        lastPointerY = newPointerY;
      }

      window.addEventListener("pointermove", updatePointer);
      window.addEventListener("pointerdown", updatePointer);

      function resizeCanvas() {
        const dpr = 1.0;
        const targetWidth = Math.floor(window.innerWidth * dpr);
        const targetHeight = Math.floor(window.innerHeight * dpr);

        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          canvas.style.width = window.innerWidth + "px";
          canvas.style.height = window.innerHeight + "px";
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
      }

      function render(time) {
        resizeCanvas();

        // Calculate delta time so rotation increments independently of frame drops
        const dt = (time - lastTimestamp) * 0.001;
        lastTimestamp = time;

        // Smooth out direction changes using linear interpolation (lerp)
        // Adjust 4.0 up for snappier responses, or down for a heavy, drifting momentum feel
        currentDirectionX += (targetDirectionX - currentDirectionX) * 24.0 * dt;
        currentDirectionY += (targetDirectionY - currentDirectionY) * 24.0 * dt;

        // Accumulate directional time steps over the delta buffer
        rotTimelineX += dt * currentDirectionX;
        rotTimelineY += dt * currentDirectionY;

        gl.uniform2f(rotTimelinesLocation, rotTimelineX, rotTimelineY);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform2f(mouseLocation, pointerX, pointerY);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
      }

      canvas.style.opacity = "1";
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
