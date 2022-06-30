import Word from "./Word";
import "./Phrase.css";

export default function Phrase({
  phrase = "",
  onSelectLetter = () => {},
  classBuilder = () => "",
}) {
  const updateSelectedLetter = (selectedLetter) => {
    onSelectLetter(selectedLetter.toLowerCase());
  };

  return (
    <div className="phrase">
      {phrase.split(" ").map((word, i) => (
        <Word
          word={word}
          onSelectLetter={updateSelectedLetter}
          classBuilder={classBuilder}
          key={`${word}-${i}`}
        />
      ))}
    </div>
  );
}
