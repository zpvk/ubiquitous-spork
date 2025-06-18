import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormHelperText
} from '@mui/material';
import type { TaskFormData } from '../../types/task';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (task: TaskFormData & { assignee?: string }) => void;
}

export default function CreateForm({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  
  // Form validation states
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [assigneeError, setAssigneeError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Title validation
    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else if (title.length > 100) {
      setTitleError('Title must be less than 100 characters');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    // Description validation (optional field)
    if (description && description.length > 500) {
      setDescriptionError('Description must be less than 500 characters');
      isValid = false;
    } else {
      setDescriptionError('');
    }
    
    // Assignee validation (optional field)
    if (assignee) {
      if (assignee.length > 100) {
        setAssigneeError('Name must be less than 100 characters');
        isValid = false;
      }
      
      // Check for valid characters (alphanumeric, spaces, and common name symbols)
      const nameRegex = /^[a-zA-Z0-9\s\.\-']+$/;
      if (!nameRegex.test(assignee)) {
        setAssigneeError('Name contains invalid characters');
        isValid = false;
      }
    } else {
      setAssigneeError('');
    }
    
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onCreate({ 
      title: title.trim(), 
      description: description.trim() || undefined,
      assignee: assignee.trim() || undefined 
    });
    
    handleClose();
  };

  const handleClose = () => {
    // Reset form fields and errors
    setTitle('');
    setDescription('');
    setAssignee('');
    setTitleError('');
    setDescriptionError('');
    setAssigneeError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            fullWidth
            autoFocus
            required
            error={!!titleError}
            helperText={titleError}
            inputProps={{ 
              maxLength: 100,
              'data-testid': 'task-title-input'
            }}
          />
          <TextField
            label="Description"
            value={description}
            onChange={e => {
              setDescription(e.target.value);
              if (descriptionError) setDescriptionError('');
            }}
            fullWidth
            multiline
            rows={4}
            error={!!descriptionError}
            helperText={descriptionError || 'Optional'}
            inputProps={{ maxLength: 500 }}
          />
          <TextField
            label="Assignee"
            value={assignee}
            onChange={e => {
              setAssignee(e.target.value);
              if (assigneeError) setAssigneeError('');
            }}
            fullWidth
            placeholder="Leave empty for unassigned"
            error={!!assigneeError}
            helperText={assigneeError || 'Optional'}
            inputProps={{ 
              maxLength: 100,
              pattern: "[A-Za-z0-9 \\-'.]*",
              title: "Enter a valid name"
            }}
          />
          <FormHelperText>All inputs are sanitized for security.</FormHelperText>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!title.trim()}
        >
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}