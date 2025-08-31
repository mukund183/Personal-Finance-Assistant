import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Box, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const TransactionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
    
    // If in edit mode, fetch transaction data
    if (isEditMode) {
      fetchTransaction();
    }
  }, [user, navigate, id, isEditMode]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/transactions/${id}`);
      
      // Format date for the input field (YYYY-MM-DD)
      const formattedDate = new Date(response.data.date).toISOString().split('T')[0];
      
      setFormData({
        type: response.data.type,
        amount: response.data.amount,
        category: response.data.category,
        description: response.data.description,
        date: formattedDate
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load transaction data. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create form data for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('userId', user?.id || 1);
      
      if (receiptFile) {
        formDataToSend.append('receipt', receiptFile);
      }
      
      if (isEditMode) {
        // Update existing transaction
        await axios.put(`http://localhost:5000/api/transactions/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Transaction updated successfully!');
      } else {
        // Create new transaction
        await axios.post('http://localhost:5000/api/transactions', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Transaction added successfully!');
        
        // Clear form for new entry
        setFormData({
          type: 'expense',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        setReceiptFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
      
      // If in edit mode, navigate back to transactions list after successful update
      if (isEditMode && !error) {
        setTimeout(() => {
          navigate('/transactions');
        }, 1500);
      }
    }
  };

  if (loading && isEditMode) return <Typography>Loading transaction data...</Typography>;

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          {isEditMode ? 'Edit Transaction' : 'Add New Transaction'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="type-label">Transaction Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Transaction Type"
                  required
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="amount"
                label="Amount"
                name="amount"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                value={formData.amount}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  required
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="date"
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="description"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Receipt (Optional)
                </Typography>
                <input
                  accept="image/*,application/pdf"
                  id="receipt"
                  type="file"
                  onChange={handleFileChange}
                  style={{ width: '100%' }}
                />
                <Typography variant="caption" color="textSecondary">
                  Supported formats: JPG, PNG, PDF (Max size: 5MB)
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/transactions')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TransactionForm;