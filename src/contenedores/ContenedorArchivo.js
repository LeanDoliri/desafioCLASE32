import { promises as fs } from "fs";

class ContenedorArchivo {
  constructor(ruta) {
    this.ruta = ruta;
  }

  async listar(id) {
    try {
      const data = await this.listarAll();
      const element = data.find((element) => id == element.id);
      return element;
    } catch (error) {
      logError(error);
      console.log(error);
    }
  }

  async listarAll() {
    try {
      const read = await fs.readFile(this.ruta, "utf-8");
      return JSON.parse(read);
    } catch (error) {
      logError(error);
      console.log(error);
    }
  }

  async guardar(element) {
    try {
      const data = await this.listarAll();
      let newId;
      if (data.length == 0) {
        newId = 1;
      } else {
        newId = data[data.length - 1].id + 1;
      }
      const newObj = { ...element, id: newId };
      data.push(newObj);
      await fs.writeFile(this.ruta, JSON.stringify(data, null, 2));
    } catch (error) {
      logError(error);
      console.log(error);
    }
  }

  async actualizar(elem) {
    try {
      let data = await this.listarAll();

      const filteredElements = data.filter((element) => element.id !== id);
      const newElement = { id, ...elem };
      data = [...filteredElements, newElement];

      await fs.writeFile(this.ruta, JSON.stringify(data, null, 2), "utf-8");

      return newElement;
    } catch (error) {
      logError(error);
      console.log(error);
    }
  }

  async borrar(id) {
    try {
      const data = await this.listarAll();

      const newData = data.filter((element) => element.id != id);
      await fs.writeFile(this.ruta, JSON.stringify(newData, null, 2), "utf-8");

      return newData;
    } catch (error) {
      logError(error);
      console.log(error);
    }
  }

  async borrarAll() {
    try {
      await fs.writeFile(this.ruta, JSON.stringify([], null, 2), "utf-8");
      return this.listarAll();
    } catch (error) {
      logError(error);
      console.log(error);
    }
  }
}

export default ContenedorArchivo;