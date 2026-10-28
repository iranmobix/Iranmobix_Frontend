import LoginLayout from "./login-layout";
import LoginImageSection from "./login-image-section";
import AuthContent from "./auth-content";

export default function LoginPage() {
  return (
    <LoginLayout>
      <AuthContent />
      <LoginImageSection />
    </LoginLayout>
  );
}
