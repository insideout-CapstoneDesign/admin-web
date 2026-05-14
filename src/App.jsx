import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import MainPage from './pages/MainPage/MainPage'
import LoginPage from './pages/LoginPage/LoginPage'
import SignupPage from './pages/SignupPage/SignupPage'
import ComponentTestPage from './pages/ComponentTestPage/ComponentTestPage'

function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/component-test" element={<ComponentTestPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App