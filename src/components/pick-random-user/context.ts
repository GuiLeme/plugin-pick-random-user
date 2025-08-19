import { createContext } from 'react';
import { FilterOptionsType } from './types';

interface FilterOptionsContextType {
  filterOptions: FilterOptionsType;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptionsType>>
}

export const FilterOptionsContext = createContext<FilterOptionsContextType>({
  filterOptions: {
    includeModerators: false,
    includePresenter: false,
    includePickedUsers: false,
  },
  setFilterOptions: () => {},
});
