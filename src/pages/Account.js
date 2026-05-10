import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../utils/axiosInterceptor";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../utils/constants";
import "./css/Account.css";
import AddCardForm from "../components/AddCardForm";
import UpdateCardForm from "../components/UpdateCardForm";
import CardDetailsModal from "../components/CardDetailsModal";

function Account() {
    const { auth } = useAuth();
    const [userData, setUserData] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showCardModal, setShowCardModal] = useState(false);
    const [showAddCardForm, setShowAddCardForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [cardToUpdate, setCardToUpdate] = useState(null);

    const fetchCards = useCallback((userId) => {
        return axiosInstance.get(`${API_BASE_URL}/api/cards/user/${userId}`)
            .then(cardsResponse => {
                console.log("Cards API response:", cardsResponse.data);
                setCards(cardsResponse.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading cards:", err);
                setLoading(false);
            });
    }, []); // Убрал auth.token из зависимостей

    const fetchUserData = useCallback(() => {
        if (!auth) return;

        // Load user data
        axiosInstance.get(`${API_BASE_URL}/api/users/find-by-email`, {
            params: { email: auth.user.email }
        })
            .then(userResponse => {
                setUserData(userResponse.data);
                // Load bank cards
                return fetchCards(userResponse.data.userId);
            })
            .catch(err => {
                console.error("Error loading account data:", err);
                setLoading(false);
            });
    }, [auth, fetchCards]);

    useEffect(() => {
        if (!auth) return;
        fetchUserData();
    }, [auth, fetchUserData]);

    useEffect(() => {
        if (showUpdateForm) setShowAddCardForm(false);
        if (showAddCardForm) setShowUpdateForm(false);
    }, [showUpdateForm, showAddCardForm]);

    const handleCardClick = (card) => {
        console.log("Clicked card:", card);
        setSelectedCard(card);
        setShowCardModal(true);
    };

    const closeCardModal = () => {
        setShowCardModal(false);
        setSelectedCard(null);
    };

    const handleAddCardClick = () => {
        setShowAddCardForm(true);
    };

    const handleCardAdded = () => {
        // Refresh cards list after adding new card
        if (userData) {
            fetchCards(userData.userId);
        }
        setShowAddCardForm(false);
    };

    const handleUpdateCard = (card) => {
        setShowAddCardForm(false);
        setCardToUpdate(card);
        setShowUpdateForm(true);
        setShowCardModal(false);
    };

    const handleCardUpdated = () => {
        // Refresh cards list after updating card
        if (userData) {
            fetchCards(userData.userId);
        }
        setShowUpdateForm(false);
        setCardToUpdate(null);
    };

    const handleDeleteCard = async (card) => {
        if (!window.confirm("Are you sure you want to delete this card?")) {
            return;
        }

        try {
            await axiosInstance.delete(
                `${API_BASE_URL}/api/cards/${card.cardId}`
            );
            alert("Card deleted successfully!");
            // Refresh cards list after deletion
            if (userData) {
                fetchCards(userData.userId);
            }
            setShowCardModal(false);
        } catch (error) {
            console.error("Error deleting card:", error);
            alert("Failed to delete card. Please try again.");
        }
    };

    // Function to determine card type by number
    const getCardType = (cardNumber) => {
        if (!cardNumber) return 'CREDIT CARD';

        const firstTwo = cardNumber.substring(0, 2);
        const firstFour = cardNumber.substring(0, 4);
        const firstOne = cardNumber.substring(0, 1);

        // Visa: 4xxx
        if (firstOne === '4') return 'VISA';

        // MasterCard: 5xxx
        if (firstOne === '5') return 'MASTERCARD';

        // American Express: 34xx, 37xx
        if (firstTwo === '34' || firstTwo === '37') return 'AMERICAN EXPRESS';

        // Discover: 6011xx
        if (firstFour === '6011') return 'DISCOVER';

        // Diners Club: 36xx, 30xx
        if (firstTwo === '36' || firstTwo === '30') return 'DINERS CLUB';

        // JCB: 35xx
        if (firstTwo === '35') return 'JCB';

        // Mir: 22xx
        if (firstTwo === '22') return 'MIR';

        // For all other cases
        return 'CREDIT CARD';
    };

    // Function to format card number (hide all except last 4 digits)
    const formatCardNumber = (card) => {
        if (!card.number) return "**** **** **** ****";

        const lastFourDigits = card.number.slice(-4);
        return `**** **** **** ${lastFourDigits}`;
    };

    // Function to show full card number in modal (also hidden)
    const formatFullCardNumber = (card) => {
        if (!card.number) return "**** **** **** ****";

        // Show format: XXXX XXXX XXXX 3333
        const visiblePart = card.number.slice(0, -4).replace(/\d/g, '*');
        const lastFourDigits = card.number.slice(-4);

        // Group by 4 digits
        const groupedVisible = visiblePart.replace(/(.{4})/g, '$1 ');
        const groupedLastFour = lastFourDigits.replace(/(.{4})/g, '$1 ');

        return `${groupedVisible.trim()} ${groupedLastFour.trim()}`;
    };

    // Function to format date
    const formatExpirationDate = (dateString) => {
        if (!dateString) return 'Not specified';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                year: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    if (!auth) return <p className="error-account">Please login to view your account.</p>;
    if (loading) return <p className="loading-account">Loading account information...</p>;

    return (
        <div className="account-container">
            <h2>My Account</h2>

            <div className="account-content">
                {/* User Profile Section */}
                <div className="profile-section">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {userData?.name?.charAt(0)}{userData?.surname?.charAt(0)}
                        </div>
                        <div className="profile-info">
                            <h3>{userData?.name} {userData?.surname}</h3>
                            <p>{userData?.email}</p>
                            <p>Member since: {new Date().getFullYear()}</p>
                        </div>
                    </div>

                    <div className="profile-details">
                        <div className="detail-item">
                            <label>Birth Date:</label>
                            <span>{userData?.birthDate || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                            <label>User ID:</label>
                            <span>{userData?.userId}</span>
                        </div>
                    </div>
                </div>

                {/* Bank Cards Section */}
                <div className="cards-section">
                    <h3>Payment Methods</h3>
                    {cards.length === 0 ? (
                        <p className="no-cards">No payment methods added</p>
                    ) : (
                        <div className="cards-list">
                            {cards.map((card) => (
                                <div
                                    key={card.cardId}
                                    className="card-item"
                                    onClick={() => handleCardClick(card)}
                                >
                                    <div className="card-icon">💳</div>
                                    <div className="card-info">
                                        <p className="card-number">{formatCardNumber(card)}</p>
                                        <p className="card-expiry">
                                            Expires: {formatExpirationDate(card.expirationDate)}
                                        </p>
                                        <p className="card-type">{getCardType(card.number)}</p>
                                    </div>
                                    <div className="card-click-hint">Click to view details</div>
                                </div>
                            ))}
                        </div>
                    )}
                    <button
                        className="btn-add-card"
                        onClick={handleAddCardClick}
                    >
                        Add New Card
                    </button>
                </div>
            </div>

            {/* Card Details Modal */}
            {showCardModal && selectedCard && (
                <CardDetailsModal
                    card={selectedCard}
                    onClose={closeCardModal}
                    onUpdate={handleUpdateCard}
                    onDelete={handleDeleteCard}
                    formatCardNumber={formatCardNumber}
                    formatFullCardNumber={formatFullCardNumber}
                    formatExpirationDate={formatExpirationDate}
                    getCardType={getCardType}
                />
            )}

            {/* Add New Card Form */}
            {showAddCardForm && (
                <AddCardForm
                    onClose={() => setShowAddCardForm(false)}
                    onCardAdded={handleCardAdded}
                />
            )}
            {/* Update Card Form */}
            {showUpdateForm && cardToUpdate && (
                <UpdateCardForm
                    card={cardToUpdate}
                    onClose={() => {
                        setShowUpdateForm(false);
                        setCardToUpdate(null);
                    }}
                    onCardUpdated={handleCardUpdated}
                />
            )}
        </div>
    );
}

export default Account;