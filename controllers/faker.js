import faker from 'faker';

faker.locale = 'es';
const {commerce, image} = faker;

export const getProductosTest = (cant) => {
    const prod = [];
    for (let i= 0; i <= cant; i++) {
        const fakeProd = {
            title: commerce.product(),
            price: commerce.price(),
            thumbnail: image.business()
        };
        prod.push(fakeProd);
    }
    return prod;
}