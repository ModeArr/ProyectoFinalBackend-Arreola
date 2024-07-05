import multer from "multer"
import uuidv4 from "uuid4"
import path from "path"
import fs from "fs"


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => { 
        const pathDocuments = `./uploads/${req.user._id}`
        const pathProfileImages = `/public/images/profile/${req.user._id}`
        const pathProductsImages = `/public/images/products/`
        // por alguna razon switch no sirve con multer 4 horas perdidas
        if (file.fieldname === "identification" || file.fieldname === "proofAdress" || file.fieldname === "bankProof") {
            fs.mkdirSync(pathDocuments, { recursive: true });
            cb(null, pathDocuments);
        } else if (file.fieldname === "profileImage") {
            fs.mkdirSync(pathProfileImages, { recursive: true });
            cb(null, pathProfileImages);
        } else if (file.fieldname === "productImage") {
            fs.mkdirSync(pathProductsImages, { recursive: true });
            cb(null, pathProductsImages);
        } else {
            cb(null, './uploads/nouser');
        }
    },
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}-${uuidv4()}${path.extname(file.originalname)}`)
    }
  } );
  
  function fileMimeFilter (req, file, cb) {
    if (file.fieldname === "identification" || 
        file.fieldname === "proofAdress" || 
        file.fieldname === "bankProof") {
      if ( file.mimetype === 'application/pdf' ) {
        cb(null, true)
      } else {
        cb(new Error("No supported format"), flase)
      }
    } else {
      if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
      ) {
        cb(null, true)
      } else {
        cb(new Error("No supported format"),)
      }
    }
  }

  const uploadDocuments = multer(
    {
      storage: fileStorage,
      limits: {
        fileSize: 2 * 1024 * 1024
      },
      fileFilter: (req, file, cb) => {
        fileMimeFilter(req, file, cb)
    }
      
    }
  ).fields(
    [
      {
        name: 'identification',
        maxCount: 1
      },
      {
        name: 'proofAdress',
        maxCount: 1
      },
      {
        name: 'bankProof',
        maxCount: 1
      }
    ]
  )

  export {
    uploadDocuments
  }