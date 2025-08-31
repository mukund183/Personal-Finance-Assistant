import React, { useState, useEffect, useContext } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Box, FormControl, 
  InputLabel, Select
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const BudgetForm = ({ open, handleClose, budget }) => {
  const { user } = useContext(AuthContext);
  
  const initialFormState = {
    category: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category || '',
        amount: budget.amount || '',
        period: budget.period || 'monthly',
        startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
        notes: budget.notes || ''
      });
    } else {
      setFormData(initialFormState);
    }
  }, [budget]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const budgetData = {
        ...formData,
        userId: user?.id || 1,
        amount: parseFloat(formData.amount)
      };

      if (budget) {
        // Update existing budget
        await axios.put(`http://localhost:5000/api/budgets/${budget.id || budget._id}`, budgetData);
      } else {
        // Create new budget
        await axios.post('http://localhost:5000/api/budgets', budgetData);
      }

      setLoading(false);
      handleClose(true); // Refresh the budget list
    } catch (err) {
      console.error('Error saving budget:', err);
      setError(err.response?.data?.message || err.response?.data?.msg || 'An error occurred while saving the budget');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => handleClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{budget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              inputProps={{ min: 0, step: 0.01 }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Period</InputLabel>
              <Select
                name="period"
                value={formData.period}
                onChange={handleChange}
                label="Period"
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="End Date (Optional)"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Notes (Optional)"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />
            
            {error && (
              <Box sx={{ color: 'error.main', mt: 1 }}>
                {error}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (budget ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BudgetForm;