import { Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WalletDisplayProps {
  address?: string;
  lpTokens?: number;
}

const WalletDisplay = ({ 
  address = "0x1234...5678", 
  lpTokens = 127.50 
}: WalletDisplayProps) => {
  const shortenAddress = (addr: string) => {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="p-4 bg-gradient-warm border-none shadow-soft">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Wallet className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Wallet</div>
          <div className="font-medium text-sm">{shortenAddress(address)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">LP Tokens</div>
          <div className="font-bold text-primary">{lpTokens.toFixed(2)}</div>
        </div>
      </div>
    </Card>
  );
};

export default WalletDisplay;