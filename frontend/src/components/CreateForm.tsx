import { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface Props {
  onCreate: (task: { title: string; description?: string }) => void;
}

export default function CreateForm({ onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title, description: description || undefined });
    setTitle('');
    setDescription('');
  };

  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{
        display: 'flex',
        gap: 1,
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' }
      }}
    >
      <TextField
        placeholder="New task title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        fullWidth
      />
      <TextField
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        fullWidth
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!title.trim()}
        startIcon={<AddIcon />}
        sx={{ minWidth: 100 }}
      >
        Add
      </Button>
    </Box>
  );
}