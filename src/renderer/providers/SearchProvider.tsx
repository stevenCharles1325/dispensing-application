import React, { createContext, useMemo, useState } from 'react';
import str from 'string-sanitizer';

interface ISearchContext {
  searchText: string;
  disabled: boolean;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  placeHolder: string;
  setPlaceHolder: React.Dispatch<React.SetStateAction<string>>;
  setSearchText: (text: string) => void;
}

export const SearchContext = createContext<Partial<ISearchContext>>({});

export default function SearchProvider({ children }: React.PropsWithChildren) {
  const [searchText, setSearchText] = useState('');
  const [placeHolder, setPlaceHolder] = useState('Search');
  const [disabled, setDisabled] = useState(false);

  const handleSearchText = (text: string) => {
    const txt = str.sanitize.keepSpace(text);
    setSearchText(txt);
  };

  const value = useMemo(
    () => ({
      searchText,
      disabled,
      setDisabled,
      placeHolder,
      setPlaceHolder,
      setSearchText: handleSearchText,
    }),
    [disabled, placeHolder, searchText]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
