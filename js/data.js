/* ========================================
   MK Collection - Product Data
   ======================================== */

const MKData = {
    // Product Categories
    categories: [
        {
            id: 'women',
            name: 'Women',
            slug: 'women',
            subcategories: [
                { id: 'dresses', name: 'Dresses', slug: 'dresses', count: 145 },
                { id: 'tops', name: 'Tops', slug: 'tops', count: 89 },
                { id: 'bottoms', name: 'Bottoms', slug: 'bottoms', count: 67 },
                { id: 'activewear', name: 'Activewear', slug: 'activewear', count: 34 },
                { id: 'cotton-dresses', name: 'Cotton Dresses', slug: 'cotton-dresses', count: 52 },
                { id: 'readymades', name: 'Readymades', slug: 'readymades', count: 78 }
            ]
        },
        {
            id: 'accessories',
            name: 'Accessories',
            slug: 'accessories',
            subcategories: [
                { id: 'jewelry', name: 'Jewelry', slug: 'jewelry', count: 124 },
                { id: 'bags', name: 'Bags', slug: 'bags', count: 45 },
                { id: 'scarves', name: 'Scarves', slug: 'scarves', count: 28 }
            ]
        }
    ],

    // Collections
    collections: [
        {
            id: 'summer-essentials',
            name: 'Summer Essentials',
            slug: 'summer-essentials',
            description: 'Light, breezy styles for the perfect summer look',
            image: 'images/collections/summer.jpg',
            featured: true
        },
        {
            id: 'wedding-guest',
            name: 'Wedding Guest',
            slug: 'wedding-guest',
            description: 'Elegant outfits for every celebration',
            image: 'images/collections/wedding.jpg',
            featured: true
        },
        {
            id: 'office-chic',
            name: 'Office Chic',
            slug: 'office-chic',
            description: 'Professional styles with a modern twist',
            image: 'images/collections/office.jpg',
            featured: true
        }
    ],

    // Products
    products: [
        {
            id: 'prod-001',
            name: 'Elegant Blush Midi Dress',
            slug: 'elegant-blush-midi-dress',
            category: 'dresses',
            collection: 'wedding-guest',
            price: 189.00,
            originalPrice: 249.00,
            discount: 24,
            description: 'A stunning midi dress in soft blush pink, perfect for weddings and special occasions. Features a flattering A-line silhouette with delicate pleating and a subtle shimmer finish.',
            images: [
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop',
                'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=1000&fit=crop',
                'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop'
            ],
            colors: [
                { name: 'Blush Pink', code: '#F5B8C9' },
                { name: 'Champagne', code: '#F7E7CE' },
                { name: 'Navy', code: '#1E3A5F' }
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            stock: {
                'XS': 5,
                'S': 12,
                'M': 8,
                'L': 15,
                'XL': 3
            },
            fabric: '95% Polyester, 5% Elastane',
            care: 'Machine wash cold, hang dry',
            rating: 4.8,
            reviews: 128,
            isNew: true,
            isSale: true,
            isFeatured: true,
            tags: ['wedding', 'formal', 'midi', 'elegant']
        },
        {
            id: 'prod-002',
            name: 'Classic White Linen Blouse',
            slug: 'classic-white-linen-blouse',
            category: 'tops',
            collection: 'office-chic',
            price: 79.00,
            originalPrice: null,
            discount: 0,
            description: 'A timeless white linen blouse with relaxed fit and subtle elegance. Perfect for office wear or casual outings.',
            images: [
                'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&h=1000&fit=crop',
                'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&h=1000&fit=crop'
            ],
            colors: [
                { name: 'White', code: '#FFFFFF' },
                { name: 'Ivory', code: '#FFFFF0' },
                { name: 'Sky Blue', code: '#87CEEB' }
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            stock: {
                'XS': 10,
                'S': 20,
                'M': 25,
                'L': 18,
                'XL': 12,
                'XXL': 5
            },
            fabric: '100% Linen',
            care: 'Hand wash recommended',
            rating: 4.6,
            reviews: 89,
            isNew: false,
            isSale: false,
            isFeatured: true,
            tags: ['office', 'casual', 'linen', 'classic']
        },
        {
            id: 'prod-003',
            name: 'High-Waist Tailored Trousers',
            slug: 'high-waist-tailored-trousers',
            category: 'bottoms',
            collection: 'office-chic',
            price: 129.00,
            originalPrice: 159.00,
            discount: 19,
            description: 'Sophisticated high-waist trousers with a tailored fit. Features side pockets and a flattering silhouette.',
            images: [
                'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop',
                'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=800&h=1000&fit=crop'
            ],
            colors: [
                { name: 'Black', code: '#1A1A1A' },
                { name: 'Navy', code: '#1E3A5F' },
                { name: 'Camel', code: '#C19A6B' }
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            stock: {
                'XS': 8,
                'S': 15,
                'M': 20,
                'L': 12,
                'XL': 6
            },
            fabric: '70% Polyester, 25% Viscose, 5% Elastane',
            care: 'Dry clean only',
            rating: 4.7,
            reviews: 156,
            isNew: false,
            isSale: true,
            isFeatured: false,
            tags: ['office', 'tailored', 'high-waist', 'professional']
        },
        {
            id: 'prod-004',
            name: 'Summer Floral Maxi Dress',
            slug: 'summer-floral-maxi-dress',
            category: 'dresses',
            collection: 'summer-essentials',
            price: 149.00,
            originalPrice: null,
            discount: 0,
            description: 'A flowing maxi dress with beautiful floral print. Features a flattering wrap style and adjustable straps.',
            images: [
                'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=1000&fit=crop',
                'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=800&h=1000&fit=crop',
                'https://images.unsplash.com/photo-1499939667766-4afceb292d05?w=800&h=1000&fit=crop'
            ],
            colors: [
                { name: 'Blue Floral', code: '#4A90D9' },
                { name: 'Rose Floral', code: '#E8B4B8' },
                { name: 'Green Floral', code: '#7CB342' }
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            stock: {
                'XS': 6,
                'S': 14,
                'M': 18,
                'L': 10,
                'XL': 4
            },
            fabric: '100% Viscose',
            care: 'Machine wash cold, line dry',
            rating: 4.9,
            reviews: 234,
            isNew: true,
            isSale: false,
            isFeatured: true,
            tags: ['summer', 'floral', 'maxi', 'casual']
        },
        {
            id: 'prod-005',
            name: 'Athleisure Yoga Set',
            slug: 'athleisure-yoga-set',
            category: 'activewear',
            collection: null,
            price: 89.00,
            originalPrice: 119.00,
            discount: 25,
            description: 'Comfortable and stylish yoga set including high-waist leggings and matching sports bra. Perfect for workouts or casual wear.',
            images: [
                'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=1000&fit=crop',
                'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=1000&fit=crop'
            ],
            colors: [
                { name: 'Black', code: '#1A1A1A' },
                { name: 'Dusty Rose', code: '#D4A5A5' },
                { name: 'Sage', code: '#9CAF88' }
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            stock: {
                'XS': 12,
                'S': 20,
                'M': 25,
                'L': 15,
                'XL': 8
            },
            fabric: '80% Nylon, 20% Spandex',
            care: 'Machine wash cold',
            rating: 4.8,
            reviews: 312,
            isNew: false,
            isSale: true,
            isFeatured: true,
            tags: ['activewear', 'yoga', 'comfortable', 'athleisure']
        },
        {
            id: 'prod-006',
            name: 'Pearl Drop Earrings',
            slug: 'pearl-drop-earrings',
            category: 'jewelry',
            collection: 'wedding-guest',
            price: 49.00,
            originalPrice: null,
            discount: 0,
            description: 'Elegant pearl drop earrings with gold-plated sterling silver posts. A timeless accessory for any occasion.',
            images: [
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=1000&fit=crop'
            ],
            colors: [
                { name: 'Gold/Pearl', code: '#FFD700' }
            ],
            sizes: ['One Size'],
            stock: {
                'One Size': 45
            },
            fabric: 'Gold-plated Sterling Silver, Freshwater Pearl',
            care: 'Store in jewelry box, avoid water',
            rating: 4.9,
            reviews: 89,
            isNew: true,
            isSale: false,
            isFeatured: true,
            tags: ['jewelry', 'earrings', 'pearl', 'elegant']
        },
        {
            id: 'prod-007',
            name: 'Cotton Wrap Dress',
            slug: 'cotton-wrap-dress',
            category: 'cotton-dresses',
            collection: 'summer-essentials',
            price: 109.00,
            originalPrice: 139.00,
            discount: 22,
            description: 'A versatile cotton wrap dress in a flattering silhouette. Breathable and comfortable for all-day wear.',
            images: [
                'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&h=1000&fit=crop',
                'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&h=1000&fit=crop'
            ],
            colors: [
                { name: 'Terra Cotta', code: '#E2725B' },
                { name: 'Olive', code: '#808000' },
                { name: 'Cream', code: '#FFFDD0' }
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            stock: {
                'XS': 7,
                'S': 16,
                'M': 22,
                'L': 14,
                'XL': 5
            },
            fabric: '100% Organic Cotton',
            care: 'Machine wash cold, tumble dry low',
            rating: 4.7,
            reviews: 178,
            isNew: false,
            isSale: true,
            isFeatured: false,
            tags: ['cotton', 'wrap', 'sustainable', 'summer']
        },
        {
            id: 'prod-008',
            name: 'Silk Camisole Top',
            slug: 'silk-camisole-top',
            category: 'tops',
            collection: null,
            price: 69.00,
            originalPrice: null,
            discount: 0,
            description: 'Luxurious silk camisole with delicate lace trim. Perfect for layering or wearing on its own.',
            images: [
                'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop',
                'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&h=1000&fit=crop'
            ],
            colors: [
                { name: 'Champagne', code: '#F7E7CE' },
                { name: 'Black', code: '#1A1A1A' },
                { name: 'Blush', code: '#F5B8C9' }
            ],
            sizes: ['XS', 'S', 'M', 'L'],
            stock: {
                'XS': 8,
                'S': 15,
                'M': 20,
                'L': 10
            },
            fabric: '100% Mulberry Silk',
            care: 'Hand wash cold, lay flat to dry',
            rating: 4.8,
            reviews: 95,
            isNew: true,
            isSale: false,
            isFeatured: true,
            tags: ['silk', 'camisole', 'luxurious', 'elegant']
        }
    ],

    // Size Guide Data
    sizeGuide: {
        tops: {
            XS: { bust: '32-33', waist: '24-25', hips: '34-35' },
            S: { bust: '34-35', waist: '26-27', hips: '36-37' },
            M: { bust: '36-37', waist: '28-29', hips: '38-39' },
            L: { bust: '38-40', waist: '30-32', hips: '40-42' },
            XL: { bust: '41-43', waist: '33-35', hips: '43-45' },
            XXL: { bust: '44-46', waist: '36-38', hips: '46-48' }
        },
        dresses: {
            XS: { bust: '32-33', waist: '24-25', hips: '34-35', length: '35' },
            S: { bust: '34-35', waist: '26-27', hips: '36-37', length: '36' },
            M: { bust: '36-37', waist: '28-29', hips: '38-39', length: '37' },
            L: { bust: '38-40', waist: '30-32', hips: '40-42', length: '38' },
            XL: { bust: '41-43', waist: '33-35', hips: '43-45', length: '39' }
        },
        bottoms: {
            XS: { waist: '24-25', hips: '34-35', inseam: '30' },
            S: { waist: '26-27', hips: '36-37', inseam: '30' },
            M: { waist: '28-29', hips: '38-39', inseam: '31' },
            L: { waist: '30-32', hips: '40-42', inseam: '31' },
            XL: { waist: '33-35', hips: '43-45', inseam: '32' }
        }
    },

    // Helper Functions
    getProductById(id) {
        return this.products.find(p => p.id === id);
    },

    getProductBySlug(slug) {
        return this.products.find(p => p.slug === slug);
    },

    getProductsByCategory(categoryId) {
        return this.products.filter(p => p.category === categoryId);
    },

    getProductsByCollection(collectionId) {
        return this.products.filter(p => p.collection === collectionId);
    },

    getNewArrivals(limit = 8) {
        return this.products.filter(p => p.isNew).slice(0, limit);
    },

    getSaleProducts(limit = 8) {
        return this.products.filter(p => p.isSale).slice(0, limit);
    },

    getFeaturedProducts(limit = 8) {
        return this.products.filter(p => p.isFeatured).slice(0, limit);
    },

    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.tags.some(tag => tag.includes(searchTerm))
        );
    },

    getCategoryById(id) {
        for (const cat of this.categories) {
            if (cat.id === id) return cat;
            const subcat = cat.subcategories.find(s => s.id === id);
            if (subcat) return subcat;
        }
        return null;
    },

    getCollectionById(id) {
        return this.collections.find(c => c.id === id);
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MKData;
}
