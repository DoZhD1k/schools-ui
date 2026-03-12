import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Цифровой рейтинг школ: Вход",
  description: "Вход в систему Цифрового рейтинга школ",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
