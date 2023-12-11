import { ShortcutKeysContext } from "UI/providers/ShortcutKeysProvider";
import { useContext } from "react";

export default function useShortcutKeys() {
  const shortcutKey = useContext(ShortcutKeysContext);

  return shortcutKey;
}
