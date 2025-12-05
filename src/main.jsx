import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { basePath } from './context/constants';
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')).render(<StrictMode>
    <BrowserRouter basename={basePath}>
      <ToastContainer
           position="top-right"
           autoClose={5000}
           hideProgressBar={false}
           newestOnTop={false}
           closeOnClick
           rtl={false}
           pauseOnFocusLoss
           draggable
           pauseOnHover
           theme="light"
           style={{
             zIndex: 9999,
             fontSize: '14px'
           }}
         />
      <App />
    </BrowserRouter>
  </StrictMode>);