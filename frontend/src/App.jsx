import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import BookmarksPage from "./pages/bookmark/BookmarksPage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const { data: authUser, isLoading } = useQuery({
    // For caching (if called again later doesn't need look at server)
    // Can also refer to it later by the unique query key to get userdata
    queryKey: ["authUser"],
    queryFn: async() => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        // If unauthorised (empty obj return) return falsy
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log("Authuser is here: ", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg"/>
      </div>
    )
  }
  return (
		<div className='flex max-w-6xl mx-auto'>
      {/* Common components (not wrapped in routes) */}
      {authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/"/>} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/"/>} />
        <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to="/login"/>} />
        <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to="/login"/>} />
        <Route path='/bookmarks/:username' element={authUser ? <BookmarksPage /> : <Navigate to="/login"/>} />
			</Routes>
      {authUser && <RightPanel />}
      <Toaster />
		</div>
  )
}

export default App
