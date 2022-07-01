import { useState, useEffect } from "react";
import Phrase from "./components/Phrase";
import { countLetter, createCompoundClassString, jumbleWord } from "./util";
import { useKey } from "react-use";
import "./App.css";

const theAlphabet = "abcdefghijklmnopqrstuvwxyz";
const apiHost =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://tim-word-api.herokuapp.com";

function App() {
  const [word, setWord] = useState();
  const [jumbledWord, setJumbledWord] = useState();
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState([]);

  const fetchWord = async () => {
    const response = await fetch(`${apiHost}/api/rand/12`);
    const { word } = await response.json();
    return word;
  };

  const checkIsValidWord = async (word) => {
    const response = await fetch(`${apiHost}/api/words/${word}/check`);
    const body = await response.json();
    return body.good && !guesses.includes(word) && word.length >= 3;
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
    const isValidWord = await checkIsValidWord(currentGuess);
    if (!isValidWord) return;
    setGuesses((guesses) => [...guesses, currentGuess]);
    setCurrentGuess(() => "");
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

  useEffect(() => {
    if (!word) return;
    setJumbledWord(jumbleWord(word));
  }, [word]);

  useEffect(() => {
    let cancelled = false;

    fetchWord().then((newWord) => {
      if (cancelled) return;
      setWord(newWord);
    });

    return () => (cancelled = true);
  }, []);

  return (
    <>
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
          onSelectLetter={addToGuess}
        />
        <Phrase phrase={currentGuess} onSelectLetter={removeFromGuess} />
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
