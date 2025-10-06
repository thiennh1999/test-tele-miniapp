'use client';

import Image from "next/image";
import AnimatedButton from "@/components/AnimatedButton";

export default function Home() {
  const referenceCode = "F8AGROUP"

  const handleButtonClick = () => {
    console.log("Button clicked!");
    alert(`Reference Code: ${referenceCode}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          This is reference CODE:
          <span className="text-blue-600 ml-2">{referenceCode}</span>
        </h1>

        <div className="flex justify-center">
          <div className="relative p-8">
            <AnimatedButton
              onClick={() => alert("Third button clicked!")}
              className="text-2xl bg-gradient-to-r from-pink-500 to-red-600"
            >
              💫
            </AnimatedButton>
          </div>
        </div>

        <p className="text-gray-600 text-sm max-w-md">
          Try clicking and holding the circular buttons to see them expand!
          The longer you hold, the bigger the circle becomes with Lottie animation.
        </p>
      </div>
    </div>
  );
}
