import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LabInventorySystem from './LabInventorySystem.jsx'
import LabInventorySystemDemo from './Demo.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LabInventorySystemDemo />
  </StrictMode>,
)
