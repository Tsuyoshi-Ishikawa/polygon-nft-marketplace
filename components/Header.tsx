import Link from 'next/link';

type Link = {
  href: string;
  text: string;
}

type Props = {
  links: Link[];
}

const Header = ({ links }: Props) => {
  return (
    <nav className="border-b p-6">
        <p className="text-4xl font-bold text-center">Polygon NFT Marketplace</p>
        <div className="flex mt-6">
          {links.map(({ href, text }, index) => {
            return (
              <Link href={href} key={index}>
                <a className="flex-auto text-green-500 text-center font-bold">
                  {text}
                </a>
              </Link>
            )
          })}
        </div>
      </nav>
  )
}

export default Header;