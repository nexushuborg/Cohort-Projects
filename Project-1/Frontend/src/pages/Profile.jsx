import { Link } from "react-router-dom";

function Profile() {
  
  const user = {
    name: "Abhirup Kovid",
    email: "abhirup@example.com",
    phone: "+91 98765 43210",
    role: "User",
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">

          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            My Profile
          </h1>

          <p className="mt-3 text-slate-600">
            View your account information.
          </p>

        </div>
      </section>


      
      <section className="mx-auto max-w-3xl px-6 py-12">

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

          
          <div className="flex items-center gap-5 border-b border-slate-200 pb-8">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
              {user.name.charAt(0)}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {user.name}
              </h2>

              <p className="mt-1 text-slate-500">
                {user.email}
              </p>
            </div>

          </div>


          
          <div className="mt-8">

            <h3 className="text-xl font-bold text-slate-900">
              Account Information
            </h3>

            <div className="mt-6 space-y-5">

              <div>
                <p className="text-sm text-slate-500">
                  Full Name
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {user.name}
                </p>
              </div>


              <div>
                <p className="text-sm text-slate-500">
                  Email Address
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {user.email}
                </p>
              </div>


              <div>
                <p className="text-sm text-slate-500">
                  Phone Number
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {user.phone}
                </p>
              </div>


              <div>
                <p className="text-sm text-slate-500">
                  Account Role
                </p>

                <span className="mt-1 inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {user.role}
                </span>
              </div>

            </div>

          </div>


          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">

            <Link
              to="/my-bookings"
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700"
            >
              My Bookings
            </Link>

            <Link
              to="/my-tickets"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              My Tickets
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Profile;