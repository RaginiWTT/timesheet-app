import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResourceManagement from "./pages/ResourceManagement";
import Timesheet from "./pages/Timesheet";
import AddResource from "./pages/AddResource";
import UpdateResource from "./pages/UpdateResource";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected / Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="resource" element={<ResourceManagement />} />
          <Route path="timesheet" element={<Timesheet />} />
          <Route path="resource/add" element={<AddResource />} /> 
           <Route path="resource/update/:resourceId" element={<UpdateResource />} /> {/* ✅ New */}
        </Route>
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
