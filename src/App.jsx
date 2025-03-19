import { useState, useEffect } from 'react';
import Modal from './components/Modal';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Sign Up

  // Array of image paths
  const slideshowImages = [
    '/Images/Image35.jpg',
    '/Images/Image33.jpg',
    '/Images/Image34.jpg',
  ];

  // Automatic sliding every 10 seconds with fade
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % slideshowImages.length
        );
        setIsFading(false);
      }, 500);
    }, 10000);

    return () => clearInterval(slideInterval);
  }, [slideshowImages.length]);

  const listings = [
    { id: 1, name: "Vintage Chair", price: "$150", image: "Chair" },
    { id: 2, name: "Coffee Table", price: "$200", image: "Table" },
    { id: 3, name: "Desk Lamp", price: "$45", image: "Lamp" },
    { id: 4, name: "Bookshelf", price: "$180", image: "Shelf" },
    { id: 5, name: "Plant Stand", price: "$35", image: "Stand" },
    { id: 6, name: "Art Print", price: "$75", image: "Art" },
  ];

  return (
    <div className="Nav-Bar">
      <div className="App">
        <button className="Front-Button" onClick={() => setIsModalOpen(true)}>
          Browse
        </button>
        <h1 id="Top-Name">Marketplace</h1>
        <input id="Top-Search" placeholder="...Search" />
      </div>

      {/* Slideshow */}
      <div className="slideshow-container">
        <img
          src={slideshowImages[currentImageIndex]}
          alt={`Slide ${currentImageIndex + 1}`}
          className={`pre-footer-image ${isFading ? 'fade-out' : 'fade-in'}`}
          onError={(e) => {
            e.target.src = '/Images/fallback.jpg';
            console.error(`Failed to load ${slideshowImages[currentImageIndex]}`);
          }}
        />
      </div>

      {/* Create Account / Login Section */}
      <div className="CreateAccount">
        <img src="./Images/Icon.png" className="Account-Icon" alt="Account Icon" />

        <h1 className="Account">{isLogin ? "Log In" : "Create an Account"}</h1>

        {!isLogin && (
          <>
            <input id="FirstName" placeholder="First Name" />
            <input id="LastName" placeholder="Last Name" />
            <input id="Email" type="email" placeholder="Email" />
          </>
        )}

        <input id="Username" placeholder="Username" />
        <input id="Password" type="password" placeholder="Password" />

        <button className="Button-Account">{isLogin ? "Log In" : "Sign Up"}</button>

        <p className="toggle-text" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Create one" : "Already have an account? Log in"}
        </p>
      </div>

      <div className="Bottom-Nav"></div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Local Listings">
        <div className="modal-body">
          <div className="map-container">Map</div>
          <div className="listings-container">
            <div className="listings-grid">
              {listings.map((listing) => (
                <div key={listing.id} className="listing-item">
                  <div className="listing-image">{listing.image}</div>
                  <div className="listing-details">
                    <div className="listing-name">{listing.name}</div>
                    <div className="listing-price">{listing.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
