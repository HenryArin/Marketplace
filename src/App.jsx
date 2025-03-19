import { useState, useEffect } from 'react';
import Modal from './components/Modal';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false); // Track fade state

  // Array of image paths in the public folder
  const slideshowImages = [
    '/Images/Image35.jpg',
    '/Images/Image33.jpg',
    '/Images/Image34.jpg',
  ];

  // Automatic sliding every 5 seconds with fade
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setIsFading(true); // Start fade-out
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % slideshowImages.length
        );
        setIsFading(false); // Fade-in new image
      }, 500); // Half-second fade-out before switching
    }, 10000); // 5000ms = 5 seconds total interval

    return () => clearInterval(slideInterval); // Cleanup on unmount
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

     {/* Slideshow with cleaner fade transition */}
     <div className="slideshow-container">
        <img
          src={slideshowImages[currentImageIndex]}
          alt={`Slide ${currentImageIndex + 1}`}
          className={`pre-footer-image ${isFading ? 'fade-out' : 'fade-in'}`}
          onError={(e) => {
            e.target.src = '/Images/fallback.jpg'; // Fallback if image fails
            console.error(`Failed to load ${slideshowImages[currentImageIndex]}`);
          }}
        />
      </div>

     
      <div className="CreateAccount">
      
     
      <h1 className="Account">Create an Account</h1>
      <input  id="Username" placeholder="Username"></input>
      <input  id="Password" placeholder="Password"></input>
      <button className="Button-Account">Log in</button>

      </div>


      <div className="Bottom-Nav"></div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Local Listings"
      >
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