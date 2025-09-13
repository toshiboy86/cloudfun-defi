import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Music, Users, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WalletDisplay from "@/components/WalletDisplay";
import { useToast } from "@/hooks/use-toast";

// Mock artist data
const artistData: Record<string, any> = {
  "1": {
    name: "Luna Vista",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop",
    description: "Dreamy indie rock with ethereal vocals and shimmering guitars that capture the essence of golden hour. Luna Vista's music transports listeners to a world of sunset drives and coastal dreams.",
    genre: "Indie Rock",
    totalFunded: 45780.50,
    interestEarned: 2340.25,
    totalFans: 127,
    userLPTokens: 127.50,
    biography: "Formed in the hills of Malibu, Luna Vista emerged from the vibrant California music scene with a sound that perfectly captures the golden state's dreamy atmosphere. Their debut album 'Sunset Sessions' received critical acclaim and established them as pioneers of the neo-psychedelic movement.",
    upcomingProjects: [
      "New EP 'Ocean Dreams' - Recording",
      "West Coast Summer Tour 2024",
      "Music Video for 'California Nights'"
    ]
  },
  "2": {
    name: "Desert Bloom",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    description: "Soulful folk melodies inspired by the vast landscapes of the American Southwest.",
    genre: "Folk",
    totalFunded: 0,
    interestEarned: 0,
    totalFans: 0,
    userLPTokens: 0,
    biography: "Desert Bloom draws inspiration from the vast expanses of the American Southwest, creating haunting folk melodies that speak to the soul. Their music tells stories of wanderers, dreamers, and the timeless beauty of desert landscapes.",
    upcomingProjects: [
      "Debut Album 'Mojave Sessions'",
      "Southwest Acoustic Tour",
      "Collaboration with Native American artists"
    ]
  }
};

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fundAmount, setFundAmount] = useState("");

  const artist = artistData[id || "1"];

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artist Not Found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleFund = () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid funding amount",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Funding Successful! 🎉",
      description: `You've invested $${fundAmount} USDC in ${artist.name}`,
    });
    
    setFundAmount("");
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate("/")}
                className="bg-background/50"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-sunset rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
                  FanVest Protocol
                </h1>
              </div>
            </div>
            <WalletDisplay lpTokens={artist.userLPTokens} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Side - Artist Info */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="w-64 h-64 mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-warm mb-6">
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-4xl font-bold mb-2 text-foreground">{artist.name}</h1>
              <p className="text-accent font-medium text-lg mb-4">{artist.genre}</p>
              <p className="text-muted-foreground leading-relaxed">{artist.description}</p>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-soft">
              <CardHeader>
                <CardTitle className="text-foreground">Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {artist.biography}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-soft">
              <CardHeader>
                <CardTitle className="text-foreground">Upcoming Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {artist.upcomingProjects.map((project: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <span>{project}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Funding Info */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-soft">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    ${artist.totalFunded.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Funded</div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-soft">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    ${artist.interestEarned.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Interest Earned</div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-soft">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-secondary-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {artist.totalFans.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Fans</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-sunset text-primary-foreground shadow-warm">
                <CardContent className="p-6 text-center">
                  <Music className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold mb-1">
                    {artist.userLPTokens.toFixed(2)}
                  </div>
                  <div className="text-sm opacity-90">Your LP Tokens</div>
                </CardContent>
              </Card>
            </div>

            {/* Funding Interface */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-soft">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Fund This Artist</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-muted-foreground">
                    Amount (USDC)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="text-lg font-medium"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your funds will be:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Deposited into Aave to earn interest</li>
                    <li>• Available for the artist to claim</li>
                    <li>• Converted to LP tokens representing your share</li>
                    <li>• Eligible for future streaming royalties</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleFund}
                  className="w-full bg-gradient-sunset text-primary-foreground hover:opacity-90 transition-opacity text-lg py-6"
                  disabled={!fundAmount || parseFloat(fundAmount) <= 0}
                >
                  Fund Artist
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDetail;