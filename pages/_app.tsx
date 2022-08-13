import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Header from '../components/Header'

function MyApp({ Component, pageProps }: AppProps) {
  const links = [
    {
      href: '/',
      text: 'Home',
    },
    {
      href: '/create-nft',
      text: 'Sell NFT',
    },
    {
      href: '/my-nfts',
      text: 'My NFTs',
    },
    {
      href: '/dashboard',
      text: 'Dashboard',
    }
  ];
  return (
    <div>
      <Header links={links}/>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
