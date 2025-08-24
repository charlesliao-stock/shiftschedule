//dateUtils.js

window.DateUtils = {
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  formatDate(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },

  getDatesRange(start, count) {
    return Array.from({ length: count }, (_, i) => this.addDays(start, i));
  },

  getColumnOffsetByDate(startDate, targetDate) {
    const msPerDay = 86400000;
    return Math.round((targetDate - startDate) / msPerDay);
  }
};