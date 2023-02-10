const socket = io();

function createLi(text) {
  let li = document.createElement("li");
  li.innerHTML = text;
  return li;
}

socket.on("randomNumbers", (result) => {
  const div = document.getElementById("getRandomNumbers");
  div.innerHTML = "";
  for (var key in result) {
    const li = createLi(key + ": " + result[key]);
    div.appendChild(li);
  }
});
