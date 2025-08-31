import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Grid,
  TextField,
  MenuItem,
  Box,
  Pagination,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import { Add as AddIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const TransactionList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  const categories = [
    'Food', 'Transportation', 'Housing', 'Utilities', 
    'Entertainment', 'Healthcare', 'Education', 'Shopping',
    'Personal', 'Debt', 'Savings', 'Income', 'Other'
  ];

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    fetchTransactions();
  }, [user, navigate, page, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = `?page=${page}&limit=10&userId=${user?.id || 1}`;
      
      if (filters.type) queryParams += `&type=${filters.type}`;
      if (filters.category) queryParams += `&category=${filters.category}`;
      if (filters.startDate) queryParams += `&startDate=${filters.startDate}`;
      if (filters.endDate) queryParams += `&endDate=${filters.endDate}`;
      if (filters.minAmount) queryParams += `&minAmount=${filters.minAmount}`;
      if (filters.maxAmount) queryParams += `&maxAmount=${filters.maxAmount}`;
      
      const response = await axios.get(`http://localhost:5000/api/transactions${queryParams}`);
      
      // Handle the new response format - backend now returns an object with transactions and pagination
      const transactionsData = response.data.transactions || [];
      const total = response.data.pagination?.total || transactionsData.length;
      
      setTransactions(transactionsData);
      setTotalPages(Math.ceil(total / 10));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
      setTransactions([]); // Set empty array on error
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`http://localhost:5000/api/transactions/${id}`);
        // Refresh transactions after delete
        fetchTransactions();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading && transactions.length === 0) return <Typography>Loading transactions...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Transactions</Typography>
        <Box>
          <IconButton 
            onClick={() => setShowFilters(!showFilters)} 
            color={showFilters ? "primary" : "default"}
            sx={{ mr: 1 }}
          >
            <FilterIcon />
          </IconButton>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/transactions/add')}
          >
            Add Transaction
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  label="Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  label="Category"
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min Amount"
                name="minAmount"
                type="number"
                size="small"
                value={filters.minAmount}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Amount"
                name="maxAmount"
                type="number"
                size="small"
                value={filters.maxAmount}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                size="small"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                size="small"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={clearFilters}
                sx={{ ml: 'auto' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Transaction List */}
      {transactions && transactions.length > 0 ? (
        <Grid container spacing={2}>
          {transactions.map((transaction) => (
            <Grid item xs={12} key={transaction.id || transaction._id}>
              <Card variant="outlined" className="transaction-card">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6">{transaction.description}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography color="textSecondary" sx={{ mr: 1 }}>
                          {new Date(transaction.date).toLocaleDateString()}
                        </Typography>
                        <Chip 
                          label={transaction.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </Box>
                      {transaction.receipt && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Has receipt
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography 
                        variant="h6" 
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                      >
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </Typography>
                      <Typography color="textSecondary">
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/transactions/edit/${transaction.id || transaction._id}`)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteTransaction(transaction.id || transaction._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography align="center" sx={{ py: 5 }}>
          No transactions found. Add a new transaction to get started.
        </Typography>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
    </Container>
  );
};

export default TransactionList;