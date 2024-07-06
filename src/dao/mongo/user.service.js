import userModels from '../../models/user.models.js';
import { isValidPasswd, createHash } from "../../utils/encrypt.js";
import CartServiceManager from "./cart.service.js";
const cartService = new CartServiceManager()

class UserManagerService {

    async checkUserAndPass(email, password) {
        try {
            const findUser = await userModels.findOne({ email }).lean()

            if (!findUser) throw Error("Usuario no registrado")

            if (!isValidPasswd(password, findUser.password)) throw Error("Contrasena incorrecta")
            
            delete findUser.password

            return findUser

        } catch (error) {
            throw Error(error)
        }  
    }

    async addUser(first_name, last_name, email, age, password) {
        try {   
            if (!first_name.trim()){
                throw new Error('Ingresa un Nombre correcto')
            }
    
            if (!last_name.trim()){
                throw new Error('Ingresa un Apellido correcto')
            }
    
            if (!email.trim()){
                throw new Error('Ingresa un email')
            }
            
            if (!password.trim()) {
                throw new Error('Ingresa una contrasena')
            }

            if (age <= 0  || typeof age != 'number') {
                throw new Error('Ingresa una edad correcta')
            }

            const pswHashed = await createHash(password)
    
            const user = {
                first_name,
                last_name,
                email,
                password: pswHashed,
                age,
                cart: await cartService.addCart()
            }

            let result = await userModels.create(user).then((res) => {
                return res
            }).catch((err) => {
                throw new Error(err)
            })
            return result
        } catch (error) {
            throw Error(error)
        }
    }

    async checkUserID(id) {
        try {
            const findUser = await userModels.findById(id).lean()
            return findUser

        } catch (error) {
            throw Error(error)
        }  
    }

    async checkUser(email) {
        try {
            const findUser = await userModels.findOne({ email }).lean()

            return findUser

        } catch (error) {
            throw Error(error)
        }  
    }

    async changeUserPassword(token, newPass){
        try {
            const newHashedPass = await createHash(newPass)

            return await userModels.findOneAndUpdate({resetLink: token}, {password: newHashedPass})
            .then((res) => {
                return res
            })
            .catch((err) => {
                throw new Error(err)
            })
        } catch (error) {
            throw Error(error)
        }
    }

    async setResetLink(uid, token) {
        try {
            return await userModels.findByIdAndUpdate(uid, {resetLink: token})
            .then((res) => {
                return res
            })
            .catch((err) => {
                throw new Error(err)
            })

        } catch (error) {
            throw Error(error) 
        }
    }

    async checkResetLink(token){
        try {
            return userModels.findOne({ resetLink: token }).lean()
        } catch (error) {
            throw Error(error) 
        }
    }

    async checkUserEmail(email) {
        try {

            return await userModels.findOne({ email }).lean()

        } catch (error) {
            throw Error(error)
        }  
    }

    async togglePremium(uid) {
        try {
            return userModels.findByIdAndUpdate(uid, [{
                $set: {
                    role: {
                      $switch: {
                        branches: [
                          {
                            case: { $eq: ["$role", "USER"] },
                            then: "PREMIUM"
                          },
                          {
                            case: { $eq: ["$role", "PREMIUM"] },
                            then: "USER"
                          },
                          {
                            case: { $eq: ["$role", "ADMIN"] },
                            then: "ADMIN"
                          }
                        ]
                      }
                    }
                  }
            }], {new: true}).lean()
        } catch (error) {
            throw Error(error)
        }
    }

    async setLastConnection(uid) {
        try {
            return await userModels.findByIdAndUpdate(uid, {last_connection: Date.now()}, {returnDocument: 'after'})
            .then((res) => {
                return res
            })
            .catch((err) => {
                throw new Error(err)
            })

        } catch (error) {
            throw Error(error) 
        }
    }

    async getDocument(uid, type){
        try {
            return await userModels.find({"_id": uid, 
                "documents":{ 
                $elemMatch: {
                    "name": type
                  }}}).lean()
            
        } catch (error) {
            throw Error(error)
        }
    }

    async setDocument(uid, type, path){
        try {
            const docExist = await this.getDocument(uid, type)
            const document = { "name": type , "reference": path }
            if (docExist.length === 0){
                const documentAdd = await userModels.findOneAndUpdate({ _id: uid}, { $push: 
                    { "documents": document }
                }, {returnDocument: 'after'})
                .then((res) => {
                    return res.documents
                })
                .catch((error) => {
                    throw Error(error)
                })
                return documentAdd
            } else {
                const documentReplace = await userModels.findOneAndUpdate({_id: uid, 'documents.name': type }, {$set : {
                    'documents.$.reference': path
                }}, {returnDocument: 'after'})
                .then((res) => {
                    return res.documents
                })
                .catch((error) => {
                    throw Error(error)
                })
                return documentReplace
            }
        } catch (error) {
            throw Error(error)
        }
    }

    async getAllUsers() {
        try {
            const allMessages = await userModels.find({})
            .select('first_name last_name role email documents cart')
            .lean()
            return allMessages
        } catch (error) {
            throw Error(error)
        }
    }

    async deleteInactiveUsers() {
        const deletedUsers = await userModels.deleteMany()
    }

}

export default UserManagerService