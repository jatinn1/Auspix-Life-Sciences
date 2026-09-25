const API_URL = "http://localhost:5000/api/enquiries";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");
const navLinks = document.querySelectorAll(".nav-links a");

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
        navigation.classList.toggle("active");

        if (navigation.classList.contains("active")) {
            menuToggle.textContent = "✕";
            menuToggle.setAttribute("aria-label", "Close navigation");
        } else {
            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-label", "Open navigation");
        }
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        if (navigation) {
            navigation.classList.remove("active");
        }

        if (menuToggle) {
            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-label", "Open navigation");
        }
    });
});

const contactForm = document.querySelector(".contact-form");
const formMessage = document.querySelector(".form-message");
const contactSubmit = document.querySelector(".contact-submit");

if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.querySelector("#name").value.trim();
        const company = document.querySelector("#company").value.trim();
        const email = document.querySelector("#email").value.trim();
        const phone = document.querySelector("#phone").value.trim();
        const message = document.querySelector("#message").value.trim();

        if (!name || !email || !message) {
            formMessage.textContent = "Please fill in all required fields.";
            formMessage.classList.add("active");
            return;
        }

        contactSubmit.disabled = true;
        contactSubmit.textContent = "Submitting...";
        formMessage.classList.remove("active");

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    company,
                    email,
                    phone,
                    message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit enquiry");
            }

            formMessage.textContent = "Thank you! Your enquiry has been submitted successfully.";
            formMessage.classList.add("active");

            contactForm.reset();
        } catch (error) {
            formMessage.textContent = "Unable to submit your enquiry. Please try again.";
            formMessage.classList.add("active");
        } finally {
            contactSubmit.disabled = false;
            contactSubmit.textContent = "Send Enquiry";
        }
    });
}

const scrollTop = document.querySelector(".scroll-top");

if (scrollTop) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            scrollTop.classList.add("active");
        } else {
            scrollTop.classList.remove("active");
        }
    });

    scrollTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

const navbar = document.querySelector(".navbar");

if (navbar) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

const sections = document.querySelectorAll("main section");

window.addEventListener("scroll", () => {
    let currentSection = "";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {
            currentSection = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");

        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }
    });
});

const revealElements = document.querySelectorAll(
    ".about-container, .products-heading, .product-card, .manufacturing-container, .quality-heading, .quality-card, .infrastructure-heading, .gallery-item, .contact-heading, .contact-grid"
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
});

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12
    }
);

revealElements.forEach((element) => {
    revealObserver.observe(element);
});