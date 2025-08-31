import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AuthContext } from '../../context/AuthContext';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    groupBy: 'month',
    chartType: 'bar',
    reportType: 'transactions' // 'transactions' or 'budgets'
  });
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    fetchReportData();
    
    // Fetch budget comparison data
    const fetchBudgetData = async () => {
      try {
        const budgetRes = await axios.get('http://localhost:5000/api/budgets/comparison/data', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        setBudgetData(budgetRes.data);
      } catch (err) {
        console.error('Error fetching budget data:', err);
      }
    };
    
    fetchBudgetData();
  }, [user, navigate, filters]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for date summary
      let dateQueryParams = `?groupBy=${filters.groupBy}`;
      if (filters.startDate) dateQueryParams += `&startDate=${filters.startDate}`;
      if (filters.endDate) dateQueryParams += `&endDate=${filters.endDate}`;
      
      // Build query parameters for category summary
      let categoryQueryParams = '';
      if (filters.startDate) categoryQueryParams += `?startDate=${filters.startDate}`;
      if (filters.endDate) {
        categoryQueryParams += categoryQueryParams ? `&endDate=${filters.endDate}` : `?endDate=${filters.endDate}`;
      }
      
      // Get category summary
      const catRes = await axios.get(`http://localhost:5000/api/transactions/summary/category${categoryQueryParams}`);
      setCategoryData(catRes.data);

      // Get date summary (monthly/weekly/daily)
      const dateRes = await axios.get(`http://localhost:5000/api/transactions/summary/date${dateQueryParams}`);
      setMonthlyData(dateRes.data);
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      groupBy: 'month',
      chartType: 'bar'
    });
  };

  // Format date labels based on groupBy
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    
    if (filters.groupBy === 'day') {
      return new Date(dateStr).toLocaleDateString();
    } else if (filters.groupBy === 'week') {
      return `Week ${dateStr}`;
    } else {
      // Month format
      return dateStr;
    }
  };

  if (loading && categoryData.length === 0) return <Typography>Loading report data...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  // Render budget comparison chart
  const renderBudgetChart = () => {
    if (budgetData.length === 0) {
      return (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1">
            No budget data available. Create budgets to see comparison charts.
          </Typography>
        </Paper>
      );
    }

    // Prepare data for charts
    const data = budgetData.map(item => ({
      name: item.category,
      budget: item.budgetAmount,
      spent: item.spent,
      remaining: item.remaining > 0 ? item.remaining : 0,
      overBudget: item.remaining < 0 ? Math.abs(item.remaining) : 0,
      percentUsed: parseFloat(item.percentUsed)
    }));

    if (filters.chartType === 'bar') {
      return (
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Budget vs. Actual Spending
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="budget" name="Budget Amount" fill="#8884d8" />
              <Bar dataKey="spent" name="Actual Spent" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      );
    } else if (filters.chartType === 'pie') {
      return (
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Budget Allocation
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={data}
                dataKey="budget"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      );
    } else {
      // Line chart for budget usage percentage
      return (
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Budget Usage Percentage
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value.toFixed(0)}%`} />
              <Legend />
              <Bar dataKey="percentUsed" name="Budget Used (%)" fill="#ff8042">
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.percentUsed > 90 ? '#ff0000' : entry.percentUsed > 75 ? '#ffbb28' : '#00C49F'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Financial Reports
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Options
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
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
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Group By</InputLabel>
              <Select
                name="groupBy"
                value={filters.groupBy}
                onChange={handleFilterChange}
                label="Group By"
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Chart Type</InputLabel>
              <Select
                name="chartType"
                value={filters.chartType}
                onChange={handleFilterChange}
                label="Chart Type"
              >
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                name="reportType"
                value={filters.reportType}
                onChange={handleFilterChange}
                label="Report Type"
              >
                <MenuItem value="transactions">Transactions</MenuItem>
                <MenuItem value="budgets">Budget vs. Actual</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              variant="outlined" 
              onClick={clearFilters}
              fullWidth
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Charts */}
      <Grid container spacing={3}>
        {filters.reportType === 'budgets' ? (
          // Budget comparison charts
          <Grid item xs={12}>
            {renderBudgetChart()}
          </Grid>
        ) : (
          // Transaction charts
          <>
            {/* Time-based Chart */}
            {/* <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  {filters.groupBy === 'month' ? 'Monthly' : filters.groupBy === 'week' ? 'Weekly' : 'Daily'} Spending
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  {filters.chartType === 'bar' ? (
                    <BarChart
                      data={monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="_id" 
                        tickFormatter={formatDateLabel}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => `$${value.toFixed(2)}`}
                        labelFormatter={formatDateLabel}
                      />
                      <Legend />
                      <Bar dataKey="total" name="Amount" fill="#8884d8" />
                    </BarChart>
                  ) : (
                    <LineChart
                      data={monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="_id" 
                        tickFormatter={formatDateLabel}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => `$${value.toFixed(2)}`}
                        labelFormatter={formatDateLabel}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        name="Amount" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </Paper>
            </Grid> */}
            
            {/* Category Pie Chart */}
            <Grid item xs={12} md={6}>
  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
    <Typography variant="h6" gutterBottom>
      Expenses by Category
    </Typography>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={101}
          fill="#8884d8"
          dataKey="total"
          nameKey="category" 
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </Paper>
</Grid>
            
            {/* Category Table */}
            <Grid item xs={12} md={6}>
  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400, overflow: 'auto' }}>
    <Typography variant="h6" gutterBottom>
      Category Breakdown
    </Typography>
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Category</th>
            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Amount</th>
            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {categoryData.length > 0 ? (
            categoryData.map((category, index) => {
              // Calculate total sum
              const totalSum = categoryData.reduce((sum, cat) => sum + cat.total, 0);
              const percentage = (category.total / totalSum) * 100;
              
              return (
                <tr key={index}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    {category._id || category.category || 'Uncategorized'}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                    ${category.total.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                    {percentage.toFixed(1)}%
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', padding: '8px' }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Box>
  </Paper>
</Grid>
          </>
        )}
      </Grid>
    </Container>
  );
};

export default Reports;