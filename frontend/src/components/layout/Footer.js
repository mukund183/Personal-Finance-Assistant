import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' Personal Finance Assistant | '}
          <Link color="inherit" href="#">
            Privacy Policy
          </Link>{' | '}
          <Link color="inherit" href="#">
            Terms of Service
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;