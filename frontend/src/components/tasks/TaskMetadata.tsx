import { Chip, Box } from '@mui/material';
import { Person as PersonIcon, AccessTime as TimeIcon } from '@mui/icons-material';

interface TaskMetadataProps {
  createdAt: string;
  assignee?: string;
  status?: string;
  className?: string;
}

export const TaskMetadata = ({ createdAt, assignee, status, className }: TaskMetadataProps) => (
  <Box className={className}>
    <Chip 
      icon={<TimeIcon />} 
      label={new Date(createdAt).toLocaleString()} 
      variant="outlined" 
      size="small" 
    />
    {assignee && (
      <Chip 
        icon={<PersonIcon />} 
        label={assignee} 
        sx={{ ml: 1 }} 
        color="primary" 
        size="small" 
      />
    )}
    {status && (
      <Chip 
        label={status} 
        color={status === 'todo' ? 'error' : 'warning'} 
        size="small" 
        sx={{ ml: 1 }} 
      />
    )}
  </Box>
);
