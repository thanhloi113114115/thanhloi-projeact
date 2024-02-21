const formattedPrice = (price) => {
    const priceAsNumber = parseFloat(price);
    if (!isNaN(priceAsNumber)) {
        const formattedPrice = priceAsNumber.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        return formattedPrice;
    }
    return "";
}
export default formattedPrice;
