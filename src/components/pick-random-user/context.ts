import { createContext } from 'react';
import { FilterOptionsType } from './types';

interface FilterOptionsContextType {
  filterOptions: FilterOptionsType;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptionsType>>
}

export const FilterOptionsContext = createContext<FilterOptionsContextType>({
  filterOptions: {
    skipModerators: true,
    skipPresenter: true,
    includePickedUsers: true,
  },
  setFilterOptions: () => {},
});
