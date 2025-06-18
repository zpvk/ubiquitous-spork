import { Tabs, Tab } from '@mui/material';
import { Person as PersonIcon, Assignment as AssignmentIcon } from '@mui/icons-material';

interface TaskTabsProps {
  value: number;
  onChange: (value: number) => void;
  todoCount: number;
  inProgressCount: number;
  className?: string;
}

export const TaskTabs = ({ value, onChange, todoCount, inProgressCount, className }: TaskTabsProps) => (
  <Tabs 
    value={value} 
    onChange={(_, v) => onChange(v)} 
    className={className}
  >
    <Tab 
      icon={<AssignmentIcon />} 
      label={`Todo (${todoCount})`} 
      iconPosition="start"
    />
    <Tab 
      icon={<PersonIcon />} 
      label={`In Progress (${inProgressCount})`} 
      iconPosition="start"
    />
  </Tabs>
);
