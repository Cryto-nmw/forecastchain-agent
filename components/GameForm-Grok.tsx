"use client";

import { switchToSepolia } from "@/lib/metamask";
import { EthToUsdPrice } from "@/components/EthToUsdPrice";
import { createForecastGame } from "@/lib/agent-deploy-game";
import { checkChainIdWithEthers } from "@/lib/ether-metamask";
import { useMetaMask } from "@/hooks/useMetaMask";
import { useEffect, useRef, useState } from "react";
import AnswerOption from "./AnswerOption";
import { CHAIN_ID } from "@/lib/config";
import { etherToUSD } from "@/lib/utils";
import toast from "react-hot-toast";
import ProgressModal from "./ProgressModal"; // Import the modal

interface ChainStatus {
  status: 0 | 1 | 2;
  chainName: string;
  chainID: string;
}

const Form = () => {
  const [bonus, setBonus] = useState(0);
  const [rate, setRate] = useState(0);
  const [usd, setUSD] = useState(0);
  const bonusRef = useRef(null);

  const handleIncrement = async () => {
    // bonusRef.current.value = ;
    setBonus((prev) => {
      let bonus = Number((prev + 0.01).toFixed(2));
      bonus = bonus < 0 ? 0 : bonus;
      bonusRef.current.value = bonus;

      setUSD(bonus * rate);
      return bonus;
    });

    // setUSD(usdRate * bonusRef.current.value);
  };

  const handleDecrease = () => {
    // bonusRef.current.value = ;
    setBonus((prev) => {
      let bonus = Number((prev - 0.01).toFixed(2));
      bonus = bonus < 0 ? 0 : bonus;
      bonusRef.current.value = bonus;
      setUSD(bonus * rate);
      return bonus;
    });
  };

  const { provider, isConnected } = useMetaMask();
  const [isCorrectChain, setCorrectChain] = useState<ChainStatus>({
    status: 0,
    chainName: "",
    chainID: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [modalMessage, setModalMessage] = useState("");
  const questionRef = useRef<HTMLInputElement>(null);
  const answerRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const oddRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (!isConnected || !provider) return;

    const callToCheckChain = async () => {
      try {
        const currentChain = await checkChainIdWithEthers(provider);
        setCorrectChain({
          status: currentChain.chainID === CHAIN_ID ? 2 : 1,
          chainName: currentChain.chainName || "",
          chainID: currentChain.chainID || "",
        });
      } catch (error) {
        toast.error("Failed to check network.");
        console.error("Chain check error:", error);
      }
    };
    callToCheckChain();
  }, [provider, isConnected]);

  useEffect(() => {
    const retriveUSDRate = async () => {
      const usdRate = await etherToUSD();
      setRate(usdRate);
    };

    retriveUSDRate();
  }, []);

  const changeDedicatedNetwok = async () => {
    try {
      const status = await switchToSepolia();
      if (status) {
        const currentChain = await checkChainIdWithEthers(provider);
        setCorrectChain({
          status: 2,
          chainName: currentChain.chainName || "",
          chainID: currentChain.chainID || "",
        });
        toast.success("Switched to Sepolia network!");
      }
    } catch (error) {
      toast.error("Failed to switch to Sepolia.");
      console.error("Network switch error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = {};
      formData["question"] = questionRef.current?.value;
      formData["answers"] = [];
      formData["odds"] = [];

      if (!formData["question"]) {
        toast.error("Question is required.");
        console.log("Question is required.");
        return;
      }

      answerRefs.current.forEach((value, key) => {
        const ansInput = value;
        const oddInput = oddRefs.current.get(key);
        if (ansInput) {
          formData["answers"].push(ansInput.value);
          const oddVal = Number(oddInput?.value ?? 0);
          formData["odds"].push(oddVal * 100);
        }
      });

      if (formData["answers"].length < 2) {
        toast.error("At least two answers are required.");
        return;
      }

      setIsSubmitting(true);
      setModalOpen(true);
      //   setModalStatus("pending");
      //   setModalMessage("Initializing game creation...");

      await createForecastGame(
        formData["question"],
        formData["answers"],
        formData["odds"],
        bonusRef.current.value,
        (status, message) => {
          setModalStatus(status);
          setModalMessage(message);
          if (status === "success" || status === "error") {
            setTimeout(() => setModalOpen(false), 3000); // Auto-close after 3 seconds
          }
        }
      );
      toast.success("Game deployed successfully!");
    } catch (error) {
      toast.error("Failed to deploy game. Please try again.");
      console.error("Deployment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAnswerRef = (id: string, element: HTMLInputElement | null) => {
    if (element) {
      answerRefs.current.set(id, element);
    } else {
      answerRefs.current.delete(id);
    }
  };

  const setOddRef = (id: string, element: HTMLInputElement | null) => {
    if (element) {
      oddRefs.current.set(id, element);
    } else {
      oddRefs.current.delete(id);
    }
  };

  return (
    <>
      <ProgressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        status={modalStatus}
        message={modalMessage}
      />
      {isCorrectChain.status === 2 ? (
        <div className="container mx-auto p-4">
          <div className="bg-gradient-to-r from-pink-300 to-blue-200 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-pink-800">
              预测游戏部署表单
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-pink-800">
                  在这里写下你的提问
                </label>
                <input
                  type="text"
                  ref={questionRef}
                  className="border p-2 w-full rounded text-pink-800"
                />
              </div>
              <AnswerOption setAnswerRef={setAnswerRef} setOddRef={setOddRef} />

              <div className="mb-4">
                <label className="block text-pink-800">奖金池</label>
                <div className="flex items-center">
                  <input
                    readOnly
                    type="text"
                    ref={bonusRef}
                    value={bonus}
                    onChange={(e) => setBonus(Number(e.target.value))}
                    step="0.01"
                    className="border p-2 w-full rounded text-pink-800"
                  />

                  <button
                    ref={bonusRef}
                    type="button"
                    onClick={handleIncrement}
                    className="ml-2 bg-pink-800 text-white p-2 rounded"
                  >
                    +
                  </button>
                  <button
                    ref={bonusRef}
                    type="button"
                    onClick={handleDecrease}
                    className="ml-2 bg-pink-800 text-white p-2 rounded"
                  >
                    -
                  </button>
                </div>
              </div>

              <div className="mb-4 flex justify-end">
                <EthToUsdPrice usd={usd} />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded w-full"
              >
                部署
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {isCorrectChain.status === 0 ? (
            <div>检查目前所在网络...</div>
          ) : (
            <div>
              目前在{isCorrectChain.chainName.toUpperCase()}, 请{" "}
              <button
                type="button"
                onClick={changeDedicatedNetwok}
                className="bg-red-500 text-white p-2 rounded"
              >
                转换
              </button>
              到 SEPOLIA
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Form;
