import React, { createContext, useMemo, useState } from 'react';

interface ISearchContext {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
}

export const SearchContext = createContext<Partial<ISearchContext>>({});

export default function SearchProvider({ children }: React.PropsWithChildren) {
  const [searchText, setSearchText] = useState('');

  const value = useMemo(
    () => ({
      searchText,
      setSearchText,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchText]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
