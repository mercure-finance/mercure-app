import WalletConnectButton from "@/components/general/walletadapter/WalletConnectButton";
import CompleteRegistrationModal from "@/components/general/walletadapter/kyc/CompleteRegistrationModal";
import { Toaster } from "@/components/ui/toaster";

import {
  CommandIcon,
  HomeIcon,
  UsersIcon,
  Package2Icon,
  SettingsIcon,
  PackageIcon,
  ArrowLeftRightIcon,
  InfoIcon,
  Settings2Icon,
  PiggyBankIcon,
  WalletCardsIcon,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const tabs = [
    {
      name: "Home",
      icon: <HomeIcon color="white" />,
      route: "/app",
    },
    {
      name: "Trade",
      icon: <ArrowLeftRightIcon color="white" />,
      route: "/app/trade",
    },
    {
      name: "Borrow",
      icon: <WalletCardsIcon color="white" />,
      route: "/app/borrow",
    },
    {
      name: "Earn",
      icon: <PiggyBankIcon color="white" />,
      route: "/app/earn",
    },
    {
      name: "Settings",
      icon: <SettingsIcon color="white" />,
      route: "/app/settings",
    },
  ];

  const headersList = headers();

  const path = headersList.get("x-pathname");
  console.log(path);

  return (
    <body className="w-screen h-screen">
      <div className="flex flex-col md:flex-row h-screen min-w-full bg-white dark:bg-slate-900">
        <aside
          id="sidebar"
          className="hidden md:block md:left-0 md:top-0 md:w-3/12 lg:w-3/12 z-40 h-auto md:h-screen md:fixed"
          aria-label="Sidebar"
        >
          <div className="flex h-auto md:h-full flex-col overflow-y-auto md:border-r border-slate-200  px-3 py-4 dark:border-slate-700 dark:bg-slate-900 bg-indigo-600">
            <Link href="/app">
              <div className="mb-10 flex items-center rounded-lg px-3 py-2 text-slate-900 dark:text-white">
                <Image
                  src="/mercure.png"
                  width={30}
                  height={30}
                  alt="Mercure Logo"
                />

                <span className="ml-3 text-large font-semibold text-white">
                  Mercure
                </span>
              </div>
            </Link>
            <ul className="space-y-2 text-sm font-medium">
              {tabs.map((tab) => (
                <li key={tab.route}>
                  <a
                    href={tab.route}
                    className={`flex items-center rounded-lg px-4 py-3 text-slate-900 
        ${
          (path!.startsWith(`${tab.route}/`) && tab.route != "/app") ||
          tab.route === path
            ? "bg-indigo-800"
            : "hover:bg-indigo-800"
        } dark:text-white dark:hover:bg-slate-700 `}
                  >
                    {tab.icon}
                    <span className="ml-3 flex-1 whitespace-nowrap text-base text-white">
                      {tab.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex">
              <div className="flex w-full justify-between">
                <span className="text-sm font-medium text-black dark:text-white mb-40">
                  <WalletConnectButton />
                </span>
              </div>
            </div>
          </div>
        </aside>

        <aside
          id="mobile-navbar"
          className="block md:hidden inset-x-0 bottom-0 z-50 bg-indigo-600 p-2 dark:bg-slate-900 fixed"
          aria-label="Mobile navbar"
        >
          <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium mt-1">
            {tabs.map((tab) => (
              <Link href={tab.route} key={tab.route}>
                <button
                  type="button"
                  className="inline-flex flex-col items-center justify-center px-5 hover:bg-indigo-800 rounded-md py-2 group"
                >
                  {tab.icon}
                  <span className="flex-1 whitespace-nowrap text-sm text-white">
                    {tab.name}
                  </span>
                </button>
              </Link>
            ))}
          </div>
        </aside>

        <CompleteRegistrationModal />

        <div className="md:w-9/12 md:ml-auto space-y-2 p-3 pt-4 mt-1  -md:space-y-4 md:p-8 md:pt-6 pb-24">
          {children}
        </div>
      </div>

      <Toaster />
    </body>
  );
};

export default AppLayout;
