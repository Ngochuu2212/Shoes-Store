import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { TooltipProvider } from '~/components/ui/tooltip'
import './index.css'
import App from './App.jsx'

// Import Redux Provider và các cấu hình Persist
import { Provider } from 'react-redux'
import { store, persistor } from '~/redux/store'
import { PersistGate } from 'redux-persist/integration/react'

import { ChatProvider } from '~/contexts/ChatContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <TooltipProvider>
            <ChatProvider>
              <ToastContainer position="top-right" />
              <App />
            </ChatProvider>
          </TooltipProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
)
