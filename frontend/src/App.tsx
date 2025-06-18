import { useEffect, useState, useCallback } from 'react';
import type { Task } from './types/task';
import type { WebSocketMessageData } from './types/websocket';
import { TaskList } from './components/tasks/TaskList';
import CreateForm from './components/tasks/CreateForm';
import { TaskService } from './services/taskService';
import { WebSocketService } from './services/webSocketService';
import ErrorMessage from './components/common/ErrorMessage';
import { 
  ThemeProvider, 
  CssBaseline, 
  Container, 
  Typography, 
  Button, 
  Box,
  Alert,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Wifi as WifiIcon, 
  WifiOff as WifiOffIcon 
} from '@mui/icons-material';
import { theme } from './themes/theme';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Set up WebSocket connection and message handling
    const ws = WebSocketService.getInstance();
    
    const handleMessage = (msg: WebSocketMessageData) => {
      try {
        switch (msg.type) {
          case 'snapshot':
            setTasks(msg.tasks);
            break;
          case 'task_created':
            setTasks(prev => [msg.task, ...prev]);
            break;
          case 'task_updated':
            setTasks(prev => prev.map(t => t.id === msg.task.id ? msg.task : t));
            break;
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
        setErrorMessage('Error processing server update. Please refresh the page.');
      }
    };

    const handleConnectionStatus = (isConnected: boolean) => {
      setWsConnected(isConnected);
    };

    // Add handlers
    ws.addMessageHandler(handleMessage);
    ws.addConnectionStatusHandler(handleConnectionStatus);

    // Cleanup
    return () => {
      ws.removeMessageHandler(handleMessage);
      ws.removeConnectionStatusHandler(handleConnectionStatus);
    };
  }, []);

  // Clear error message
  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  // Create a new task
  const handleCreate = async (data: { title: string; description?: string; assignee?: string }) => {
    try {
      await TaskService.createTask(data);
      // No need for success message as WebSocket will update the UI
    } catch (error) {
      console.error('Failed to create task:', error);
      setErrorMessage('Failed to create task. Please try again.');
    }
  };

  // Handle claiming a task
  const handleClaim = async (id: string, assignee: string) => {
    try {
      await TaskService.claimTask(id, { assignee });
      // No need for success message as WebSocket will update the UI
    } catch (error) {
      console.error('Failed to claim task:', error);
      setErrorMessage('Failed to claim task. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Connection Status Alert */}
        {!wsConnected && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
            icon={<WifiOffIcon />}
          >
            Connection lost. Attempting to reconnect... Real-time updates are temporarily unavailable.
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" component="h1">
              Real-Time Todo
            </Typography>
            {/* Connection Status Chip */}
            <Chip
              icon={wsConnected ? <WifiIcon /> : <WifiOffIcon />}
              label={wsConnected ? 'Connected' : 'Reconnecting...'}
              color={wsConnected ? 'success' : 'warning'}
              size="small"
              variant="outlined"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateOpen(true)}
            disabled={!wsConnected} // Optionally disable when disconnected
          >
            Add Task
          </Button>
        </Box>
        
        <CreateForm 
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreate} 
        />
        <TaskList 
          tasks={tasks} 
          onClaim={handleClaim}
        />
        
        {/* Error Message Snackbar */}
        <ErrorMessage 
          message={errorMessage} 
          onClose={clearError}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;