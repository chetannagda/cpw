// Global variables and product data
let currentHeroSlide = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
let heroSlideInterval;

// Product data - Only 5 main products as shown in Featured Products section
const products = {
    1: {
        id: 1,
        title: 'Premium Wedding Lightroom Luts',
        price: 199,
        originalPrice: 999,
        image: './images/WED.jpg',
        category: 'wedding',
        description: 'Enhance your wedding photos with our premium Lightroom presets and LUTs specifically designed for this special occasion.'
    },
    2: {
        id: 2,
        title: 'Premium PreWedding Lightroom Luts',
        price: 199,
        originalPrice: 999,
        image: './images/pre.jpg',
        category: 'prewedding',
        description: 'Perfect presets for pre-wedding photography sessions with romantic and dreamy effects.'
    },
    3: {
        id: 3,
        title: 'Premium Camera Raw Luts',
        price: 199,
        originalPrice: 499,
        image: './images/wen.jpg',
        category: 'cinematic',
        description: 'Professional cinematic LUTs for video editing with bright and airy aesthetics.'
    },
    4: {
        id: 4,
        title: 'Premier Pro Wedding Luts',
        price: 199,
        originalPrice: 999,
        image: './images/prowed.jpg',
        category: 'wedding',
        description: 'Classic wedding presets for timeless and elegant wedding photography.'
    },
    5: {
        id: 5,
        title: 'Premier Pro PreWedding Luts',
        price: 199,
        originalPrice: 999,
        image: './images/pro.jpg',
        category: 'prewedding',
        description: 'Professional pre-wedding presets for stunning couple photography.'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize hero slider
    initializeHeroSlider();
    
    // Add smooth scrolling to all anchor links
    addSmoothScrolling();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize collections page if present
    if (window.location.pathname.includes('collections.html')) {
        initializeCollectionsPage();
    }
    
    // Initialize cart page if present
    if (window.location.pathname.includes('cart.html')) {
        initializeCartPage();
    }
    
    // Handle URL parameters for category filtering
    handleURLParameters();
    
    console.log('ColorPW website initialized successfully');
}

// Hero slider functionality
function initializeHeroSlider() {
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length === 0) return;
    
    let currentSlide = 0;
    
    function showSlide(index) {
        heroSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % heroSlides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
        showSlide(currentSlide);
    }
    
    // Auto-advance slides
    heroSlideInterval = setInterval(nextSlide, 5000);
    
    // Pause auto-advance on hover
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.addEventListener('mouseenter', () => {
            clearInterval(heroSlideInterval);
        });
        
        heroSection.addEventListener('mouseleave', () => {
            heroSlideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    // Expose functions globally for button clicks
    window.nextHeroSlide = nextSlide;
    window.prevHeroSlide = prevSlide;
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    // Toggle mobile menu
    window.toggleMobileMenu = function() {
        mobileMenu.classList.toggle('open');
        
        // Toggle aria-expanded for accessibility
        const isOpen = mobileMenu.classList.contains('open');
        mobileMenuBtn.setAttribute('aria-expanded', isOpen);
        
        // Prevent body scrolling when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    
    // Close mobile menu
    window.closeMobileMenu = function() {
        mobileMenu.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenu.classList.contains('open') && 
            !mobileMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close menu on window resize if desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });
}

// Smooth scrolling for anchor links
function addSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                const mobileMenu = document.querySelector('.mobile-menu');
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    closeMobileMenu();
                }
                
                // Calculate header offset
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;
                const topBanner = document.querySelector('.top-banner');
                const bannerHeight = topBanner ? topBanner.offsetHeight : 0;
                const offset = headerHeight + bannerHeight + 20;
                
                const targetPosition = targetElement.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize animations on scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll(
        '.product-card, .feature, .testimonial-card, .contact-item, .about-text, .about-features'
    );
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// Product functionality
function openProduct(productId) {
    if (!productId || !products[productId]) {
        console.error('Invalid product ID:', productId);
        showNotification('Product not found', 'error');
        return;
    }
    
    // Store product ID for the product page
    sessionStorage.setItem('currentProduct', productId);
    
    // Navigate to product page
    window.location.href = `product.html?id=${productId}`;
}

// Add to cart functionality (will be handled by cart.js)
function addToCart(productId) {
    if (!window.cart) {
        console.error('Cart system not initialized');
        return;
    }
    
    const product = products[productId];
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    window.cart.addItem(product);
    showNotification(`${product.title} added to cart!`, 'success');
}

// Buy now functionality
function buyNow(productId) {
    const product = products[productId];
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Add to cart and proceed to checkout
    addToCart(productId);
    
    // Small delay to ensure cart is updated
    setTimeout(() => {
        if (window.cart && window.cart.getItems().length > 0) {
            window.location.href = 'cart.html';
        }
    }, 100);
}

// Contact form submission
function submitContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get('name') || form.querySelector('input[type="text"]').value;
    const email = formData.get('email') || form.querySelector('input[type="email"]').value;
    const message = formData.get('message') || form.querySelector('textarea').value;
    
    if (!name || !email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Simulate form submission
    showNotification('Thank you for your message! We will get back to you soon.', 'success');
    form.reset();
}

// Collections page functionality
function initializeCollectionsPage() {
    generateProductsGrid();
    
    // Set up filter functionality
    window.filterProducts = function(category) {
        const productCards = document.querySelectorAll('.product-card');
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        // Update active filter button
        filterBtns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Show/hide products based on category
        productCards.forEach(card => {
            const productCategory = card.getAttribute('data-category');
            if (category === 'all' || productCategory === category) {
                card.style.display = 'block';
                setTimeout(() => card.classList.add('fade-in'), 100);
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });
    };
    
    // Set up sort functionality
    window.sortProducts = function() {
        const sortValue = document.getElementById('sortSelect').value;
        const productsGrid = document.getElementById('productsGrid');
        const productCards = Array.from(productsGrid.querySelectorAll('.product-card'));
        
        productCards.sort((a, b) => {
            const aId = parseInt(a.getAttribute('data-product-id'));
            const bId = parseInt(b.getAttribute('data-product-id'));
            const aProduct = products[aId];
            const bProduct = products[bId];
            
            switch (sortValue) {
                case 'price-low':
                    return aProduct.price - bProduct.price;
                case 'price-high':
                    return bProduct.price - aProduct.price;
                case 'newest':
                    return bId - aId;
                default:
                    return aId - bId;
            }
        });
        
        // Re-append sorted cards
        productCards.forEach(card => {
            productsGrid.appendChild(card);
        });
    };
}

// Generate products grid for collections page
function generateProductsGrid() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    Object.values(products).forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    card.setAttribute('data-category', product.category);
    card.onclick = () => openProduct(product.id);
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.title}" loading="lazy">
        </div>
        <div class="product-info">
            <h3>${product.title}</h3>
            <div class="price">
                <span class="sale-price">Rs. ${product.price.toFixed(2)}</span>
                <span class="regular-price">Rs. ${product.originalPrice.toFixed(2)}</span>
            </div>
            <div class="product-actions">
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <button class="buy-now-btn" onclick="event.stopPropagation(); buyNow(${product.id})">
                    Buy Now
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Handle URL parameters for filtering
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category && window.location.pathname.includes('collections.html')) {
        // Wait for page to load then apply filter
        setTimeout(() => {
            const filterBtn = document.querySelector(`[onclick="filterProducts('${category}')"]`);
            if (filterBtn) {
                filterBtn.click();
            }
        }, 100);
    }
}

// Cart page initialization
function initializeCartPage() {
    const cartPageContent = document.getElementById('cartPageContent');
    if (!cartPageContent || !window.cart) return;
    
    function renderCartPage() {
        const cartItems = window.cart.getItems();
        
        if (cartItems.length === 0) {
            cartPageContent.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some presets to get started!</p>
                    <a href="collections.html" class="continue-shopping">Continue Shopping</a>
                </div>
            `;
            return;
        }
        
        const total = cartItems.reduce((sum, item) => sum + item.price, 0);
        
        cartPageContent.innerHTML = `
            <div class="cart-items-list">
                ${cartItems.map(item => `
                    <div class="cart-page-item">
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.title}">
                        </div>
                        <div class="item-details">
                            <h3>${item.title}</h3>
                            <p class="item-price">Rs. ${item.price.toFixed(2)}</p>
                        </div>
                        <div class="item-actions">
                            <button class="remove-btn" onclick="window.cart.removeItem(${item.id}); initializeCartPage();">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="total-section">
                    <h3>Order Summary</h3>
                    <div class="total-line">
                        <span>Subtotal:</span>
                        <span>Rs. ${total.toFixed(2)}</span>
                    </div>
                    <div class="total-line final-total">
                        <span><strong>Total:</strong></span>
                        <span><strong>Rs. ${total.toFixed(2)}</strong></span>
                    </div>
                </div>
                <div class="checkout-actions">
                    <button class="checkout-btn" onclick="checkout()">
                        Proceed to Checkout
                    </button>
                    <a href="collections.html" class="continue-shopping-link">Continue Shopping</a>
                </div>
            </div>
        `;
    }
    
    renderCartPage();
}

// Checkout functionality
function checkout() {
    if (!window.cart || window.cart.getItems().length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    const cartItems = window.cart.getItems();
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    
    // Simulate checkout process
    showNotification('Redirecting to payment...', 'success');
    
    // In a real application, this would redirect to a payment gateway
    setTimeout(() => {
        if (confirm(`Proceed to payment for Rs. ${total.toFixed(2)}?\n\nThis is a demo - no actual payment will be processed.`)) {
            window.cart.clearCart();
            showNotification('Order placed successfully! Thank you for your purchase.', 'success');
            
            // Redirect to home page after successful order
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }, 1000);
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#f43f5e'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease, opacity 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Utility functions
function formatCurrency(amount) {
    return `Rs. ${amount.toFixed(2)}`;
}

// Handle page visibility changes to pause/resume animations
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        clearInterval(heroSlideInterval);
    } else {
        if (heroSlides.length > 1) {
            heroSlideInterval = setInterval(() => {
                window.nextHeroSlide && window.nextHeroSlide();
            }, 5000);
        }
    }
});

// Handle window resize for responsive adjustments
window.addEventListener('resize', function() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
            window.closeMobileMenu && window.closeMobileMenu();
        }
    }
});

// Initialize touch/swipe support for mobile devices
function initializeTouchSupport() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        heroSection.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleHeroSwipe();
        });
    }
    
    function handleHeroSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                window.nextHeroSlide && window.nextHeroSlide();
            } else {
                window.prevHeroSlide && window.prevHeroSlide();
            }
        }
    }
}

// Initialize touch support when DOM is ready
document.addEventListener('DOMContentLoaded', initializeTouchSupport);

// Export functions for global use
window.openProduct = openProduct;
window.addToCart = addToCart;
window.buyNow = buyNow;
window.submitContactForm = submitContactForm;
window.checkout = checkout;
window.showNotification = showNotification;
window.products = products;

console.log('Main.js loaded successfully');
