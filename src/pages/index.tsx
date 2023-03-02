import { type NextPage } from "next";
import Head from "next/head";
import { type ChangeEvent, useState, useEffect, useRef } from "react";
import { Bars } from "react-loader-spinner";

import { api } from "~/utils/api";
import { AIaus, AIeu, AIna, AIRegion, Chatter } from "~/utils/enums";

const Home: NextPage = () => {
  const TEXTAREA_COLS = 100;
  const TEXTAREA_ROWS = 2;
  const HISTORY_LIMIT = 50;

  const [sendAllowed, setSendAllowed] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [parentId, setParentId] = useState<string>("");
  const [convoId, setConvoId] = useState<string | undefined>("");
  const [voiceRegion, setVoiceRegion] = useState<string>("NA");
  const [voiceType, setVoiceType] = useState<string>("en-US-AmberNeural");

  const [messageHistory, setMessageHistory] = useState<[Chatter, string][]>([]);

  const didLoad = useRef<boolean>(false);

  const scrollBottomRef = useRef<HTMLDivElement | null>(null);

  const aiResponse = api.response.respond.useMutation();

  const sendData = async () => {
    setMessageHistory((m) => [...m, [Chatter.HUMAN, message]]);
    await aiResponse.mutateAsync({
      text: message,
      parentId,
      convoId,
      voiceType,
    });
    setMessage("");
    setSendAllowed(false);
  };

  const validateTextArea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value.replace("\n", ""));
    setSendAllowed(e.target.value.trim() ? true : false);
  };

  const checkSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (e.keyCode == 13 && e.shiftKey == false && sendAllowed) {
      void sendData();
    }
  };

  const clearTextArea = () => {
    setMessage("");
    setParentId("");
    setConvoId("");
    setMessageHistory([]);
    setSendAllowed(false);
  };

  const playBuffer = (audioDataString: string) => {
    const uint8Array = new Uint8Array(
      JSON.parse(audioDataString) as Iterable<number>
    );
    const audioData: ArrayBuffer = uint8Array.buffer;
    const audioContext = new AudioContext();
    const source = audioContext.createBufferSource();
    void audioContext.decodeAudioData(audioData, (decodedData) => {
      source.buffer = decodedData;
      source.connect(audioContext.destination);
      source.start();
    });
  };

  const determineVoiceDropdown = () => {
    switch (voiceRegion) {
      case AIRegion.NORTH_AMERICA:
        return AIna;
      case AIRegion.AUSTRALIA:
        return AIaus;
      case AIRegion.EUROPE:
        return AIeu;
      default:
        return AIna;
    }
  };

  useEffect(() => {
    if (didLoad.current && aiResponse.data) {
      setMessageHistory((m) => [...m, [Chatter.AI, aiResponse.data.text]]);
      setParentId(aiResponse.data.parentId);
      setConvoId(aiResponse.data.convoId);
      playBuffer(aiResponse.data.voice);
    } else didLoad.current = true;
  }, [aiResponse.data]);

  useEffect(() => {
    messageHistory.length >= HISTORY_LIMIT && messageHistory.shift();
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageHistory]);

  return (
    <>
      <Head>
        <title>Ryans AI Convos</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-zinc-900">
        <div className="flex h-screen w-1/2 flex-col items-center justify-end gap-4 rounded-lg border px-4 py-14">
          <h2 className="absolute top-0 py-4 text-4xl text-white">
            Text Chat With AI
          </h2>
          <h2 className="absolute top-0 py-14 text-base text-white">
            By Ryan Coppa
          </h2>
          <div className="flex-1 self-start">
            <label className="mx-2 flex text-white" htmlFor="region">
              Region
            </label>
            <select
              className="m-2 rounded-md border bg-transparent p-0.5 text-white"
              value={voiceRegion}
              onChange={(e) => setVoiceRegion(e.target.value)}
              id="region"
            >
              {Object.keys(AIRegion).map((k, i) => (
                <option className="bg-zinc-900" key={i} value={AIRegion[k]}>
                  {k}
                </option>
              ))}
            </select>
            <label className="mx-2 flex text-white" htmlFor="voice">
              Voice
            </label>
            <select
              className="m-2 rounded-md border bg-transparent p-0.5 text-white"
              value={voiceType}
              onChange={(e) => setVoiceType(e.target.value)}
              id="voice"
            >
              {Object.keys(determineVoiceDropdown()).map((k, i) => (
                <option
                  className="bg-zinc-900"
                  key={i}
                  value={determineVoiceDropdown()[k]}
                >
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-8 w-3/4 overflow-y-auto rounded-lg">
            {messageHistory.map((m, i) => (
              <div key={i} className="flex">
                <h2 className="w-12 p-1 text-white">{m[0]}</h2>
                <div
                  className={`my-1 w-full whitespace-pre-wrap rounded-lg bg-opacity-25 px-12 text-left font-montserrat text-base text-white ${
                    m[0] === Chatter.HUMAN ? "bg-cyan-custom" : "bg-cyan-900"
                  }`}
                  key={i}
                >
                  {m[1]}
                </div>
                <div ref={scrollBottomRef}></div>
              </div>
            ))}
          </div>
          <div className="relative">
            <textarea
              className="resize-none rounded-lg border bg-transparent p-2 text-sm text-white"
              placeholder="Enter your prompt..."
              value={message}
              rows={TEXTAREA_ROWS}
              cols={TEXTAREA_COLS}
              maxLength={TEXTAREA_COLS * TEXTAREA_ROWS}
              onChange={validateTextArea}
              onKeyUp={checkSubmit}
            />
            {aiResponse.isLoading && (
              <div className="absolute top-0 right-0">
                <Bars
                  height="60"
                  width="60"
                  color="#16a9e4"
                  ariaLabel="bars-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </div>
            )}
          </div>
          <div className="flex gap-40 justify-self-end">
            <button
              className="rounded-lg border px-6 py-2 text-xl text-white hover:bg-violet-900 disabled:opacity-25 disabled:hover:bg-transparent"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={sendData}
              type="submit"
              disabled={aiResponse.isLoading || !sendAllowed}
            >
              Send
            </button>
            <button
              className="rounded-lg border px-6 py-2 text-xl text-white hover:bg-violet-900 disabled:opacity-25 disabled:hover:bg-transparent"
              onClick={clearTextArea}
              disabled={aiResponse.isLoading}
            >
              Clear
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
