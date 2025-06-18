import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Stack, 
  TextField, 
  Card, 
  CardContent, 
  Chip, 
  Button,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Person as PersonIcon, 
  AccessTime as TimeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import DOMPurify from 'dompurify';
import type { Task } from '../../types/task';
import { TaskDialog } from './TaskDialog';
import { TaskService } from '../../services/taskService';

interface Props {
  tasks: Task[];
  onClaim?: (id: string, assignee: string) => void;
}

export const TaskList = ({ tasks, onClaim }: Props) => {
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [useBackendSearch, setUseBackendSearch] = useState(false);

  // useEffect to handle debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      // Require at least 2 characters for backend search
      if (search.trim().length >= 2) {
        setIsSearching(true);
        setSearchError(null);
        try {
          const results = await TaskService.searchTasks(search);
          setSearchResults(results);
          setUseBackendSearch(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchError('Failed to search tasks');
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setUseBackendSearch(false);
        setSearchResults([]);
        setSearchError(null);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [search]);

  // Filter tasks based on search when not using backend search
  const filteredTasks = useBackendSearch ? searchResults : tasks.filter(t => {
    const searchTerm = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(searchTerm) ||
      (t.description && t.description.toLowerCase().includes(searchTerm))
    );
  });

  // Filter tasks by status
  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'inprogress');
  const displayTasks = currentTab === 0 ? todoTasks : inProgressTasks;

  const handleTaskClick = (task: Task) => {
    // Only allow claiming tasks from the Todo tab
    if (currentTab === 0) {
      setSelectedTask(task);
    }
  };

  // Safe sanitization helper for displayed content
  const sanitizeContent = (content: string): string => {
    return DOMPurify.sanitize(content);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search and Tabs */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search tasks... (min 2 characters)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          error={!!searchError || (search.trim().length === 1)}
          helperText={searchError || (search.trim().length === 1 ? "Enter at least 2 characters to search" : "")}
          InputProps={{
            endAdornment: isSearching ? <CircularProgress size={20} /> : null,
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          inputProps={{ 
            maxLength: 50, 
            'aria-label': 'Search tasks'
          }}
        />
        
        <Tabs 
          value={currentTab} 
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
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
      </Stack>

      {/* Task List */}
      {displayTasks.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          {useBackendSearch && search.trim() 
            ? `No tasks found matching "${search}"`
            : tasks.length === 0 
              ? "No tasks yet."
              : "No tasks matching your filter"
          }
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {displayTasks.map(task => (
            <Card 
              key={task.id} 
              variant="outlined"
              sx={{ 
                cursor: currentTab === 0 ? 'pointer' : 'default',
                '&:hover': {
                  bgcolor: currentTab === 0 ? 'action.hover' : undefined
                }
              }}
              onClick={currentTab === 0 ? () => handleTaskClick(task) : undefined}
            >
              <CardContent sx={{ pb: '16px !important' }}>
                {/* Task Header with sanitized content */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ wordBreak: 'break-word', flex: 1, mr: currentTab === 0 ? 2 : 0 }}>
                    {sanitizeContent(task.title)}
                  </Typography>
                  {currentTab === 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                      sx={{ minWidth: '80px', flexShrink: 0 }}
                    >
                      Claim
                    </Button>
                  )}
                </Box>
                
                {/* Description Preview with sanitized content */}
                {task.description && (
                  <Typography 
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {sanitizeContent(task.description)}
                  </Typography>
                )}

                {/* Metadata with sanitized content */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip 
                    icon={<TimeIcon />} 
                    label={new Date(task.created_at).toLocaleString()} 
                    variant="outlined" 
                    size="small" 
                  />
                  {task.assignee && (
                    <Chip 
                      icon={<PersonIcon />} 
                      label={`Assigned: ${sanitizeContent(task.assignee)}`}
                      color="primary" 
                      size="small" 
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Task Dialog */}
      <TaskDialog 
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onClaim={onClaim}
      />
    </Box>
  );
};