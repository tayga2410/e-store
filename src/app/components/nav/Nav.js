import Link from "next/link";

export default function Nav() {
  return (
    <nav className="nav">
      <ul className="nav-list">
        <li className="nav-item">
          <Link href="/">Home</Link>
        </li>
        <li className="nav-item">
          <Link href="/">About</Link>
        </li>
        <li className="nav-item">
          <Link href="/">Contact Us</Link>
        </li>
        <li className="nav-item">
          <Link href="/">Blog</Link>
        </li>
      </ul>
    </nav>
  );
}
