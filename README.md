
# 🧮 Portfolio Rebalancer with SideShift.ai Integration

A non-custodial crypto dashboard built with Next.js 14 (App Router) that helps users visualize their portfolio and rebalance it using real-time swap quotes from [SideShift.ai](https://sideshift.ai). Connect your wallet, set your target allocation, and rebalance in one click — all without giving up custody.

---

## 🚀 Features

- 🔐 **Wallet Connection** via [Wagmi](https://wagmi.sh/) + [RainbowKit](https://www.rainbowkit.com/)
- 📊 **Portfolio Snapshot** with current asset allocation
- 🎯 **Target Allocation Input** to define your ideal portfolio mix
- 🔁 **Rebalance Suggestions** using SideShift quotes
- 💸 **Affiliate Monetization** via SideShift affiliate ID
- 🧠 **Modular Architecture** for easy extension and customization

---

## 🧱 Tech Stack

| Layer        | Tools & Libraries                          |
|--------------|--------------------------------------------|
| Framework    | Next.js 14 (App Router, TypeScript)        |
| Wallet       | Wagmi, RainbowKit                          |
| Styling      | Tailwind CSS                               |
| API Calls    | Axios, native `fetch`                      |
| Backend      | Next.js API Routes (`app/api/`)            |
| Integration  | SideShift.ai `/quotes` and `/shift` APIs   |

---

## 📦 Installation

```bash
git clone https://github.com/your-username/portfolio-rebalancer.git
cd portfolio-rebalancer
npm install
```


🔐 Environment Variables
Create a .env.local file in the root:
```
SIDESHIFT_SECRET=your-sideshift-secret
SIDESHIFT_AFFILIATE_ID=your-affiliate-id
```

🧪 Development
```
npm run dev
```
Visit http://localhost:3000 to view the app.

🧠 Architecture Overview

```
src/
├── app/                     # App Router pages and layout
│   ├── page.tsx            # Main dashboard
│   └── api/quote/route.ts  # Secure SideShift quote handler
├── components/             # UI components
├── lib/                    # Business logic (rebalance.ts, sideshift.ts)
├── types/                  # Shared TypeScript interfaces
├── utils/                  # Helpers and formatters

```
✨ How It Works
- Connect your wallet
- App fetches current balances (mocked or via RPC)
- Define your target allocation
- App compares current vs target
- Suggests swaps using SideShift /quotes
- (Optional) Execute swaps via /shift endpoint

💰 Monetization
Add your affiliateId to all SideShift API calls to earn commission on every swap. You can adjust commissionRate to optimize user pricing.

📈 Future Enhancements
- ✅ Live balance fetch via Covalent or Alchemy
- ✅ Swap execution via /shift
- ✅ AI for suggesting Swaps
- ✅ Telegram bot integration
- ✅ Multi-chain support
