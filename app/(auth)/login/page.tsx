import { LoginForm } from "./LoginForm";
import { PublicHeader } from "@/components/layout/PublicHeader";

export const metadata = {
  title: "เข้าสู่ระบบ - Car Booking",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">เข้าสู่ระบบ</h1>
            <p className="mt-2 text-sm text-slate-600">
              
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
