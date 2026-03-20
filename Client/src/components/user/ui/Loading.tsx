// src/components/user/ui/Loading.tsx
// Chịu trách nhiệm: Spinner loading — fullscreen hoặc inline
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?:    string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message, fullScreen = false }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 2, minHeight: fullScreen ? '100vh' : '60vh' }}>
    <CircularProgress size={48} />
    {message && <Typography color="text.secondary">{message}</Typography>}
  </Box>
);

export default Loading;