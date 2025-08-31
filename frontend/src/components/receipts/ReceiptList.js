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
  Box,
  Pagination,
  Chip,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const ReceiptList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    fetchReceipts();
  }, [user, navigate, page]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/receipts?page=${page}&limit=10&userId=${user?.id || 1}`);
      
      // Handle the new response format - backend now returns a simple array
      const receiptsData = Array.isArray(response.data) ? response.data : [];
      setReceipts(receiptsData);
      
      // Calculate total pages based on array length
      setTotalPages(Math.ceil(receiptsData.length / 10));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError(err.message);
      setReceipts([]); // Set empty array on error
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDeleteReceipt = async (id) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        await axios.delete(`http://localhost:5000/api/receipts/${id}`);
        // Refresh receipts after delete
        fetchReceipts();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType && fileType.includes('pdf')) {
      return '📄';
    } else {
      return '🖼️';
    }
  };

  if (loading && receipts.length === 0) return <Typography>Loading receipts...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Receipts</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/receipts/upload')}
        >
          Upload Receipt
        </Button>
      </Box>

      {/* Receipt List */}
      {receipts && receipts.length > 0 ? (
        <Grid container spacing={2}>
          {receipts.map((receipt) => (
            <Grid item xs={12} sm={6} md={4} key={receipt.id || receipt._id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box 
                  sx={{ 
                    height: 140, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: receipt.fileType && receipt.fileType.includes('pdf') ? '#f5f5f5' : '#eef2f6',
                    position: 'relative'
                  }}
                >
                  <Typography variant="h2">{getFileTypeIcon(receipt.fileType)}</Typography>
                  {receipt.processedTransactionId && (
                    <Chip 
                      label="Processed" 
                      color="success" 
                      size="small" 
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {receipt.extractedData?.merchant || 'Receipt'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Uploaded: {new Date(receipt.uploadDate).toLocaleDateString()}
                  </Typography>
                  {receipt.extractedData?.amount && (
                    <Typography variant="body1" fontWeight="bold">
                      ${receipt.extractedData.amount}
                    </Typography>
                  )}
                  {receipt.extractedData?.date && (
                    <Typography variant="body2">
                      Date: {new Date(receipt.extractedData.date).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/receipts/${receipt.id || receipt._id}`)}
                  >
                    View
                  </Button>
                  {!receipt.processedTransactionId && (
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate('/transactions/add', { 
                        state: { 
                          receiptData: receipt,
                          receiptId: receipt.id || receipt._id
                        } 
                      })}
                    >
                      Create Transaction
                    </Button>
                  )}
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteReceipt(receipt.id || receipt._id)}
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
          No receipts found. Upload a receipt to get started.
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

export default ReceiptList;