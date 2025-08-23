// Shopping cart functionality
class ShoppingCart {
    constructor() {
        this.items = [];
        this.isOpen = false;
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.updateDisplay();
        this.setupEventListeners();
        console.log('Shopping cart initialized');
    }
    
    // Load cart from localStorage
    loadFromStorage() {
        try {
            const savedCart = localStorage.getItem('colorpw_cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.items = [];
        }
    }
    
    // Save cart to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('colorpw_cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }
    
    // Add item to cart
    addItem(product) {
        if (!product || !product.id) {
            console.error('Invalid product data');
            return false;
        }
        
        // Check if item already exists
        const existingItemIndex = this.items.findIndex(item => item.id === product.id);
        
        if (existingItemIndex > -1) {
            // Item already in cart, show message
            window.showNotification && window.showNotification(`${product.title} is already in your cart!`, 'error');
            return false;
        }
        
        // Add new item
        this.items.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            category: product.category
        });
        
        this.saveToStorage();
        this.updateDisplay();
        return true;
    }
    
    // Remove item from cart
    removeItem(productId) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== productId);
        
        if (this.items.length < initialLength) {
            this.saveToStorage();
            this.updateDisplay();
            window.showNotification && window.showNotification('Item removed from cart', 'success');
            return true;
        }
        return false;
    }
    
    // Clear entire cart
    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateDisplay();
    }
    
    // Get all cart items
    getItems() {
        return this.items;
    }
    
    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => total + item.price, 0);
    }
    
    // Get item count
    getItemCount() {
        return this.items.length;
    }
    
    // Update cart display
    updateDisplay() {
        this.updateCartCount();
        this.updateCartSidebar();
    }
    
    // Update cart count in header
    updateCartCount() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const count = this.getItemCount();
        
        cartCounts.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }
    
    // Update cart sidebar content
    updateCartSidebar() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.querySelector('.checkout-btn');
        
        if (!cartItems) return;
        
        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some amazing presets to get started!</p>
                    <a href="collections.html" class="continue-shopping" onclick="toggleCart()">Continue Shopping</a>
                </div>
            `;
            
            if (cartTotal) cartTotal.textContent = '0.00';
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }
        
        // Render cart items
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <div class="cart-item-price">Rs. ${item.price.toFixed(2)}</div>
                    <button class="remove-item" onclick="window.cart.removeItem(${item.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
        
        // Update total
        if (cartTotal) {
            cartTotal.textContent = this.getTotal().toFixed(2);
        }
        
        // Enable checkout button
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
        }
    }
    
    // Toggle cart sidebar
    toggle() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (!cartSidebar || !cartOverlay) return;
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        } else {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
        
        // Update cart display when opening
        if (this.isOpen) {
            this.updateDisplay();
        }
    }
    
    // Close cart
    close() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
            this.isOpen = false;
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Close cart when clicking overlay
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.close());
        }
        
        // Close cart with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Handle cart icon clicks
        const cartIcons = document.querySelectorAll('.cart-icon');
        cartIcons.forEach(icon => {
            icon.addEventListener('click', () => this.toggle());
        });
        
        // Handle close button
        const closeButtons = document.querySelectorAll('.close-cart');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.close());
        });
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global cart instance
    window.cart = new ShoppingCart();
    
    // Make cart functions globally available
    window.toggleCart = function() {
        window.cart.toggle();
    };
    
    window.addToCart = function(productId) {
        if (!window.products || !window.products[productId]) {
            window.showNotification && window.showNotification('Product not found', 'error');
            return;
        }
        
        const product = window.products[productId];
        const success = window.cart.addItem(product);
        
        if (success) {
            window.showNotification && window.showNotification(`${product.title} added to cart!`, 'success');
        }
    };
    
    window.removeFromCart = function(productId) {
        window.cart.removeItem(productId);
    };
    
    window.checkout = function() {
        const cartItems = window.cart.getItems();
        
        if (cartItems.length === 0) {
            window.showNotification && window.showNotification('Your cart is empty', 'error');
            return;
        }
        
        const total = window.cart.getTotal();
        const itemCount = cartItems.length;
        
        // Show checkout confirmation
        const confirmMessage = `
            Ready to checkout?
            
            Items: ${itemCount}
            Total: Rs. ${total.toFixed(2)}
            
            This is a demo - no actual payment will be processed.
        `;
        
        if (confirm(confirmMessage)) {
            // Simulate payment processing
            window.showNotification && window.showNotification('Processing payment...', 'success');
            
            setTimeout(() => {
                // Simulate successful payment
                window.cart.clearCart();
                window.cart.close();
                
                window.showNotification && window.showNotification(
                    'Order placed successfully! Thank you for your purchase.', 
                    'success'
                );
                
                // Redirect to home page after successful order
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }, 2000);
        }
    };
    
    console.log('Cart system initialized successfully');
});

// Handle page unload - save cart state
window.addEventListener('beforeunload', function() {
    if (window.cart) {
        window.cart.saveToStorage();
    }
});

// Handle storage events (for cart sync between tabs)
window.addEventListener('storage', function(e) {
    if (e.key === 'colorpw_cart' && window.cart) {
        window.cart.loadFromStorage();
        window.cart.updateDisplay();
    }
});

// Cart persistence across page loads
function ensureCartPersistence() {
    if (window.cart) {
        // Save cart state periodically
        setInterval(() => {
            window.cart.saveToStorage();
        }, 30000); // Save every 30 seconds
    }
}

// Initialize cart persistence
document.addEventListener('DOMContentLoaded', ensureCartPersistence);

// Add utility functions for cart management
window.getCartTotal = function() {
    return window.cart ? window.cart.getTotal() : 0;
};

window.getCartItemCount = function() {
    return window.cart ? window.cart.getItemCount() : 0;
};

window.getCartItems = function() {
    return window.cart ? window.cart.getItems() : [];
};

window.clearCart = function() {
    if (window.cart) {
        window.cart.clearCart();
        window.showNotification && window.showNotification('Cart cleared', 'success');
    }
};

// Handle mobile-specific cart interactions
function handleMobileCartInteractions() {
    // Ensure cart sidebar takes full width on mobile
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar && window.innerWidth <= 768) {
        cartSidebar.style.width = '100vw';
        cartSidebar.style.right = '-100vw';
    }
}

// Update cart sidebar width on resize
window.addEventListener('resize', handleMobileCartInteractions);
document.addEventListener('DOMContentLoaded', handleMobileCartInteractions);

console.log('Cart.js loaded successfully');
