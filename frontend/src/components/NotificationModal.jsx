function NotificationModal({ title, message, icon = "⚠️", onClose }) {
  return (
    <div className="login-modal-overlay">
      <div className="login-modal-card notification-modal">
        <div className="login-modal-icon">
          {icon}
        </div>

        <h3>{title}</h3>

        <p>{message}</p>

        <button
          className="login-modal-primary"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default NotificationModal;