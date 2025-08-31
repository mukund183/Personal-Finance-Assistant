import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import BudgetForm from './BudgetForm';

const BudgetList = () => {
  const { user } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/budgets', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setBudgets(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setLoading(false);
    }
  };

  const handleEdit = (budget) => {
    setCurrentBudget(budget);
    setOpenForm(true);
  };

  const handleDelete = (budget) => {
    setBudgetToDelete(budget);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/budgets/${budgetToDelete._id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setBudgets(budgets.filter(budget => budget._id !== budgetToDelete._id));
      setDeleteDialog(false);
      setBudgetToDelete(null);
    } catch (err) {
      console.error('Error deleting budget:', err);
    }
  };

  const handleFormClose = (refresh = false) => {
    setOpenForm(false);
    setCurrentBudget(null);
    if (refresh) {
      fetchBudgets();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Budget Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
        >
          Add Budget
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading budgets...</Typography>
      ) : budgets.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No budgets found. Create your first budget to start tracking your spending limits.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget._id}>
                  <TableCell>{budget.category}</TableCell>
                  <TableCell align="right">${budget.amount.toFixed(2)}</TableCell>
                  <TableCell>{budget.period}</TableCell>
                  <TableCell>{formatDate(budget.startDate)}</TableCell>
                  <TableCell>{budget.endDate ? formatDate(budget.endDate) : 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(budget)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(budget)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <BudgetForm 
        open={openForm} 
        handleClose={handleFormClose} 
        budget={currentBudget} 
      />

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this budget?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetList;