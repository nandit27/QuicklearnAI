import { useEffect, useRef, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Security from './components/Security'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import QuizGenerator from './pages/quiz'
import LoginModal from './components/LoginModal'
import SignUpModal from './components/SignUpModal'
import StudentDashboard from './components/StudentDashboard'
import ProfilePage from './components/ProfilePage'
import SummaryPage from './pages/SummaryPage'

function Home() {
  const contentRef = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    const sections = contentRef.current.querySelectorAll('section')
    sections.forEach((section) => observer.observe(section))

    return () => sections.forEach((section) => observer.unobserve(section))
  }, [])

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Hero />
      </div>
      <div ref={contentRef} className="space-y-32">
        <section className="opacity-0 transition-opacity duration-1000">
          <Features />
        </section>
        <section className="opacity-0 transition-opacity duration-1000">
          <Security />
        </section>
        <section className="opacity-0 transition-opacity duration-1000">
          <FAQ />
        </section>
      </div>
      <Footer />
    </>
  )
}


function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setShowLoginModal(false);
    setIsLoggedIn(true);
  };

  const NavbarWrapper = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
      if (isLoggedIn) {
        navigate('/quiz');
      }
    }, [isLoggedIn, navigate]);

    return (
      <Navbar 
        onLoginClick={() => setShowLoginModal(true)}
        onSignUpClick={() => setShowSignUpModal(true)}
        isLoggedIn={isLoggedIn}
      />
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <NavbarWrapper />
        <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/quiz" /> : <Home />} />
          <Route path="/dashboard" element={<ProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/quiz" element={<QuizGenerator />} />
        </Routes>
        
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          onSignUpClick={() => {
            setShowLoginModal(false);
            setShowSignUpModal(true);
          }}
          onLogin={handleLogin}
        />
        
        <SignUpModal 
          isOpen={showSignUpModal} 
          onClose={() => setShowSignUpModal(false)}
          onSwitchToLogin={() => {
            setShowSignUpModal(false);
            setShowLoginModal(true);
          }}
        />
      </div>
    </Router>
  );
}

export default App;