import { useEffect, useState } from "react";
import api from "../../api/axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users");

        const data = response.data?.data || [];

        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load users:", err);

        setError(
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const getRoleStyle = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";

      case "host":
        return "bg-blue-100 text-blue-700";

      case "guest":
      default:
        return "bg-green-100 text-green-700";
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500" />

          <p className="mt-4 text-sm text-gray-500">
            Loading users...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div>
          <p className="text-sm font-semibold text-rose-500">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Users
          </h1>

          <p className="mt-2 text-gray-500">
            View all registered users on RentalHub.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Users */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">
              All Users
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {users.length} registered user
              {users.length !== 1 ? "s" : ""}
            </p>
          </div>

          {users.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-5xl">👥</div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No users found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                There are currently no registered users.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      User
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Email
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Role
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 font-semibold text-rose-600">
                            {user.name
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name || "Unknown"}
                            </p>

                            <p className="text-xs text-gray-400">
                              ID: {user.id}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-gray-600">
                        {user.email || "N/A"}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRoleStyle(
                            user.role
                          )}`}
                        >
                          {user.role || "guest"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-gray-600">
                        {user.phone || "N/A"}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-gray-600">
                        {user.created_at
                          ? new Date(
                              user.created_at
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}

export default Users;
