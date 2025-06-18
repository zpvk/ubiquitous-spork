import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack
} from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (task: { title: string; description?: string; assignee?: string }) => void;
}

export default function CreateForm({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreate({ 
      title, 
      description: description || undefined,
      assignee: assignee || undefined 
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setAssignee('');
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
            onChange={e => setTitle(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            inputProps={{ maxLength: 500 }}
          />
          <TextField
            label="Assignee (optional)"
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
            fullWidth
            placeholder="Leave empty for unassigned"
          />
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