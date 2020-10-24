'use strict'

const CRIT_FAIL = "#d95a5a";
const CRIT_LUCK = "#349479";

const LOG_HEADER = document.getElementById('logHeader');
const PLACEHOLDER = document.getElementById('placeholder');

const ERROR = "Error";
const ABL = "ability";
const MIN = "min";
const MAX = "max";
const SUM = "sum";
const ROLL = "roll";


function dieToStr(count, sides) {
  return count + "d" + sides;
}


class DieGroup {
  constructor(str) {
    let [count, sides] = str.split("d").map(item => +item);
    this.count = (count === 0 ? 1 : count);
    this.sides = sides;
    this.throws = [];
    for (let i = 0; i < this.count; ++i)
      this.throws.push(this.roll());
  }

  roll() {
    return Math.floor(Math.random() * this.sides) + 1;
  }

  getColor(dieThrow) {
    return (dieThrow === this.sides ? CRIT_LUCK : dieThrow === 1 ? CRIT_FAIL : "black");
  }

  min() {
    let tmp = this.throws.reduce((min, current) => Math.min(min, current));
    return [tmp, this.getColor(tmp)];
  }

  max() {
    let tmp = this.throws.reduce((max, current) => Math.max(max, current));
    return [tmp, this.getColor(tmp)];
  }

  sum() {
    return this.throws.reduce((sum, current) => sum + current);
  }
}


function minArr(array) {
  return array.reduce(([min, minColor], [cur, curColor]) => [Math.min(min, cur), (min < cur ? minColor : curColor)]);
}

function maxArr(array) {
  return array.reduce(([max, maxColor], [cur, curColor]) => [Math.max(max, cur), (max > cur ? maxColor : curColor)]);
}

function sumArr(array) {
  return array.reduce((sum, current) => sum + current);
}


function letsRoll(parsedInput) {
  let command = parsedInput[0];
  let diceGroups = [];
  let sourceBonus = 0;
  for (let i = 1; i < parsedInput.length; ++i) {
    let idx = parsedInput[i].indexOf("d");
    if (idx !== -1)
      diceGroups.push(new DieGroup(parsedInput[i]));
    else
      sourceBonus += +parsedInput[i];
  }
  if (command == ABL)
    diceGroups.push(new DieGroup("4d6"));
  let [resultArr, colorArr, bonus] = findResult(command, diceGroups, sourceBonus);
  printAll(parsedInput.join(" "), diceGroups, resultArr, colorArr, bonus);
}

function findResult(command, diceGroups, bonus=0) {
  let groupResults = [];
  let result;
  let color = "black";
  switch (command) {
    case MIN: case MAX: case SUM:
      for (let i = 0; i < diceGroups.length; ++i)
        groupResults.push(diceGroups[i][command]());
  }
  switch(command) {
    case MIN: [result, color] = minArr(groupResults); break;
    case MAX: [result, color] = maxArr(groupResults); break;
    case SUM: result = sumArr(groupResults); break;
    case ROLL:
      result = diceGroups[0].throws.slice(0,4);
      color = result.map(function (dieThrow) {return diceGroups[0].getColor(dieThrow);});
      break;
    case ABL:
      result = diceGroups[0].sum() - diceGroups[0].min()[0];
      break;
    default:
      result = ERROR;
  }
  if (isNaN(+result)) bonus = "";
  if (String(result).includes("NaN")) result = ERROR;
  if (Array.isArray(result))
    return [result, color, bonus];
  return [[result], [color], bonus];
}

function printAll(input, diceGroups, resultArr, colorArr, bonus) {
  PLACEHOLDER.innerHTML = "";
  printResult(resultArr, colorArr, bonus, PLACEHOLDER);

  let logItem = document.createElement("li");
  logItem.className = "logItem";
  logItem.innerHTML = input + " || ";
  LOG_HEADER.insertAdjacentElement("afterend", logItem);
  if (resultArr[0] != ERROR) {
    printDiceGroups(diceGroups, logItem);
    logItem.innerHTML += "|| ";
  }
  printResult(resultArr, colorArr, bonus, logItem);
}

function printResult(resultArr, colorArr, bonus, docElem) {
  for (let i = 0; i < resultArr.length; ++i) {
    let resSpan = document.createElement("span");
    resSpan.innerHTML = (i > 0 ? " " : "") + (resultArr[i] + bonus);
    resSpan.style.color = colorArr[i];
    docElem.insertAdjacentElement("beforeend", resSpan);
  }
}

function printDiceGroups(diceGroups, docElem) {
  for (let i = 0; i < diceGroups.length; ++i) {
    docElem.innerHTML += "("
    diceGroups[i].throws.forEach(dieThrow => {
      let rollSpan = document.createElement("span");
      rollSpan.innerHTML = " " + dieThrow;
      rollSpan.style.color = diceGroups[i].getColor(dieThrow);
      docElem.insertAdjacentElement("beforeend", rollSpan);
    });
    docElem.innerHTML += ") ";
  }
}


let button = document.getElementById('button');
let table = document.getElementById('rollTable');

table.onclick = function(event) {
  let td = event.target.closest('td');
  if (!td || !table.contains(td)) return;
  letsRoll([ROLL, dieToStr(td.innerHTML, td.getAttribute("die"))]);
};

button.onclick = function() {
  letsRoll(document.getElementById("console").value.split(" "));
  document.getElementById("console").value = "";
}
