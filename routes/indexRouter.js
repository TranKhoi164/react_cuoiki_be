const productrouter=require("./productRoutes")

function routes(app){
    app.use('/products', productrouter);
}

module.exports=routes

