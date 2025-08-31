import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Navbar from './components/layout/Navbar';
import TransactionList from './components/transactions/TransactionList';
import TransactionForm from './components/transactions/TransactionForm';
import ReceiptUpload from './components/receipts/ReceiptUpload';
import ReceiptList from './components/receipts/ReceiptList';
import Reports from './components/reports/Reports';
import BudgetList from './components/budgets/BudgetList';
import BudgetComparison from './components/budgets/BudgetComparison';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#f50057',
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/transactions/add" element={<TransactionForm />} />
            <Route path="/transactions/edit/:id" element={<TransactionForm />} />
            <Route path="/receipts" element={<ReceiptList />} />
            <Route path="/receipts/upload" element={<ReceiptUpload />} />
            <Route path="/budgets" element={<BudgetList />} />
            <Route path="/budgets/comparison" element={<BudgetComparison />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;