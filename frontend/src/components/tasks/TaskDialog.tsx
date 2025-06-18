import { useState } from 'react';
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
  IconButton
} from '@mui/material';
import { 
  Person as PersonIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import type { Task } from '../../types/task';

interface Props {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onClaim?: (id: string, assignee: string) => void;
}

export const TaskDialog = ({ task, open, onClose, onClaim }: Props) => {
  const [assignee, setAssignee] = useState('');

  if (!task) return null;

  const handleClose = () => {
    setAssignee('');
    onClose();
  };

  const handleClaim = () => {
    if (task && onClaim && assignee.trim()) {
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
          {task.title}
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
                label={`Currently assigned to ${task.assignee}`}
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
                {task.description}
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
              onChange={(e) => setAssignee(e.target.value)}
              fullWidth
              size="small"
              placeholder="Your name"
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
          disabled={!assignee.trim()}
        >
          Claim Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};