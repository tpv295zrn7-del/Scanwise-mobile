export const fetchProductByBarcode = async (barcode) => {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
  );
  const data = await response.json();
  if (data.status === 1) {
    return {
      name: data.product.product_name || 'Unknown product',
      brand: data.product.brands || 'Unknown brand',
      image: data.product.image_url || null,
      categories: data.product.categories || '',
      ingredients: data.product.ingredients_text || '',
      nutriscore: data.product.nutriscore_grade || null,
    };
  }
  return null;
};
