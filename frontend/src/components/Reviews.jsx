import { useEffect, useMemo, useState } from "react";
import {
  getReviews,
  getReviewableOrders,
  addReview,
  deleteReview,
} from "../api/reviewApi";

const BASE_URL = import.meta.env.VITE_API_URL;

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function Reviews() {
  const [menuItems, setMenuItems] = useState([]);
  const [itemId, setItemId] = useState(null);
  const [data, setData] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // My own order ids — used only to show a "delete" option on reviews I wrote.
  const myOrderIds = useMemo(
    () => new Set(myOrders.map((o) => o.order_id)),
    [myOrders]
  );

  const selectedOrder = useMemo(
    () => myOrders.find((o) => String(o.order_id) === String(selectedOrderId)),
    [myOrders, selectedOrderId]
  );

  const reviewableItemsForOrder = useMemo(
    () => (selectedOrder ? selectedOrder.items.filter((i) => !i.already_reviewed) : []),
    [selectedOrder]
  );

  const ordersWithReviewableItems = useMemo(
    () => myOrders.filter((o) => o.items.some((i) => !i.already_reviewed)),
    [myOrders]
  );

  useEffect(() => {
    fetch(`${BASE_URL}/menu-items`)
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(data.items || []);
        if (data.items && data.items.length > 0) {
          setItemId(data.items[0].id);
        }
      })
      .catch(() => setMenuItems([]));
  }, []);

  const loadMyOrders = async () => {
    try {
      const orders = await getReviewableOrders();
      setMyOrders(orders);
    } catch {
      setMyOrders([]);
    } finally {
      setOrdersLoaded(true);
    }
  };

  const loadReviews = async (id) => {
    if (!id) return;
    setLoadingReviews(true);
    const result = await getReviews(id);
    setData(result);
    setLoadingReviews(false);
  };

  useEffect(() => {
    loadMyOrders();
  }, []);

  useEffect(() => {
    if (itemId) loadReviews(itemId);
  }, [itemId]);

  useEffect(() => {
    // Whenever the chosen order changes, default to its first reviewable item.
    if (reviewableItemsForOrder.length > 0) {
      setSelectedItemId(String(reviewableItemsForOrder[0].item_id));
    } else {
      setSelectedItemId("");
    }
  }, [selectedOrderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!selectedOrderId || !selectedItemId) {
      setFormError("Please choose an order and an item to review.");
      return;
    }

    setSubmitting(true);
    try {
      await addReview(Number(selectedOrderId), Number(selectedItemId), rating, comment);
      setComment("");
      setRating(5);
      setFormSuccess("Thanks! Your review has been posted.");
      await loadMyOrders();
      if (Number(selectedItemId) === Number(itemId)) {
        await loadReviews(itemId);
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      await loadReviews(itemId);
      await loadMyOrders();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="bb-page">
      <div className="bb-header">
        <div className="bb-logo">
          <span className="bb-burger">☰</span>
          <span>BiteBuddy</span>
        </div>

        <span className="bb-header-icon">🍔</span>
      </div>

      <main className="bb-card bb-review-card">
        <div className="bb-page-heading">
          <span className="bb-eyebrow">CUSTOMER FEEDBACK</span>
          <h1>Ratings & Reviews</h1>
          <p>Share your experience and help others choose their food.</p>
        </div>

        <label className="bb-label">Choose a menu item</label>

        <select
          className="bb-input"
          value={itemId ?? ""}
          onChange={(e) => setItemId(Number(e.target.value))}
        >
          {menuItems.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {!loadingReviews && data && (
          <div className="bb-rating-summary">
            <div className="bb-rating-star">★</div>

            <div>
              <strong>{data.average_rating} / 5</strong>
              <span>{data.count} review{data.count === 1 ? "" : "s"}</span>
            </div>
          </div>
        )}

        <div className="bb-review-list">
          {data?.reviews.length === 0 && (
            <p className="bb-empty-note">No reviews yet for this item — be the first!</p>
          )}

          {data?.reviews.map((r) => (
            <div key={r.id} className="bb-review-item">
              <div className="bb-review-meta">
                <span className="bb-stars">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
                <span className="bb-order-badge">Order #{r.order_id}</span>
                <span className="bb-review-date">{formatDate(r.created_at)}</span>
              </div>

              {r.comment && <p>{r.comment}</p>}

              {myOrderIds.has(r.order_id) && (
                <button
                  type="button"
                  className="bb-review-delete-btn"
                  onClick={() => handleDelete(r.id)}
                >
                  Delete my review
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bb-page-heading" style={{ marginTop: 30 }}>
          <h2>Write a Review</h2>
          <p>Reviews are tied to a real order of yours — no name required.</p>
        </div>

        {ordersLoaded && myOrders.length === 0 && (
          <p className="bb-empty-note">
            You don't have any orders yet. Place an order first, then come back here to review it.
          </p>
        )}

        {ordersLoaded && myOrders.length > 0 && ordersWithReviewableItems.length === 0 && (
          <p className="bb-empty-note">
            You've already reviewed every item from all your orders. Thanks for the feedback!
          </p>
        )}

        {ordersWithReviewableItems.length > 0 && (
          <form onSubmit={handleSubmit} className="bb-review-form">
            <label className="bb-label">Which order?</label>
            <select
              className="bb-input"
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
            >
              <option value="">Select an order…</option>
              {ordersWithReviewableItems.map((o) => (
                <option key={o.order_id} value={o.order_id}>
                  Order #{o.order_id} — {formatDate(o.created_at)} ({o.status})
                </option>
              ))}
            </select>

            {selectedOrder && (
              <>
                <label className="bb-label">Which item from that order?</label>
                <select
                  className="bb-input"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                >
                  {reviewableItemsForOrder.map((i) => (
                    <option key={i.item_id} value={i.item_id}>
                      {i.item_name} (x{i.quantity})
                    </option>
                  ))}
                </select>
              </>
            )}

            <label className="bb-label">Your rating</label>
            <select
              className="bb-input"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} star{r > 1 ? "s" : ""}
                </option>
              ))}
            </select>

            <label className="bb-label">Your comment</label>
            <input
              className="bb-input"
              type="text"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            {formError && <p className="bb-error-text">{formError}</p>}
            {formSuccess && <p className="bb-success-text">{formSuccess}</p>}

            <button type="submit" className="bb-primary-button" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
export default Reviews;
