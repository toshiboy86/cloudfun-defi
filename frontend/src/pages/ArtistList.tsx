import { useState } from "react";
import WalletDisplay from "@/components/WalletDisplay";
import ArtistCard from "@/components/ArtistCard";
import { Input } from "@/components/ui/input";
import { Search, Music } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

// Mock data for artists from Spotify playlists
const mockArtists = [
  {
    id: "1",
    name: "Luna Vista",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
    isFunded: true,
    genre: "Indie Rock",
    followers: 45200,
    popularity: 78,
    lpTokens: 127.50,
    lpBalance: 2340.25
  },
  {
    id: "2", 
    name: "Desert Bloom",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
    isFunded: false,
    genre: "Folk",
    followers: 12800,
    popularity: 56,
    lpTokens: 0,
    lpBalance: 0
  },
  {
    id: "3",
    name: "Neon Mirage",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
    isFunded: true,
    genre: "Synth-Pop",
    followers: 89500,
    popularity: 84,
    lpTokens: 85.20,
    lpBalance: 1780.90
  },
  {
    id: "4",
    name: "Golden Coast",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
    isFunded: false,
    genre: "Surf Rock",
    followers: 23400,
    popularity: 62,
    lpTokens: 0,
    lpBalance: 0
  },
  {
    id: "5",
    name: "Velvet Canyon",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop", 
    isFunded: false,
    genre: "Psychedelic",
    followers: 8900,
    popularity: 49,
    lpTokens: 0,
    lpBalance: 0
  },
  {
    id: "6",
    name: "Sunset Drive",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
    isFunded: true,
    genre: "Yacht Rock",
    followers: 67200,
    popularity: 71,
    lpTokens: 92.75,
    lpBalance: 1556.40
  }
];

const ArtistList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArtists = mockArtists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-sunset rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
                FanVest Protocol
              </h1>
            </div>
            <WalletDisplay />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative py-24 px-6 text-center overflow-hidden"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/80" />
        <div className="relative z-10 container mx-auto">
          <h2 className="text-5xl font-bold mb-6 text-foreground">
            Discover Artists from Your
            <span className="block bg-gradient-sunset bg-clip-text text-transparent">
              Spotify Playlists
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Support your favorite musicians and share in their success through decentralized crowdfunding
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search artists or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/80 backdrop-blur-sm border-border"
            />
          </div>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtists.map((artist) => (
              <ArtistCard key={artist.id} {...artist} />
            ))}
          </div>
          
          {filteredArtists.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No artists found matching your search.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ArtistList;