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
            return await userModels.findById(id).lean()
             
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
            .select('first_name last_name role email documents cart last_connection')
            .lean()
            return allMessages
        } catch (error) {
            throw Error(error)
        }
    }

    async deleteInactiveUsers() {
        const deletedUsers = []
        const usersAll = await this.getAllUsers()
        usersAll.forEach(user => {
            const time_difference = Date.now() - Date.parse(user.last_connection)
            const hoursInactive = Math.round(time_difference / (1000 * 60 * 60))
            if (hoursInactive > 48){
                userModels.deleteOne({_id: user._id})
                .then((res) => {
                    if (res.deletedCount === 1){
                        deletedUsers.push( user )
                    }
                })
                .catch((error) => {
                    throw Error(error)
                })   
            }
        }) 
        return deletedUsers
    }

    async deleteUser(uid) {
        return userModels.deleteOne({_id: uid})
        .then((res) => {
            if (!res.acknowledged){
                throw Error("Cant delete this user")
            }
            return res
        })
        .catch((error) => {
            throw Error(error)
        })  
    }

}

export default UserManagerService