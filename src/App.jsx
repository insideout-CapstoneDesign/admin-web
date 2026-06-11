import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import MainPage from './pages/MainPage/MainPage'
import LoginPage from './pages/LoginPage/LoginPage'
import SignupPage from './pages/SignupPage/SignupPage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import TenantDetailPage from './pages/TenantDetailPage/TenantDetailPage'
import BuildingDetailPage from './pages/BuildingDetailPage/BuildingDetailPage'
import MapEditorPage from './pages/MapEditorPage/MapEditorPage'

function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tenant/:tenantId" element={<TenantDetailPage />} />
                <Route path="/building/:buildingId" element={<BuildingDetailPage />} />
                <Route path="/building/:buildingId/floors/:floorId/editor" element={<MapEditorPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
