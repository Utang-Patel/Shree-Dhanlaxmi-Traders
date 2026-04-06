// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Animate hamburger menu
    mobileMenuBtn.classList.toggle('active');
});

// Manual navigation
prevBtn.addEventListener('click', () => {
    clearInterval(slideInterval);
    prevSlide();
    slideInterval = setInterval(nextSlide, 3000);
});

nextBtn.addEventListener('click', () => {
    clearInterval(slideInterval);
    nextSlide();
    slideInterval = setInterval(nextSlide, 3000);
});

// Product Cards Animation
const productCards = document.querySelectorAll('.product-card');

// Simple animation when products come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

productCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    observer.observe(card);
});

// Get Details Button Click Handler
const detailButtons = document.querySelectorAll('.get-details-btn');

detailButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const productName = e.target.parentElement.querySelector('h3').textContent;
        alert(`Details for ${productName} will be displayed here`);
    });
});

// View All Products Button Click Handler
const viewAllBtn = document.querySelector('.view-all-btn');

viewAllBtn.addEventListener('click', () => {
    alert('Redirecting to all products page');
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


