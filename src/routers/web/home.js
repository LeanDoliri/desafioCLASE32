import { Router } from "express";

const productosWebRouter = new Router();

productosWebRouter.get("/home", async (req, res) => {
  if(!req.session.passport?.user){
    res.redirect("login");
  } else{
    res.render("home", { nombre: req.session.passport?.user });
  }
});

export default productosWebRouter;