import { type NextPage } from "next";
import Head from "next/head";
import { type ChangeEvent, useState } from "react";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const TEXTAREA_COLS = 50;
  const TEXTAREA_ROWS = 6;

  const [sendAllowed, setSendAllowed] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const aiResponse = api.response.respond.useQuery(
    { text: message },
    { enabled: false, retry: false }
  );

  const sendData = () => {
    console.log(message);
    void aiResponse.refetch();
  };

  const validateTextArea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setSendAllowed(e.target.value ? true : false);
  };

  const clearTextArea = () => {
    setMessage("");
    setSendAllowed(false);
  };

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Enter Dialogue Below
          </h1>

          <textarea
            className="resize-none overflow-hidden rounded-lg p-2"
            value={message}
            rows={TEXTAREA_ROWS}
            cols={TEXTAREA_COLS}
            maxLength={TEXTAREA_COLS * TEXTAREA_ROWS}
            onChange={validateTextArea}
          />
          <div className="flex gap-12">
            <button
              className="rounded-lg border px-6 py-2 text-xl text-white hover:bg-violet-900 disabled:opacity-25 disabled:hover:bg-transparent"
              onClick={sendData}
              disabled={!sendAllowed}
            >
              Send
            </button>
            <button
              className="rounded-lg border px-6 py-2 text-xl text-white hover:bg-violet-900 disabled:opacity-25 disabled:hover:bg-transparent"
              onClick={clearTextArea}
              disabled={!sendAllowed}
            >
              Clear
            </button>
          </div>

          <p className="text-2xl text-white">
            {aiResponse.data
              ? aiResponse.data.response
              : "AI is awaiting text..."}
          </p>
        </div>
      </main>
    </>
  );
};

export default Home;
