import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AdminUpdates from "./AdminUpdates";
import AddUser from "./AddUser";
import Sidebar from "./Sidebar";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data.user);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Supprimer ?",
      text: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer !",
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/admin/delete-user/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Supprimé !", "L'utilisateur a été supprimé.", "success");
          fetchUsers();
        }
      } catch (error) {
        Swal.fire("Erreur", "Impossible de supprimer.", "error");
      }
    }
  };

  const toggleActivation = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/toggle-user/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Erreur activation:", err);
    }
  };

  const paginatedUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    
    <div className="p-6 bg-gray-100 min-h-screen">
     
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Admin</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Utilisateurs</h2>
            <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-zinc-400 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                  Ajouter utilisateur
            </button>

          </div>

         <div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {paginatedUsers.map((user) => (
        <tr key={user._id} className="hover:bg-gray-50 transition">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.role}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {user.isActive ? "Actif" : "Bloqué"}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
            <button
              onClick={() => toggleActivation(user._id)}
              className="inline-flex items-center px-3 py-1 bg-teal-700 hover:bg-teal-950 text-white text-xs font-medium rounded shadow"
            >
              {user.isActive ? "Bloquer" : "Activer"}
            </button>
            <button
              onClick={() => deleteUser(user._id)}
              className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded shadow"
            >
              Supprimer
            </button>
            <button
              onClick={() => setEditingUser(user)}
              className="inline-flex items-center px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded shadow"
            >
              Modifier
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


              {editingUser && (
  <AdminUpdates
    selectedUser={editingUser}
    onClose={() => setEditingUser(null)}
    onSave={fetchUsers}
  />
)}
{showAddModal && (
  <AddUser
    onClose={() => setShowAddModal(false)}
    onSave={fetchUsers}
  />
)}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Précédent
            </button>
            <span className="text-gray-600">
              Page {currentPage} sur {Math.ceil(users.length / usersPerPage)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  p < Math.ceil(users.length / usersPerPage) ? p + 1 : p
                )
              }
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
   
  );
};
export default AdminDashboard;
