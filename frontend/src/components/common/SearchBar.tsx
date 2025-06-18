import { TextField, Box } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = 'Search...' }: SearchBarProps) => (
  <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
    <TextField
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      InputProps={{
        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
      }}
    />
  </Box>
);
