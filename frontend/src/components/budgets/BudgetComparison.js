import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, LinearProgress, 
  Grid, Card, CardContent, Divider 
} from '@mui/material';
import axios from 'axios';

const BudgetComparison = () => {
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBudgetComparison();
  }, []);

  const fetchBudgetComparison = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/budgets/comparison/data', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setComparison(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching budget comparison:', err);
      setError('Failed to load budget comparison data');
      setLoading(false);
    }
  };

  const getProgressColor = (percentUsed) => {
    const percent = parseFloat(percentUsed);
    if (percent < 70) return 'success';
    if (percent < 90) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Budget vs. Actual Spending
      </Typography>
      
      {loading ? (
        <Typography>Loading budget comparison data...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : comparison.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No budget data available. Create budgets to track your spending against limits.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {comparison.map((item) => (
            <Grid item xs={12} md={6} key={item.budgetId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.category}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Budget: ${item.budgetAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Spent: ${item.spent.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(parseFloat(item.percentUsed), 100)} 
                    color={getProgressColor(item.percentUsed)}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.percentUsed}% used
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={parseFloat(item.remaining) >= 0 ? 'success.main' : 'error.main'}
                    >
                      {parseFloat(item.remaining) >= 0 
                        ? `$${item.remaining.toFixed(2)} remaining` 
                        : `$${Math.abs(item.remaining).toFixed(2)} over budget`}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BudgetComparison;