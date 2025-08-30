import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Splash, BusinessTypeSelection } from './features/onboarding/pages';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main route - Splash screen */}
        <Route path="/" element={<Splash />} />
        
        {/* Onboarding routes */}
        <Route path="/onboarding">
          <Route path="business-type" element={<BusinessTypeSelection />} />
        </Route>
      </Routes>
    </Router>
  );
}


