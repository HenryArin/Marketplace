import { useState, useEffect } from 'react';
import Modal from './components/Modal';
import ListingDetailView from './components/ListingDetailView';
import MapComponent from './components/MapComponent';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
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
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // List of available categories
  const categories = [
    { value: 'books', label: 'Books' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'other', label: 'Other' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' },
    { value: 'toys', label: 'Toys' },
    { value: 'vehicles', label: 'Vehicles' }
  ];

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      // If the same category is clicked again, clear the filter
      setSelectedCategory('');
    } else {
      // Otherwise, set the selected category
      setSelectedCategory(category);
    }
    setShowCategories(false);
  };

  const handleCategoriesButtonClick = () => {
    setShowCategories(!showCategories);
    setShowFilters(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to fetch listings
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      let url = `http://localhost:8000/src/get_all_listings.php?sort=${sortBy}`;
      
      // Add category filter if one is selected
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      
      console.log('Fetching listings from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      console.log('Fetched listings data:', data);
      
      // Make sure each listing has an images array
      const processedListings = (data.listings || []).map(listing => {
        // If images is a string, convert it to an array
        if (typeof listing.images === 'string') {
          try {
            listing.images = JSON.parse(listing.images);
          } catch (e) {
            // If parsing fails, create an array with the string
            listing.images = listing.images ? [listing.images] : [];
          }
        } else if (!Array.isArray(listing.images)) {
          // If images is not an array, create an empty array
          listing.images = [];
        }
        return listing;
      });
      
      setListings(processedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch listings when component mounts or sort or category changes
  useEffect(() => {
    fetchListings();
  }, [sortBy, selectedCategory]);

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setModalMode('marketplace');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMode(null);
  };

  return (
    <div className="Nav-Bar">
      <div className="App">
        <button className="Front-Button" onClick={handleOpenModal}>
          Browse
        </button>
        <h1 id="Top-Name">Henry & Oscar's Marketplace</h1>
        <img src="./Images/Kitty2.png" id="Top-Search" width="75px" height="75px"/>
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


<footer className="app-footer">
  <div className="footer-left">
    <div className="language">
      <label>LANGUAGE</label>
      <select>
        <option>English</option>
      </select>
    </div>
    <ul className="footer-links">
      <li><a href="#">Search</a></li>
      <li><a href="#">Privacy Policy</a></li>
      <li><a href="#">Cookie Policy</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </div>
  <div className="footer-right">
    <div className="payment-icons">
      <img src="/Images/visa.png" alt="Visa" />
      <img src="/Images/mastercard.png" alt="Mastercard" />
      <img src="/Images/amex.png" alt="Amex" />
      <img src="/Images/paypal.png" alt="Paypal" />
      <img src="/Images/discover.png" alt="Discover" />
    </div>
    <div className="footer-branding">
      <p>© Marketplace</p>
      <p>Powered by Henry & Oscar</p>
    </div>
  </div>
</footer>

      {selectedListing && (
        <div 
          className="listing-detail-overlay" 
          onClick={(e) => {
            console.log('Overlay clicked');
            setSelectedListing(null);
          }}
        >
          <div 
            className="listing-detail-container" 
            onClick={(e) => {
              console.log('Container clicked');
              e.stopPropagation();
            }}
          >
            <ListingDetailView 
              listing={selectedListing}
              onClose={() => {
                console.log('Close button clicked');
                setSelectedListing(null);
              }}
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalMode(null);
        }}
        mode={modalMode}
        loggedIn={loggedIn}
        onLogout={handleLogout}
        refreshListings={fetchListings}
      >
        <div className="modal-content-container">
          <div name="Top-Line" id="Top-Line"></div>  
          <div name="Hero" id="Hero">
            <h1>Discover, Buy, and Sell—Your Marketplace for Everything You Need</h1>
          </div>
          <div name="Button-Container" id="Button-Container">
            <div name="Button-Rows" id="Button-Rows">
               <div class="search-container">
                 <input 
                   type="text" 
                   class="search-input" 
                   placeholder="...Search" 
                   value={searchQuery}
                   onChange={handleSearch}
                 />
               </div>
               <button class={`filter-button small ${selectedCategory ? 'active' : ''}`} onClick={handleCategoriesButtonClick}>
                 {selectedCategory ? 
                   `Category: ${categories.find(c => c.value === selectedCategory)?.label || 'All'}` : 
                   'Categories'
                 }
               </button>
               <button className="filter-button small" onClick={handleFilterClick}>Filter</button>

               {showFilters && (
                 <div className="filter-dropdown">
                   <button onClick={() => handleSortChange('newest')} className="filter-option">Newest First</button>
                   <button onClick={() => handleSortChange('oldest')} className="filter-option">Oldest First</button>
                   <button onClick={() => handleSortChange('price_high')} className="filter-option">Price: High to Low</button>
                   <button onClick={() => handleSortChange('price_low')} className="filter-option">Price: Low to High</button>
                 </div>
               )}

              {showCategories && (
                <div className="filter-dropdown">
                  <button 
                    onClick={() => handleCategoryClick('')} 
                    className="filter-option"
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button 
                      key={category.value}
                      onClick={() => handleCategoryClick(category.value)} 
                      className={`filter-option ${selectedCategory === category.value ? 'active' : ''}`}
                    >
                      {category.label}
                    </button>
                  ))}
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
                listings
                  .filter(listing => 
                    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((listing) => (
                    <div 
                      key={listing.listingID} 
                      className="listing-item"
                      onClick={() => {
                        console.log('Clicked listing:', listing);
                        setSelectedListing(listing);
                      }}
                    >
                      <img 
                        src={`http://localhost:8000/img/listings/${listing.images[0] || 'default.jpg'}`}
                        alt={listing.title}
                        className="List-Image"
                        width="250"
                        height="250"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOHB4IiBmaWxsPSIjMjEyNTI5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                        }}
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
            <div className="map-container">
              <MapComponent 
                listings={listings} 
                onSelectListing={(listing) => setSelectedListing(listing)}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
