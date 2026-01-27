import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import LaunchList from './components/LaunchList'
import LaunchDetails from './components/LaunchDetails'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LaunchList />} />
        <Route path="/launch/:id" element={<LaunchDetails />} />
      </Routes>
    </Router>
  )
}

export default App
