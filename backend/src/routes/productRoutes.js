import express from 'express';
import { products } from '../data/products.js';
import { filterProducts } from '../utils/filterEngine.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { categories, minPrice, maxPrice, minRating } = req.query;

    const criteria = {};
    
    if (categories) {
      criteria.categories = categories.split(',').map(c => c.trim()).filter(Boolean);
    }
    
    if (minPrice !== undefined && minPrice !== '') {
      criteria.minPrice = parseFloat(minPrice);
    }
    
    if (maxPrice !== undefined && maxPrice !== '') {
      criteria.maxPrice = parseFloat(maxPrice);
    }
    
    if (minRating !== undefined && minRating !== '') {
      criteria.minRating = parseFloat(minRating);
    }

    const filteredProducts = filterProducts(products, criteria);

    const absoluteMinPrice = products.reduce((min, p) => p.price < min ? p.price : min, products[0]?.price || 0);
    const absoluteMaxPrice = products.reduce((max, p) => p.price > max ? p.price : max, products[0]?.price || 1000);

    const categoryCounts = {};
    products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    const activeCategoryCounts = {};
    const criteriaWithoutCategory = { ...criteria, categories: [] };
    const productsFilteredByOthers = filterProducts(products, criteriaWithoutCategory);
    productsFilteredByOthers.forEach(p => {
      activeCategoryCounts[p.category] = (activeCategoryCounts[p.category] || 0) + 1;
    });

    const ratingBands = [5, 4, 3, 2, 1];
    const ratingCounts = ratingBands.map(star => {
      const count = products.filter(p => p.rating >= star).length;
      const activeCount = productsFilteredByOthers.filter(p => p.rating >= star).length;
      return { rating: star, count, activeCount };
    });

    const brands = [...new Set(products.map(p => p.brand))];

    res.json({
      success: true,
      data: filteredProducts,
      meta: {
        totalCount: products.length,
        filteredCount: filteredProducts.length,
        facets: {
          categories: Object.keys(categoryCounts).map(cat => ({
            name: cat,
            totalCount: categoryCounts[cat],
            activeCount: activeCategoryCounts[cat] || 0
          })),
          priceRange: {
            min: absoluteMinPrice,
            max: absoluteMaxPrice
          },
          ratings: ratingCounts,
          brands
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing product filter",
      error: error.message
    });
  }
});

export default router;
