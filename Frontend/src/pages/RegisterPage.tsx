import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { AuthMessage } from "../components/auth/AuthMessage";
import { MdEmail } from "react-icons/md";
import { FaLock, FaUser } from "react-icons/fa";
import { Eye, EyeClosed } from "lucide-react";
import { registerUser } from '../hooks/useRegister';
import { ToggleCheckbox } from "../components/ui/ToggleCheckbox";

const inputClass = "w-full bg-transparent text-white placeholder-white pl-10 py-2 border-0 border-b-2 border-b-gray-400 focus:border-b-blue-400 focus:ring-0 transition outline-none";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      setError("");
      setSuccess("");
      await registerUser({ username, name, email, password });
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.response?.data ?? "Registration failed");
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to start managing your finances."
      footer={
        <>Already have an account? <Link to="/login" className="text-blue-200 hover:underline">Login</Link></>
      }
    >
      <form className="card-body flex flex-col gap-7 p-4" onSubmit={handleSubmit} noValidate>
        <AuthMessage variant="error">{error}</AuthMessage>
        <AuthMessage variant="success">{success}</AuthMessage>

        <div className="flex flex-col gap-2 px-2">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input type="text" placeholder="Username" className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input type="text" placeholder="Full Name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input type="email" placeholder="Email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none text-xs px-2">
          <input type="checkbox" className="sr-only" id="terms" required />
          <ToggleCheckbox checked={true} onChange={() => {}} label="I agree to the Terms & Conditions" />
        </label>

        <button type="submit" className="p-2 font-semibold flex justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md">
          Sign Up
        </button>
      </form>
    </AuthLayout>
  );
}
