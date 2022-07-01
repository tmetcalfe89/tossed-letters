import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useInterval, useKey, useLocalStorage } from "react-use";
import Phrase from "./components/Phrase";
import {
  countLetter,
  createCompoundClassString,
  getTodayStringified,
  jumbleWord,
} from "./util";
import "./App.css";

const theAlphabet = "abcdefghijklmnopqrstuvwxyz";
const apiHost =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://tim-word-api.herokuapp.com";

function App() {
  const [word, setWord] = useLocalStorage("word", undefined);
  const [jumbledWord, setJumbledWord] = useState();
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useLocalStorage("guesses", []);
  const [historicalGuesses, setHistoricalGuesses] = useLocalStorage(
    "historicalGuesses",
    []
  );
  const [submittingGuess, setSubmittingGuess] = useState(false);
  const [fetchNewWord, setFetchNewWord] = useState(false);

  const fetchWord = async () => {
    const response = await fetch(`${apiHost}/api/rand/12`);
    const { word } = await response.json();
    return word;
  };

  const wordErrors = {
    UNRECOGNIZED: (word) => `${word} is not a recognized word.`,
    ALREADY_USED: (word) => `${word} was already used.`,
    TOO_SHORT: (word) => `${word} is less than 3 letters long.`,
  };
  const checkIsValidWord = async (word) => {
    if (guesses.includes(word)) {
      return wordErrors.ALREADY_USED;
    } else if (word.length < 3) {
      return wordErrors.TOO_SHORT;
    }
    const response = await fetch(`${apiHost}/api/words/${word}/check`);
    const body = await response.json();
    if (!body.good) {
      return wordErrors.UNRECOGNIZED;
    } else {
      return true;
    }
  };

  const addToGuess = (letter) => {
    if (countLetter(currentGuess, letter) < countLetter(word, letter)) {
      setCurrentGuess(currentGuess + letter);
    }
  };

  const removeFromGuess = () => {
    setCurrentGuess(currentGuess.slice(0, currentGuess.length - 1));
  };

  const submitGuess = async () => {
    if (submittingGuess) {
      return;
    }
    setCurrentGuess(() => "");
    setSubmittingGuess(true);
    const currentGuessI = currentGuess;
    const isValidWord = await checkIsValidWord(currentGuessI);
    setSubmittingGuess(false);
    if (isValidWord !== true) {
      return toast(isValidWord(currentGuessI));
    }
    setGuesses([...guesses, currentGuessI]);
  };

  useKey([], (e) => {
    if (theAlphabet.includes(e.key)) {
      addToGuess(e.key);
    } else if (e.key === "Enter") {
      submitGuess();
    } else if (e.key === "Backspace") {
      removeFromGuess();
    }
  });

  useInterval(() => {
    setFetchNewWord(true);
  }, 10e3);

  useEffect(() => {
    if (!word) return;
    setJumbledWord(jumbleWord(word));
  }, [word]);

  useEffect(() => {
    if (!fetchNewWord) return;
    let cancelled = false;

    fetchWord().then((newWord) => {
      if (cancelled) return;
      if (newWord !== word) {
        setHistoricalGuesses([
          ...historicalGuesses,
          {
            date: getTodayStringified(),
            guesses,
          },
        ]);
        setGuesses([]);
        setWord(newWord);
      }
      setFetchNewWord(false);
    });

    return () => (cancelled = true);
  }, [fetchNewWord]);

  return (
    <>
      <Toaster />
      <header>Tossed Letters</header>
      <main>
        <Phrase
          phrase={jumbledWord}
          classBuilder={(letter, i) =>
            createCompoundClassString(
              countLetter(currentGuess, letter) >=
                countLetter(jumbledWord.slice(0, i + 1), letter) && "hidden"
            )
          }
          onSelectLetter={() => setJumbledWord(jumbleWord(word))}
        />
        <Phrase phrase={currentGuess} />
        <div className="guesses">{guesses.sort().join(", ")}</div>
      </main>
      <footer>
        <div>
          Copyright &copy;{" "}
          <a href="https://github.com/tmetcalfe89/tossed-letters">
            Timothy Metcalfe 2022
          </a>
        </div>
        <div>
          Words from{" "}
          <a href="https://random-word-api.herokuapp.com/home">
            random-word-api
          </a>
        </div>
        <div>
          Word verification from{" "}
          <a href="https://dictionaryapi.com/">
            Merriam-Webster's Dictionary API
          </a>
        </div>
      </footer>
    </>
  );
}

export default App;
