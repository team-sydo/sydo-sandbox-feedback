
import { SydoLogo } from "./SydoLogo";

interface NavBarProps {
  userName: string;
}

export function NavBar({ userName }: NavBarProps) {
  return (
    <nav className="border-b py-4 px-6 flex justify-between items-center bg-white">
      <SydoLogo />
      <div className="text-sm font-medium">
        {userName}
      </div>
    </nav>
  );
}
