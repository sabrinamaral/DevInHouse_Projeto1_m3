const createProduct = (category_id, name, price) => ({
  category_id,
  name,
  suggested_price: price,
  created_at: new Date(),
  updated_at: new Date(),
});

module.exports = {
  Product1: createProduct(1, "Smartphone A21s", 2500),
  Product2: createProduct(1, "Notebook Dell", 3500),
  Product3: createProduct(1, "Mackbook Pro", 7500),
  Product4: createProduct(1, "Pc Gamer", 5500),
  Product5: createProduct(1, "Monitor Ultrawide Curvo", 1700),
  Product6: createProduct(1, "Teclado Husky Gaming Blizzard", 229),
  Product7: createProduct(1, "Mouse Gamer Redragon Cobra", 114.9),
  Product8: createProduct(1, "Playstation 5", 5900),
  Product9: createProduct(
    1,
    "Impressora Multifuncional HP Ink Advantage",
    499.9
  ),
  Product10: createProduct(2, "Smart TV Samsung 75´ 8K Neo", 21999),
};
