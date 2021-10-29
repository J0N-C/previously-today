/* global savedFacts */
/* imported savedFacts */
const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const $dailyFact = document.querySelector('#daily-fact');
const $dateLabel = document.querySelector('#date-label');
const $currentDate = document.querySelector('#current-date');
const $getNewFact = document.querySelector('#new-fact');
const $saveFact = document.querySelector('#save-fact');
const $dateModal = document.querySelector('#date-modal');
const $monthSelector = document.querySelector('#month-select');
const $daySelector = document.querySelector('#day-select');
const $viewNewDate = document.querySelector('#view-new-date');
const $submitNewDate = document.querySelector('#submit-new-date');
const $closeDateSelect = document.querySelector('#close-date-select');
const $saveNotify = document.querySelector('#save-notify');
const $calendarLabel = document.querySelector('#calendar-label');
const $calendarMonths = document.querySelector('#calendar-months');
const $mainDailyFact = document.querySelector('#main-daily-fact');
const $calendarList = document.querySelector('#calendar-list');
const $sidebarActiveButton = document.querySelector('#sidebar-active');
const $footerActive = document.querySelector('#footer-active');
const $factList = document.querySelector('#fact-list');
const xhr = new XMLHttpRequest(); /* temporary proxy request */
var getLimit = 0;
var viewingHomePage = true;
var today = dateToday();
var otherDate = [...today];
var factToday;
getFact(today);

/* temporary proxy listener */
xhr.addEventListener('load', function () {
  factToday = xhr.response;
  if ($dailyFact.textContent === factToday.text && getLimit < 4) {
    getLimit++;
    return getFact(otherDate);
  }
  $dailyFact.textContent = factToday.text;
  getLimit = 0;
});

/* Original get setup, replace when backend is learned!!!
const factRequest = new XMLHttpRequest();
factRequest.addEventListener('load', function () {
  factToday = JSON.parse(factRequest.response);
  if ($dailyFact.textContent === factToday.text && getLimit < 4) {
    getLimit++;
    return getFact(otherDate);
  }
  $dailyFact.textContent = factToday.text;
  getLimit = 0;
}); */

/* generate new fact */
$getNewFact.addEventListener('click', function () {
  $saveNotify.className = 'hidden';
  getFact(otherDate);
});

/* open view new date modal, auto populate selection with today */
$viewNewDate.addEventListener('click', function (event) {
  $dateModal.className = 'modal';
  for (let i = 0; i < $monthSelector.children.length; i++) {
    if (parseInt($monthSelector.children[i].getAttribute('value')) === today[0]) {
      $monthSelector.children[i].setAttribute('selected', 'selected');
    }
  }
  populateDays(checkDaysInMonth(today[0]));
  for (let i = 0; i < $daySelector.children.length; i++) {
    if (parseInt($daySelector.children[i].getAttribute('value')) === today[1]) {
      $daySelector.children[i].setAttribute('selected', 'selected');
    }
  }
});

/* submit new date for new fact of day */
$submitNewDate.addEventListener('click', function (event) {
  event.preventDefault();
  otherDate[0] = parseInt($monthSelector.value);
  otherDate[1] = parseInt($daySelector.value);
  $dateModal.className = 'hidden';
  $dateLabel.textContent = 'VIEWING DATE';
  if (otherDate[0] === today[0] && otherDate[1] === today[1]) {
    $dateLabel.textContent = 'TODAY\'S DATE';
  }
  $saveNotify.className = 'hidden';
  getFact(otherDate);
});

/* cancel and close new date modal */
$closeDateSelect.addEventListener('click', function (event) {
  event.preventDefault();
  $dateModal.className = 'hidden';
});

/* auto populate date selector days with days of month */
$monthSelector.addEventListener('change', function (event) {
  populateDays(checkDaysInMonth(parseInt($monthSelector.value)));
});

/* save fact */
$saveFact.addEventListener('click', function (event) {
  saveCurrentFact();
});

/* switch to calendar or daily fact views */
$sidebarActiveButton.addEventListener('click', function (event) {
  switchViewCalendar();
});
$footerActive.querySelector('button').addEventListener('click', function (event) {
  switchViewCalendar();
});

/* switch displayed calendar month */
$calendarMonths.addEventListener('click', function (event) {
  if (event.target.tagName !== 'BUTTON') return;
  for (let i = 0; i < $calendarMonths.children.length; i++) {
    $calendarMonths.children[i].className = '';
  }
  event.target.className = 'selected';
  const monthName = event.target.textContent;
  const monthNum = (monthNames.indexOf(monthName) + 1);
  loadFacts(monthNum);
});

/* entry objects format: savedFacts: {10: {1: {year: text, year:text}, 2: {year: text}}, 11: {}} */
function saveCurrentFact() {
  const year = factToday.year;
  const month = otherDate[0];
  const day = otherDate[1];
  if (savedFacts[month] === undefined) {
    savedFacts[month] = {};
  }
  if (savedFacts[month][day] === undefined) {
    savedFacts[month][day] = {};
  }
  if (savedFacts[month][day][year] === undefined) {
    savedFacts[month][day][year] = factToday.text;
  }
  $saveNotify.className = '';
}

function checkDaysInMonth(value) {
  let dayCount;
  switch (value) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      dayCount = 31;
      break;
    case 2:
      dayCount = 29;
      break;
    case 4:
    case 6:
    case 9:
    case 11:
      dayCount = 30;
      break;
  }
  return dayCount;
}

function populateDays(days) {
  const currentDayCount = $daySelector.length;
  if (days - currentDayCount === 0) return;
  if (days - currentDayCount > 0) {
    for (let i = (currentDayCount + 1); i <= days; i++) {
      const newDay = document.createElement('option');
      newDay.setAttribute('value', i);
      newDay.textContent = i;
      $daySelector.appendChild(newDay);
    }
  } else if (days - currentDayCount < 0) {
    const diff = currentDayCount - days;
    for (let i = 0; i < diff; i++) {
      $daySelector.lastChild.remove();
    }
  }
}

function dateToday() {
  const fullDate = [];
  const today = new Date();
  fullDate.push(today.getMonth() + 1);
  fullDate.push(today.getDate());
  return fullDate;
}

/*  CHANGE WHEN BACKEND IS LEARNED!!!
function getFact(date) {
  if ($dailyFact === null) return;
  const month = date[0];
  const day = date[1];
  $currentDate.textContent = `${monthNames[month - 1]} ${day}`;
  factRequest.open('GET', `http://numbersapi.com/${month}/${day}/date?json`);
  factRequest.send();
} */

function getFact(date) {

  if ($dailyFact === null) return;
  const month = date[0];
  const day = date[1];
  $currentDate.textContent = `${monthNames[month - 1]} ${day}`;
  const numbersAPIrequest = `http://numbersapi.com/${month}/${day}/date?json`;
  xhr.open('GET', `https://lfz-cors.herokuapp.com/?url=${numbersAPIrequest}`);
  xhr.setRequestHeader('token', 'abc123');
  xhr.responseType = 'json';
  xhr.send();
}

function switchViewCalendar() {
  if (viewingHomePage === true) {
    $mainDailyFact.classList.add('hidden');
    $dateLabel.classList.add('hidden');
    $currentDate.classList.add('hidden');
    $viewNewDate.classList.add('hidden');
    $calendarLabel.classList.remove('hidden');
    $calendarMonths.classList.remove('hidden');
    $calendarList.classList.remove('hidden');
    $sidebarActiveButton.textContent = 'BACK TO DAILY FACT';
    $footerActive.querySelector('button').textContent = 'BACK TO DAILY FACT';
    viewingHomePage = false;
    for (let i = 0; i < $calendarMonths.children.length; i++) {
      $calendarMonths.children[i].className = '';
    }
    $calendarMonths.children[(today[0] - 1)].className = 'selected';
    loadFacts(today[0]);
  } else {
    $mainDailyFact.classList.remove('hidden');
    $dateLabel.classList.remove('hidden');
    $currentDate.classList.remove('hidden');
    $viewNewDate.classList.remove('hidden');
    $calendarLabel.classList.add('hidden');
    $calendarMonths.classList.add('hidden');
    $calendarList.classList.add('hidden');
    $sidebarActiveButton.textContent = 'VIEW CALENDAR OF FACTS';
    $footerActive.querySelector('button').textContent = 'VIEW CALENDAR OF FACTS';
    viewingHomePage = true;
  }
}

function loadFacts(monthNum) {
  $factList.textContent = '';
  $calendarList.querySelector('h2').textContent = `SAVED FACTS FOR ${monthNames[(monthNum - 1)]}`;
  if (savedFacts[monthNum] === undefined) return;
  const dayCount = checkDaysInMonth(monthNum);
  for (let i = 1; i <= dayCount; i++) {
    if (savedFacts[monthNum][i] === undefined) continue;
    const newListDay = document.createElement('li');
    newListDay.textContent = `${monthNames[monthNum - 1]} ${i}`;
    newListDay.className = 'list-divider';
    $factList.appendChild(newListDay);
    const years = Object.keys(savedFacts[monthNum][i]);
    for (let j = 0; j < years.length; j++) {
      const newListItem = document.createElement('li');
      newListItem.textContent = savedFacts[monthNum][i][years[j]];
      $factList.appendChild(newListItem);
    }
  }
}
