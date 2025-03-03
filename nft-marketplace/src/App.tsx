import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Profile from "./pages/Profile";
import Hero from "./components/Hero";
import Create from "./pages/Create";

export default function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Hero />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/explore" element={<h1 className="text-center text-3xl mt-20">Explore NFTs</h1>} />
                        <Route path="/Create" element={<Create />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
