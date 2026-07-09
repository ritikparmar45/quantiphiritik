export function filterProducts(products, criteria = {}) {
  if (!criteria) {
    return products;
  }

  const { categories, minPrice, maxPrice, minRating } = criteria;

  const hasCategories = Array.isArray(categories) && categories.length > 0;
  
  const parsedMinPrice = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
  const parsedMaxPrice = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
  const parsedMinRating = typeof minRating === 'string' ? parseFloat(minRating) : minRating;

  const hasMinPrice = typeof parsedMinPrice === 'number' && !isNaN(parsedMinPrice);
  const hasMaxPrice = typeof parsedMaxPrice === 'number' && !isNaN(parsedMaxPrice);
  const hasMinRating = typeof parsedMinRating === 'number' && !isNaN(parsedMinRating);

  if (!hasCategories && !hasMinPrice && !hasMaxPrice && !hasMinRating) {
    return products;
  }

  return products.filter(product => {
    if (hasCategories && !categories.includes(product.category)) {
      return false;
    }

    if (hasMinPrice && product.price < parsedMinPrice) {
      return false;
    }
    if (hasMaxPrice && product.price > parsedMaxPrice) {
      return false;
    }

    if (hasMinRating && product.rating < parsedMinRating) {
      return false;
    }

    return true;
  });
}
