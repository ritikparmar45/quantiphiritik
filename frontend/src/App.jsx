import { useState, useEffect } from 'react';
import { 
  Filter, 
  RotateCcw, 
  Star, 
  ShoppingBag, 
  SlidersHorizontal,
  Inbox
} from 'lucide-react';
import './App.css';

function App() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 400 });
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        
        if (selectedCategories.length > 0) {
          params.append('categories', selectedCategories.join(','));
        }
        
        params.append('minPrice', priceRange.min);
        params.append('maxPrice', priceRange.max);
        
        if (minRating > 0) {
          params.append('minRating', minRating);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product data from server.');
        }
        const result = await response.json();
        
        if (result.success) {
          setProducts(result.data);
          setMeta(result.meta);
          setError(null);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message || 'Unable to connect to the backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategories, priceRange, minRating]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 400 });
    setMinRating(0);
    setSortBy('featured');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="star-icon filled" size={16} fill="currentColor" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="half-star-container">
            <Star className="star-icon empty" size={16} />
            <div className="half-star" style={{ width: '50%' }}>
              <Star className="star-icon filled" size={16} fill="currentColor" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="star-icon empty" size={16} />);
      }
    }
    return stars;
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price-desc') {
      return b.price - a.price;
    }
    if (sortBy === 'rating-desc') {
      return b.rating - a.rating;
    }
    return 0;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon-bg">
            <ShoppingBag className="logo-icon" size={24} />
          </div>
          <h1>Veloce</h1>
          <span className="logo-badge">Marketplace</span>
        </div>
        <p className="header-subtitle">Discover premium items with precision filtering</p>
      </header>

      <main className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">
              <Filter className="sidebar-icon" size={18} />
              <h2>Filters</h2>
            </div>
            {(selectedCategories.length > 0 || priceRange.min > 0 || priceRange.max < 400 || minRating > 0) && (
              <button className="reset-btn" onClick={handleResetFilters} title="Clear all active filters">
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="filter-sections">
            <div className="filter-group">
              <h3>Categories</h3>
              <div className="checkbox-list">
                {meta?.facets?.categories ? (
                  meta.facets.categories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.name);
                    const isDisabled = cat.activeCount === 0 && !isChecked;
                    return (
                      <label 
                        key={cat.name} 
                        className={`checkbox-label ${isChecked ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => handleCategoryChange(cat.name)}
                        />
                        <span className="custom-checkbox"></span>
                        <span className="category-name">{cat.name}</span>
                        <span className="count-badge">{cat.activeCount}</span>
                      </label>
                    );
                  })
                ) : (
                  <div className="skeleton-placeholder" style={{ height: '120px' }}></div>
                )}
              </div>
            </div>

            <div className="filter-group">
              <div className="price-header">
                <h3>Price Range</h3>
                <SlidersHorizontal size={14} className="muted-icon" />
              </div>
              
              <div className="price-value-display">
                <div className="price-box">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(Number(e.target.value), priceRange.max - 10));
                      setPriceRange(prev => ({ ...prev, min: val }));
                    }}
                  />
                </div>
                <div className="price-separator">—</div>
                <div className="price-box">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => {
                      const val = Math.min(400, Math.max(Number(e.target.value), priceRange.min + 10));
                      setPriceRange(prev => ({ ...prev, max: val }));
                    }}
                  />
                </div>
              </div>

              <div className="dual-slider-container">
                <div className="slider-track-base"></div>
                <div 
                  className="slider-track-selected"
                  style={{
                    left: `${(priceRange.min / 400) * 100}%`,
                    right: `${100 - (priceRange.max / 400) * 100}%`
                  }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={priceRange.min}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), priceRange.max - 10);
                    setPriceRange(prev => ({ ...prev, min: val }));
                  }}
                  className="slider-thumb thumb-left"
                />
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={priceRange.max}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), priceRange.min + 10);
                    setPriceRange(prev => ({ ...prev, max: val }));
                  }}
                  className="slider-thumb thumb-right"
                />
              </div>
            </div>

            <div className="filter-group">
              <h3>Minimum Rating</h3>
              <div className="radio-list">
                <label className={`radio-label ${minRating === 0 ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === 0}
                    onChange={() => setMinRating(0)}
                  />
                  <span className="custom-radio"></span>
                  <span className="rating-text">Any Rating</span>
                  <span className="count-badge">
                    {meta?.totalCount || 0}
                  </span>
                </label>

                {[5, 4, 3, 2, 1].map((stars) => {
                  const ratingFacet = meta?.facets?.ratings?.find(r => r.rating === stars);
                  const isChecked = minRating === stars;
                  const isDisabled = (ratingFacet?.activeCount || 0) === 0 && !isChecked;
                  
                  return (
                    <label 
                      key={stars} 
                      className={`radio-label ${isChecked ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => setMinRating(stars)}
                      />
                      <span className="custom-radio"></span>
                      <div className="stars-row">
                        {renderStars(stars)}
                        <span className="and-up">& up</span>
                      </div>
                      <span className="count-badge">
                        {ratingFacet?.activeCount || 0}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>
        </aside>

        <section className="catalog-section">
          <div className="catalog-header">
            <div className="catalog-header-left">
              <div className="results-count">
                {loading ? (
                  <span>Filtering products...</span>
                ) : (
                  <span>Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}</span>
                )}
              </div>

              <div className="active-pills">
                {selectedCategories.map(cat => (
                  <span key={cat} className="pill" onClick={() => handleCategoryChange(cat)}>
                    {cat} &times;
                  </span>
                ))}
                {(priceRange.min > 0 || priceRange.max < 400) && (
                  <span className="pill" onClick={() => setPriceRange({ min: 0, max: 400 })}>
                    ${priceRange.min}-${priceRange.max} &times;
                  </span>
                )}
                {minRating > 0 && (
                  <span className="pill" onClick={() => setMinRating(0)}>
                    {minRating}★ & up &times;
                  </span>
                )}
              </div>
            </div>

            <div className="catalog-header-right">
              <label htmlFor="sort-select" className="sort-label">Sort By</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Top Rated First</option>
              </select>
            </div>
          </div>

          {loading && products.length === 0 ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Curating your collection...</p>
            </div>
          ) : error ? (
            <div className="error-screen">
              <div className="error-box">
                <h2>Server Sync Issue</h2>
                <p>{error}</p>
                <button className="primary-btn" onClick={() => window.location.reload()}>
                  Retry Connection
                </button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="no-results-screen">
              <div className="no-results-card">
                <div className="no-results-icon-bg">
                  <Inbox className="no-results-icon" size={32} />
                </div>
                <h3>No Items Match Your Criteria</h3>
                <p>Try widening your price range, clearing some category filters, or selecting a lower star rating limit.</p>
                <button className="primary-btn reset-cta-btn" onClick={handleResetFilters}>
                  <RotateCcw size={16} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="products-grid">
              {sortedProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="product-image"
                      loading="lazy" 
                    />
                    {!product.inStock && (
                      <div className="out-of-stock-badge">Out of Stock</div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <div className="product-meta">
                      <span className="product-brand">{product.brand}</span>
                      <div className="rating-pill">
                        <Star className="mini-star" size={12} fill="currentColor" />
                        <span>{product.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <h3 className="product-name" title={product.name}>
                      {product.name}
                    </h3>
                    
                    <p className="product-description">
                      {product.description}
                    </p>

                    <div className="product-card-footer">
                      <div className="product-price">
                        <span className="price-symbol">$</span>
                        <span className="price-value">{product.price.toFixed(2)}</span>
                      </div>
                      
                      <button 
                        className={`action-btn ${product.inStock ? 'buy-btn' : 'notify-btn'}`}
                        disabled={!product.inStock}
                      >
                        {product.inStock ? 'Add to Cart' : 'Restocking'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;
