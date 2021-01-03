/**
 * Generate random note id
 * @returns {string}
 */
exports.generateRandomNoteId = function () {
  const length = 11;
  const separator = '-';
  const separatedPlaces = [3, 7];
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = '';

  for (let i = 0; i < length; ++i) {
    let char;

    if (separatedPlaces.includes(i)) {
      char = separator;
    }
    else {
      char = chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += char;
  }

  return result;
}