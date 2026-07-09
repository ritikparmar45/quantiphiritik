/**
 * Core processing function for Combinatorial Intersect Filtering.
 * 
 * Accepts the active combination criteria state and executes a comprehensive search
 * loop over the product inventory array, ensuring a product is only returned if it
 * satisfies the category selection, falls inside the price boundary, and meets/exceeds rating.
 * 
 * Includes Graceful Null Handling: if all filters are left unselected or cleared, the logic
 * safely bypasses data reduction filters to display the full, base inventory set seamlessly.
 * 
 * @param {Array} products - Master product item inventory array.
 * @param {Object} criteria - Active combination criteria state.
 * @param {Array<string>} [criteria.categories] - Array of selected categories.
 * @param {number} [criteria.minPrice] - Minimum price boundary.
 * @param {number} [criteria.maxPrice] - Maximum price boundary.
 * @param {number} [criteria.minRating] - Minimum star rating.
 * @returns {Array} - The filtered products array.
 */
export function filterProducts(products, criteria = {}) {
  // Graceful Null Handling: If no criteria object is provided, return base inventory
  if (!criteria) {
    return products;
  }

  const { categories, minPrice, maxPrice, minRating } = criteria;

  // Determine active filtering conditions
  const hasCategories = Array.isArray(categories) && categories.length > 0;
  
  // Parse and validate numeric boundaries
  const parsedMinPrice = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
  const parsedMaxPrice = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
  const parsedMinRating = typeof minRating === 'string' ? parseFloat(minRating) : minRating;

  const hasMinPrice = typeof parsedMinPrice === 'number' && !isNaN(parsedMinPrice);
  const hasMaxPrice = typeof parsedMaxPrice === 'number' && !isNaN(parsedMaxPrice);
  const hasMinRating = typeof parsedMinRating === 'number' && !isNaN(parsedMinRating);

  // Graceful Null Handling: If all filters are unselected, inactive, or cleared,
  // safely bypass data reduction and return the full inventory.
  if (!hasCategories && !hasMinPrice && !hasMaxPrice && !hasMinRating) {
    return products;
  }

  // Intersect filtering search loop
  return products.filter(product => {
    // 1. Category check: Product must be one of the selected categories
    if (hasCategories && !categories.includes(product.category)) {
      return false;
    }

    // 2. Price boundary check: Product price must fall within [minPrice, maxPrice]
    if (hasMinPrice && product.price < parsedMinPrice) {
      return false;
    }
    if (hasMaxPrice && product.price > parsedMaxPrice) {
      return false;
    }

    // 3. Star rating check: Product rating must meet or exceed the minimum threshold
    if (hasMinRating && product.rating < parsedMinRating) {
      return false;
    }

    return true;
  });
}
