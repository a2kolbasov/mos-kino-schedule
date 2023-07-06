// ==UserScript==
// @name         Mos-kino 2
// @version      0.1
// @description  try to take over the world!
// @author       A. Kolbasov
// @match        https://mos-kino.ru/schedule/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require      https://momentjs.com/downloads/moment-with-locales.js
// @require      https://momentjs.com/downloads/moment-timezone-with-data-10-year-range.js
// ==/UserScript==


const url = new URL(window.location.href)

const dateUtils = (new class {
    /** @type {string[]} */
    dates = Array.from(document.querySelectorAll('.date-picker [data-date]')).map(node => node.getAttribute('data-date'))

    currentDate = url.searchParams.get('date') || new Date().toLocaleDateString('sv' /* ISO 8601 */, { timeZone: 'Europe/Moscow' })

    /**
     * @param {string} currentDate
     * @returns {?string}
     */
    nextDate(currentDate) {
        let index = this.dates.indexOf(currentDate)
        if (index < 0 || index + 1 === this.dates.length) return null
        return this.dates[index + 1]
    }

    /**
     * @param {string} currentDate
     * @returns {?string}
     */
    prevDate(currentDate) {
        let index = this.dates.indexOf(currentDate)
        if (index <= 0) return null
        return this.dates[index - 1]
    }
}());


(function addButtons() {
    /** @type {HTMLDivElement} */
    const picker = document.querySelector('.date-picker')
    picker.style.minWidth = 'unset'

    const prev = document.createElement('a')
    const next = document.createElement('a')
    picker.before(prev)
    picker.after(next)
    // picker.append(prev)
    // picker.append(next)

    prev.innerHTML = '🔙'
    next.innerHTML = '🔜'
    prev.style.fontSize = 'x-large'
    next.style.fontSize = 'x-large'

    const prevDate = dateUtils.prevDate(dateUtils.currentDate)
    const nextDate = dateUtils.nextDate(dateUtils.currentDate)
    if (prevDate) prev.href = changeDate(prevDate).search
    if (nextDate) next.href = changeDate(nextDate).search
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
