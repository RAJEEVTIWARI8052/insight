import React, { useState } from "react";

interface Props {
    email: string;
    name: string;
    password: string;
    bio: string;
    avatar: string;
    onSuccess: (user: any, token: string) => void;
}

const OtpModal: React.FC<Props> = ({
    email,
    name,
    password,
    bio,
    avatar,
    onSuccess,
}) => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const verifyOtp = async () => {
        try {
            setLoading(true);

           
            const verifyRes = await fetch(
                "http://localhost:5000/api/auth/verify-otp",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp }),
                }
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
                alert(verifyData.message || "Invalid OTP");
                return;
            }

           
            await new Promise((resolve) => setTimeout(resolve, 500));


            const registerRes = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                }
            );

            const registerData = await registerRes.json();

            if (!registerRes.ok) {
                alert(registerData.message || "Registration failed");
                return;
            }

            alert("Account created successfully 🎉");

            onSuccess(registerData.user, registerData.token);
        } catch (err) {
            alert("Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[300]">
            <div className="bg-slate-900 p-6 rounded-xl w-80 text-center">
                <h2 className="text-xl font-bold mb-4 text-white">Enter OTP</h2>

                <input
                    type="text"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 rounded bg-slate-800 text-white mb-4"
                />

                <button
                    onClick={verifyOtp}
                    disabled={loading}
                    className="w-full bg-blue-600 py-2 rounded text-white font-bold"
                >
                    {loading ? "Verifying..." : "Verify & Create Account"}
                </button>
            </div>
        </div>
    );
};

export default OtpModal;
