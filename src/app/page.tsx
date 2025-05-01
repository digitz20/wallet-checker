import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BitcoinIcon, EthereumIcon, LitecoinIcon, TetherIcon } from "@/components/crypto-icons"; // Assuming icons are created in a separate file

export default function Home() {
  // Static data for wallet checks and found crypto
  const walletChecks = [
    "Wallet check: Validating address format...",
    "Wallet check: Querying blockchain ledger...",
    "Wallet check: Cross-referencing known lists...",
    "Wallet check: Analyzing transaction history...",
    "Wallet check: Checking against blacklist database...",
    "Wallet check: Final verification step...",
  ];

  const foundCrypto = [
    { name: "Bitcoin", amount: "0.78 BTC" },
    { name: "Ethereum", amount: "4.15 ETH" },
    { name: "Tether (ERC20)", amount: "1,250.00 USDT" },
    { name: "Litecoin", amount: "15.30 LTC" },
  ];

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 md:p-8 bg-background">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg p-4">
          <CardTitle className="text-center text-xl md:text-2xl font-semibold">
            BOLT365 VTH-90A
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              Checked: 488,737,851
            </p>
          </div>

          <Separator />

          <div className="space-y-2 text-sm md:text-base text-muted-foreground font-mono">
            {walletChecks.map((check, index) => (
              <p key={index}>{check}</p>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-lg md:text-xl font-semibold text-accent">
              Found: {foundCrypto.length}
            </p>
            <div className="space-y-1 text-base md:text-lg">
              {foundCrypto.map((crypto, index) => (
                <p key={index} className="font-medium text-foreground">
                  <span className="text-accent">{crypto.amount}</span> - {crypto.name}
                </p>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex justify-center items-center space-x-4 md:space-x-6 pt-4">
            <BitcoinIcon className="h-8 w-8 md:h-10 md:w-10 text-foreground" />
            <EthereumIcon className="h-8 w-8 md:h-10 md:w-10 text-foreground" />
            <TetherIcon className="h-8 w-8 md:h-10 md:w-10 text-foreground" />
            <span className="text-xs text-muted-foreground">(TRC20)</span>
            <TetherIcon className="h-8 w-8 md:h-10 md:w-10 text-foreground" />
             <span className="text-xs text-muted-foreground">(ERC20)</span>
            <LitecoinIcon className="h-8 w-8 md:h-10 md:w-10 text-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
