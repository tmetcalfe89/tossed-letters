import { useState, useEffect } from "react";
import Phrase from "./components/Phrase";
import { countLetter, createCompoundClassString, jumbleWord } from "./util";
import { useKey } from "react-use";
import "./App.css";

const theAlphabet = "abcdefghijklmnopqrstuvwxyz";

function App() {
  const [word, setWord] = useState();
  const [jumbledWord, setJumbledWord] = useState();
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState([]);

  const fetchWord = async () => {
    const response = await fetch(
      "https://random-word-api.herokuapp.com/word?length=12"
    );
    const wordList = await response.json();
    return wordList[0];
  };

  const checkIsValidWord = async (word) => {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    return response.ok && !guesses.includes(word) && word.length >= 3;
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
    setGuesses([...guesses, currentGuess]);
    setCurrentGuess("");
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
        <div className="guesses">{guesses.join(", ")}</div>
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
      </footer>
    </>
  );
}

export default App;
