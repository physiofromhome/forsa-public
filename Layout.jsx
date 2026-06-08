import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import CoinDetail from "./pages/CoinDetail";
import Patterns from "./pages/Patterns";

function Protected({ children }) {
  const { authed } = useAuth();
  return authed ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { authed } = useAuth();
  return authed ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicOnly><Auth mode="login" /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><Auth mode="register" /></PublicOnly>} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/markets" element={<Protected><Markets /></Protected>} />
            <Route path="/markets/:sym" element={<Protected><CoinDetail /></Protected>} />
            <Route path="/patterns" element={<Protected><Patterns /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
