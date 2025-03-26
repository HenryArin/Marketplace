# Marketplace Application

A full-stack web application for buying and selling items locally with an interactive map feature.

## Features

- **User Authentication**: Secure signup and login system
- **Item Listings**: Create, view, edit, and delete listings
- **Categories**: Filter items by categories (Technology, Clothing, Furniture, etc.)
- **Location-Based**: Add location information to listings that appear on an interactive map
- **Real-time Messaging**: Communicate with sellers through an in-app messaging system
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React.js
- CSS for styling
- Leaflet for interactive maps

### Backend
- PHP for server-side logic
- SQLite for database storage

## Setup Instructions

### Prerequisites
- Node.js and npm
- PHP server (like XAMPP, WAMP, or built-in PHP server)
- Web browser

### Installation

1. Clone the repository:
```
git clone https://github.com/HenryArin/Project2.git
cd Project2
```

2. Set up the frontend:
```
cd frontend
npm install
npm run dev
```

3. Set up the backend:
```
cd ../marketplace
php -S localhost:8000
```

4. Initialize the database:
```
php src/setup_database.php
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

- `/frontend`: React frontend application
  - `/src/components`: React components
  - `/src/assets`: Static assets

- `/marketplace`: PHP backend application
  - `/src`: PHP source files
  - `/sql`: SQLite database
  - `/img`: Uploaded images

## How to Use

### Create a Listing
1. Log in or create an account
2. Click on "Create Listing" 
3. Fill in the item details (title, price, description)
4. Select a category
5. Add a location (e.g., "McDonald's on Highway 46, Wasco, California")
6. Upload up to 3 images
7. Submit the listing

### Browse Listings
- View all listings on the main marketplace page
- Filter by category using the "Categories" dropdown
- Use the search bar to find specific items
- View locations of items on the interactive map

### Contact Sellers
- Click on a listing to view details
- Click "Message Seller" to start a conversation

## Future Improvements

- Add user ratings and reviews
- Implement advanced search filters
- Add payment processing integration
- Create mobile applications

## Contributors
- Henry Arinaga
- Oscar

## License
This project is licensed under the MIT License - see the LICENSE file for details. 