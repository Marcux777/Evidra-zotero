import './style.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { createUiTransport } from './transport';

const { bridge } = createUiTransport(window);
createRoot(document.getElementById('root')!).render(<App bridge={bridge} compact={new URLSearchParams(location.search).get('surface') === 'reader'}/>);
