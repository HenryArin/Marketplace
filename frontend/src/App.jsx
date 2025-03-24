import { useState, useEffect } from 'react';
import Modal from './components/Modal';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(() => {
    // Initialize loggedIn state from localStorage
    return localStorage.getItem('loggedIn') === 'true';
  });
  const [userEmail, setUserEmail] = useState(() => {
    // Initialize userEmail state from localStorage
    return localStorage.getItem('userEmail') || '';
  });
  const [modalMode, setModalMode] = useState(null);
  const [listings, setListings] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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

  // Function to fetch listings
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/src/get_all_listings.php?sort=${sortBy}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch listings when component mounts or sort changes
  useEffect(() => {
    fetchListings();
  }, [sortBy]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('emailaddress', email);
      formData.append('password', password);
      
      // Add the appropriate action based on whether it's login or signup
      if (isLogin) {
        formData.append('loginAccount', true);
      } else {
        formData.append('createAccount', true);
      }

      console.log('Submitting auth data...');
      const endpoint = isLogin ? 'login.php' : 'signup.php';
      const response = await fetch(`http://localhost:8000/src/${endpoint}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      // Add debug output
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      const text = await response.text();
      console.log('Response text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Server returned invalid JSON response');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.message && (data.message.includes('Login Successful!') || data.message.includes('Account Successfully Created!'))) {
        alert(isLogin ? 'Login successful!' : 'Account created successfully!');
        // Clear form
        setPassword('');
        // Set logged in state if login was successful
        if (isLogin) {
          setLoggedIn(true);
          setUserEmail(email);
          // Save to localStorage
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('userEmail', email);
          
          // Store auth token if it exists
          if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userID', data.userID);
          }
        }
        // Optionally switch back to login view after successful signup
        if (!isLogin) {
          setIsLogin(true);
        }
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      alert('Error during authentication. Please try again.');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserEmail('');
    // Clear localStorage
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userEmail');
  };

  const handleFilterClick = () => {
    setShowFilters(!showFilters);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setShowFilters(false); // Close the dropdown after selection
  };

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
      {!loggedIn ? (
        <div className="CreateAccount">
          <img src="./Images/Icon.png" className="Account-Icon" alt="Account Icon" />

          <h1 id="Create-An-Account">{isLogin ? 'Login' : 'Create an Account'}</h1>
          <input
            id="Username"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            id="Password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="Button-Account" onClick={handleAuth}>
            {isLogin ? 'Log in' : 'Sign up'}
          </button>

          <p className="toggle-text" id="Toggle-text" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Create one" : "Already have an account? Log in"}
          </p>
        </div>
      ) : (
        <div className="CreateAccount">
          <img src="./Images/Icon.png" className="Account-Icon" alt="Account Icon" />
          <h1 id="Create-An-Account" style={{ color: 'white' }}>Welcome, {userEmail}!</h1>
          <button className="Button-Account" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}

      <div className="Bottom-Nav"></div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalMode(null);
        }}
        mode={modalMode}
        loggedIn={loggedIn}
        onLogout={handleLogout}
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
    <button className="filter-button" onClick={handleFilterClick}>Filter</button>
    {showFilters && (
      <div className="filter-dropdown">
        <button onClick={() => handleSortChange('newest')} className="filter-option">Newest First</button>
        <button onClick={() => handleSortChange('oldest')} className="filter-option">Oldest First</button>
        <button onClick={() => handleSortChange('price_high')} className="filter-option">Price: High to Low</button>
        <button onClick={() => handleSortChange('price_low')} className="filter-option">Price: Low to High</button>
      </div>
    )}
     </div>
      </div>

      <div name="Listings-Container" id="List-Container">
        <div className="sort-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
          </select>
        </div>
        <div name="Listings-Grid" id="List-Grid">
          {isLoading ? (
            <div className="loading">Loading listings...</div>
          ) : listings.length === 0 ? (
            <div className="no-listings">No listings found</div>
          ) : (
            listings.map((listing) => (
              <div key={listing.listingID} className="listing-item">
                <img 
                  src={`http://localhost:8000/img/listings/${listing.images[0] || 'default.jpg'}`}
                  alt={listing.title}
                  className="List-Image"
                  width="250"
                  height="250"
                />
                <div className="listing-info">
                  <h3>{listing.title}</h3>
                  <p className="price">${listing.price}</p>
                </div>
              </div>
            ))
          )}
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
