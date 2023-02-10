function randoms(cant) {
  const numbers = {};
  for (let i = 0; i < cant; i++) {
    const randomNumbers = Math.floor(Math.random() * 1000);
    if (!numbers[randomNumbers]) {
      numbers[randomNumbers] = 1;
    } else {
      numbers[randomNumbers]++;
    }
  }

  return numbers;
}

process.on('message', cant => {
    const result = randoms(cant);
    process.send(result);
});
