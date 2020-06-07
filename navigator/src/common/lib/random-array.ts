/** @format */

export const randomArray = (arr: any[]) => {
  const words = [...arr]
  let i = words.length
  let temporaryValue
  let randomIndex
  while (i !== 0) {
    randomIndex = Math.floor(Math.random() * i)
    i -= 1
    temporaryValue = words[i]
    words[i] = words[randomIndex]
    words[randomIndex] = temporaryValue
  }

  return words
}
