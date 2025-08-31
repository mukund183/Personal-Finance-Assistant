import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Box, 
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const ReceiptUpload = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please select a valid file (JPG, PNG, or PDF)');
      setFile(null);
      setPreview(null);
      return;
    }
    
    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setFile(null);
      setPreview(null);
      return;
    }
    
    setFile(selectedFile);
    setError('');
    
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For PDFs, just show a placeholder
      setPreview('pdf');
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    setProcessingStatus('Uploading receipt...');
    
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      formData.append('userId', user?.id || 1);
      
      // Upload the receipt
      setProcessingStatus('Processing receipt with OCR...');
      const response = await axios.post('http://localhost:5000/api/receipts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Receipt uploaded and processed successfully!');
      setProcessingStatus('');
      
      // Navigate to create transaction with the receipt data
      navigate('/transactions/add', { 
        state: { 
          receiptData: response.data,
          receiptId: response.data.id || response.data._id
        } 
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload receipt. Please try again.');
      setProcessingStatus('');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Set the file input value
      const fileInput = document.getElementById('receipt-upload');
      
      // Create a DataTransfer object to set the file input value
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      fileInput.files = dataTransfer.files;
      
      // Trigger the file change handler
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Upload Receipt
        </Typography>
        
        <Typography variant="body1" align="center" color="textSecondary" paragraph>
          Upload a receipt image or PDF to automatically extract transaction details.
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
        
        <Box 
          sx={{ 
            border: '2px dashed #ccc', 
            borderRadius: 2, 
            p: 3, 
            textAlign: 'center',
            mb: 3,
            backgroundColor: '#f9f9f9',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: '#f0f7ff'
            }
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
            id="receipt-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="receipt-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              sx={{ mb: 2 }}
            >
              Select File
            </Button>
          </label>
          
          <Typography variant="body2" color="textSecondary">
            Drag and drop a file here, or click to select
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
            Supported formats: JPG, PNG, PDF (Max size: 5MB)
          </Typography>
        </Box>
        
        {/* Preview */}
        {preview && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Preview:
            </Typography>
            <Card sx={{ maxWidth: 400, mx: 'auto' }} className="receipt-preview">
              {preview === 'pdf' ? (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                  <Typography>PDF Document</Typography>
                </Box>
              ) : (
                <CardMedia
                  component="img"
                  image={preview}
                  alt="Receipt preview"
                  sx={{ maxHeight: 300, objectFit: 'contain' }}
                />
              )}
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {file?.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {(file?.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
        
        {/* Processing status */}
        {processingStatus && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>{processingStatus}</Typography>
          </Box>
        )}
        
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => navigate('/receipts')}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!file || loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Processing...' : 'Upload & Process'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ReceiptUpload;