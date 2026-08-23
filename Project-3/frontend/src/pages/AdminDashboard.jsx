import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [users, setUsers] = useState([]);

  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    bookings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const usersResponse = await axios.get(
        "http://localhost:5000/api/users"
      );

      const usersData = usersResponse.data.data || [];

      setUsers(usersData);

      const propertiesResponse = await axios.get(
        "http://localhost:5000/api/properties"
      );

      const bookingsResponse = await axios.get(
        "http://localhost:5000/api/bookings"
      );

      setStats({
        users: usersData.length,
        properties:
          propertiesResponse.data.data?.length || 0,
        bookings:
          bookingsResponse.data.data?.length || 0,
      });

    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500"></div>

          <p className="mt-4 text-gray-500">
            Loading dashboard...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Manage users and monitor your platform.
          </p>

        </div>

      </div>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* Users */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Users
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.users}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                👥
              </div>

            </div>

          </div>

          {/* Properties */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Properties
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.properties}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                🏠
              </div>

            </div>

          </div>

          {/* Bookings */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Bookings
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.bookings}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                📅
              </div>

            </div>

          </div>

        </div>

        {/* Users Table */}
        <div className="mt-10 overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <h2 className="text-xl font-bold text-gray-900">
              Registered Users
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              All users registered on the platform.
            </p>

          </div>

          {users.length === 0 ? (

            <div className="p-10 text-center text-gray-500">
              No users registered.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Name
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

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 font-semibold text-rose-600">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>

                          <span className="font-medium text-gray-900">
                            {user.name}
                          </span>

                        </div>

                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "host"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {user.role}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {user.phone || "N/A"}
                      </td>

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

      </main>

    </div>
  );
}

export default AdminDashboard;