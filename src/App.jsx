import { useState } from 'react'
import Modal from './components/Modal'
import './App.css'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample listings data
  const listings = [
    { id: 1, name: "Vintage Chair", price: "$150", image: "Chair" },
    { id: 2, name: "Coffee Table", price: "$200", image: "Table" },
    { id: 3, name: "Desk Lamp", price: "$45", image: "Lamp" },
    { id: 4, name: "Bookshelf", price: "$180", image: "Shelf" },
    { id: 5, name: "Plant Stand", price: "$35", image: "Stand" },
    { id: 6, name: "Art Print", price: "$75", image: "Art" },
  ];

  return (
    <div className="App">
      <button onClick={() => setIsModalOpen(true)}>
        Open Modal
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Local Listings"
      >
        <div className="modal-body">
          <div className="map-container">
            Map
          </div>
          <div className="listings-container">
            <div className="listings-grid">
              {listings.map(listing => (
                <div key={listing.id} className="listing-item">
                  <div className="listing-image">
                    {listing.image}
                  </div>
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
  )
}

export default App
