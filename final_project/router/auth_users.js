const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// In-memory users array to store registered users
let users = [];

// Check if username is valid (i.e., not already taken)
const isValid = (username) => {
    let user = users.find(user => user.username === username);
    return !user;
}

// Check if user is authenticated (username and password match)
const authenticatedUser = (username, password) => {
    let user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: '1h' });
        req.session.authorization = { accessToken };
        return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    // Get the username from session (assuming user is logged in)
    const username = req.session.authorization ? jwt.verify(req.session.authorization.accessToken, 'access').data : null;
    
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }
    
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    
    if (!review) {
        return res.status(400).json({ message: "Review text is required Use ?review=some_text" });
    }
    
    // Add or modify review (if the user already reviewed, update; otherwise, add new)
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/modified successfully", book: books[isbn] });
});

// Delete a book review (only the review posted by the logged in user can be deleted)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization ? jwt.verify(req.session.authorization.accessToken, 'access').data : null;
    
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }
    
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    
    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully", book: books[isbn] });
    } else {
        return res.status(404).json({ message: "Review not found for this user" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
