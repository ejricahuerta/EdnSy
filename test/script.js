document.addEventListener('DOMContentLoaded', () => {
    /* ==== 1. Sticky Navigation ==== */
    const nav = document.querySelector('.glass-nav');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    /* ==== 2. Smooth Scrolling ==== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (nav.classList.contains('mobile-open')) {
                    nav.classList.remove('mobile-open');
                }
            }
        });
    });

    /* ==== 3. Scroll Animations (Intersection Observer) ==== */
    const animationOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // Handle staggered animations specifically
                if (target.classList.contains('stagger-fade-in')) {
                    const children = target.children;
                    Array.from(children).forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animate-in');
                        }, index * 150); // Stagger by 150ms
                    });
                } else {
                    // Regular animations
                    target.classList.add('animate-in');
                }
                
                observer.unobserve(target); // Only animate once
            }
        });
    }, animationOptions);

    // Select all elements to animate
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .stagger-fade-in');
    
    animatedElements.forEach(el => {
        animateOnScroll.observe(el);
    });

    /* ==== 4. Mock Form Submission ==== */
    const quoteForm = document.getElementById('hero-quote-form');
    
    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const btn = quoteForm.querySelector('.btn-submit');
            const originalText = btn.innerHTML;
            
            // Loading state
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Sending...</span>';
            btn.style.opacity = '0.8';
            btn.disabled = true;
            
            // Simulate network request
            setTimeout(() => {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Request Sent!</span>';
                btn.style.background = '#10b981'; // Success green
                btn.style.color = '#fff';
                
                quoteForm.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.opacity = '1';
                    btn.disabled = false;
                }, 3000);
                
            }, 1500);
        });
    }

    /* ==== 5. Interactive Glass Cards Effect ==== */
    // Add subtle tilt/glow effect based on mouse position
    const glassCards = document.querySelectorAll('.hover-glow');
    
    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
