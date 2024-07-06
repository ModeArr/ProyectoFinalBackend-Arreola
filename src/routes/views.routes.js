import { Router } from "express";
import { authMdwFront, loggedRedirect } from "../middleware/auth.middleware.js";
import { userService, cartService, messagesService, productService } from "../repository/index.js";


const router = Router()

router.get('/', authMdwFront, async(req, res) => {
    const { page = 1, limit = 5, sort } = req.query;

    let query = {}

    if (req.query.status){
        query = { status: req.query.status 
        }
    }

    if (req.query.category){
        query = { category: req.query.category.charAt(0).toUpperCase()
            + req.query.category.slice(1) }
    }

    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);

    const cartTotal = await cartService.getCartTotalAmount(req.user)
    const quantityTotal = await cartService.getCartTotalProducts(req.user)
    productService.getProducts(page, limit, sort, query, url).then(result => {
        res.render("index", {
            title: "Proyecto Final CoderHouse",
            products: result.payload,
            nextPage: result.nextLink,
            prevPage: result.prevLink,
            user: req.user,
            total: cartTotal,
            quantityTotal: quantityTotal,
            style: "styles.css"
        })
    }).catch(err => {
        console.log(err);
        res.status(400).json(err.message);
    });
})

router.get('/realtimeproducts', authMdwFront, (req, res) => {
    const { page = 1, limit = 5, sort } = req.query;

    let query = {}

    if (req.query.status){
        query = { status: req.query.status 
        }
    }

    if (req.query.category){
        query = { category: req.query.category.charAt(0).toUpperCase()
            + req.query.category.slice(1) }
    }

    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);

    productService.getProducts(page, limit, sort, query, url).then(result => {
        res.render("realtimeproducts", {
            title: "Proyecto Final CoderHouse - Productos en tiempo real",
            products: result.payload,
            nextPage: result.nextLink,
            prevPage: result.prevLink,
            user: req.user
        })
    }).catch(err => {
        console.log(err);
        res.status(400).json(err.message);
    });
})

router.get('/chat', (req, res) => {

    messagesService.getAllMessages().then(result => {
        res.render("chat", {
            title: "Proyecto Final CoderHouse - Chat en tiempo real",
            messages: result
        })
    }).catch(err => {
        console.log(err);
        res.status(400).json(err.message);
    });
})

router.get('/products', authMdwFront, async(req, res) => {
    const { page = 1, limit = 5, sort } = req.query;

    let query = {}

    if (req.query.status){
        query = { status: req.query.status 
        }
    }

    if (req.query.category){
        query = { category: req.query.category.charAt(0).toUpperCase()
            + req.query.category.slice(1) }
    }

    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);

    const cartTotal = await cartService.getCartTotalAmount(req.user)
    const quantityTotal = await cartService.getCartTotalProducts(req.user)
    productService.getProducts(page, limit, sort, query, url).then(result => {
        res.render("products", {
            title: "Proyecto Final CoderHouse",
            products: result.payload,
            nextPage: result.nextLink,
            prevPage: result.prevLink,
            user: req.user,
            total: cartTotal,
            quantityTotal: quantityTotal,
            style: "styles.css"
        })
    }).catch(err => {
        console.log(err);
        res.status(400).json(err.message);
    });
})

router.get('/carts/:cid', authMdwFront, (req, res) => {
    const idCart = req.params.cid

    cartService.getCartProducts(idCart).then(result => {
        res.render("cart", {
            title: "Proyecto Final CoderHouse - Carrito de Compras",
            product: result
        })
    }).catch(err => {
        console.log(err);
        res.status(400).json(err.message);
    });
})

router.get('/cart', authMdwFront, async(req, res) => {
    const idCart = req.user.cart
    const cartTotal = await cartService.getCartTotalAmount(req.user)
    const quantityTotal = await cartService.getCartTotalProducts(req.user)
    cartService.getCartProducts(idCart).then(result => {
        res.render("cart", {
            title: "Proyecto Final CoderHouse - Carrito de Compras",
            product: result,
            idCart: idCart,
            total: cartTotal,
            quantityTotal: quantityTotal
        })
    }).catch(err => {
        console.log(err);
        res.status(400).json(err.message);
    });
})

router.get('/login', loggedRedirect, (req, res) => {
        res.render("login", {
            title: "Proyecto Final CoderHouse - Login"
        })
})

router.get('/register', loggedRedirect, (req, res) => {
    res.render("register", {
        title: "Proyecto Final CoderHouse - Register"
    })
})

router.get('/forgotpassword', loggedRedirect, (req, res) => {
    res.render("forgotpassword", {
        title: "Olvide contrasena - Proyecto Final CoderHouse"
    })
})

router.get('/updatepassword/:token', loggedRedirect, (req, res) => {
    const token = req.params.token
    res.render("updatepassword", {
        title: "Actualizar contrasena - Proyecto Final CoderHouse",
        token: token
    })
})

router.get('/perfil', authMdwFront, async(req, res) => {
    const cartTotal = await cartService.getCartTotalAmount(req.user)
    const quantityTotal = await cartService.getCartTotalProducts(req.user)
    res.render("profile", {
        title: "Proyecto Final CoderHouse",
        user: req.user,
        total: cartTotal,
        quantityTotal: quantityTotal,
        style: "styles.css"
    })
})

router.get('/admin-panel', authMdwFront, async(req, res) => {
    const usersAll = await userService.getAllUsers()
    const cartTotal = await cartService.getCartTotalAmount(req.user)
    const quantityTotal = await cartService.getCartTotalProducts(req.user)

    usersAll.forEach(user => {
        const time_difference = Date.now() - Date.parse(user.last_connection)
        const result = Math.round(time_difference / (1000 * 60 * 60))
        user.hoursInactive = result  
    });
    console.log(usersAll)
    res.render("adminpanel", {
        title: "Admin Panel - Proyecto Final CoderHouse",
        users: usersAll,
        total: cartTotal,
        quantityTotal: quantityTotal,
        style: "styles.css"
    })
})

export default router