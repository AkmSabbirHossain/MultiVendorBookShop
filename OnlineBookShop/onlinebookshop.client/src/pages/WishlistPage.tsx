//import React, { useEffect } from 'react';
//import { useWishlist } from '../components/WishlistContext';
//import { Link } from 'react-router-dom';

//const WishlistPage: React.FC = () => {
//    const { wishlistItems, removeFromWishlist, loading, refreshWishlist } = useWishlist();

//    // Page load হলে wishlist refresh করবে
//    useEffect(() => {
//        refreshWishlist();
//    }, [refreshWishlist]);

//    if (loading) {
//        return (
//            <div className="container mt-5 text-center">
//                <div className="spinner-border text-primary" role="status">
//                    <span className="visually-hidden">Loading...</span>
//                </div>
//                <p className="mt-3">Loading your wishlist...</p>
//            </div>
//        );
//    }

//    if (wishlistItems.length === 0) {
//        return (
//            <div className="container mt-5 text-center py-5">
//                <div className="mb-4">
//                    <i className="bi bi-heart text-muted" style={{ fontSize: '4rem' }}></i>
//                </div>
//                <h3>Your Wishlist is Empty</h3>
//                <p className="text-muted mb-4">You haven't added any books to your wishlist yet.</p>
//                <Link to="/" className="btn btn-primary btn-lg">
//                    Browse Books
//                </Link>
//            </div>
//        );
//    }

//    return (
//        <div className="container mt-4">
//            <div className="d-flex justify-content-between align-items-center mb-4">
//                <h2>My Wishlist ({wishlistItems.length})</h2>
//                <button
//                    className="btn btn-outline-secondary"
//                    onClick={refreshWishlist}
//                >
//                    Refresh
//                </button>
//            </div>

//            <div className="row g-4">
//                {wishlistItems.map((item) => (
//                    <div key={item.wishlistItemId} className="col-md-6 col-lg-4">
//                        <div className="card h-100 shadow-sm hover-shadow">
//                            {item.imageUrl && (
//                                <img
//                                    src={item.imageUrl}
//                                    className="card-img-top"
//                                    alt={item.bookTitle}
//                                    style={{ height: '220px', objectFit: 'cover' }}
//                                />
//                            )}

//                            <div className="card-body d-flex flex-column">
//                                <h5 className="card-title">{item.bookTitle}</h5>
//                                {item.author && (
//                                    <p className="text-muted small mb-2">{item.author}</p>
//                                )}

//                                <div className="mt-2 mb-3">
//                                    <span className="fw-bold text-success fs-5">
//                                        ৳ {item.bookPrice.toFixed(2)}
//                                    </span>
//                                </div>

//                                <div className="mt-auto d-flex gap-2">
//                                    <Link
//                                        to={`/books/${item.bookId}`}
//                                        className="btn btn-outline-primary flex-grow-1"
//                                    >
//                                        View Details
//                                    </Link>

//                                    <button
//                                        className="btn btn-danger"
//                                        onClick={() => removeFromWishlist(item.bookId)}
//                                        title="Remove from wishlist"
//                                    >
//                                        <i className="bi bi-trash"></i>
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                    </div>
//                ))}
//            </div>
//        </div>
//    );
//};

//export default WishlistPage;