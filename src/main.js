import express from "express";
import session from "express-session";
import { Server as HttpServer } from "http";
import { Server as Socket } from "socket.io";

import MongoStore from "connect-mongo";

import config from "./config.js";

import mensajesWs from "./routers/ws/mensajes.js";
import productosWs from "./routers/ws/productos.js";

import productosWebRouter from "./routers/web/home.js";
import loginWebRouter from "./routers/web/login.js";

import { fork } from 'child_process';

//--------------------------------------------
// instancio servidor, socket y api

const app = express();
const httpServer = new HttpServer(app);
const io = new Socket(httpServer);

app.use(express.static("public"));

/*----------- Motor de plantillas -----------*/
app.set("view engine", "ejs");

//--------------------------------------------
// configuro el socket

io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado!");

  mensajesWs(socket);
  productosWs(socket);
});

//--------------------------------------------
// configuro el servidor

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: config.mongoRemote.cnxStr,
      mongoOptions: config.mongoRemote.options,
    }),
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000,
    },
  })
);

//--------------------------------------------
// rutas
app.use(productosWebRouter);
app.use(loginWebRouter);

app.get("/info", (req, res) => {
  const datos = {
    "Argumentos de entrada": process.argv.slice(2).join(", "),
    "Nombre de la plataforma (sistema operativo)": process.platform,
    "Versión de node.js": process.version,
    "Memoria total reservada (rss)": parseInt(process.memoryUsage().rss / 1024 / 1024),
    "Path de ejecución": process.execPath,
    "Process id": process.pid,
    "Carpeta del proyecto": process.cwd(),
  };
  res.send(datos);
});

const forked = fork('./src/randomNumbers.js');

app.get("/api/randoms", async(req, res)=>{
  const { cant = 100000000 } = req.query;
  io.on('connection', async (socket)=>{
    console.log("Nuevo cliente conectado!");
    forked.send(cant);
    forked.on('message', result => {
      socket.emit("randomNumbers", result) 
    });
  });
  res.render("randoms");
});

//--------------------------------------------
// inicio el servidor

const connectedServer = httpServer.listen(config.PORT, () => {
  console.log(
    `Servidor http escuchando en el puerto ${connectedServer.address().port}`
  );
});
connectedServer.on("error", (error) =>
  console.log(`Error en servidor ${error}`)
);