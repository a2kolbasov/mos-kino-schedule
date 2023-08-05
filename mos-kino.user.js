// @ts-check

// ==UserScript==
// @name            Mos-kino 2
// @version         0.1
// @description     Перемещение по календарю назад/вперёд, день недели у выбранной даты
// @author          Aleksandr Kolbasov
// @match           https://mos-kino.ru/schedule/*
// @grant           none
// ==/UserScript==

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
     *
     * @param {string} date
     * @returns {string}
     */
    toWeekday(date) {
        return new Date(date).toLocaleString('ru', { weekday: 'short' }).toUpperCase();
    }
}());

const page = (new class {
    addButtons() {
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
    }

    addWeekday() {
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

///
// init
///

page.addButtons();
page.addWeekday();
