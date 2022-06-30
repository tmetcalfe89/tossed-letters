import { createCompoundClassString } from "../util";

export default function Letter({
  letter = "",
  onSelectLetter = () => {},
  classBuilder = () => "",
}) {
  return (
    <div
      onClick={onSelectLetter}
      className={createCompoundClassString(classBuilder(), "letter")}
    >
      {letter}
    </div>
  );
}
