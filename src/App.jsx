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
        <p id="Top-Name">Marketplace</p>
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

      <h2 className="Account">Create an Account</h2>
      <input  id="Username" placeholder="Username"></input>
      <input  id="Password" placeholder="Password"></input>
      <button className="Button-Account">Log in</button>
      

        <p className="toggle-text" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Create one" : "Already have an account? Log in"}
        </p>
      </div>

      <div className="Bottom-Nav"></div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        
      >
        <div name="Top-Line" id="Top-Line"></div>  
        <div name="Hero" id="Hero">
          <h1>Discover, Buy, and Sell—Your Marketplace for Everything You Need</h1>
        </div>
        <div name="Button-Container" id="Button-Container">
          <div name="Button-Rows" id="Button-Rows">
             <div class="search-container">
               <input type="text" class="search-input" placeholder="...Search" />
    </div>
    <button class="filter-button">SouthWest</button>
    <button class="filter-button">Favorites</button>
    <button class="filter-button">Technology</button>
    <button class="fliter-button">Filter</button>
     </div>
      </div>

      <div name="Listings-Container" id="List-Container">
    <div name="Listings-Grid" id="List-Grid">
      <div class="listing-item">
        <img src="./Images/Image11.jpg" class="List-Image" alt="Blender" width="250" height="250" />
      </div>
      <div class="listing-item">
        <img src="./Images/Image12.jpg" class="List-Image" alt="Blender" width="250" height="250" />
      </div>
      <div class="listing-item">
        <img src="./Images/Image13.jpg" class="List-Image" alt="Blender" width="250" height="250" />
      </div>
      <div class="listing-item">
        <img src="./Images/Image19.jpg" class="List-Image" alt="Blender" width="250" height="250" />
      </div>
      <div class="listing-item">
        <img src="./Images/Image32.jpg" class="List-Image" alt="Blender" width="250" height="250" />
      </div>
      <div class="listing-item">
        <img src="./Images/Image16.jpg" class="List-Image" alt="Blender" width="250" height="250" />
      </div>
    </div>
    </div>
       
        <div name="Bottom-Line" id="Bottom-Line"></div>
        <div className="modal-body">
        <div className="map-container">Map</div>
          
       
        </div>
      </Modal>
    </div>
  );
}

export default App;
