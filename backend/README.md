# Finance Assistant Backend

A simplified backend API for the Finance Assistant application without database or authentication requirements.

## Features

- **In-Memory Storage**: All data is stored in memory (resets on server restart)
- **No Database Required**: No MySQL, PostgreSQL, or any database setup needed
- **No Authentication**: All endpoints are public for easy testing
- **File Upload Support**: Receipt image uploads are supported
- **RESTful API**: Standard REST endpoints for all operations

## API Endpoints

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile?userId=1` - Get user profile

### Transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions?userId=1` - Get all transactions for a user
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary/category?userId=1` - Get summary by category
- `GET /api/transactions/summary/date?userId=1` - Get summary by date

### Budgets
- `POST /api/budgets` - Create a new budget
- `GET /api/budgets?userId=1` - Get all budgets for a user
- `GET /api/budgets/:id` - Get budget by ID
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/comparison/data?userId=1` - Get budget comparison

### Receipts
- `POST /api/receipts/upload` - Upload a receipt
- `GET /api/receipts?userId=1` - Get all receipts for a user
- `GET /api/receipts/:id` - Get receipt by ID
- `DELETE /api/receipts/:id` - Delete receipt
- `POST /api/receipts/:id/transaction` - Create transaction from receipt

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

The server will start on port 5000 (or the PORT environment variable if set).

## Usage

All endpoints accept a `userId` parameter (defaults to 1 if not provided) to simulate different users. Data is stored in memory and will be reset when the server restarts.

### Example Usage

```bash
# Register a user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password"}'

# Create a transaction
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"type":"expense","amount":50.00,"category":"Food","description":"Lunch"}'

# Get all transactions for user 1
curl http://localhost:5000/api/transactions?userId=1
```

## File Uploads

Receipt images are stored in the `uploads/` directory. The server automatically creates this directory if it doesn't exist.

## Notes

- This is a simplified version for development and testing
- No data persistence - all data is lost on server restart
- No security features - all endpoints are public
- No database required - everything runs in memory 