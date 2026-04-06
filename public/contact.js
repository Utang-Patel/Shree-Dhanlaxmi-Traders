// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Header Background Change on Scroll
window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
        header.style.background = "#222";
    } else {
        header.style.background = "#333";
    }
});

// Image Hover Effect
const contactImage = document.querySelector("main img");

contactImage.addEventListener("mouseover", () => {
    contactImage.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.3)";
});

contactImage.addEventListener("mouseleave", () => {
    contactImage.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
});

// Animate Elements When They Come into View
const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px",
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

// Apply animation to all elements
document.querySelectorAll("h3, p, h4").forEach(element => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    observer.observe(element);
});
