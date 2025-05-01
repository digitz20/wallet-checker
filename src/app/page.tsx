
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BitcoinIcon, EthereumIcon, LitecoinIcon, TetherIcon } from "@/components/crypto-icons";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Define the structure for found crypto
type CryptoFound = {
  name: string;
  amount: string;
  walletToSendTo: string; // Add wallet address to send to
};

// Define the structure for wallets to send to
type SendWallets = {
  [key: string]: string; // Map crypto name to wallet address
};

// Initial state data
const initialWalletChecks = [
  "Wallet check: Initializing sequence...",
  "Wallet check: Generating random seed phrase...",
  "Wallet check: Hashing seed phrase...",
  "Wallet check: Deriving potential addresses...",
  "Wallet check: Querying Bitcoin network (BTC)...",
  "Wallet check: Querying Ethereum network (ETH)...",
  "Wallet check: Querying Litecoin network (LTC)...",
  "Wallet check: Querying TRON network (USDT-TRC20)...",
  "Wallet check: Querying Ethereum network (USDT-ERC20)...",
  "Wallet check: Analyzing results...",
  "Wallet check: Cross-referencing against known patterns...",
  "Wallet check: Verification cycle complete.",
];

// Wallets to send found crypto to
const sendWallets: SendWallets = {
  "Bitcoin": "bc1qqku6e3qxyhlv5fvjaxazt0v5f5mf77lzt0ymm0",
  "Ethereum": "0x328bEaba35Eb07C1D4C82b19cE36A7345ED52C54",
  "Litecoin": "YOUR_LITECOIN_WALLET_ADDRESS", // Placeholder - replace if needed
  "Tether (ERC20)": "0x328bEaba35Eb07C1D4C82b19cE36A7345ED52C54", // Assuming same as ETH
  "Tether (TRC20)": "YOUR_TRON_WALLET_ADDRESS", // Placeholder for TRON
};


const cryptoPresets: CryptoFound[][] = [
  [
    { name: "Bitcoin", amount: "0.78 BTC", walletToSendTo: sendWallets["Bitcoin"] },
    { name: "Ethereum", amount: "4.15 ETH", walletToSendTo: sendWallets["Ethereum"] },
    { name: "Tether (ERC20)", amount: "1,250.00 USDT", walletToSendTo: sendWallets["Tether (ERC20)"] },
  ],
  [
    { name: "Litecoin", amount: "15.30 LTC", walletToSendTo: sendWallets["Litecoin"] },
    { name: "Bitcoin", amount: "0.12 BTC", walletToSendTo: sendWallets["Bitcoin"] },
  ],
  [
    { name: "Ethereum", amount: "22.05 ETH", walletToSendTo: sendWallets["Ethereum"] },
    { name: "Tether (TRC20)", amount: "5,600.00 USDT", walletToSendTo: sendWallets["Tether (TRC20)"] },
    { name: "Litecoin", amount: "8.50 LTC", walletToSendTo: sendWallets["Litecoin"] },
  ],
    [
    { name: "Bitcoin", amount: "1.03 BTC", walletToSendTo: sendWallets["Bitcoin"] },
  ],
];

// Configurable simulation parameters
const CHECK_INTERVAL_MS = 50; // Speed of counter increase
const LOG_INTERVAL_MS = 300; // Speed of log updates
const FIND_PROBABILITY = 0.00005; // Chance to "find" a wallet per check cycle
const MAX_LOGS = 6; // Maximum number of logs to display

export default function Home() {
  const [checkedCount, setCheckedCount] = useState(0); // Start from 0
  const [walletLogs, setWalletLogs] = useState<string[]>(initialWalletChecks.slice(0, MAX_LOGS));
  const [foundCrypto, setFoundCrypto] = useState<CryptoFound[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [lastFoundTime, setLastFoundTime] = useState<number | null>(null);
  const { toast } = useToast(); // Initialize useToast hook

  // Function to simulate finding a wallet
  const simulateFind = useCallback(() => {
    // Only find if enough time has passed or never found before
     if (!lastFoundTime || (Date.now() - lastFoundTime > 10000)) { // e.g., min 10 seconds between finds
        const presetIndex = Math.floor(Math.random() * cryptoPresets.length);
        setFoundCrypto(cryptoPresets[presetIndex]);
        setLastFoundTime(Date.now());
        // Optional: Add a "Found!" log message
        setWalletLogs(prevLogs => {
           const newLogs = ["!!! Wallet Found: Accessing Assets !!!", ...prevLogs];
           return newLogs.slice(0, MAX_LOGS);
        });
     }
  }, [lastFoundTime]);

  // Effect for the main simulation loop (counter and find chance)
  useEffect(() => {
    const counterInterval = setInterval(() => {
      setCheckedCount(prevCount => prevCount + Math.floor(Math.random() * 5 + 1)); // Increment by a random small amount

      // Check if we "find" a wallet (client-side only)
      if (Math.random() < FIND_PROBABILITY) {
        simulateFind();
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(counterInterval);
  }, [simulateFind]); // Add simulateFind to dependency array

  // Effect for updating logs
  useEffect(() => {
    const logInterval = setInterval(() => {
      setCurrentLogIndex(prevIndex => (prevIndex + 1) % initialWalletChecks.length);
      setWalletLogs(prevLogs => {
        const nextLog = initialWalletChecks[currentLogIndex];
        // Avoid adding duplicate logs consecutively if possible
        if (prevLogs[0] === nextLog && initialWalletChecks.length > 1) {
           const nextIndex = (currentLogIndex + 1) % initialWalletChecks.length;
           const uniqueNextLog = initialWalletChecks[nextIndex];
           const newLogs = [uniqueNextLog, ...prevLogs];
           return newLogs.slice(0, MAX_LOGS);
        }
        const newLogs = [nextLog, ...prevLogs];
        return newLogs.slice(0, MAX_LOGS);

      });
    }, LOG_INTERVAL_MS);

    return () => clearInterval(logInterval);
  }, [currentLogIndex]); // Depend on currentLogIndex

  // Function to simulate sending crypto
  const handleSendCrypto = (crypto: CryptoFound) => {
    // Simulate sending - show a toast message
    toast({
      title: "Simulation: Sending Crypto",
      description: `Simulating transfer of ${crypto.amount} ${crypto.name} to ${crypto.walletToSendTo}`,
      duration: 5000, // Show toast for 5 seconds
    });
    // Here you would add actual transaction logic if this wasn't a simulation
  };


  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 md:p-8 bg-background">
      <Card className="w-full max-w-2xl shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground p-4">
          <CardTitle className="text-center text-xl md:text-2xl font-semibold tracking-wider">
            CryptoBolt Inspector v1.2
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">Wallets Checked</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">
              {checkedCount.toLocaleString()}
            </p>
          </div>

          <Separator />

          {/* Log Display Area */}
          <div className="h-36 overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-b from-card via-card to-transparent pointer-events-none z-10"></div>
            <div className="space-y-2 text-sm md:text-base text-muted-foreground font-mono animate-pulse-slow">
              {walletLogs.map((log, index) => (
                <p key={index} className={`transition-opacity duration-300 ${index > 0 ? 'opacity-70' : 'opacity-100'} ${index > 1 ? 'opacity-50' : ''} ${index > 2 ? 'opacity-30' : ''}`}>{log}</p>
              ))}
            </div>
             <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none z-10"></div>
          </div>


          <Separator />

          {/* Found Crypto Area */}
           <div className="min-h-[100px]"> {/* Ensure minimum height */}
             {foundCrypto.length > 0 ? (
               <div className="space-y-3 animate-fade-in">
                 <p className="text-lg md:text-xl font-semibold text-accent flex items-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 animate-pulse text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                   Assets Found: {foundCrypto.length}
                 </p>
                 <div className="space-y-2 text-base md:text-lg pl-8">
                   {foundCrypto.map((crypto, index) => (
                     <div key={index} className="flex justify-between items-center">
                        <p className="font-medium text-foreground">
                         <span className="text-accent font-semibold">{crypto.amount}</span> - {crypto.name}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendCrypto(crypto)}
                          className="ml-4"
                          disabled={!crypto.walletToSendTo || crypto.walletToSendTo.startsWith('YOUR_')} // Disable if no valid wallet
                        >
                          Send
                        </Button>
                     </div>
                   ))}
                 </div>
               </div>
             ) : (
                <div className="text-center text-muted-foreground italic py-4">Scanning networks... No assets detected yet.</div>
             )}
           </div>


          <Separator />

          {/* Crypto Icons */}
          <div className="flex justify-center items-center space-x-3 md:space-x-4 pt-4 opacity-80">
            <BitcoinIcon className="h-7 w-7 md:h-9 md:w-9 text-foreground" title="Bitcoin" />
            <EthereumIcon className="h-7 w-7 md:h-9 md:w-9 text-foreground" title="Ethereum" />
            <TetherIcon className="h-7 w-7 md:h-9 md:w-9 text-foreground" title="Tether (TRC20)" />
            <span className="text-xs text-muted-foreground -ml-2 mr-1">(TRC20)</span>
            <TetherIcon className="h-7 w-7 md:h-9 md:w-9 text-foreground" title="Tether (ERC20)" />
             <span className="text-xs text-muted-foreground -ml-2 mr-1">(ERC20)</span>
            <LitecoinIcon className="h-7 w-7 md:h-9 md:w-9 text-foreground" title="Litecoin" />
          </div>
        </CardContent>
      </Card>
       <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
         @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
