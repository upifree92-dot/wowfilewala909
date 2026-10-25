import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

const EditModal = () => {
  const { editingContent, finishEditing, updateSiteContent } = useAppContext();
  const [currentValue, setCurrentValue] = useState("");

  useEffect(() => {
    if (editingContent) {
      setCurrentValue(editingContent.value);
    }
  }, [editingContent]);

  if (!editingContent) return null;

  const handleSave = () => {
    updateSiteContent(editingContent.path, currentValue);
    finishEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4"
      onClick={finishEditing}
    >
      <div
        className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg shadow-2xl w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={finishEditing}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-3xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-center mb-4 text-slate-800 dark:text-slate-200">
          Edit Content
        </h2>
        <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-4 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
          Editing key: <code className="font-mono">{editingContent.path}</code>
        </p>
        <textarea
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 h-32 text-lg dark:text-white"
          autoFocus
        />
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => {
              updateSiteContent(editingContent.path, "");
              finishEditing();
            }}
            className="w-1/3 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg"
          >
            Delete
          </button>
          <button
            onClick={handleSave}
            className="w-2/3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
