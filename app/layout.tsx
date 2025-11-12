import './globals.css'
import Providers from './providers'

export const metadata = {
    title: 'Crypto - Balance',
    description: 'Rebalance your crypto portfolio using SideShift.ai'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <div className="min-h-screen">
                        <main className="container mx-auto px-4 py-8">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    )
}