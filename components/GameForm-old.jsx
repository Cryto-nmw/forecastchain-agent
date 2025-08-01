"use client";

import { checkChainIdWithEthers } from "@/lib/ether-metamask";
import { useMetaMask } from "@/hooks/useMetaMask";
import { useEffect } from "react";
import { retrieveMetaMaskProver, switchToSepolia } from "@/lib/metamask";
import { createForecastGame } from "@/lib/agent-deploy-game";

import { useRef, useState } from "react";
import AnswerOption from "./AnswerOption";
import { CHAIN_ID } from "@/lib/config";

const Form = () => {
  // const [reloadCounter, setReloadCounter] = useState(1);
  const questionRef = useRef("");
  const [isCorrectChain, setCorrectChain] = useState({
    status: 0,
    chainName: "",
    chainID: "",
  });

  const answerRefs = useRef(new Map());
  const oddRefs = useRef(new Map());
  // const { provider } = useMetaMask();

  useEffect(() => {
    const callToCheckChain = async () => {
      const provider = await retrieveMetaMaskProver();
      const currentChain = await checkChainIdWithEthers(provider);
      console.log(
        `checked chain: ${currentChain.chainID} ${currentChain.chainName}`
      );
      if (currentChain.chainID == CHAIN_ID) {
        setCorrectChain({
          status: 2,
          chainName: currentChain.chainName,
          chainID: currentChain.chainId,
        });
      } else {
        setCorrectChain({
          status: 1,
          chainName: currentChain.chainName,
          chainID: currentChain.chainId,
        });
      }
    };
    callToCheckChain();
  }, []);

  const changeDedicatedNetwok = async (e) => {
    const status = await switchToSepolia();
    if (status) {
      const provider = await retrieveMetaMaskProver();
      const currentChain = await checkChainIdWithEthers(provider);
      setCorrectChain({
        status: 2,
        chainName: currentChain.chainName,
        chainID: currentChain.chainId,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const isDedicatedChain = await checkChainIdWithEthers(provider);

    const formData = {};
    formData["question"] = questionRef.current.value;
    formData["answers"] = [];
    formData["odds"] = [];
    answerRefs.current.forEach((value, key) => {
      const ansInput = value;
      const oddInput = oddRefs.current.get(key);
      console.log(` ==> ${ansInput.value}`);
      if (ansInput) {
        formData["answers"].push(ansInput.value);
        formData["odds"].push(oddInput.value);
      }
    });

    await createForecastGame(
      formData["question"],
      formData["answers"],
      formData["odds"]
    );
    // console.log("Form data:", formData);
  };

  const setAnswerRef = (id, element) => {
    if (element) {
      // console.log(element.value);
      answerRefs.current.set(id, element);
    } else {
      answerRefs.current.delete(id);
    }
  };

  const setOddRef = (id, element) => {
    if (element) {
      // console.log(element.value);
      oddRefs.current.set(id, element);
    } else {
      oddRefs.current.delete(id);
    }
  };

  return (
    <>
      {isCorrectChain.status == 2 ? (
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
                  // value={question}
                  ref={questionRef}
                  className="border p-2 w-full rounded text-pink-800"
                />
              </div>
              <AnswerOption setAnswerRef={setAnswerRef} setOddRef={setOddRef} />
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
          {isCorrectChain.status == 0 ? (
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
