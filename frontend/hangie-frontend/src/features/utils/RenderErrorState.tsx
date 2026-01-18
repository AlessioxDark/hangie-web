import { useApi } from "@/contexts/ApiContext";
import { AlertCircle } from "lucide-react";

const RenderErrorState = ({ type, reloadFunction }) => {
  const { error } = useApi();
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-16 h-16 text-warning" />
      </div>
      <h3 className="text-lg font-medium text-text-1 mb-2">
        {error[type].message}
      </h3>
      <p className="text-gray-500 mb-6 text-center">{error[type].details}</p>
      <button
        onClick={() => reloadFunction()}
        className="bg-primary hover:bg-primary/90 text-bg-1 px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Riprova
      </button>
    </div>
  );
};

export default RenderErrorState;
