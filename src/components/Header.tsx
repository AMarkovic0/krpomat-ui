import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, LayoutDashboard } from "lucide-react";

export const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.setItem("isAuth", "false");
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full bg-background border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-4">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            
            {isAdmin && (
              <Button
                variant={location.pathname === "/users" ? "default" : "ghost"}
                onClick={() => navigate("/users")}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Users
              </Button>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {(localStorage.getItem("isAuth") === "true") ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {localStorage.getItem("username")}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};