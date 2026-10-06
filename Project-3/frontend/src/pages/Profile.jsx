import { useEffect, useState } from "react";
import api from "../api/axios";

function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        const user = res.data.data || res.data.user || res.data;
        setName(user.name || "");
        setEmail(user.email || "");
        setRole(user.role || "guest");
        setPhone(user.phone || "");
        setBio(user.bio || "");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load profile details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setUpdating(true);

    const profileData = {
      name: name,
      phone: phone,
      bio: bio,
    };

    api
      .put("/users/profile", profileData)
      .then((res) => {
        setMessage("Profile updated successfully!");
        alert("Profile updated successfully!");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to update profile.");
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="mx-auto max-w-2xl bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 font-bold text-2xl text-rose-600">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{name || "User Profile"}</h1>
            <p className="text-sm text-gray-500 capitalize">Role: {role}</p>
          </div>
        </div>

        {message && (
          <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address (Read Only)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full p-3 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell guests or hosts a little about yourself..."
              className="w-full p-3 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {updating ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;