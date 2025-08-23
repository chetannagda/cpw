// Product page functionality
let currentImageIndex = 0;
let productImages = [];
let currentProduct = null;
let touchStartX = 0;
let touchEndX = 0;

// Initialize product page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('product.html')) {
        initializeProductPage();
    }
});

function initializeProductPage() {
    // Get product ID from URL or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || sessionStorage.getItem('currentProduct') || '1';
    
    loadProductData(productId);
    setupImageGallery();
    setupImageNavigation();
    setupZoomFunctionality();
    loadRelatedProducts(productId);
    trackProductView(productId);
    setupTouchSupport();
    
    console.log('Product page initialized for product:', productId);
}

// Load product data
function loadProductData(productId) {
    currentProduct = window.products[productId];
    
    if (!currentProduct) {
        console.error('Product not found:', productId);
        showNotification('Product not found', 'error');
        window.location.href = 'collections.html';
        return;
    }
    
    // Update page title
    document.title = `${currentProduct.title} - ColorPW`;
    
    // Update product information
    updateProductInfo();
    
    // Setup product images
    setupProductImages();
}

// Update product information in the DOM
function updateProductInfo() {
    const elements = {
        title: document.querySelector('.product-title'),
        salePrice: document.querySelector('.sale-price'),
        regularPrice: document.querySelector('.regular-price'),
        brand: document.querySelector('.brand')
    };
    
    if (elements.title) elements.title.textContent = currentProduct.title;
    if (elements.salePrice) elements.salePrice.textContent = `Rs. ${currentProduct.price.toFixed(2)}`;
    if (elements.regularPrice) elements.regularPrice.textContent = `Rs. ${currentProduct.originalPrice.toFixed(2)}`;
    if (elements.brand) elements.brand.textContent = 'ColorPW';
}

// Setup product images
function setupProductImages() {
    // Only show the main product image as per requirements
    productImages = [
        currentProduct.image
    ];
    
    currentImageIndex = 0;
    updateMainImage();
    generateThumbnails();
}

// Setup image gallery
function setupImageGallery() {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.addEventListener('error', function() {
            this.src = 'https://via.placeholder.com/500x300?text=Image+Not+Available';
        });
    }
}

// Setup image navigation
function setupImageNavigation() {
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        const zoomModal = document.getElementById('zoomModal');
        if (zoomModal && zoomModal.classList.contains('open')) {
            e.preventDefault();
            switch(e.key) {
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
                case 'Escape':
                    closeZoom();
                    break;
            }
        }
    });
    
    // Auto-play functionality (optional)
    startImageAutoPlay();
}

// Setup zoom functionality
function setupZoomFunctionality() {
    const zoomModal = document.getElementById('zoomModal');
    if (zoomModal) {
        // Close zoom when clicking outside image
        zoomModal.addEventListener('click', function(e) {
            if (e.target === zoomModal) {
                closeZoom();
            }
        });
    }
}

// Update main image
function updateMainImage() {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage && productImages[currentImageIndex]) {
        // Add loading effect
        mainImage.style.opacity = '0.5';
        
        // Create new image to check if it loads
        const img = new Image();
        img.onload = function() {
            mainImage.src = productImages[currentImageIndex];
            mainImage.style.opacity = '1';
            
            // Update zoom modal image if open
            const zoomedImage = document.getElementById('zoomedImage');
            if (zoomedImage) {
                zoomedImage.src = productImages[currentImageIndex];
            }
        };
        img.onerror = function() {
            mainImage.src = 'https://via.placeholder.com/500x300?text=Image+Not+Available';
            mainImage.style.opacity = '1';
        };
        img.src = productImages[currentImageIndex];
    }
    
    updateThumbnailActive();
}

// Generate thumbnails
function generateThumbnails() {
    const thumbnailGallery = document.querySelector('.thumbnail-gallery');
    if (!thumbnailGallery) return;
    
    thumbnailGallery.innerHTML = '';
    
    productImages.forEach((imageSrc, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.onclick = () => changeMainImage(index);
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `Product image ${index + 1}`;
        img.loading = 'lazy';
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/80x80?text=N/A';
        };
        
        thumbnail.appendChild(img);
        thumbnailGallery.appendChild(thumbnail);
    });
}

// Change main image
function changeMainImage(index) {
    if (index < 0 || index >= productImages.length) return;
    
    currentImageIndex = index;
    updateMainImage();
}

// Update thumbnail active state
function updateThumbnailActive() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
}

// Navigate to previous image
function prevImage() {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : productImages.length - 1;
    changeMainImage(newIndex);
}

// Navigate to next image
function nextImage() {
    const newIndex = currentImageIndex < productImages.length - 1 ? currentImageIndex + 1 : 0;
    changeMainImage(newIndex);
}

// Toggle zoom modal
function toggleZoom() {
    const zoomModal = document.getElementById('zoomModal');
    const zoomedImage = document.getElementById('zoomedImage');
    const mainImage = document.getElementById('mainProductImage');
    
    if (zoomModal && zoomedImage && mainImage) {
        zoomedImage.src = mainImage.src;
        zoomModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

// Close zoom modal
function closeZoom() {
    const zoomModal = document.getElementById('zoomModal');
    
    if (zoomModal) {
        zoomModal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Setup touch support for mobile swipe
function setupTouchSupport() {
    const mainImage = document.getElementById('mainProductImage');
    if (!mainImage) return;
    
    mainImage.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    mainImage.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleImageSwipe();
    }, { passive: true });
    
    // Also add touch support to zoom modal
    const zoomModal = document.getElementById('zoomModal');
    if (zoomModal) {
        zoomModal.addEventListener('touchstart', function(e) {
            if (e.target.tagName === 'IMG') {
                touchStartX = e.changedTouches[0].screenX;
            }
        }, { passive: true });
        
        zoomModal.addEventListener('touchend', function(e) {
            if (e.target.tagName === 'IMG') {
                touchEndX = e.changedTouches[0].screenX;
                handleImageSwipe();
            }
        }, { passive: true });
    }
}

// Handle swipe gesture
function handleImageSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextImage(); // Swipe left, go to next
        } else {
            prevImage(); // Swipe right, go to previous
        }
    }
}

// Auto-play images
function startImageAutoPlay() {
    let autoPlayInterval;
    
    function startAutoPlay() {
        if (productImages.length <= 1) return;
        autoPlayInterval = setInterval(() => {
            nextImage();
        }, 5000);
    }
    
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }
    
    // Start auto-play
    startAutoPlay();
    
    // Stop auto-play when user interacts
    const galleryContainer = document.querySelector('.product-gallery');
    if (galleryContainer) {
        galleryContainer.addEventListener('mouseenter', stopAutoPlay);
        galleryContainer.addEventListener('mouseleave', startAutoPlay);
        
        // Also stop on touch
        galleryContainer.addEventListener('touchstart', stopAutoPlay);
    }
    
    // Stop auto-play when page is not visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });
}

// Load related products
function loadRelatedProducts(currentProductId) {
    const relatedProductsGrid = document.getElementById('relatedProducts');
    if (!relatedProductsGrid || !window.products) return;
    
    // Get all products excluding the current one - show remaining 4 products
    const relatedProducts = Object.values(window.products)
        .filter(product => product.id != currentProductId);
    
    relatedProductsGrid.innerHTML = '';
    
    relatedProducts.forEach(product => {
        const productCard = createRelatedProductCard(product);
        relatedProductsGrid.appendChild(productCard);
    });
}

// Create related product card
function createRelatedProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    card.onclick = () => window.openProduct(product.id);
    
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
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); window.addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <button class="buy-now-btn" onclick="event.stopPropagation(); window.buyNow(${product.id})">
                    Buy Now
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Track product view
function trackProductView(productId) {
    try {
        const viewCountKey = `product_${productId}_views`;
        const currentViews = parseInt(localStorage.getItem(viewCountKey) || '924');
        const newViews = currentViews + 1;
        
        localStorage.setItem(viewCountKey, newViews.toString());
        
        const viewCountElement = document.getElementById('viewCount');
        if (viewCountElement) {
            viewCountElement.textContent = newViews.toString();
        }
    } catch (error) {
        console.warn('Could not track product view:', error);
    }
}

// Add to cart from product page
function addToCartFromProduct() {
    if (currentProduct && window.addToCart) {
        window.addToCart(currentProduct.id);
    }
}

// Buy now from product page
function buyNowFromProduct() {
    if (currentProduct && window.buyNow) {
        window.buyNow(currentProduct.id);
    }
}

// Handle page unload
window.addEventListener('beforeunload', function() {
    // Clear any intervals
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Clear auto-play interval
        }
    });
});

// Export functions for global use
window.changeMainImage = changeMainImage;
window.prevImage = prevImage;
window.nextImage = nextImage;
window.toggleZoom = toggleZoom;
window.closeZoom = closeZoom;
window.addToCartFromProduct = addToCartFromProduct;
window.buyNowFromProduct = buyNowFromProduct;

console.log('Product.js loaded successfully');
