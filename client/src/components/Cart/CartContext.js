// CartContext.js
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const getInitialCount = () => {
        const storedCount = localStorage.getItem('count');
        return storedCount ? parseInt(storedCount, 10) : 0;
    };

    const [productsCount, setProductsCount] = useState(getInitialCount());

    const updateToCart = () => {
        const storedCount = localStorage.getItem('count');
        const parsedCount = parseInt(storedCount, 10);
      
        if (!isNaN(parsedCount)) {
          setProductsCount(parsedCount);
        } else {
          setProductsCount(0);
        }
      };
      
    return (
        <CartContext.Provider value={{ productsCount, updateToCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
