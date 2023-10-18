import React, { createContext, useMemo, useState } from 'react';
import str from 'string-sanitizer';
import debounce from 'lodash.debounce';

interface ISearchContext {
  searchText: string;
  setSearchText: (text: string) => void;
}

export const SearchContext = createContext<Partial<ISearchContext>>({});

export default function SearchProvider({ children }: React.PropsWithChildren) {
  const [searchText, setSearchText] = useState('');

  const debouncedSetSearchText = (text: string) =>
    setSearchText(str.sanitize.keepSpace(text));

  const value = useMemo(
    () => ({
      searchText,
      setSearchText: debouncedSetSearchText,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchText]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
