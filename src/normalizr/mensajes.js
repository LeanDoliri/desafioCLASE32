import { normalize, schema } from "normalizr";

//--------------------------------------------
// NORMALIZACIÓN DE MENSAJES

// Definimos un esquema de autor
const authorSchema = new schema.Entity("authors", {}, { idAttribute: "mail" });

// Definimos un esquema de mensaje
const textSchema = new schema.Entity("text");

// Definimos un esquema de posts
const mensajeSchema = new schema.Entity("messages", {
  author: authorSchema,
  text: [textSchema],
});

const normalizarMensajes = (mensajesConId) =>
  normalize(mensajesConId, [mensajeSchema]);

export { normalizarMensajes };
