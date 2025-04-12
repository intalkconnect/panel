import { useUser } from "../../hooks/useUser";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
