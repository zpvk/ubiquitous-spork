import { useMemo, useState } from 'react';
import type { Task } from '../types/task';

export const useTaskFiltering = (tasks: Task[]) => {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  const filteredTasks = useMemo(() => 
    tasks.filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description?.toLowerCase().includes(search.toLowerCase()))
    ),
    [tasks, search]
  );

  const todoTasks = useMemo(() => 
    filteredTasks.filter(t => t.status === 'todo'),
    [filteredTasks]
  );

  const inProgressTasks = useMemo(() => 
    filteredTasks.filter(t => t.status === 'inprogress'),
    [filteredTasks]
  );

  const displayTasks = tab === 0 ? todoTasks : inProgressTasks;

  return {
    tab,
    setTab,
    search,
    setSearch,
    todoTasks,
    inProgressTasks,
    displayTasks
  };
};
