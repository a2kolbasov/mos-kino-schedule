// ==UserScript==
// @name            Mos-kino 2
// @version         0.1
// @description     Перемещение по календарю назад/вперёд, день недели у выбранной даты
// @author          Aleksandr Kolbasov
// @match           https://mos-kino.ru/schedule/*
// @grant           none
// ==/UserScript==

const url = new URL(window.location.href)

/** @type {HTMLDivElement} */
const datePicker = document.querySelector('.date-picker')

const dateUtils = (new class {
    /** @type {string[]} */
    dates = Array.from(datePicker.querySelectorAll('[data-date]')).map(node => node.getAttribute('data-date'))

    currentDate = url.searchParams.get('date') || new Date().toLocaleDateString('sv' /* like ISO 8601 */, { timeZone: 'Europe/Moscow' })

    /**
     * @returns {?string}
     */
    nextDate() {
        let index = this.dates.indexOf(this.currentDate)
        if (index < 0 || index + 1 === this.dates.length) return null
        return this.dates[index + 1]
    }

    /**
     * @returns {?string}
     */
    prevDate() {
        let index = this.dates.indexOf(this.currentDate)
        if (index <= 0) return null
        return this.dates[index - 1]
    }

    /**
     * @param {string} date
     * @returns {string}
     */
    weekday(date) {
        return new Date(date).toLocaleString('ru', { weekday: 'short' }).toUpperCase()
    }
}());


(function addButtons() {
    datePicker.style.minWidth = 'unset'

    const prevBtn = document.createElement('a')
    const nextBtn = document.createElement('a')
    datePicker.before(prevBtn)
    datePicker.after(nextBtn)

    prevBtn.textContent = '\u{1f519}' // 🔙
    nextBtn.textContent = '\u{1f51c}' // 🔜
    prevBtn.style.fontSize = 'x-large'
    nextBtn.style.fontSize = 'x-large'

    const prevDate = dateUtils.prevDate(dateUtils.currentDate)
    const nextDate = dateUtils.nextDate(dateUtils.currentDate)
    if (prevDate) prevBtn.href = changeDate(prevDate).search
    if (nextDate) nextBtn.href = changeDate(nextDate).search
})();

(function addWeekday() {
    const label = datePicker.querySelector('.label')
    const dateElement = label.querySelector('.value')
    const input = label.querySelector('input')

    const weedayElement = document.createElement('span')
    label.append(weedayElement)

    function changeWeekday() {
        if (!/^\d/.test(dateElement.textContent)) return // если дата не выбрана
        let weekday = dateUtils.weekday(input.value || dateUtils.currentDate)
        weedayElement.textContent = `(${weekday})`
    }

    datePicker.querySelector('.calendar-slider').addEventListener('click', changeWeekday) // todo: из 1-ого скрипта
    changeWeekday()
})();

/**
 * @param {string} newDate
 * @returns {URL} new URL
 */
function changeDate(newDate) {
    const changedUrl = new URL(url)
    changedUrl.searchParams.set('date', newDate)
    return changedUrl
}
