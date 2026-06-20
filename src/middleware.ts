import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // If we want additional logic per-route within /admin, we can add it here.
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access only if the user is logged in and has an ADMIN or MODERATOR role
        return !!token && (token.role === "ADMIN" || token.role === "MODERATOR");
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
