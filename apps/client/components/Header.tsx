"use client";

// import { useRouter } from "next/navigation";

export default function Header() {
  // const router = useRouter();

  // const handleLogout = () => {
  //   console.log("Logging out...");
  //   if (localStorage.getItem("transactionHashes"))
  //     localStorage.removeItem("transactionHashes");
  //   router.push("/signin");
  // };

  return (
    <header className="bg-gray-800 text-white p-3 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">Breaking Bad - NCB's Eagle</h1>
      </div>
    </header>
  );
}
