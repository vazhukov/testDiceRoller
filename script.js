'use strict'

const CRIT_FAIL = "#9f2e2e";
const CRIT_LUCK = "#2c814e";

function dieToStr(count, sides) {
  return count + "d" + sides;
}


class DieGroup {
  constructor(str) {
    let cnt$side = str.split("d").map(item => +item);

    this.count = (cnt$side[0] === 0 ? 1 : cnt$side[0]);
    this.sides = cnt$side[1];
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


function printResult(result, color, bonus) {
  let placeholder = document.getElementById('placeholder');
  placeholder.innerHTML = "";
  for (let i = 0; i < result.length; ++i) {
    let resSpan = document.createElement("span");
    resSpan.innerHTML = (i > 0 ? " " : "") + (result[i] + bonus);
    resSpan.style.color = color[i];
    placeholder.insertAdjacentElement("beforeEnd", resSpan);
  }
}

function saveInLog(command, diceGroups, bonus) {
  let logHeader = document.getElementById('logHeader');
  let logItem = document.createElement("li");
  logItem.className = "logItem";
  logItem.innerHTML = ( command + " "
                      + diceGroups.map(dieGroup => String(dieGroup.count + "d" + dieGroup.sides)).join(" ") + " "
                      + (bonus != 0 ? bonus : "")
                      + " || ");
  logHeader.insertAdjacentElement("afterEnd", logItem);

  for (let i = 0; i < diceGroups.length; ++i) {
    logItem.innerHTML += "("
    diceGroups[i].throws.forEach(dieThrow => {
      let rollSpan = document.createElement("span");
      rollSpan.innerHTML = " " + dieThrow;
      rollSpan.style.color = diceGroups[i].getColor(dieThrow);
      logItem.insertAdjacentElement("beforeEnd", rollSpan);
    });
    logItem.innerHTML += ") ";
  }
}

function findResult(command, diceGroups, bonus=0) {
  let groupResults = [];
  let result;
  let color = "black";
  switch (command) {
    case "min": case "max": case "sum":
      for (let i = 0; i < diceGroups.length; ++i)
        groupResults.push(diceGroups[i][command]());
  }
  switch(command) {
    case "min": [result, color] = minArr(groupResults); break;
    case "max": [result, color] = maxArr(groupResults); break;
    case "sum": result = sumArr(groupResults); break;
    case "roll":
      result = diceGroups[0].throws.slice(0,4);
      color = result.map(function (dieThrow) {return diceGroups[0].getColor(dieThrow);});
      break;
    case "ability":
      let dieGroup = new DieGroup("4d6");
      result = dieGroup.sum() - dieGroup.min()[0];
      break;
    default:
      result = "Error";
  }

  if (isNaN(+result)) bonus = "";
  if (String(result).includes("NaN")) result = "Error";
  if (Array.isArray(result))
    printResult(result, color, bonus);
  else
    printResult([result], [color], bonus);
  saveInLog(command, diceGroups, bonus);
}


let button = document.getElementById('button');
let table = document.getElementById('rollTable');

table.onclick = function(event) {
  let td = event.target.closest('td');
  if (!td || !table.contains(td)) return;

  let dieGroup = new DieGroup(dieToStr(td.innerHTML, td.getAttribute("die")));
  findResult("roll", [dieGroup]);
};

button.onclick = function() {
  let text = document.getElementById("console").value.split(" ");
  let command = text[0];
  let diceGroups = [];
  let bonus = 0;
  for (let i = 1; i < text.length; ++i) {
    let idx = text[i].indexOf("d");
    if (idx !== -1) {
      let tmp = "";
      if (idx === 0) tmp = "1";
      let dieGroup = new DieGroup(tmp + text[i]);
      diceGroups.push(dieGroup);
    } else {
      bonus += +text[i];
    }
  }
  findResult(command, diceGroups, bonus);
  document.getElementById("console").value = "";
}
