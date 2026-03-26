import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Features from './components/Features';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import LinkNotFound from './pages/LinkNotFound';


function App() {
    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f0f1a' }}>
                <Navbar />
                <Routes>
                    <Route path="/" element={
                    
                    
        
                        <>
                            <Home />
                            <Features />
                            <Footer />
                        </>
                    } />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/link-not-found" element={<LinkNotFound />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
