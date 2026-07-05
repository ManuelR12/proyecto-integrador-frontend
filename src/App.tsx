import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import { ToastProvider } from "./contexts/ToastContext";
import PageTransition from "./components/layout/PageTransition";
import SkipLink from "./components/layout/SkipLink";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import UsernameSetup from "./pages/UsernameSetup";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Sala from "./pages/Sala";
import ProtectedRoute from "./components/layout/ProtectedRoute";

function App() {
	return (
		<AuthProvider>
			<UserProfileProvider>
				<ToastProvider>
					<BrowserRouter>
						<SkipLink />
						<main id="main-content">
							<PageTransition>
								<Routes>
									<Route path="/" element={<Home />} />
									<Route path="/login" element={<Login />} />
									<Route path="/registro" element={<Registro />} />
									<Route path="/username-setup" element={<UsernameSetup />} />
									<Route
										path="/dashboard"
										element={
											<ProtectedRoute>
												<Dashboard />
											</ProtectedRoute>
										}
									/>
									<Route
										path="/perfil"
										element={
											<ProtectedRoute>
												<Perfil />
											</ProtectedRoute>
										}
									/>
									<Route
										path="/sala/:id"
										element={
											<ProtectedRoute>
												<Sala />
											</ProtectedRoute>
										}
									/>
								</Routes>
							</PageTransition>
						</main>
					</BrowserRouter>
				</ToastProvider>
			</UserProfileProvider>
		</AuthProvider>
	);
}

export default App;
