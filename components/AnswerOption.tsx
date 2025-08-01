// components/AnswerOption.tsx
"use client";

import { useState } from "react";

interface Option {
  answer: string;
  odds: string;
}

const AnswerOption = ({ setAnswerRef, setOddRef }) => {
  const [options, setOptions] = useState<Option[]>([{ answer: "", odds: "" }]);

  const handleAddOption = () => {
    setOptions([...options, { answer: "", odds: "" }]);
  };

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    const newOptions = [...options];
    newOptions[index][name as keyof Option] = value;
    setOptions(newOptions);
  };

  return (
    <div>
      {options.map((option, index) => (
        <div
          key={index}
          className="mb-4 p-4 bg-pink-200 bg-opacity-50 rounded-lg"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 p-2">
              <label className="block text-pink-800">答案选项</label>
              <input
                name="answer"
                placeholder="答案选项"
                value={option.answer}
                ref={(el) => setAnswerRef(index, el)}
                onChange={(event) => handleInputChange(index, event)}
                className="border p-2 w-full rounded text-pink-800"
              />
            </div>
            <div className="w-full md:w-1/2 p-2">
              <label className="block text-pink-800">赔率</label>
              <input
                name="odds"
                type="number"
                step="0.01"
                placeholder="赔率"
                ref={(el) => setOddRef(index, el)}
                value={option.odds}
                onChange={(event) => handleInputChange(index, event)}
                className="border p-2 w-full rounded text-pink-800"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddOption}
        className="bg-red-500 text-white p-2 rounded"
      >
        添加更多
      </button>
    </div>
  );
};

export default AnswerOption;
