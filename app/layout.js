import './globals.css'

export const metadata = {
  title: 'Adyen Platform Scoping Questionnaire',
  description: 'Help us understand your platform requirements for Adyen integration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
