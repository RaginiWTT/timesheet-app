import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResourceManagement from "./pages/ResourceManagement";
import Timesheet from "./pages/Timesheet";
import AddResource from "./pages/AddResource";
import UpdateResource from "./pages/UpdateResource";
import NotAuthorized from "./components/NotAuthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerManagement from "./pages/CustomerManagement";
import AddCustomer from "./pages/AddCustomer";
import ProjectManagement from "./pages/ProjectManagement";
import AddUpdateProject from "./pages/AddUpdateProject";
import ProjectTaskManagement from "./pages/ProjectTaskManagement";
import AddUpdateTask from "./pages/AddUpdateTask";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected / Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["1", "2"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Admin only pages */}
          <Route
            path="resource"
            element={
              <ProtectedRoute allowedRoles={["1"]}>
                <ResourceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="resource/add"
            element={
              <ProtectedRoute allowedRoles={["1"]}>
                <AddResource />
              </ProtectedRoute>
            }
          />

      
          <Route
            path="resource/update/:resourceId"
            element={
              <ProtectedRoute allowedRoles={["1"]}>
                <UpdateResource />
              </ProtectedRoute>
            }
          />

               <Route
            path="task/add"
            element={
              <ProtectedRoute allowedRoles={["1"]}>
                <AddUpdateTask />
              </ProtectedRoute>
            }
          />

      
          <Route
            path="task/update/:id"
            element={
              <ProtectedRoute allowedRoles={["1"]}>
                <AddUpdateTask />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="customer/add"
            element={
              <ProtectedRoute allowedRoles={["1"]}>
                <AddCustomer />
              </ProtectedRoute>
            }
          /> */}

               {/* Project add / update using same component */}
          <Route path="project/add" element={<AddUpdateProject />} />
          <Route path="project/update/:id" element={<AddUpdateProject />} />

          <Route
            path="customer/add"
            element={<AddCustomer />} // Add Mode
          />
          <Route
            path="customer/update/:id"
            element={<AddCustomer />} // Update Mode using same form
          />

          <Route
            path="customer"
            element={
              <ProtectedRoute allowedRoles={["1"]}>
                <CustomerManagement />
              </ProtectedRoute>
            }
          />

          
          <Route
            path="project"
            element={
              <ProtectedRoute allowedRoles={["1"]}>
                <ProjectManagement />
              </ProtectedRoute>
            }
          />

                 <Route
            path="task"
            element={
              <ProtectedRoute allowedRoles={["1"]}>
                <ProjectTaskManagement />
              </ProtectedRoute>
            }
          />

          {/* Pages for multiple roles */}
          <Route
            path="timesheet"
            element={
              <ProtectedRoute allowedRoles={["1", "2"]}>
                <Timesheet />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallbacks */}
        <Route path="*" element={<Login />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />
      </Routes>
    </Router>
  );
}

export default App;
