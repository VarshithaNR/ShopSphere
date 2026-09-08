import { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";
import ProductCard from "../components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      product.category === category;

    const matchesPrice =
      priceRange === "All" ||
      (priceRange === "under1000" && product.price < 1000) ||
      (priceRange === "1000to5000" &&
        product.price >= 1000 &&
        product.price <= 5000) ||
      (priceRange === "above5000" && product.price > 5000);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPrice
    );
  });

  const sortedProducts = [...filteredProducts].sort(
    (a, b) => {
      if (sortBy === "priceLowToHigh") {
        return a.price - b.price;
      }

      if (sortBy === "priceHighToLow") {
        return b.price - a.price;
      }

      if (sortBy === "ratingHighToLow") {
        return b.rating - a.rating;
      }

      return 0;
    }
  );

  return (
    <div
      style={{
        padding: "30px",
      }}
    >
      <h1>ShopSphere Products</h1>

      <div
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "center",
          margin: "20px 0",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "12px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          <option value="All">All Prices</option>
          <option value="under1000">Under ₹1000</option>
          <option value="1000to5000">
            ₹1000 - ₹5000
          </option>
          <option value="above5000">Above ₹5000</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          <option value="default">Sort By</option>
          <option value="priceLowToHigh">
            Price: Low to High
          </option>
          <option value="priceHighToLow">
            Price: High to Low
          </option>
          <option value="ratingHighToLow">
            Rating: High to Low
          </option>
        </select>
      </div>

      {sortedProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {sortedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;