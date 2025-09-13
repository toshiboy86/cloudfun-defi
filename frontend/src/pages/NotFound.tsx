import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-warm">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-sunset rounded-full flex items-center justify-center mx-auto">
          <Music className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-6xl font-bold bg-gradient-sunset bg-clip-text text-transparent">404</h1>
        <p className="text-xl text-muted-foreground">Oops! This page got lost in the grooves</p>
        <Button 
          onClick={() => window.location.href = "/"}
          className="bg-gradient-sunset text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Return to Artists
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
