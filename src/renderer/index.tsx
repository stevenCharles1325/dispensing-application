import { createRoot } from 'react-dom/client';
import * as process from 'process';
import { RouterProvider } from 'react-router-dom';
import router from './App';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<RouterProvider router={router} />);
