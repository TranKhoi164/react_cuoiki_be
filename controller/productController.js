const Product=require("../models/Product")

async function getproduct(req, res) {
  const products = await Product.find();
  res.json(products);
}

// GET: lấy sản phẩm theo ID
async function getProductbyid(req, res) {
  const product = await Product.findById(req.params.id);
  res.json(product);
}

// POST: tạo sản phẩm
async function addProduct(req, res) {
  const product = await Product.create(req.body);
  res.json({ message: "Created", product });
}

// PUT: cập nhật sản phẩm
async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json({ message: "Updated", product });
}

// DELETE: xóa sản phẩm
async function deleteProduct(req, res) {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
}

module.exports={
    getproduct,
    getProductbyid,
    addProduct,
    updateProduct,
    deleteProduct
}