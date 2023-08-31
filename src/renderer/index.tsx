import { createRoot } from 'react-dom/client';
import App from './App';
import * as process from 'process';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
