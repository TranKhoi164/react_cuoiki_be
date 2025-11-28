const productrouter=require("./productRoutes")
const accountRouter=require("./accountRoutes")

function routes(app){
    app.use('/products', productrouter);
    app.use('/accounts', accountRouter);
}

module.exports=routes

