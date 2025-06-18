import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Chip,
  IconButton,
  FormHelperText
} from '@mui/material';
import { 
  Person as PersonIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import DOMPurify from 'dompurify';
import type { Task } from '../../types/task';

interface Props {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onClaim?: (id: string, assignee: string) => void;
}

export const TaskDialog = ({ task, open, onClose, onClaim }: Props) => {
  const [assignee, setAssignee] = useState('');
  const [assigneeError, setAssigneeError] = useState('');
  
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setAssignee('');
      setAssigneeError('');
    }
  }, [open]);

  if (!task) return null;
  
  // Safely sanitized content for display
  const safeTitle = task.title ? DOMPurify.sanitize(task.title) : '';
  const safeDescription = task.description ? DOMPurify.sanitize(task.description) : '';
  const safeAssignee = task.assignee ? DOMPurify.sanitize(task.assignee) : '';

  const handleClose = () => {
    setAssignee('');
    setAssigneeError('');
    onClose();
  };

  const validateAssignee = (value: string): boolean => {
    const trimmed = value.trim();
    
    if (!trimmed) {
      setAssigneeError('Name is required');
      return false;
    }
    
    if (trimmed.length > 100) {
      setAssigneeError('Name must be less than 100 characters');
      return false;
    }
    
    // Check for valid characters (alphanumeric, spaces, and common name symbols)
    const nameRegex = /^[a-zA-Z0-9\s\.\-']+$/;
    if (!nameRegex.test(trimmed)) {
      setAssigneeError('Name contains invalid characters');
      return false;
    }
    
    setAssigneeError('');
    return true;
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAssignee(value);
    
    // Clear error as user types, will validate again on submit
    if (assigneeError) {
      setAssigneeError('');
    }
  };

  const handleClaim = () => {
    if (task && onClaim && validateAssignee(assignee)) {
      onClaim(task.id, assignee.trim());
      handleClose();
    }
  };

  return (
    <Dialog 
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        p: 3,
        pb: 0
      }}>
        <Typography variant="h6" component="span" sx={{ wordBreak: 'break-word', pr: 3 }}>
          {/* Using sanitized content */}
          <span dangerouslySetInnerHTML={{ __html: safeTitle }} />
        </Typography>
        <IconButton 
          onClick={handleClose}
          size="small"
          sx={{ mt: -1, mr: -1 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Current Assignee */}
          {task.assignee && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                icon={<PersonIcon />}
                label={`Currently assigned to ${safeAssignee}`}
                color="primary"
                size="small"
              />
            </Box>
          )}

          {/* Description */}
          {task.description && (
            <Box>
              <Typography variant="subtitle1" color="primary.main" gutterBottom>
                Description
              </Typography>
              <Typography 
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'text.primary',
                  lineHeight: 1.6,
                  bgcolor: 'action.hover',
                  p: 2,
                  borderRadius: 1,
                  maxHeight: 200,
                  overflowY: 'auto'
                }}
              >
                {/* Using sanitized content */}
                <span dangerouslySetInnerHTML={{ __html: safeDescription }} />
              </Typography>
            </Box>
          )}

          {/* Created Date */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Created
            </Typography>
            <Typography>
              {new Date(task.created_at).toLocaleString()}
            </Typography>
          </Box>

          {/* Claim Section */}
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle1" color="primary.main" gutterBottom>
              Claim This Task
            </Typography>
            <TextField
              label="Enter your name"
              value={assignee}
              onChange={handleAssigneeChange}
              fullWidth
              size="small"
              placeholder="Your name"
              error={!!assigneeError}
              helperText={assigneeError}
              inputProps={{ 
                maxLength: 100,
                pattern: "[A-Za-z0-9 \\-'.]*",
                title: "Enter a valid name"
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 2 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          size="large"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleClaim}
          variant="contained"
          size="large"
          disabled={!assignee.trim() || !!assigneeError}
        >
          Claim Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};