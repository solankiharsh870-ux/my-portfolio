const menuButton = document.getElementById("menuBtn");
const navigation = document.getElementById("navLinks");

function setMenuOpen(open) {
    if (!menuButton || !navigation) return;
    navigation.classList.toggle("show", open);
    menuButton.setAttribute("aria-expanded", String(open));
    const icon = menuButton.querySelector("i");
    menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    if (icon) {
        icon.classList.toggle("fa-xmark", open);
        icon.classList.toggle("fa-bars", !open);
    }
}

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
    });

    navigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
            setMenuOpen(false);
            menuButton.focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (menuButton.getAttribute("aria-expanded") === "true" &&
            !navigation.contains(event.target) && !menuButton.contains(event.target)) {
            setMenuOpen(false);
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 850) setMenuOpen(false);
    }, { passive: true });
}

const siteHeader = document.getElementById("siteHeader");
if (siteHeader) {
    let scrollUpdatePending = false;
    const updateHeader = () => {
        if (scrollUpdatePending) return;
        scrollUpdatePending = true;
        window.requestAnimationFrame(() => {
            siteHeader.classList.toggle("scrolled", window.scrollY > 12);
            scrollUpdatePending = false;
        });
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
}

// Full-viewport perspective particle field shared across the site.
let particleCanvas = document.querySelector(".site-particle-field");
if (!particleCanvas) {
    particleCanvas = document.createElement("canvas");
    particleCanvas.className = "site-particle-field";
    particleCanvas.setAttribute("aria-hidden", "true");
    document.body.prepend(particleCanvas);
}
if (particleCanvas) {
    const particleContext = particleCanvas.getContext("2d");
    if (particleContext) {
        const reduceParticleMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const particleCount = window.innerWidth < 700 ? 120 : 250;
        const particles = Array.from({ length: particleCount }, (_, index) => ({
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            depth: Math.random(),
            phase: index * 0.37,
            size: 0.65 + Math.random() * 1.15
        }));
        let particleWidth = 0;
        let particleHeight = 0;
        let particleFrame = 0;
        let particleTime = 0;

        const resizeParticleField = () => {
            const bounds = { width: window.innerWidth, height: window.innerHeight };
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
            particleWidth = bounds.width;
            particleHeight = bounds.height;
            particleCanvas.width = Math.round(bounds.width * pixelRatio);
            particleCanvas.height = Math.round(bounds.height * pixelRatio);
            particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            drawParticleField();
        };

        const drawParticleField = () => {
            particleContext.clearRect(0, 0, particleWidth, particleHeight);
            const points = particles.map((particle) => {
                const depth = (particle.depth + particleTime * 0.025) % 1;
                const perspective = 0.18 + depth * 0.82;
                const spreadX = particleWidth * 0.52 * perspective;
                const spreadY = particleHeight * 0.72 * perspective;
                const wave = Math.sin(particle.x * 3.2 + particleTime * 0.45 + particle.phase) * 10;
                return {
                    x: particleWidth * 0.5 + particle.x * spreadX,
                    y: particleHeight * 0.5 + particle.y * spreadY + wave,
                    depth,
                    radius: particle.size * (0.45 + perspective * 0.85)
                };
            });

            // Fine, dim links make the points read as a connected 3D field.
            for (let i = 0; i < points.length; i += 1) {
                for (let j = i + 1; j < points.length; j += 1) {
                    const dx = points[i].x - points[j].x;
                    const dy = points[i].y - points[j].y;
                    const distance = Math.hypot(dx, dy);
                    if (distance < 48) {
                        particleContext.strokeStyle = `rgba(65, 151, 194, ${(1 - distance / 48) * 0.09})`;
                        particleContext.lineWidth = 0.6;
                        particleContext.beginPath();
                        particleContext.moveTo(points[i].x, points[i].y);
                        particleContext.lineTo(points[j].x, points[j].y);
                        particleContext.stroke();
                    }
                }
            }

            points.forEach((point, index) => {
                const tint = index % 9 === 0 ? "118, 220, 137" : index % 5 === 0 ? "150, 139, 255" : "103, 220, 255";
                const alpha = 0.18 + point.depth * 0.58;
                particleContext.fillStyle = `rgba(${tint}, ${alpha})`;
                particleContext.beginPath();
                particleContext.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
                particleContext.fill();
            });
        };

        const animateParticleField = () => {
            particleTime += 0.016;
            drawParticleField();
            particleFrame = window.requestAnimationFrame(animateParticleField);
        };

        resizeParticleField();
        window.addEventListener("resize", resizeParticleField, { passive: true });
        if (!reduceParticleMotion) particleFrame = window.requestAnimationFrame(animateParticleField);
        window.addEventListener("pagehide", () => window.cancelAnimationFrame(particleFrame), { once: true });
    }
}

document.querySelectorAll(".profile-image, .about-photo-frame img").forEach((image) => {
    const showPhotoFallback = () => {
        const fallback = document.createElement("span");
        fallback.className = "photo-fallback";
        fallback.setAttribute("role", "img");
        fallback.setAttribute("aria-label", "Profile portrait is unavailable");
        fallback.innerHTML = '<i class="fa-regular fa-image" aria-hidden="true"></i><span>Portrait unavailable</span>';
        image.replaceWith(fallback);
    };

    if (image.complete && image.naturalWidth === 0) showPhotoFallback();
    else image.addEventListener("error", showPhotoFallback, { once: true });
});

const typingTarget = document.getElementById("typing-text");
if (typingTarget) {
    const roles = ["Aspiring Software Developer", "Web Developer", "python Developer", "Exploring AI & Data"];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
        typingTarget.textContent = roles[0];
    } else {
        let roleIndex = 0;
        let characterIndex = 0;
        let deleting = false;

        const typeNextCharacter = () => {
            const role = roles[roleIndex];
            characterIndex += deleting ? -1 : 1;
            typingTarget.textContent = role.slice(0, characterIndex);

            let delay = deleting ? 45 : 85;
            if (!deleting && characterIndex === role.length) {
                deleting = true;
                delay = 1300;
            } else if (deleting && characterIndex === 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                delay = 300;
            }
            window.setTimeout(typeNextCharacter, delay);
        };
        typeNextCharacter();
    }
}

