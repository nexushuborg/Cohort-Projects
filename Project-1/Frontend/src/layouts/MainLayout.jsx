import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function MainLayout(){
    return(
        <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <Outlet />
      </main>
    </div>
    )
}

export default MainLayout