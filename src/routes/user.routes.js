import { Router } from "express";
import passport from "passport";
import { authMdw } from "../middleware/auth.middleware.js"
import { uploadDocuments } from "../middleware/multer.middleware.js"
import { logoutUserCtrl, 
          loginUserCookieCtrl, 
          currentUserCtrl, 
          forgotPasswordCtrl, 
          updatePasswordCtrl, 
          togglePremiumCtrl,  
          uploadDocumentsCtrl,
          getAllUsersCtrl,
          deleteInactiveUsersCtrl,
          deleteUserCtrl } from "../controllers/users.controller.js";

const router = Router();

router.get("/logout", logoutUserCtrl)

router.post("/login", passport.authenticate('login', {
  failureRedirect: '/login',
  session: false,
}), loginUserCookieCtrl);

router.post("/register", passport.authenticate('register', {
  successRedirect: '/login',
  failureRedirect: '/register',
  session: false,
}));

router.get(
  "/github",
  passport.authenticate("github", { 
    scope: ["user:email"]})
);

router.get(
  "/github/callback",
  passport.authenticate("github", { 
    successRedirect: '/',
    failureRedirect: "/login",
    session: false,
}), loginUserCookieCtrl);

router.get("/current", passport.authenticate("jwt", { session: false }), currentUserCtrl)

router.post("/resetpassword", forgotPasswordCtrl)

router.post("/updatepassword/:token", updatePasswordCtrl)

router.post("/premium/:uid", authMdw(['ADMIN']), togglePremiumCtrl)

router.post("/:uid/documents", authMdw(['USER','ADMIN','PREMIUM']), uploadDocuments, uploadDocumentsCtrl)

router.get("/", authMdw(['ADMIN']), getAllUsersCtrl)

router.delete("/inactive", authMdw(['ADMIN']), deleteInactiveUsersCtrl)

router.delete("/:uid", authMdw(['ADMIN']), deleteUserCtrl)

export default router;