const socket = io();

function makeNumbers(result) {
  const html = result
    .map((number) => {
      return `<span style="color:brown;">${number}</span>`;
    })
  return html;
}

//------------------------------------------------------------------------------------

const formAgregarProducto = document.getElementById("formAgregarProducto");
formAgregarProducto.addEventListener("submit", (e) => {
  e.preventDefault();
  const titleValue = document.querySelector("input[name=title]").value;
  const priceValue = document.querySelector("input[name=price]").value;
  const thumbnailValue = document.querySelector("input[name=thumbnail]").value;
  const newProduct = {
    title: titleValue,
    price: priceValue,
    thumbnail: thumbnailValue,
  };
  socket.emit("newProduct", newProduct);
  formAgregarProducto.reset();
});

socket.on("productos", (productos) => {
  makeHtmlTable(productos).then((html) => {
    document.getElementById("productos").innerHTML = html;
  });
});

function makeHtmlTable(productos) {
  return fetch("plantillas/tabla-productos.hbs")
    .then((respuesta) => respuesta.text())
    .then((plantilla) => {
      const template = Handlebars.compile(plantilla);
      const html = template({ productos });
      return html;
    });
}

//-------------------------------------------------------------------------------------

// MENSAJES

/* --------------------- DESNORMALIZACIÓN DE MENSAJES ---------------------------- */
// Definimos un esquema de autor
const authorSchema = new normalizr.schema.Entity(
  "authors",
  {},
  { idAttribute: "mail" }
);

// Definimos un esquema de mensaje
const textSchema = new normalizr.schema.Entity("text");

// Definimos un esquema de posts
const mensajeSchema = new normalizr.schema.Entity("messages", {
  author: authorSchema,
  text: [textSchema],
});

/* ----------------------------------------------------------------------------- */

const inputEmail = document.getElementById("authorId");
const inputName = document.getElementById("authorName");
const inputLastName = document.getElementById("authorLastName");
const inputAge = document.getElementById("authorAge");
const inputUsername = document.getElementById("authorUsername");
const inputAvatar = document.getElementById("authorAvatar");
const inputMensaje = document.getElementById("inputMensaje");
const btnEnviar = document.getElementById("btnEnviar");

const formPublicarMensaje = document.getElementById("formPublicarMensaje");
formPublicarMensaje.addEventListener("submit", (e) => {
  e.preventDefault();
  const emailValue = inputEmail.value;
  const nameValue = inputName.value;
  const lastNameValue = inputLastName.value;
  const ageValue = inputAge.value;
  const inputUsernameValue = inputUsername.value;
  const avatarValue = inputAvatar.value;
  const date = new Date().toLocaleDateString("es-ES");
  const time = new Date().toLocaleTimeString();
  const textValue = inputMensaje.value;
  const newMessage = {
    author: {
      mail: emailValue,
      name: nameValue,
      lastName: lastNameValue,
      age: ageValue,
      username: inputUsernameValue,
      avatar: avatarValue,
    },
    text: textValue,
    date: date + " " + time,
  };
  socket.emit("newMessage", newMessage);
  formPublicarMensaje.reset();
});

socket.on("messages", (messages) => {

  let messagesDenormalized = normalizr.denormalize(
    messages.result,
    [mensajeSchema],
    messages.entities
  );

  const html = makeHtmlList(messagesDenormalized);
  document.getElementById("mensajes").innerHTML = html;

  let messagesNSize = JSON.stringify(messages).length;
  let messagesNdSize = JSON.stringify(messagesDenormalized).length;
  
  let porcentajeResult = porcentaje(messagesNdSize, messagesNSize);
  document.getElementById("compresion-info").innerText = porcentajeResult;
});

function makeHtmlList(mensajes) {
  const html = mensajes
    .map((mensaje) => {
      return `<div style="margin-bottom: 10px;">
        <img src="${mensaje.author.avatar}" height="30px">
        <span style="color:brown;">
        ${mensaje.author.mail + " "}
        </span>
        <strong style="color:blue;">
        ${mensaje.author.name + " "}
        ${mensaje.author.lastName + " : "}
        </strong>
        <i style="color:green;">${mensaje.text}</i>
        </div>`;
    })
    .join(" ");
  return html;
}

function porcentaje(a, b) {
  return (a / b).toFixed(2);
}