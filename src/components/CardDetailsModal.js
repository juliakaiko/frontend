import React from "react";
import "./css/CardDetailsModal.css";

function CardDetailsModal({
                              card,
                              onClose,
                              onUpdate,
                              onDelete,
                              formatCardNumber,
                              formatFullCardNumber,
                              formatExpirationDate,
                              getCardType
                          }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card-modal" onClick={(e) => e.stopPropagation()}>
                <div className="card-modal-header">
                    <h3>Card Details</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="card-modal-content">
                    <div className="card-preview">
                        <div className="card-preview-icon">💳</div>
                        <div className="card-preview-info">
                            <p className="card-preview-number">
                                {formatCardNumber(card)}
                            </p>
                            <p className="card-preview-expiry">
                                {formatExpirationDate(card.expirationDate)}
                            </p>
                        </div>
                    </div>

                    <div className="card-details">
                        <div className="detail-row">
                            <span className="detail-label">Cardholder Name:</span>
                            <span className="detail-value">{card.holder || 'Not specified'}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Card Number:</span>
                            <span className="detail-value">{formatFullCardNumber(card)}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Expiry Date:</span>
                            <span className="detail-value">{formatExpirationDate(card.expirationDate)}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Card Type:</span>
                            <span className="detail-value">{getCardType(card.number)}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Card ID:</span>
                            <span className="detail-value">{card.cardId}</span>
                        </div>
                    </div>
                </div>

                {/* Only Update and Delete buttons*/}
                <div className="card-modal-actions">
                    <button
                        className="btn-update"
                        onClick={() => onUpdate(card)}
                    >
                        Update
                    </button>
                    <button
                        className="btn-danger"
                        onClick={() => onDelete(card)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CardDetailsModal;