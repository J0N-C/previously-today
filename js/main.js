/* global savedFacts */
/* imported savedFacts */
const months = [{ name: 'JANUARY', days: 31 }, { name: 'FEBRUARY', days: 29 }, { name: 'MARCH', days: 31 }, { name: 'APRIL', days: 30 }, { name: 'MAY', days: 31 }, { name: 'JUNE', days: 30 }, { name: 'JULY', days: 31 }, { name: 'AUGUST', days: 31 }, { name: 'SEPTEMBER', days: 30 }, { name: 'OCTOBER', days: 31 }, { name: 'NOVEMBER', days: 30 }, { name: 'DECEMBER', days: 31 }];
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
const $deleteModal = document.querySelector('#delete-modal');
const $confirmDate = document.querySelector('#confirm-date');
const $confirmDelete = document.querySelector('#confirm-delete');
const $closeDelete = document.querySelector('#close-delete');
const $saveNotify = document.querySelector('#save-notify');
const $calendarLabel = document.querySelector('#calendar-label');
const $calendarMonths = document.querySelector('#calendar-months');
const $mainDailyFact = document.querySelector('#main-daily-fact');
const $calendarList = document.querySelector('#calendar-list');
const $sidebarActiveButton = document.querySelector('#sidebar-active');
const $footerActive = document.querySelector('#footer-active');
const $factList = document.querySelector('#fact-list');
const $tomorrow = document.querySelector('#tomorrow');
const $yesterday = document.querySelector('#yesterday');
var $allDeleteButtons;
const xhr = new XMLHttpRequest();
var getLimit = 0;
var viewingHomePage = true;
var today = dateToday();
var otherDate = [...today];
var factToday;
var deleteThis;
getFact(today);

/* proxy listener */
xhr.addEventListener('load', function () {
  factToday = xhr.response;
  if ($dailyFact.textContent === factToday.text && getLimit < 4) {
    getLimit++;
    return getFact(otherDate);
  }
  $dailyFact.textContent = factToday.text;
  getLimit = 0;
});

/* generate new fact */
$getNewFact.addEventListener('click', function () {
  $saveNotify.className = 'hidden';
  getFact(otherDate);
});

/* open view new date modal, auto populate selection with today */
$viewNewDate.addEventListener('click', function (event) {
  $dateModal.className = 'modal';
  for (let i = 0; i < $monthSelector.children.length; i++) {
    if (parseInt($monthSelector.children[i].getAttribute('value')) === otherDate[0]) {
      $monthSelector.children[i].setAttribute('selected', 'selected');
    }
  }
  populateDays(months[(otherDate[0] - 1)].days);
  for (let i = 0; i < $daySelector.children.length; i++) {
    if (parseInt($daySelector.children[i].getAttribute('value')) === otherDate[1]) {
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

/* select date for tomorrow */
$tomorrow.addEventListener('click', function (event) {
  event.preventDefault();
  $saveNotify.className = 'hidden';
  otherDate[1] += 1;
  if (otherDate[1] > months[(otherDate[0] - 1)].days) {
    otherDate[0] += 1;
    if (otherDate[0] > 12) {
      otherDate[0] = 1;
    }
    otherDate[1] = 1;
  }
  $dateLabel.textContent = 'VIEWING DATE';
  if (otherDate[0] === today[0] && otherDate[1] === today[1]) {
    $dateLabel.textContent = 'TODAY\'S DATE';
  }
  getFact(otherDate);
});

/* select date for yesterday */
$yesterday.addEventListener('click', function (event) {
  event.preventDefault();
  $saveNotify.className = 'hidden';
  otherDate[1] -= 1;
  if (otherDate[1] < 1) {
    otherDate[0] -= 1;
    if (otherDate[0] < 1) {
      otherDate[0] = 12;
    }
    otherDate[1] = months[(otherDate[0] - 1)].days;
  }
  $dateLabel.textContent = 'VIEWING DATE';
  if (otherDate[0] === today[0] && otherDate[1] === today[1]) {
    $dateLabel.textContent = 'TODAY\'S DATE';
  }
  getFact(otherDate);
});

/* cancel and close new date modal */
$closeDateSelect.addEventListener('click', function (event) {
  event.preventDefault();
  $dateModal.className = 'hidden';
});

/* cancel and close delete confirmation modal */
$closeDelete.addEventListener('click', function (event) {
  event.preventDefault();
  $deleteModal.className = 'hidden';
});

/* auto populate date selector days with days of month */
$monthSelector.addEventListener('change', function (event) {
  populateDays(months[$monthSelector.value - 1].days);
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
  let monthNum;
  for (let i = 0; i < months.length; i++) {
    if (months[i].name === monthName) {
      monthNum = (i + 1);
    }
  }
  $factList.setAttribute('data-month', monthNum);
  loadFacts(monthNum);
});

/* delete confirmation */
$factList.addEventListener('click', function (event) {
  if (event.target.tagName !== 'BUTTON') return;
  deleteThis = {};
  $deleteModal.className = 'modal';
  for (let i = 0; i < $allDeleteButtons.length; i++) {
    if ($allDeleteButtons[i] === event.target) {
      deleteThis.liIndex = i;
      deleteThis.factMonth = parseInt($factList.getAttribute('data-month'));
      deleteThis.factDay = parseInt(event.target.closest('li').getAttribute('data-day'));
      deleteThis.factYear = parseInt(event.target.closest('li').getAttribute('data-year'));
      deleteThis.factIndex = parseInt(event.target.closest('li').getAttribute('data-index'));
    }
  }
  $confirmDate.textContent = `${deleteThis.factMonth}-${deleteThis.factDay}-${deleteThis.factYear}`;
});

/* yes delete */
$confirmDelete.addEventListener('click', function (event) {
  event.preventDefault();
  savedFacts[deleteThis.factMonth][deleteThis.factDay][deleteThis.factYear].splice([deleteThis.factIndex], 1);
  if (savedFacts[deleteThis.factMonth][deleteThis.factDay][deleteThis.factYear].length === 0) {
    delete savedFacts[deleteThis.factMonth][deleteThis.factDay][deleteThis.factYear];
  }
  if (Object.keys(savedFacts[deleteThis.factMonth][deleteThis.factDay]).length === 0) {
    delete savedFacts[deleteThis.factMonth][deleteThis.factDay];
  }
  loadFacts(deleteThis.factMonth);
  $deleteModal.className = 'hidden';
});

/* entry objects format: savedFacts: {10: {1: {year: [text1, text2], year: [text1]}, 2: {year: [text]}}, 11: {}} */
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
    savedFacts[month][day][year] = [];
  }
  if (savedFacts[month][day][year].indexOf(factToday.text) === -1) {
    savedFacts[month][day][year].push(factToday.text);
  }
  $saveNotify.className = '';
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

function getFact(date) {
  if ($dailyFact === null) return;
  const month = date[0];
  const day = date[1];
  $currentDate.textContent = `${months[month - 1].name} ${day}`;
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
    $factList.setAttribute('data-month', today[0]);
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
  $calendarList.querySelector('h2').textContent = `SAVED FACTS FOR ${months[(monthNum - 1)].name}`;
  if (!savedFacts[monthNum] || Object.keys(savedFacts[monthNum]).length === 0) {
    const $noFacts = document.createElement('p');
    $noFacts.textContent = 'No facts saved';
    return $factList.appendChild($noFacts);
  }
  const dayCount = months[monthNum - 1].days;
  for (let i = 1; i <= dayCount; i++) {
    if (savedFacts[monthNum][i] === undefined) continue;
    const $newListDay = document.createElement('ul');
    const $newListDayTitle = document.createElement('h3');
    $newListDayTitle.textContent = `${months[monthNum - 1].name} ${i}`;
    $newListDay.className = 'list-divider lightgray';
    $newListDay.appendChild($newListDayTitle);
    $factList.appendChild($newListDay);
    const years = Object.keys(savedFacts[monthNum][i]);
    for (let j = 0; j < years.length; j++) {
      for (let k = 0; k < savedFacts[monthNum][i][years[j]].length; k++) {
        const $newListItem = document.createElement('li');
        $newListItem.className = 'flex spce-btwn wrap white';
        $newListItem.setAttribute('data-day', i);
        $newListItem.setAttribute('data-year', years[j]);
        $newListItem.setAttribute('data-index', k);
        const $newListText = document.createElement('p');
        $newListText.className = 'column-75';
        $newListText.textContent = savedFacts[monthNum][i][years[j]];
        $newListItem.appendChild($newListText);
        $newListDay.appendChild($newListItem);
        const $newDeleteContainer = document.createElement('div');
        $newDeleteContainer.className = 'column-20 row just-cent';
        const $newDeleteButton = document.createElement('button');
        $newDeleteButton.textContent = 'DELETE';
        $newDeleteButton.className = 'red column-full';
        $newListItem.appendChild($newDeleteContainer);
        $newDeleteContainer.appendChild($newDeleteButton);
      }
    }
  }
  $allDeleteButtons = document.querySelectorAll('li > div > button');
}
