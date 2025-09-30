import Image from "next/image";

export default function Home() {
  const referenceCode = "F8AGROUP"
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">This is reference CODE : {referenceCode}</h1>
    </div>
  );
}
