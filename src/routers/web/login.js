import { Router } from "express";
import ContenedorMongoDb from "../../contenedores/ContenedorMongoDb.js";

import bcrypt from 'bcrypt';
import passport from "passport";
import { Strategy } from "passport-local";
const LocalStrategy = Strategy;

const users = new ContenedorMongoDb;

const loginWebRouter = new Router();

/*----------- bcrypt -----------*/
async function generateHashPassword(password) {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
}

async function verifyPassword(user, password){
    const match = await bcrypt.compare(password, user.password);
    return match;
}

/*----------- passport -----------*/
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async function (email, password, done) {
        const usersDb = await users.listarAll();
        const userExist = usersDb.find(usr => usr.email == email);

        if (!userExist) {
            return done(null, false);
        } else {
            const match = await verifyPassword(userExist, password);

            if (!match){
                return done(null, false);
            }return done(null, userExist);
        }
    }
));

passport.serializeUser((usuario, done) => {
    done(null, usuario.email);
});

passport.deserializeUser(async (email, done) => {
    const usersDb = await users.listarAll();
    const user = usersDb.find(usr => usr.email == email);
    done(null, user);
});

/*----------- ROUTERS -----------*/
/*----- login -----*/
loginWebRouter.get("/", (req, res) => {
  res.redirect("login");
});

loginWebRouter.get("/login", (req, res) => {
  res.sendFile("login.html", { root: "public" });
});

loginWebRouter.post("/login", 
        passport.authenticate('local', { successRedirect: '/home', failureRedirect: '/login-error' }),
    );

loginWebRouter.get("/logout", (req, res) => {
  if (!req.session.passport?.user) {
    res.redirect("login");
  } else {
    res.render("logout.ejs", { nombre: req.session.passport?.user });
  }
});

loginWebRouter.get('/login-error', (req, res) => {
    res.sendFile("login-error.html", { root: "public" });
});

/*----- register -----*/
loginWebRouter.get('/register', (req, res) =>{
    res.sendFile("register.html", { root: "public" });
})

loginWebRouter.post('/register', async (req, res) =>{
    const { email, password } = req.body;
    const usersDb = await users.listarAll();
    const userExist = usersDb.find(usr => usr.email == email);

    if (userExist) {
        res.sendFile("register-error.html", { root: "public" });
    } else {
        const newUser = {email, password:await generateHashPassword(password)}
        await users.guardar(newUser);
        res.redirect('/login');
    }
})

export default loginWebRouter;