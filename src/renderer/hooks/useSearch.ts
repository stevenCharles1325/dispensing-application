import { SearchContext } from 'UI/providers/SearchProvider';
import { useContext } from 'react';

export default function useSearch() {
  const search = useContext(SearchContext);

  return search;
}
