import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import PresenterNotes from './PresenterNotes';
import { PRESENTER_NOTES_PATH } from './presenterGuides';
import './styles.css';

const path = window.location.pathname.replace(/\/+$/, '') || '/';
const isNotes = path === PRESENTER_NOTES_PATH;

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isNotes ? <PresenterNotes /> : <App />}</StrictMode>,
);
