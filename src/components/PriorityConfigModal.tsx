import React, { useState, useEffect } from "react";
import { Sliders, Check, RotateCcw, X, Info } from "lucide-react";
import { PriorityWeights } from "../types";
import { getPriorityWeightsApi, updatePriorityWeightsApi } from "../api";

interface PriorityConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWeightsChanged?: () => void;
}

export const PriorityConfigModal: React.FC<PriorityConfigModalProps> = ({
  isOpen,
  onClose,
  onWeightsChanged
}) => {
  const [weights, setWeights] = useState<PriorityWeights>({
    urgency: 40,
    deadline: 25,
    availability: 20,
    demand: 15
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getPriorityWeightsApi()
        .then(setWeights)
        .catch(console.error);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = weights.urgency + weights.deadline + weights.availability + weights.demand;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePriorityWeightsApi(weights);
      setSavedSuccess(true);
      if (onWeightsChanged) onWeightsChanged();
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setWeights({
      urgency: 40,
      deadline: 25,
      availability: 20,
      demand: 15
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-base">Configure Priority Scoring Weights</h3>
              <p className="text-xs text-stone-500">Tune the transparent multi-factor prioritization engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600 flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <span>
              The AI priority engine evaluates every request against current platform capacity. Total weights normalize to 100%. Requests scoring ≥68 trigger <strong>HIGH</strong> priority.
            </span>
          </div>

          {/* Slider 1: Urgency */}
          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
              <span>Urgency Factor (HIGH / MED / LOW)</span>
              <span className="font-mono text-blue-600 font-semibold">{weights.urgency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights.urgency}
              onChange={(e) => setWeights({ ...weights, urgency: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Slider 2: Deadline */}
          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
              <span>Request Deadline / Time Sensitivity</span>
              <span className="font-mono text-blue-600 font-semibold">{weights.deadline}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights.deadline}
              onChange={(e) => setWeights({ ...weights, deadline: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Slider 3: Resource Availability */}
          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
              <span>Resource Availability & Scarcity</span>
              <span className="font-mono text-blue-600 font-semibold">{weights.availability}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights.availability}
              onChange={(e) => setWeights({ ...weights, availability: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Slider 4: Demand */}
          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
              <span>Category Demand & Competitor Requests</span>
              <span className="font-mono text-blue-600 font-semibold">{weights.demand}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights.demand}
              onChange={(e) => setWeights({ ...weights, demand: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-stone-500 border-t border-stone-100">
            <span>
              Weight Total: <strong className={total === 100 ? "text-emerald-600" : "text-amber-600"}>{total}%</strong>
              {total !== 100 && " (will auto-normalize)"}
            </span>
            <button
              onClick={handleResetDefaults}
              className="flex items-center space-x-1 text-stone-500 hover:text-stone-800 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset 40/25/20/15</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm disabled:opacity-50"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : null}
            <span>{savedSuccess ? "Saved!" : isSaving ? "Saving..." : "Apply Weights"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
