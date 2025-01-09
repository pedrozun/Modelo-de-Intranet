import {
	createBrowserRouter,
	RouterProvider,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout/Layout";
import { LoginPage } from "./pages/Login";
import { NotFoundPage } from "./pages/NotFound";
import { protectedRoutes } from "./routes/protectedRoutes";
import { AnimatedBackground } from "./components/Background/AnimatedBackground";

function AnimatedRoutes() {
	const location = useLocation();

	return (
		<>
			<AnimatedBackground />
			<AnimatePresence
				mode="wait"
				initial={false}
			>
				<Routes
					location={location}
					key={location.pathname === "/login" ? "login" : "app"}
				>
					<Route
						path="/login"
						element={<LoginPage />}
					/>
					{protectedRoutes.map(({ path, Component, requiredGroup }) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute requiredGroup={requiredGroup}>
									<Layout>
										<Component />
									</Layout>
								</ProtectedRoute>
							}
						/>
					))}
					<Route
						path="*"
						element={
							<ProtectedRoute>
								<Layout>
									<NotFoundPage />
								</Layout>
							</ProtectedRoute>
						}
					/>
				</Routes>
			</AnimatePresence>
		</>
	);
}

export default function App() {
	return (
		<RouterProvider
			router={createBrowserRouter([
				{
					path: "*",
					element: (
						<ThemeProvider>
							<AuthProvider>
								<div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
									<AnimatedRoutes />
								</div>
							</AuthProvider>
						</ThemeProvider>
					),
				},
			])}
		/>
	);
}
