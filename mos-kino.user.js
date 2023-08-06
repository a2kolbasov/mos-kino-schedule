// ==UserScript==
// @name            Улучшенное расписание Москино
// @namespace       github.com/a2kolbasov
// @version         1.0.0
// @description     Добавляет кнопки быстрого переключения на следующий / предыдущий день расписания, отображает день недели выбранной даты
// @author          Aleksandr Kolbasov
// @license         MPL-2.0
// @icon            https://www.google.com/s2/favicons?sz=64&domain=mos-kino.ru
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
            let index = this.indexOfDate(this.currentDate);
            if (index + 1 >= this.availableDates.length) return null;

            /**
             * если текущий даты нет в массиве, под найденным индексом сохранён следующий доступный в расписании день (@see {@link indexOfDate})
             */
            let currentOrNextDate = this.availableDates[index];
            return currentOrNextDate === this.currentDate ? this.availableDates[index + 1] : currentOrNextDate;
        }

        /**
         * @returns {?string}
         */
        prevDate() {
            let index = this.indexOfDate(this.currentDate);
            if (index === 0) return null;
            return this.availableDates[index - 1];
        }

        /**
         * @param {string} date
         * @returns {string}
         */
        toWeekday(date) {
            return new Date(date).toLocaleString('ru', { weekday: 'short' }).toUpperCase();
        }

        /**
         * Выдаёт индекс в массиве расписания, под которым строка с датой должна находится в отсортированном массиве.
         * Она не обязана быть в этом массиве (для случаев отсутствия запланированных событий на данную дату).
         * Если строки нет в массиве, то индекс обозначает место, куда она бы вклинилась бы в отсортированном массиве.
         * Для массива `[1, 5]` поиск элемента `3` вернёт индекс `1` -- как для `[1, 3, 5]`.
         * @param {string} date
         * @param {number} [startIndex]
         * @param {number} [endIndex]
         * @returns {number}
         */
        indexOfDate(date, startIndex = 0, endIndex = dates.availableDates.length) {
            if (startIndex === endIndex) return startIndex;
            let midIndex = Math.round((endIndex - startIndex) / 2) + startIndex - 1;
            let midDate = dates.availableDates[midIndex];

            if (date < midDate) return this.indexOfDate(date, startIndex, midIndex);
            if (date > midDate) return this.indexOfDate(date, midIndex + 1, endIndex);
            return midIndex;
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

        datePicker.querySelector('.calendar-slider').addEventListener('click', changeWeekday);
        changeWeekday();
    })();

    (function autoclickOnDateSelect() {
        datePicker.querySelector('.calendar-slider').addEventListener('click', e => {
            if (e.target.getAttribute('data-date')) {
                queueMicrotask(() => {
                    datePicker.querySelector('.bt').click();
                });
            }
        });
    })();
})();
