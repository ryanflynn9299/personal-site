// This page renders the login form for the admin dashboard.
export default function LoginPage() {
  // A server action or client-side handler would be used here
  // to process the form submission and set a secure cookie.

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm text-center">
        {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
        <h1 className="font-heading text-2xl font-bold text-slate-50">
          // Mission Control Access
        </h1>
        <p className="mt-2 text-sm text-slate-400">Authorization Required</p>

        <form className="mt-8 space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter Access Code..."
              className="w-full rounded-md border-slate-600 bg-slate-800 px-4 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-sky-600 py-2 font-semibold text-white"
          >
            [ ENGAGE ]
          </button>
        </form>
      </div>
    </main>
  );
}
