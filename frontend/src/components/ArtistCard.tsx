import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ArtistCardProps {
  id: string;
  name: string;
  image: string;
  isFunded: boolean;
  genre?: string;
  followers: number;
  popularity: number;
  lpTokens: number;
  lpBalance: number;
}

const ArtistCard = ({ 
  id, 
  name, 
  image, 
  isFunded, 
  genre = "Alternative Rock",
  followers,
  popularity,
  lpTokens,
  lpBalance
}: ArtistCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="group overflow-hidden bg-card border-border shadow-soft hover:shadow-warm transition-all duration-300 hover:scale-105">
      <div className="aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-xl text-foreground">{name}</h3>
          <div className="flex-shrink-0">
            {isFunded ? (
              <div className="flex items-center space-x-1 text-accent text-xs font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Pool Active</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-muted-foreground text-xs font-medium">
                <Circle className="w-4 h-4" />
                <span>No Pool</span>
              </div>
            )}
          </div>
        </div>
        
        <Badge variant="secondary" className="mb-4">
          {genre}
        </Badge>
        
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-muted-foreground text-xs mb-1">Followers</div>
            <div className="font-semibold text-foreground">{followers.toLocaleString()}</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-muted-foreground text-xs mb-1">Popularity</div>
            <div className="font-semibold text-foreground">{popularity}/100</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-muted-foreground text-xs mb-1">LP Tokens</div>
            <div className="font-semibold text-foreground">{lpTokens.toFixed(2)}</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-muted-foreground text-xs mb-1">LP Balance</div>
            <div className="font-semibold text-foreground">${lpBalance.toFixed(2)}</div>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate(`/artist/${id}`)}
          className="w-full bg-gradient-sunset text-primary-foreground hover:opacity-90 transition-opacity border-none shadow-none"
        >
          {isFunded ? "View Investment" : "Fund Artist"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ArtistCard;