import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datapolis: Вход",
  description: "Вход в систему Datapolis",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
