const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }
    
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Return all books in a neat JSON format
    return res.status(200).json(books);
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});
  
// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let results = [];
    for (let isbn in books) {
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
            results.push({ isbn, ...books[isbn] });
        }
    }
    if (results.length > 0) {
        return res.status(200).json(results);
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let results = [];
    for (let isbn in books) {
        if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
            results.push({ isbn, ...books[isbn] });
        }
    }
    if (results.length > 0) {
        return res.status(200).json(results);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Task 5: Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

/* --- Additional Endpoints Using Async/Await (Tasks 10-13) --- */

// Task 10: Get the book list available using async/await
public_users.get('/async/books', async (req, res) => {
    try {
        let allBooks = await new Promise((resolve, reject) => {
            resolve(books);
        });
        res.status(200).json(allBooks);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Task 11: Get book details based on ISBN using async/await
public_users.get('/async/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        let book = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject("Book not found");
            }
        });
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

// Task 12: Get book details based on author using async/await
public_users.get('/async/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        let results = await new Promise((resolve, reject) => {
            let found = [];
            for (let isbn in books) {
                if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
                    found.push({ isbn, ...books[isbn] });
                }
            }
            if (found.length > 0) {
                resolve(found);
            } else {
                reject("No books found by this author");
            }
        });
        res.status(200).json(results);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

// Task 13: Get all books based on title using async/await
public_users.get('/async/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        let results = await new Promise((resolve, reject) => {
            let found = [];
            for (let isbn in books) {
                if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
                    found.push({ isbn, ...books[isbn] });
                }
            }
            if (found.length > 0) {
                resolve(found);
            } else {
                reject("No books found with this title");
            }
        });
        res.status(200).json(results);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

module.exports.general = public_users;
