import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaBook, FaTrash } from 'react-icons/fa';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';

function App() {
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [isCartVisible, setIsCartVisible] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:8080/api/catalog')
            .then(response => setBooks(response.data))
            .catch(error => console.error('Error fetching books:', error));
    }, []);

    const fetchCartItems = () => {
        axios.get('http://localhost:8081/api/cart')
            .then(response => {
                setCartItems(response.data);
                setCartCount(response.data.length);
            })
            .catch(error => console.error('Error fetching cart items:', error));
    };

    useEffect(fetchCartItems, []);

    const addToCart = (bookId) => {
        axios.post('http://localhost:8081/api/cart', { bookId, quantity: 1 })
            .then(() => {
                fetchCartItems();
                alert('Added to cart!');
            })
            .catch(error => console.error('Error adding to cart:', error));
    };

    const removeFromCart = (id) => {
        axios.delete(`http://localhost:8081/api/cart/${id}`)
            .then(() => fetchCartItems())
            .catch(error => console.error('Error removing from cart:', error));
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            const book = books.find(book => book.id === item.bookId);
            return book ? total + book.price * item.quantity : total;
        }, 0).toFixed(2);
    };

    const handlePurchase = () => {
        axios.delete('http://localhost:8081/api/cart')
            .then(() => {
                setCartItems([]);
                setCartCount(0);
                setIsCartVisible(false);
                alert('Thank you for your purchase!');
            })
            .catch(error => console.error('Error clearing cart:', error));
    };

    return (
        <Router>
            <div className="app-container">
                <header className="app-header">
                    <h1 className="header-title">Newcastle University Book Store</h1>
                    <div className="cart-container">
                        <button onClick={() => setIsCartVisible(true)} className="cart-button">
                            <FaShoppingCart size={24} />
                            <span className="cart-count">{cartCount}</span>
                        </button>
                    </div>
                </header>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search books by title or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="book-list">
                    {books.filter(book =>
                        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        book.author.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map(book => (
                        <div key={book.id} className="book-card">
                            <div className="book-info">
                                <h3 className="book-title">{book.title}</h3>
                                <p className="book-author">by {book.author}</p>
                                <p className="book-price">${book.price}</p>
                            </div>
                            <button onClick={() => addToCart(book.id)} className="add-to-cart-btn">
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>

                {cartItems.length > 0 && (
                    <button onClick={handlePurchase} className="purchase-btn front-page-purchase">
                        Complete Purchase
                    </button>
                )}

                {isCartVisible && (
                    <div className="cart-modal">
                        <div className="cart-modal-content">
                            <button onClick={() => setIsCartVisible(false)} className="close-btn">X</button>
                            <h2>Your Cart</h2>
                            <div className="cart-items">
                                {cartItems.length === 0 ? (
                                    <p>Your cart is empty</p>
                                ) : (
                                    cartItems.map(item => {
                                        const book = books.find(b => b.id === item.bookId);
                                        return book && (
                                            <div key={item.id} className="cart-item">
                                                <FaBook size={24} className="book-icon" />
                                                <div>
                                                    <p>Title: {book.title}</p>
                                                    <p>Author: {book.author}</p>
                                                    <p>Price: ${book.price}</p>
                                                    <p>Quantity: {item.quantity}</p>
                                                    <p>Total: ${(book.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="remove-btn styled-remove-btn">
                                                    <FaTrash /> Remove
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            {cartItems.length > 0 && (
                                <>
                                    <div className="total-price">
                                        <h3>Total Price: ${calculateTotalPrice()}</h3>
                                    </div>
                                    <button onClick={handlePurchase} className="purchase-btn">
                                        Complete Purchase
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Router>
    );
}

export default App;
