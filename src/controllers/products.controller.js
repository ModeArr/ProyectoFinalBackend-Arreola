import { productService } from "../repository/index.js";
import { userService } from "../repository/index.js";
import { transporter } from "../utils/email.js"

const getProductsCtrl = async(req, res) => {
    const { page = 1, limit = 5, sort } = req.query;

    let query = {}

    if (req.query.status){
        query = { status: req.query.status }
    }

    if (req.query.category){//convierte la primera letra en mayuscula
        query = { category: req.query.category.charAt(0).toUpperCase()
            + req.query.category.slice(1) }
    }

    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);

    productService.getProducts(page, limit, sort, query, url).then(result => {

        res.status(200).json({status: "success", ...result});
        
    }).catch(err => {
        console.log(err);
        res.status(400).json({status: "error", message: err.message});
    });
}

const getProductsByIdCtrl = async(req, res) => {
    const id = req.params.pid
    productService.getProductById(id).then(result => {
        return res.status(200).json(...result);
    }).catch(err => {
        res.status(400).json(err.message)
    })
}

const addProductCtrl = async(req, res) => {
    const newProduct = req.body
    const io = req.app.get('io')
    newProduct.owner = req.user._id

    productService.addProduct(newProduct)
        .then(result => {
            io.emit('product created', result);
            return res.status(200).json({status: "success", product: result._doc});
        }).catch(err => {
            res.status(400).json({status: "error", message: err.message})
        });
}

const updateProductCtrl = async(req, res) => {
    const editData = req.body
    const id = req.params.pid

    productService.updateProduct(id, editData.field, editData.edit)
        .then(result => {
            return res.status(200).json({status: "success", product: result});
        }).catch(err => {
            res.status(400).json({status: "error", message: err.message})
        });
}

const deleteProductCtrl = async(req, res) => {
    const id = req.params.pid
    const io = req.app.get('io')
    const product = await productService.getProductById(id)
    const owner = await userService.checkUserID(product[0].owner)

    if (owner.role === "PREMIUM"){ //send email if product have owner

        const data = {
            to: owner.email,
            subject: 'A product you created have been deleted',
            html: `
            <h3>Hola, lamentamos informarte que uno de tus productos fue borrado por una administrador</h3>
            <p>Puedes comunicarta al correo webmaster@tienda.com si es que esto fue un erro."</p>
            `,
          }

        productService.deleteProduct(id)
          .then(result => {
              io.emit('product deleted', id)
              transporter.sendMail(data, function(error, body) {
                  if (error) {
                    return res.status(400).json({error: error.message})
                  }
                  return res.status(200).json({status: "success", result})
                })
          }).catch(err => {
              res.status(400).json({status: "error", message: err.message})
          })
    }

    productService.deleteProduct(id)
        .then(result => {
            io.emit('product deleted', id)
            return res.status(200).json({status: "success", result})
        }).catch(err => {
            res.status(400).json({status: "error", message: err.message})
        })
}


export {
    getProductsCtrl,
    getProductsByIdCtrl,
    updateProductCtrl,
    deleteProductCtrl,
    addProductCtrl
}