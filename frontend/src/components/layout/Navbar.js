import React, { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box,
  Switch,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle,
  Dashboard,
  Receipt,
  AttachMoney,
  BarChart,
  AccountBalance
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const Navbar = ({ toggleDarkMode, darkMode }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
          Finance Assistant
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/"
            title="Dashboard"
          >
            <Dashboard />
          </IconButton>
          
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/transactions"
            title="Transactions"
          >
            <AttachMoney />
          </IconButton>
          
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/receipts"
            title="Receipts"
          >
            <Receipt />
          </IconButton>
          
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/budgets"
            title="Budgets"
          >
            <AccountBalance />
          </IconButton>
          
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/reports"
            title="Reports"
          >
            <BarChart />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color="default"
            />
          </Box>

          {user ? (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          ) : (
            <Box>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;