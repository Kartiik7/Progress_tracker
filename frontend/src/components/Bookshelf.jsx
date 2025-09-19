import React, { useState, useEffect } from "react";
import * as bookApi from '../api/books';
import styles from "./Bookshelf.module.css";

// Main component for the Bookshelf page
export default function Bookshelf() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    totalPages: "",
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookApi.getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.totalPages) return;
    try {
      await bookApi.createBook({
        ...formData,
        totalPages: Number(formData.totalPages),
      });
      setShowForm(false);
      setFormData({ title: "", author: "", totalPages: "" });
      fetchBooks();
    } catch (error) {
      console.error("Failed to add book:", error);
    }
  };

  const handleUpdateBook = async (book, newStatus) => {
    try {
      await bookApi.updateBook(book._id, { status: newStatus });
      fetchBooks();
    } catch (error) {
      console.error("Failed to update book status", error);
    }
  };

  const renderBooks = (status) => {
    return books
      .filter((book) => book.status === status)
      .map((book) => (
        <BookCard key={book._id} book={book} onUpdate={handleUpdateBook} />
      ));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>My Bookshelf</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={styles.addBookBtn}
        >
          {showForm ? "Cancel" : "＋ Add New Book"}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleAddBook} className={styles.addBookForm}>
          <input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Book Title"
            required
          />
          <input
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            placeholder="Author"
          />
          <input
            name="totalPages"
            type="number"
            value={formData.totalPages}
            onChange={handleInputChange}
            placeholder="Total Pages"
            required
          />
          <button type="submit">Save Book</button>
        </form>
      )}

      {loading ? (
        <p>Loading your bookshelf...</p>
      ) : (
        <div className={styles.shelves}>
          <Shelf title="Currently Reading" books={renderBooks("reading")} />
          <Shelf title="Want to Read" books={renderBooks("to-read")} />
          <Shelf title="Finished" books={renderBooks("finished")} />
        </div>
      )}
    </div>
  );
}

// --- Helper Components ---

function Shelf({ title, books }) {
  return (
    <section className={styles.shelf}>
      <h2>{title}</h2>
      {books.length > 0 ? (
        <div className={styles.bookGrid}>{books}</div>
      ) : (
        <p className={styles.emptyShelf}>This shelf is empty.</p>
      )}
    </section>
  );
}

function BookCard({ book, onUpdate }) {
  const progress =
    book.totalPages > 0
      ? Math.round((book.currentPage / book.totalPages) * 100)
      : 0;

  return (
    <div className={styles.bookCard}>
      <div className={styles.bookInfo}>
        <h3>{book.title}</h3>
        <p>{book.author || "Unknown Author"}</p>
      </div>
      <div className={styles.progress}>
        <div
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className={styles.progressText}>
        {book.currentPage} / {book.totalPages} pages
      </p>
      <div className={styles.actions}>
        {book.status !== "reading" && (
          <button onClick={() => onUpdate(book, "reading")}>
            Start Reading
          </button>
        )}
        {book.status !== "finished" && (
          <button onClick={() => onUpdate(book, "finished")}>
            Mark as Finished
          </button>
        )}
        {book.status !== "to-read" && (
          <button onClick={() => onUpdate(book, "to-read")}>
            Move to "To Read"
          </button>
        )}
      </div>
    </div>
  );
}
