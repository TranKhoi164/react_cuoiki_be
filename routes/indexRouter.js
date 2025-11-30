const productrouter = require("./productRoutes")
const accountRouter = require("./accountRoutes")
const orderRouter = require('./orderRoutes')

function routes(app) {
    app.use('/products', productrouter);
    app.use('/accounts', accountRouter);
    app.use('/order', orderRouter)
}

module.exports = routes

