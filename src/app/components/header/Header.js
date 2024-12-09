import Nav from '../nav/Nav';
import Link from "next/link";
import Image from 'next/image';

export default function Header() {
  return (
    <header className="header">
       <div className="header-container">
        <span>Digital Heaven</span>
        <form action="">
          <input type="text" />
          <button type="submit">Search</button>
        </form>
       <Nav />
       <ul className="header-icons">
        <li>
          <Link href="/cart"><Image src="/header/cart-icon.svg" alt="cart" width={25} height={22}></Image></Link>
        </li>
        <li>
          <Link href="/auth"><Image src="/header/cabinet-icon.svg" alt="cart" width={17} height={22}></Image></Link>
        </li>
        </ul>
      </div>
    </header>
  );
}
