import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <nav>
      <div>
        <div>
          <Link href="/benchmarks" className="w-full">
            <Button className="w-full">
              View Benchmarks
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
