const express = require("express");
const mongoose = require("mongoose");
const database= require("./config/database")
const routes=require('./routes/indexRouter')
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// async function fixSlugIndex() {
//   await mongoose.connect('mongodb://0.0.0.0:27017/product_db');
//   const db = mongoose.connection.db;
  
//   try {
//     // Xóa index slug_1
//     await db.collection('products').dropIndex('slug_1');
//     console.log('✅ Đã xóa index slug_1');
//   } catch (error) {
//     console.log('ℹ️ Index slug_1 không tồn tại hoặc đã bị xóa');
//   }
  
//   mongoose.disconnect();
// }

// fixSlugIndex();

database.connect();

routes(app)

app.listen(5000, () => console.log("Server running on port 5000"));
