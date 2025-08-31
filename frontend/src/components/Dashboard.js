import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Grid, Paper, Typography, Button, Box, 
  Card, CardContent, CardActions, LinearProgress, 
  IconButton, Tooltip 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [budgetData, setBudgetData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);

      // Get recent transactions
      const transRes = await axios.get('http://localhost:5000/api/transactions?limit=5');
      setTransactions(transRes.data.transactions || []);

      // Get category summary
      const catRes = await axios.get('http://localhost:5000/api/transactions/summary/category');
      setCategoryData(catRes.data || []);

      // Get monthly summary
      const dateRes = await axios.get('http://localhost:5000/api/transactions/summary/date?groupBy=month');
      setMonthlyData(dateRes.data || []);

      // Get budgets
      const budgetRes = await axios.get('http://localhost:5000/api/budgets/comparison/data', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setBudgetData(budgetRes.data || []);

      // Calculate totals
      let incomeTotal = 0;
      let expenseTotal = 0;
      (transRes.data.transactions || []).forEach(transaction => {
        if (transaction.type === 'income') {
          incomeTotal += transaction.amount;
        } else {
          expenseTotal += transaction.amount;
        }
      });

      setTotalIncome(incomeTotal);
      setTotalExpense(expenseTotal);

      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  if (loading) return <Typography>Loading dashboard...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>Financial Dashboard</Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} color="primary" disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 140, bgcolor: '#e3f2fd' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>Balance</Typography>
            <Typography component="p" variant="h4">${(totalIncome - totalExpense).toFixed(2)}</Typography>
            <Typography color="text.secondary">Current balance</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 140, bgcolor: '#e8f5e9' }}>
            <Typography component="h2" variant="h6" color="success" gutterBottom>Income</Typography>
            <Typography component="p" variant="h4">${totalIncome.toFixed(2)}</Typography>
            <Typography color="text.secondary">Total income</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 140, bgcolor: '#ffebee' }}>
            <Typography component="h2" variant="h6" color="error" gutterBottom>Expenses</Typography>
            <Typography component="p" variant="h4">${totalExpense.toFixed(2)}</Typography>
            <Typography color="text.secondary">Total expenses</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Category Chart - Full Width */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Expenses by Category</Typography>
        <ResponsiveContainer width="100%" height={500}>
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <Pie
              data={categoryData}
              cx="50%" cy="50%"
              outerRadius={150}
              dataKey="total"
              nameKey="category"
              label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Paper>

      {/* Recent Transactions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
        <Grid container spacing={2}>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <Grid item xs={12} key={transaction.id}>
                <Card variant="outlined" className="transaction-card">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography variant="h6">{transaction.description}</Typography>
                        <Typography color="textSecondary">
                          {new Date(transaction.date).toLocaleDateString()} - {transaction.category}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
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
                    <Button size="small" onClick={() => navigate(`/transactions/edit/${transaction.id}`)}>Edit</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography>No recent transactions found.</Typography>
            </Grid>
          )}
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/transactions')}>
            View All Transactions
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;