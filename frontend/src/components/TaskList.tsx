import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';
import { TaskService } from '../services/TaskService'; // Import your TaskService
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

interface Props {
  tasks: Task[];
  onClaim?: (id: string, assignee: string) => void;
}

interface TaskDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onClaim?: (id: string, assignee: string) => void;
}

const TaskDialog = ({ task, open, onClose, onClaim }: TaskDialogProps) => {
  const [assignee, setAssignee] = useState('');
  
  if (!task) return null;

  const handleClaim = () => {
    if (onClaim && assignee.trim()) {
      onClaim(task.id, assignee);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Task Details</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="h6">{task.title}</Typography>
          {task.description && (
            <Typography color="text.secondary">{task.description}</Typography>
          )}
          <Box>
            <Chip 
              icon={<TimeIcon />} 
              label={new Date(task.created_at).toLocaleString()} 
              variant="outlined" 
              size="small" 
            />
            {task.assignee && (
              <Chip 
                icon={<PersonIcon />} 
                label={task.assignee} 
                sx={{ ml: 1 }} 
                color="primary" 
                size="small" 
              />
            )}
            <Chip 
              label={task.status} 
              color={task.status === 'todo' ? 'error' : 'warning'} 
              size="small" 
              sx={{ ml: 1 }} 
            />
          </Box>
          {!task.assignee && onClaim && (
            <TextField
              label="Your Name"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              fullWidth
              size="small"
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {!task.assignee && onClaim && (
          <Button onClick={handleClaim} variant="contained" disabled={!assignee.trim()}>
            Claim Task
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function TaskList({ tasks, onClaim }: Props) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await TaskService.searchTasks(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchError('Failed to search tasks');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Effect to handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(search);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [search, debouncedSearch]);

  // Determine which tasks to display
  const getDisplayTasks = () => {
    // If we're searching, use search results directly from API
    if (search.trim()) {
      const todoTasks = searchResults.filter(t => t.status === 'todo');
      const inProgressTasks = searchResults.filter(t => t.status === 'inprogress');
      
      return {
        todoTasks,
        inProgressTasks,
        displayTasks: tab === 0 ? todoTasks : inProgressTasks
      };
    }
    
    // If not searching, use all tasks (no local filtering)
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'inprogress');
    
    return {
      todoTasks,
      inProgressTasks,
      displayTasks: tab === 0 ? todoTasks : inProgressTasks
    };
  };

  const { todoTasks, inProgressTasks, displayTasks } = getDisplayTasks();

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  if (tasks.length === 0) return (
    <Box sx={{ textAlign: 'center', my: 4 }}>
      <Typography color="text.secondary">No tasks yet.</Typography>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: isSearching && <CircularProgress size={20} />,
          }}
          error={!!searchError}
          helperText={searchError}
        />
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab 
          icon={<AssignmentIcon />} 
          label={`Todo (${todoTasks.length})`} 
          iconPosition="start"
        />
        <Tab 
          icon={<PersonIcon />} 
          label={`In Progress (${inProgressTasks.length})`} 
          iconPosition="start"
        />
      </Tabs>

      {search.trim() && searchResults.length === 0 && !isSearching && !searchError && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography color="text.secondary">
            No tasks found matching "{search}"
          </Typography>
        </Box>
      )}

      <Stack spacing={1}>
        {displayTasks.map(task => (
          <Card 
            key={task.id} 
            variant="outlined" 
            sx={{ 
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={() => handleTaskClick(task)}
          >
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>
                {task.title}
              </Typography>
              {task.description && (
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {task.description}
                </Typography>
              )}
              <Box sx={{ mt: 1 }}>
                <Chip 
                  icon={<TimeIcon />} 
                  label={new Date(task.created_at).toLocaleString()} 
                  variant="outlined" 
                  size="small" 
                />
                {task.assignee && (
                  <Chip 
                    icon={<PersonIcon />} 
                    label={task.assignee} 
                    sx={{ ml: 1 }} 
                    color="primary" 
                    size="small" 
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <TaskDialog 
        task={selectedTask} 
        open={!!selectedTask} 
        onClose={() => setSelectedTask(null)}
        onClaim={onClaim}
      />
    </Box>
  );
}