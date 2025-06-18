import { useState } from 'react';
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
  Tab
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Person as PersonIcon, 
  AccessTime as TimeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import type { Task } from '../../types/task';
import { TaskDialog } from './TaskDialog';

interface Props {
  tasks: Task[];
  onClaim?: (id: string, assignee: string) => void;
}

export const TaskList = ({ tasks, onClaim }: Props) => {
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  // Filter tasks based on search
  const filteredTasks = tasks.filter(t => 
    (t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase()))
  );

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

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search and Tabs */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
          No tasks found
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
                {/* Task Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ wordBreak: 'break-word', flex: 1, mr: currentTab === 0 ? 2 : 0 }}>
                    {task.title}
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
                
                {/* Description Preview */}
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
                    {task.description}
                  </Typography>
                )}

                {/* Metadata */}
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
                      label={`Assigned: ${task.assignee}`}
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