import React, { useState, useEffect } from "react";
import * as bookApi from '../api/books';
import styles from "./Bookshelf.module.css";

// --- Main Component ---
export default function Bookshelf() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async (bookData) => {
    try {
      await bookApi.createBook(bookData);
      setShowForm(false);
      fetchBooks();
    } catch (error) {
      console.error("Failed to add book:", error);
    }
  };

  const handleUpdateBook = async (bookId, payload) => {
    try {
      await bookApi.updateBook(bookId, payload);
      fetchBooks();
    } catch (error) {
      console.error("Failed to update book:", error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to permanently delete this book?")) {
      try {
        await bookApi.deleteBook(bookId);
        fetchBooks();
      } catch (error) {
        console.error("Failed to delete book:", error);
      }
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>My Bookshelf</h1>
        <button onClick={() => setShowForm(!showForm)} className={styles.addBookBtn}>
          {showForm ? "✕ Close" : "＋ Add Book"}
        </button>
      </header>

      {showForm && <AddBookForm onAddBook={handleAddBook} />}

      {loading ? (
        <p className={styles.loading}>Loading your bookshelf...</p>
      ) : (
        <div className={styles.shelvesGrid}>
          <Shelf title="Currently Reading" books={books.filter(b => b.status === 'reading')} onUpdate={handleUpdateBook} onDelete={handleDeleteBook} />
          <Shelf title="Want to Read" books={books.filter(b => b.status === 'to-read')} onUpdate={handleUpdateBook} onDelete={handleDeleteBook} />
          <Shelf title="Finished" books={books.filter(b => b.status === 'finished')} onUpdate={handleUpdateBook} onDelete={handleDeleteBook} />
          <Shelf title="Did Not Finish" books={books.filter(b => b.status === 'dnf')} onUpdate={handleUpdateBook} onDelete={handleDeleteBook} />
        </div>
      )}
    </div>
  );
}

// --- Child Components ---

function AddBookForm({ onAddBook }) {
  const [formData, setFormData] = useState({ title: "", author: "", totalPages: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.totalPages) return;
    onAddBook({ ...formData, totalPages: Number(formData.totalPages) });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.addBookForm}>
      <input name="title" value={formData.title} onChange={handleChange} placeholder="Book Title (e.g., The Great Gatsby)" required />
      <input name="author" value={formData.author} onChange={handleChange} placeholder="Author (e.g., F. Scott Fitzgerald)" />
      <input name="totalPages" type="number" value={formData.totalPages} onChange={handleChange} placeholder="Total Pages" required />
      <button type="submit">Save Book</button>
    </form>
  );
}

function Shelf({ title, books, onUpdate, onDelete }) {
  // Now we don't return null if books.length is 0, so the grid structure is maintained.
  // Instead, we'll show an empty state message.
  return (
    <section className={styles.shelf}>
      <h2>{title}</h2>
      {books.length > 0 ? (
        <div className={styles.bookGrid}>
          {books.map(book => <BookCard key={book._id} book={book} onUpdate={onUpdate} onDelete={onDelete} />)}
        </div>
      ) : (
        <p className={styles.emptyShelf}>This shelf is empty.</p>
      )}
    </section>
  );
}

function BookCard({ book, onUpdate, onDelete }) {
  return (
    <div className={styles.bookCard}>
      <div className={styles.bookInfo}>
        <h3>{book.title}</h3>
        <p>{book.author || "Unknown Author"}</p>
      </div>

      {book.status === 'finished' && <StarRating rating={book.rating} onRate={(rating) => onUpdate(book._id, { rating })} />}
      {book.status === 'reading' && <BookProgress book={book} onUpdate={onUpdate} />}

      <BookCardActions book={book} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
}

function BookProgress({ book, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(book.currentPage);
  const progressPercent = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

  const handleSave = () => {
    const newPage = Math.min(Number(currentPage), book.totalPages);
    onUpdate(book._id, { currentPage: newPage });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={styles.progressEdit}>
        <input type="number" value={currentPage} onChange={(e) => setCurrentPage(e.target.value)} autoFocus onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
        <span>/ {book.totalPages} pages</span>
      </div>
    );
  }

  return (
    <div className={styles.progressContainer} onClick={() => setIsEditing(true)}>
      <div className={styles.progress}>
        <div className={styles.progressBar} style={{ width: `${progressPercent}%` }}></div>
      </div>
      <p className={styles.progressText}>{book.currentPage} / {book.totalPages} pages</p>
    </div>
  );
}

function StarRating({ rating, onRate }) {
  return (
    <div className={styles.starRating}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span key={starValue} className={starValue <= rating ? styles.starFilled : styles.star} onClick={() => onRate(starValue)}>
            ★
          </span>
        );
      })}
    </div>
  );
}

function BookCardActions({ book, onUpdate, onDelete }) {
  return (
    <div className={styles.actions}>
      <div className={styles.statusActions}>
        {book.status !== "reading" && <button onClick={() => onUpdate(book._id, { status: "reading" })}>Read</button>}
        {book.status !== "finished" && <button onClick={() => onUpdate(book._id, { status: "finished" })}>Finish</button>}
        {book.status !== "dnf" && <button onClick={() => onUpdate(book._id, { status: "dnf" })}>DNF</button>}
        {book.status !== "to-read" && <button onClick={() => onUpdate(book._id, { status: "to-read" })}>To Read</button>}
      </div>
      <button onClick={() => onDelete(book._id)} className={styles.deleteBtn}>🗑️</button>
    </div>
  );
}