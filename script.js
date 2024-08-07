"use strict"

/*

num sides n
dice x, y with sides x_i, y_i in increasing order
WLOG:
x_1 = y_1 = 1    (1 way of rolling 2)
y_2 = 2          (2 ways of rolling 3)
sum of x_i + y_i = n(n+1)
x_n + y_n = 2n

*/

let numSides, sideSum, properRoll, x, y, candidateDice

const roll = (sides1, sides2) => {
  const values = {}
  sides1.forEach(side1 => {
    sides2.forEach(side2 => {
      const roll = side1 + side2
      values[roll] = (values[roll] || 0) + 1
    })
  })
  return values
}

class Die {
  constructor(numSides, sides) {
    this.numSides = numSides
    this.sides = sides
  }
  get sidesFilled() {
    return this.sides.length
  }
  get highestSide() {
    return this.sides[this.sidesFilled - 1]
  }
  get sum() {
    return this.sides.reduce((a, b) => a + b, 0)
  }
  copy() {
    // really slow, probably
    return new Die(this.numSides, [...this.sides])
  }
  minSum(newSide = null) {
    if (newSide) {
      // these checks are unnecessary
      const highestSide = Math.max(this.highestSide, newSide)
      const sidesFilled = this.sidesFilled + 1
      if (sidesFilled <= this.numSides)
        return highestSide * (this.numSides - sidesFilled) + this.sum + newSide
    }
    return this.highestSide * (this.numSides - this.sidesFilled) + this.sum
  }
  candidateSides(die) {
    const minSide = this.highestSide
    let newSides = []
    let newSide = minSide - 1
    whileLoop: while (true) {
      newSide++
      if (newSide + die.highestSide > 2 * numSides) break
      const minSum = die.minSum() + this.minSum(newSide)
      if (minSum > sideSum) break

      const newRoll = roll([...this.sides, newSide], die.sides)
      for (const value of Object.keys(newRoll))
        if (newRoll[value] > properRoll[value]) continue whileLoop

      newSides.push(newSide)
    }
    return newSides
  }
  addSide(side) {
    this.sides.push(side)
    // should be largest
    // this.sides.sort((a, b) => a - b)
  }
}

function solveBoth(die1, die2, iter) {
  for (const candidateSide of die1.candidateSides(die2)) {
    const dieCopy = die1.copy()
    dieCopy.addSide(candidateSide)

    if (iter > 1) solveBoth(die2, dieCopy, iter - 1)
    else candidateDice.push([dieCopy.sides, die2.sides])
  }
}

function solveOne(die1, die2, iter) {
  for (const candidateSide of die1.candidateSides(die2)) {
    const dieCopy = die1.copy()
    dieCopy.addSide(candidateSide)

    if (iter > 1) solveOne(dieCopy, die2, iter - 1)
    else candidateDice.push([dieCopy.sides, die2.sides])
  }
}

function findDice(sides, allDice) {
  candidateDice = []
  numSides = sides
  sideSum = numSides * (numSides + 1)
  properRoll = Object.fromEntries(
    Array.from({ length: 2 * numSides - 1 }, (v, i) => [
      i + 2,
      numSides - Math.abs(i - numSides + 1),
    ])
  )
  x = new Die(numSides, [1])

  if (!allDice) {
    const conjecturedSolution = Array.from(
      { length: numSides },
      (v, i) => i
    ).map(i => 1 + Math.ceil(i / 2))

    y = new Die(numSides, conjecturedSolution)
    solveOne(x, y, numSides - 1)
    return [candidateDice[0]]
  }

  y = new Die(numSides, [1, 2])
  solveBoth(x, y, 2 * numSides - 3) // 3 sides already set

  // i got lazy here
  let noDuplicates = [candidateDice[0]]
  for (const candidatePair of candidateDice) {
    let duplicate
    for (const pair of noDuplicates) {
      duplicate = true
      for (let i = 0; i < numSides; i++) {
        if (candidatePair[0][i] !== pair[1][i]) {
          duplicate = false
          break
        }
      }
      if (duplicate) break
    }
    if (!duplicate) noDuplicates.push(candidatePair)
  }
  return noDuplicates
}
