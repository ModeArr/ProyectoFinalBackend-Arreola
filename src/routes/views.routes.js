import { Router } from "express";
import DBProductManager from "../dao/mongo/product.service.js";
const products = new DBProductManager()
import DBMessagesManager from "../dao/mongo/messages.service.js";
const messages = new DBMessagesManager()
import DBCartManager from "../dao/mongo/cart.service.js";
const cart = new DBCartManager()
import { authMdwFront, loggedRedirect } from "../middleware/auth.middleware.js";
import { userService } from "../repository/index.js";


const router = Router()

router.get('/', authMdwFront, (req, res) => {
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

    products.getProducts(page, limit, sort, query, url).then(result => {
        res.render("index", {
            title: "Proyecto Final CoderHouse",
            products: result.payload,
            nextPage: result.nextLink,
            prevPage: result.prevLink,
            user: req.user,
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

    products.getProducts(page, limit, sort, query, url).then(result => {
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

    messages.getAllMessages().then(result => {
        res.render("chat", {
            title: "Proyecto Final CoderHouse - Chat en tiempo real",
            messages: result
        })
    }).catch(err => {
        console.log(err);
        res.status(400).json(err.message);
    });
})

router.get('/products', authMdwFront, (req, res) => {
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

    products.getProducts(page, limit, sort, query, url).then(result => {
        res.render("products", {
            title: "Proyecto Final CoderHouse",
            products: result.payload,
            nextPage: result.nextLink,
            prevPage: result.prevLink,
            user: req.user,
            style: "styles.css"
        })
    }).catch(err => {
        console.log(err);
        res.status(400).json(err.message);
    });
})

router.get('/carts/:cid', authMdwFront, (req, res) => {
    const idCart = req.params.cid

    cart.getCartProducts(idCart).then(result => {
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
    const cartTotal = await cart.getCartTotalAmount(req.user)

    cart.getCartProducts(idCart).then(result => {
        res.render("cart", {
            title: "Proyecto Final CoderHouse - Carrito de Compras",
            product: result,
            total: cartTotal,
            idCart: idCart
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
    res.render("profile", {
        title: "Proyecto Final CoderHouse",
        user: req.user,
        style: "styles.css"
    })
})

router.get('/admin-panel', authMdwFront, async(req, res) => {
    const usersAll = await userService.getAllUsers()
    res.render("adminpanel", {
        title: "Admin Panel - Proyecto Final CoderHouse",
        users: usersAll,
        style: "styles.css"
    })
})

export default router