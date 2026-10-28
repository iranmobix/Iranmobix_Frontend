import LoginActions from "./login-header-actions";
import AuthFlow from "./auth-flow";

export default function AuthContent() {
  return (
    <section className="relative flex min-h-[calc(100svh-12px)] w-full flex-col items-center justify-center bg-white px-5 py-20 sm:min-h-[calc(100svh-16px)] sm:px-10 lg:min-h-0 lg:w-[55%] lg:px-12 lg:py-16">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <LoginActions />
      </div>
      <div className="w-full max-w-[420px]">
        <AuthFlow />
      </div>
    </section>
  );
}
