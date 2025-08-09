






// Create products with no variants
export const createProduct = async(req, res) => {

}

export const updateProduct = async(req, res) => {

}

export const deleteProduct = async(req, res) => {

}

// Add variants to existing product
export const addVariant = async(req, res) => {   
// In controller/service, manually check before adding:
// if (product.variants.some(v => v.color === newColor && v.size === newSize)) throw Error("Variant already exists");
// duplicate check logic
//  validate that if hasVariants is false, then price and quantity on the product itself are required
}

export const updateVariant = async(req, res) => {

}

export const deleteVariant = async(req, res) => {

}




