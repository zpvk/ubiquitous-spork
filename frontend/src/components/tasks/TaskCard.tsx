import { Card, CardContent, Typography, Box } from '@mui/material';
import { Task } from '../../types/task';
import { TaskMetadata } from './TaskMetadata';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => (
  <Card 
    variant="outlined" 
    sx={{ 
      cursor: 'pointer',
      '&:hover': { bgcolor: 'action.hover' }
    }}
    onClick={() => onClick(task)}
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
      <TaskMetadata
        createdAt={task.created_at}
        assignee={task.assignee}
        className="mt-1"
      />
    </CardContent>
  </Card>
);
