import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../../components/ui/Loader";

function Register() {
  const [fullname, setFullName] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();

  const data = {
    fullname,
    username,
    email,
    password,
  };

  try {
    setIsLoading(true);
    
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Register failed! ❌");
    }

    navigate("/manager/login");
  } catch (error) {
    console.error("Registration error:", error);
  } finally {
    setIsLoading(false);
  }
};



  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-center items-center gap-10 md:gap-20 p-4">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-blue-600 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">REGISTER</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullname" className="block font-semibold text-white">Full Name</label>
            <input
              type="text"
              id="fullname"
              value={fullname}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your Full Name"
              className="w-full p-3 border rounded-lg mt-1 focus:outline-none  bg-blue-600 text-white"
            />
          </div>

          <div>
            <label htmlFor="username" className="block font-semibold text-white">User Name</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              required
              placeholder="Enter your User Name"
              className="w-full p-3 border rounded-lg mt-1 focus:outline-none bg-blue-600 text-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-semibold text-white">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your Email"
              className="w-full p-3 border rounded-lg mt-1 focus:outline-none bg-blue-600 text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-semibold text-white">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your Password"
              className="w-full p-3 border rounded-lg mt-1 focus:outline-none bg-blue-600 text-white"
            />
          </div>

        

          <p className="mt-4 text-white text-center">
            Already have an account?{" "}
            <Link to="/manager/login" className=" font-semibold hover:underline">
              Login
            </Link>
          </p>

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg uppercase font-semibold transition"
          >
            Register
          </button>
        </form>

        {isLoading && <Loader />}
      </div>
    </div>
  );
}

export default Register;
