import { products } from './data/products.js';
import { filterProducts } from './utils/filterEngine.js';

console.log("=== Running Core Filtering Engine Tests ===\n");

function assertEquals(actual, expected, testName) {
  if (actual === expected) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName} - Expected: ${expected}, Got: ${actual}`);
    process.exit(1);
  }
}


const test1 = filterProducts(products, {});
assertEquals(test1.length, 20, "Test 1: Empty criteria returns all 20 products");


const test2 = filterProducts(products, null);
assertEquals(test2.length, 20, "Test 2: Null criteria returns all 20 products");


const test3 = filterProducts(products, { categories: ['Electronics'] });
const allElectronics = test3.every(p => p.category === 'Electronics');
assertEquals(allElectronics, true, "Test 3a: All returned products are in 'Electronics'");
assertEquals(test3.length, 4, "Test 3b: Found exactly 4 electronic products");


const test4 = filterProducts(products, { categories: ['Electronics', 'Books'] });
const allElectronicsOrBooks = test4.every(p => p.category === 'Electronics' || p.category === 'Books');
assertEquals(allElectronicsOrBooks, true, "Test 4a: All returned products are 'Electronics' or 'Books'");
assertEquals(test4.length, 7, "Test 4b: Found exactly 7 products (4 electronics + 3 books)");


const test5 = filterProducts(products, { minPrice: 50, maxPrice: 150 });
const inPriceRange = test5.every(p => p.price >= 50 && p.price <= 150);
assertEquals(inPriceRange, true, "Test 5a: All products are between $50 and $150");
assertEquals(test5.length, 5, "Test 5b: Found exactly 5 products in price range [50, 150]");


const test6 = filterProducts(products, { minRating: 4.5 });
const meetsRating = test6.every(p => p.rating >= 4.5);
assertEquals(meetsRating, true, "Test 6a: All products rating >= 4.5");
assertEquals(test6.length, 8, "Test 6b: Found exactly 8 products with rating >= 4.5");


const test7 = filterProducts(products, {
  categories: ['Electronics', 'Home & Living'],
  minPrice: 100,
  maxPrice: 300,
  minRating: 4.4
});






assertEquals(test7.length, 4, "Test 7: Combinatorial filter matches exactly 4 products");


const test8 = filterProducts(products, {
  minPrice: 1000
});
assertEquals(test8.length, 0, "Test 8: Extreme min price filter returns 0 products");

console.log("\n=== All Tests Passed Successfully! ===");
