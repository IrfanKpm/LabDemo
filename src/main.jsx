import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LabInventorySystemDemo from './Demo.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LabInventorySystemDemo />
  </StrictMode>,
)
