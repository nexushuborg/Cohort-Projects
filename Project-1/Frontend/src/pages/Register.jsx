import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { registerUser } from "../api/authApi";
import useAuthStore from "../stores/authStore";

function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [serverError, setServerError] = useState("");

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const response = await registerUser(data);
      login(response.data);
      navigate(response.data.user.role === "organizer" ? "/organizer-dashboard" : "/");
    } catch (error) {
      setServerError(error.response?.data?.error?.message || "Could not create your account.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">

      <div className="mx-auto max-w-md">

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="text-center">

            <h1 className="text-3xl font-bold text-slate-900">
              Create an Account
            </h1>

            <p className="mt-2 text-slate-600">
              Join EventHub and discover amazing events.
            </p>

          </div>


          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
          >

            <div>

              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                {...register("name", {
                  required: "Name is required.",
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}

            </div>


            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Please enter a valid email address.",
                  },
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}

            </div>


            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Create a password"
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters.",
                  },
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}

            </div>


            <div>

              <label
                htmlFor="role"
                className="block text-sm font-medium text-slate-700"
              >
                Account Type
              </label>

              <select
                id="role"
                {...register("role", {
                  required: "Please select an account type.",
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              >

                <option value="">
                  Select account type
                </option>

                <option value="attendee">
                  Attendee
                </option>

                <option value="organizer">
                  Organizer
                </option>

              </select>

              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}

            </div>


            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating…" : "Create Account"}
            </button>

            {serverError && (
              <p className="mt-2 text-sm text-red-600">{serverError}</p>
            )}

          </form>


          <p className="mt-6 text-center text-sm text-slate-600">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-medium text-slate-900 hover:underline"
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;
