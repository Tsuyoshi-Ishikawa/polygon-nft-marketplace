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
        <p className="text-4xl font-bold">Polygon NFT Marketplace</p>
        <div className="flex mt-4">
          {links.map(({ href, text }, index) => {
            return (
              <Link href={href} key={index}>
                <a className="mr-4 text-pink-500">
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