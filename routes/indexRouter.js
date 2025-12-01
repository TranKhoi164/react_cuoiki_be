const productrouter=require("./productRoutes")
const accountRouter=require("./accountRoutes")
const inventoryRouter=require("./inventoryRoutes")
const importOrderRouter = require("./importOrderRoutes");

function routes(app){
    app.use('/products', productrouter);
    app.use('/accounts', accountRouter);
    app.use('/inventory', inventoryRouter);
    app.use('/import-orders', importOrderRouter); 
}

module.exports=routes