import ShortcutKeyDTO from "App/data-transfer-objects/shortcut-key.dto";

const shortcutKeys: Omit<
  ShortcutKeyDTO,
  | 'id'
  | 'user_id'
  | 'user'
  | 'system_id'
  | 'created_at'
  | 'updated_at'
  >[] = [
  {
    key: 'search-bar',
    key_combination: 'f1',
    title: 'Search Bar',
    description: '—'
  },
  {
    key: 'place-order',
    key_combination: 'f2',
    title: 'Place Order',
    description: '—'
  },
  // {
  //   key: 'add-payment',
  //   key_combination: 'f3',
  //   title: 'Add Payment',
  //   description: '—'
  // },
  {
    key: 'cancel-order',
    key_combination: 'f4',
    title: 'Cancel Order',
    description: '—'
  },
  {
    key: 'collapse-navigation',
    key_combination: 'ctrl+`',
    title: 'Collapse Navigation',
    description: '—'
  },
  {
    key: 'log-out',
    key_combination: 'ctrl+l',
    title: 'Logout',
    description: '—'
  },
];

export default shortcutKeys;
