import express from "express";
import { Server as HttpServer } from "http";
import { Server as Socket } from "socket.io";

import productosApi from "../../api/productos.js";
import addRandomProducts from "../../mocks/fakerProducts.js";

const app = express();
const httpServer = new HttpServer(app);
const io = new Socket(httpServer);

async function addProductsFaker() {
  for (let i = 0; i < 5; i++) {
    await productosApi.guardar(addRandomProducts());
  }
  const productos = await productosApi.listarAll();
  socket.emit("productos", productos);
}

export default async function configurarSocket(socket) {
  // ---- PRODUCTOS ----
  // carga inicial de productos
  const productos = await productosApi.listarAll();
  if (productos.length == 0) {
    await addProductsFaker();
  } else {
    socket.emit("productos", productos);
  }

  // actualizacion de productos
  socket.on("newProduct", async (data) => {
    productosApi.guardar(data);
    const productos = await productosApi.listarAll();
    io.sockets.emit("productos", productos);
  });
}
