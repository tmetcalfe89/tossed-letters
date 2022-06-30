export const jumbleWord = (string = "") => {
  const letters = string.split("");
  const jumbledWord = [];
  while (letters.length > 0) {
    const letter = letters.splice(
      Math.floor(Math.random() * letters.length),
      1
    )[0];
    jumbledWord.push(letter);
  }
  return jumbledWord.join("");
};

export const countLetter = (string = "", letter = "") =>
  (string.match(new RegExp(letter, "g")) || []).length;

export const countAllLetters = (string = "") =>
  string.toLowerCase().match(/[a-z]/g)?.length || 0;

export const isLetter = (string = "") =>
  countAllLetters(string) === 1 && string.length === 1;

export const createCompoundClassString = (...classes) =>
  classes.filter((thisClass) => thisClass).join(" ");
