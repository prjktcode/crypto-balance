//.components/ConnectWallet.ts

"use client";

import React, { useEffect, useState } from "react";

export default function ConnectWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setIsAvailable(true);
      // If already connected, read accounts
      (window as any).ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) setAccount(accounts[0]);
        })
        .catch(() => {});
      // Listen for account changes
      const handler = (accounts: string[]) => {
        setAccount(accounts.length ? accounts[0] : null);
      };
      (window as any).ethereum.on?.("accountsChanged", handler);
      return () => (window as any).ethereum.removeListener?.("accountsChanged", handler);
    } else {
      setIsAvailable(false);
    }
  }, []);

  const connect = async () => {
    try {
      const provider = (window as any).ethereum;
      if (!provider) {
        // Prompt user to install MetaMask
        window.open("https://metamask.io/download/", "_blank");
        return;
      }
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0] ?? null);
    } catch (err) {
      console.error("connect error", err);
    }
  };

  const disconnect = () => {
    // MetaMask doesn't provide a programmatic disconnect; we clear local state.
    setAccount(null);
  };

  if (!isAvailable) {
    return (
      <div>
        <button className="btn ghost" onClick={() => window.open("https://metamask.io/download/", "_blank")}>
          Install MetaMask
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {account ? (
        <>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Connected</div>
            <div style={{ fontWeight: 700 }}>{account.slice(0, 6)}...{account.slice(-4)}</div>
          </div>
          <button className="btn ghost" onClick={disconnect}>
            Disconnect
          </button>
        </>
      ) : (
        <button className="btn" onClick={connect}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}