import faker from 'faker'
faker.locale = 'es'

function crearProductoRandom() {
    return {
        title: faker.commerce.product(),
        price: faker.commerce.price(),
        thumbnail: faker.image.imageUrl()
    }
}

const addRandomProducts = () =>{
    return crearProductoRandom()
}

export default addRandomProducts;