
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BitcoinIcon, EthereumIcon, LitecoinIcon, TetherIcon } from "@/components/crypto-icons";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlayIcon, PauseIcon, SquareIcon, RotateCcwIcon } from 'lucide-react'; // Import icons

// Define the structure for found crypto
type CryptoFound = {
  name: string;
  amount: string;
  walletToSendTo: string; // Wallet address associated with the preset
};

// Define the structure for wallets to send to
type SendWallets = {
  [key: string]: string; // Map crypto name to the target wallet address
};

// Simulation status type
type SimulationStatus = 'stopped' | 'running' | 'paused';

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
// IMPORTANT: These addresses are used by handleSendCrypto.
const sendWallets: SendWallets = {
  "Bitcoin": "bc1qqku6e3qxyhlv5fvjaxazt0v5f5mf77lzt0ymm0",
  "Ethereum": "0x328bEaba35Eb07C1D4C82b19cE36A7345ED52C54",
  "Litecoin": "ltc1q7jl2al4caanc0k5zgsz3e399agfklk75nz46kf", // Updated Litecoin address
  "Tether (ERC20)": "0x328bEaba35Eb07C1D4C82b19cE36A7345ED52C54",
  "Tether (TRC20)": "THycvE5TKFTLv4nZsq8SJJCYhDmvysSLyk",
};

// Crypto presets that can be "found".
// Note: walletToSendTo here is based on the initial sendWallets state.
// handleSendCrypto dynamically uses the *current* sendWallets value.
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

// Assets to automatically send
const AUTO_SEND_ASSETS = ["Bitcoin", "Ethereum", "Tether (ERC20)", "Tether (TRC20)", "Litecoin"]; // Added Litecoin

export default function Home() {
  const [checkedCount, setCheckedCount] = useState(0); // Start from 0
  const [walletLogs, setWalletLogs] = useState<string[]>(initialWalletChecks.slice(0, MAX_LOGS));
  const [foundCrypto, setFoundCrypto] = useState<CryptoFound[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [lastFoundTime, setLastFoundTime] = useState<number | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>('stopped'); // Initial state is stopped
  const { toast } = useToast(); // Initialize useToast hook

  // Refs for intervals to clear them correctly
  const counterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);


  // Function to simulate sending crypto - Memoized with useCallback
  const handleSendCrypto = useCallback((crypto: CryptoFound) => {
    const targetWallet = sendWallets[crypto.name] || crypto.walletToSendTo; // Prioritize current sendWallets address
    const isAutoSend = AUTO_SEND_ASSETS.includes(crypto.name);

    toast({
      // Add "Auto-" prefix if it's an auto-sent asset
      title: `Simulation: ${isAutoSend ? 'Auto-Sending' : 'Sending'} Crypto`,
      description: `Simulating transfer of ${crypto.amount} ${crypto.name} to ${targetWallet}`, // Use targetWallet
      duration: 5000, // Show toast for 5 seconds
    });
    // Here you would add actual transaction logic if this wasn't a simulation
  }, [toast]); // Dependency: toast

  // Function to simulate finding a wallet - Memoized with useCallback
  const simulateFind = useCallback(() => {
    // Only find if enough time has passed or never found before
     if (!lastFoundTime || (Date.now() - lastFoundTime > 10000)) { // e.g., min 10 seconds between finds
        const presetIndex = Math.floor(Math.random() * cryptoPresets.length);
        const newlyFound = cryptoPresets[presetIndex];
        setFoundCrypto(newlyFound);
        setLastFoundTime(Date.now());

        // Automatically send configured assets if found and address is valid
        newlyFound.forEach(crypto => {
          if (AUTO_SEND_ASSETS.includes(crypto.name)) {
            const targetWallet = sendWallets[crypto.name];
            if (targetWallet && !targetWallet.startsWith('YOUR_')) { // Ensure address is not a placeholder
              setTimeout(() => handleSendCrypto(crypto), 500); // Delay slightly for UI update
            }
          }
        });

        // Optional: Add a "Found!" log message
        setWalletLogs(prevLogs => {
           const newLogs = ["!!! Wallet Found: Accessing Assets !!!", ...prevLogs];
           return newLogs.slice(0, MAX_LOGS);
        });
     }
  }, [lastFoundTime, handleSendCrypto]); // Dependencies: lastFoundTime, handleSendCrypto

   // Function to start intervals
   const startIntervals = useCallback(() => {
    if (counterIntervalRef.current) clearInterval(counterIntervalRef.current);
    counterIntervalRef.current = setInterval(() => {
      setCheckedCount(prevCount => prevCount + Math.floor(Math.random() * 5 + 1));
      if (Math.random() < FIND_PROBABILITY) {
        simulateFind();
      }
    }, CHECK_INTERVAL_MS);

    if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    logIntervalRef.current = setInterval(() => {
      setCurrentLogIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % initialWalletChecks.length;
        setWalletLogs(prevLogs => {
          const nextLog = initialWalletChecks[nextIndex];
          if (prevLogs[0] === nextLog && initialWalletChecks.length > 1) {
            const wrapIndex = (nextIndex + 1) % initialWalletChecks.length;
            const uniqueNextLog = initialWalletChecks[wrapIndex];
            const newLogs = [uniqueNextLog, ...prevLogs];
            return newLogs.slice(0, MAX_LOGS);
          }
          const newLogs = [nextLog, ...prevLogs];
          return newLogs.slice(0, MAX_LOGS);
        });
        return nextIndex; // Return the updated index
      });
    }, LOG_INTERVAL_MS);
  }, [simulateFind]); // Include simulateFind

  // Function to clear intervals
  const clearIntervals = () => {
    if (counterIntervalRef.current) clearInterval(counterIntervalRef.current);
    if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    counterIntervalRef.current = null;
    logIntervalRef.current = null;
  };

  // Effect to manage intervals based on simulationStatus
  useEffect(() => {
    if (simulationStatus === 'running') {
      startIntervals();
    } else {
      clearIntervals();
    }

    // Cleanup function to clear intervals when component unmounts or status changes
    return () => {
      clearIntervals();
    };
  }, [simulationStatus, startIntervals]); // Re-run when status or startIntervals changes


  // Button Handlers
  const handleStart = () => {
    if (simulationStatus === 'stopped') {
        setCheckedCount(0); // Reset count only when starting from stopped
        setFoundCrypto([]); // Clear found crypto
        setWalletLogs(initialWalletChecks.slice(0, MAX_LOGS)); // Reset logs
    }
    setSimulationStatus('running');
  };

  const handleStop = () => {
    setSimulationStatus('stopped');
    setCheckedCount(0); // Reset count
    setFoundCrypto([]); // Clear found crypto
    setWalletLogs(["Simulation stopped.", ...initialWalletChecks.slice(0, MAX_LOGS - 1)]); // Update logs
  };

  const handlePause = () => {
    setSimulationStatus('paused');
     setWalletLogs(prevLogs => {
           const newLogs = ["Simulation paused.", ...prevLogs];
           return newLogs.slice(0, MAX_LOGS);
        });
  };

  const handleContinue = () => {
    setSimulationStatus('running');
     setWalletLogs(prevLogs => {
           const newLogs = ["Simulation resumed.", ...prevLogs];
           return newLogs.slice(0, MAX_LOGS);
        });
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
           {/* Control Buttons */}
           <div className="flex justify-center space-x-2">
            <Button
              onClick={handleStart}
              disabled={simulationStatus === 'running'}
              variant="secondary"
            >
              <PlayIcon className="mr-2 h-4 w-4" /> Start
            </Button>
            <Button
              onClick={handlePause}
              disabled={simulationStatus !== 'running'}
              variant="secondary"
            >
              <PauseIcon className="mr-2 h-4 w-4" /> Pause
            </Button>
            <Button
              onClick={handleContinue}
              disabled={simulationStatus !== 'paused'}
              variant="secondary"
            >
              <PlayIcon className="mr-2 h-4 w-4" /> Continue
            </Button>
            <Button
              onClick={handleStop}
              disabled={simulationStatus === 'stopped'}
              variant="destructive"
            >
               <SquareIcon className="mr-2 h-4 w-4" /> Stop
            </Button>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">Wallets Checked</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">
              {checkedCount.toLocaleString()}
            </p>
             <p className="text-xs text-muted-foreground mt-1">
              Status: <span className={`font-medium ${
                simulationStatus === 'running' ? 'text-green-600' :
                simulationStatus === 'paused' ? 'text-yellow-600' :
                'text-red-600'
              }`}>{simulationStatus.charAt(0).toUpperCase() + simulationStatus.slice(1)}</span>
            </p>
          </div>

          <Separator />

          {/* Log Display Area */}
          <div className="h-36 overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-b from-card via-card to-transparent pointer-events-none z-10"></div>
            <div className={`space-y-2 text-sm md:text-base text-muted-foreground font-mono ${simulationStatus === 'running' ? 'animate-pulse-slow' : ''}`}>
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
                   {foundCrypto.map((crypto, index) => {
                     const targetWallet = sendWallets[crypto.name] || crypto.walletToSendTo;
                     const isAutoSent = AUTO_SEND_ASSETS.includes(crypto.name);
                     // Disable send button if auto-sent OR if target wallet is still a placeholder OR simulation is not running
                     const isSendDisabled = isAutoSent || !targetWallet || targetWallet.startsWith('YOUR_') || simulationStatus !== 'running';

                     return (
                       <div key={index} className="flex justify-between items-center">
                          <p className="font-medium text-foreground">
                           <span className="text-accent font-semibold">{crypto.amount}</span> - {crypto.name}
                           {/* Indicate if auto-sent */}
                           {isAutoSent && (
                              <span className="ml-2 text-xs text-green-600">(Auto-Sent)</span>
                           )}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendCrypto(crypto)}
                            className="ml-4"
                            disabled={isSendDisabled} // Use calculated disabled state
                          >
                            Send
                          </Button>
                       </div>
                     );
                   })}
                 </div>
               </div>
             ) : (
                <div className="text-center text-muted-foreground italic py-4">
                  {simulationStatus === 'stopped' ? 'Simulation stopped.' : 'Scanning networks... No assets detected yet.'}
                </div>
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
          /* Only apply pulse when running */
        }
         .running .animate-pulse-slow {
           animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
         }
      `}</style>
    </div>
  );
}
