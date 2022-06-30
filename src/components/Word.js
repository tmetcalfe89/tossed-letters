import Letter from "./Letter";

export default function Word({
  word = "",
  onSelectLetter = () => {},
  classBuilder = () => "",
}) {
  return (
    <div className="word">
      {word.split("").map((letter, i) => (
        <Letter
          letter={letter}
          onSelectLetter={() => onSelectLetter(letter)}
          classBuilder={() => classBuilder(letter, i)}
          key={`${letter}-${i}`}
        />
      ))}
    </div>
  );
}
