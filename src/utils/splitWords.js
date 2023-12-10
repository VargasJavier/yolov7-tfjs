export const splitWords = (arrayWords) => {
  const wordUnique = [];

  arrayWords.forEach((palabra) => {
    if (!wordUnique.includes(palabra)) {
      wordUnique.push(palabra);
    }
  });

  return wordUnique;
}