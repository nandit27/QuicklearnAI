import React from 'react';

const Tabs = ({ children, value, onChange }) => {
  return <div className="w-full">{children}</div>;
};

const TabsList = ({ children }) => {
  return (
    <div className="flex rounded-lg bg-[#1a2234] p-1 mb-4">
      {children}
    </div>
  );
};

const TabTrigger = ({ value, selected, onClick, children }) => {
  return (
    <button
      onClick={() => onClick(value)}
      className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors
        ${selected ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
    >
      {children}
    </button>
  );
};

const TabContent = ({ value, selected, children }) => {
  if (!selected) return null;
  return <div>{children}</div>;
};

export { Tabs, TabsList, TabTrigger, TabContent };