import express from "express";
import compression from "compression";
import session from "express-session";
import { Server as HttpServer } from "http";
import { Server as Socket } from "socket.io";

import MongoStore from "connect-mongo";

import config from "./config.js";

import mensajesWs from "./routers/ws/mensajes.js";
import productosWs from "./routers/ws/productos.js";

import productosWebRouter from "./routers/web/home.js";
import loginWebRouter from "./routers/web/login.js";

import { fork } from "child_process";

import cluster from "cluster";
import os from "os";
const CPU_CORES = os.cpus().length;

import { logInfo, logWarn } from "./logs/winston.js";
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
  // console.log("Nuevo cliente conectado!");

  mensajesWs(socket);
  productosWs(socket);
});

//--------------------------------------------
// configuro el servidor

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

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
app.use((req, res, next) => {
  logInfo(`${req.method} ${req.originalUrl}`);
  next();
})

app.use(productosWebRouter);
app.use(loginWebRouter);

app.get("/info", (req, res) => {
  const datos = {
    "Argumentos de entrada": process.argv.slice(2).join(", "),
    "Nombre de la plataforma (sistema operativo)": process.platform,
    "Versión de node.js": process.version,
    "Memoria total reservada (rss)": parseInt(
      process.memoryUsage().rss / 1024 / 1024
    ),
    "Path de ejecución": process.execPath,
    "Process id": process.pid,
    "Carpeta del proyecto": process.cwd(),
    "Número de Procesadores": CPU_CORES,
  };
  // console.log(datos);
  res.send(datos);
});

const forked = fork("./src/randomNumbers.js");

// app.get("/api/randoms", async (req, res) => {
//   const { cant = 1000000000 } = req.query;
//   io.on("connection", async (socket) => {
//     // console.log("Nuevo cliente conectado!");
//     forked.send(cant);
//     forked.on("message", (result) => {
//       socket.emit("randomNumbers", result);
//     });
//   });
//   res.render("randoms");
// });

app.use((req, res, next) => {
  logWarn(`${req.method} ${req.url} - ruta inexistente!`);
  next();
});

//--------------------------------------------
// inicio el servidor

const forkMode = config.mode !== "cluster";

if (forkMode) {
  const connectedServer = httpServer.listen(config.PORT, () => {
    console.log(
      `Servidor express escuchando en el puerto: ${config.PORT} - PID Worker: ${process.pid}`
    );
  });
  connectedServer.on("error", (error) =>
    console.log(`Error en servidor ${error}`)
  );
} else {
  if (config.mode == "cluster" && cluster.isPrimary) {
    console.log("Cant de cores:", CPU_CORES);

    for (let i = 0; i < CPU_CORES; i++) {
      cluster.fork();
    }

    cluster.on("online", (worker) => {
      console.log(`Worker ${worker.process.pid} is online`);
    });

    cluster.on("exit", (worker) => {
      console.log(`Worker ${process.pid} ${worker.id} ${worker.pid} finalizo ${new Date().toLocaleString()}`);
      cluster.fork();
    });
  } else {
    const connectedServer = httpServer.listen(config.PORT, () => {
      console.log(
        `Servidor express escuchando en el puerto: ${config.PORT} - PID Worker: ${process.pid}`
      );
    });
    connectedServer.on("error", (error) =>
      console.log(`Error en servidor ${error}`)
    );
  }
}
