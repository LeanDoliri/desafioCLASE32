import mensajesApi from "../../api/mensajes.js";
import { normalizarMensajes } from "../../normalizr/mensajes.js";

import express from "express";
import { Server as HttpServer } from "http";
import { Server as Socket } from "socket.io";

const app = express();
const httpServer = new HttpServer(app);
const io = new Socket(httpServer)

async function listarMensajes() {
  const archivoMensajes = await mensajesApi.listarAll();
  const normalizados = normalizarMensajes(archivoMensajes);
  return normalizados;
}

export default async function configurarSocket(socket) {
  // ---- MENSAJES ----
  // carga inicial de productos
  const messages = await listarMensajes();
  socket.emit("messages", messages);

  // actualizacion de mensajes
  socket.on("newMessage", async (data) => {
    mensajesApi.guardar(data);
    await listarMensajes().then((res) => {
      io.sockets.emit("mensajes", res);
    });
  });
}
