// @ts-check

// ==UserScript==
// @name            Improved Moskino schedule
// @namespace       github.com/a2kolbasov
// @version         snapshot
// @description     Adds buttons to quickly switch to the next / previous day of the schedule, displays the day of the week for the selected date
// @name:ru         Улучшенное расписание Москино
// @description:ru  Добавляет кнопки быстрого переключения на следующий / предыдущий день расписания, отображает день недели выбранной даты
// @author          Aleksandr Kolbasov
// @license         MPL-2.0
// @match           https://mos-kino.ru/schedule/*
// @grant           none
// ==/UserScript==

/*
 * Copyright © 2023 Aleksandr Kolbasov
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

(() => {
    const url = new URL(window.location.href);

    /** @type {HTMLDivElement} */
    const datePicker = document.querySelector('.date-picker');

    const dates = (new class {
        /**
         * Доступные в расписании даты
         * @type {string[]}
         */
        availableDates = Array.from(datePicker.querySelectorAll('[data-date]')).map(node => node.getAttribute('data-date'));

        currentDate = url.searchParams.get('date') || new Date().toLocaleDateString('sv' /* like ISO 8601 */, { timeZone: 'Europe/Moscow' });

        /**
         * @returns {?string}
         */
        nextDate() {
            let index = this.availableDates.indexOf(this.currentDate);
            if (index < 0 || index + 1 === this.availableDates.length) return null;
            return this.availableDates[index + 1];
        }

        /**
         * @returns {?string}
         */
        prevDate() {
            let index = this.availableDates.indexOf(this.currentDate);
            if (index <= 0) return null;
            return this.availableDates[index - 1];
        }

        /**
         * @param {string} date
         * @returns {string}
         */
        toWeekday(date) {
            return new Date(date).toLocaleString('ru', { weekday: 'short' }).toUpperCase();
        }
    }());

    /**
     * @param {string} date
     * @returns {URL}
     */
    function getUrlWithDate(date) {
        const changedUrl = new URL(url);
        changedUrl.searchParams.set('date', date);
        return changedUrl;
    }

    (function addButtons() {
        datePicker.style.minWidth = 'unset';

        const prevBtn = document.createElement('a');
        const nextBtn = document.createElement('a');
        datePicker.before(prevBtn);
        datePicker.after(nextBtn);

        prevBtn.textContent = '\u{1f519}'; // 🔙
        nextBtn.textContent = '\u{1f51c}'; // 🔜
        prevBtn.style.fontSize = 'x-large';
        nextBtn.style.fontSize = 'x-large';

        const prevDate = dates.prevDate();
        const nextDate = dates.nextDate();
        if (prevDate) prevBtn.href = getUrlWithDate(prevDate).search;
        if (nextDate) nextBtn.href = getUrlWithDate(nextDate).search;
    })();

    (function addWeekday() {
        const label = datePicker.querySelector('.label');
        const dateElement = label.querySelector('.value');
        const input = label.querySelector('input');

        const weedayElement = document.createElement('span');
        label.append(weedayElement);

        function changeWeekday() {
            if (!/^\d/.test(dateElement.textContent)) return; // если дата не выбрана
            let weekday = dates.toWeekday(input.value || dates.currentDate);
            weedayElement.textContent = `(${weekday})`;
        }

        datePicker.querySelector('.calendar-slider').addEventListener('click', changeWeekday); // todo: из 1-ого скрипта
        changeWeekday();
    })();
})();

/**
 * @param {string} date
 * @param {number} startIndex
 * @param {number} endIndex
 * @returns {number} index
 */
function indexOfDate(arr, date, startIndex, endIndex) {
    let midIndex = Math.round((endIndex - startIndex) / 2) + startIndex - 1;
    let midDate = arr[midIndex];
    // let midDate = dates.availableDates[midIndex];

    if (date < midDate) return indexOfDate(arr, date, startIndex, midIndex);
    if (date > midDate) return indexOfDate(arr, date, midIndex + 1, endIndex);
    return midIndex;
}
