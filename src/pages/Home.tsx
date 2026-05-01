import type { FC } from "react";
import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";

const Home: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-white text-center">
      <GlassCard className="p-8">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to Weathering With You
        </h1>
        <p className="text-xl mb-8">
          Your personal weather dashboard and forecast companion.
        </p>
        <Link
          to="/dashboard"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
        >
          Go to Dashboard
        </Link>
      </GlassCard>
    </div>
  );
};

export default Home;
