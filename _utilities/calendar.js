import Calendar from 'moment-calendar'
import moment from 'moment'

import { toUpper, range, map } from 'lodash'

export const generateCalendar = () => {
  let year = moment().get('year')
  // let yearRange = range(year - 50, year + 51)
  let yearRange = range(1900, 2001)
  let calendar = new Calendar()
  let data = {}

  yearRange = [2016]
  yearRange.forEach((year) => {
    let yearMap = {
      year,
      months: []
    }

    data[year] = []

    calendar.setStart(new Date(year, 0, 1))
    calendar.setEnd(new Date(year, 11, 31))

    let months = calendar.months(year)

    months.forEach((month) => {
      let monthObj = {}
      let monthAbrv = toUpper(month.start.format('MMM'))

      monthObj.month = monthAbrv
      monthObj.days = []

      let days = month.days()

      days.forEach((day) => {

        let date = day.start.get('date')
        let dayOfYear = day.start.get('dayOfYear')
        let dayOfWeek = day.start.get('day')

        let dayObj = {
          year,
          month: monthAbrv,
          date,
          dayOfYear,
          dayOfWeek
        }

        monthObj.days.push(dayObj)
      })

      yearMap.months.push(monthObj)
    })

    data[year].push(yearMap)
  })

  return data
}

export const generateYears = () => {
  let year = moment().get('year')
  // let yearRange = range(year - 50, year + 51)
  let yearRange = range(1900, 2001)
  let calendar = new Calendar()
  let data = {}

  yearRange.forEach((year) => {
    let yearMap = {
      year,
      months: []
    }

    let daysMap = {}
    daysMap.days = []
    data[year] = []

    calendar.setStart(new Date(year, 0, 1))
    calendar.setEnd(new Date(year, 11, 31))

    let months = calendar.months(year)

    months.forEach((month) => {
      let monthAbrv = toUpper(month.start.format('MMM'))
      let weeksMap = {}

      let days = month.days()

      days.forEach((day) => {
        let week = day.start.get('week')

        // handle special case when days belong to week 1 of following year
        if (monthAbrv === 'DEC' && week === 1) {
          week = 53
        }

        if (!weeksMap[week]) {
          weeksMap[week] = ['', '', '', '', '', '', '']
        }

        let date = day.start.get('date')
        let dayOfYear = day.start.get('dayOfYear')
        let dayOfWeek = day.start.get('day')

        let dayObj = {
          year,
          month: monthAbrv,
          date,
          week,
          dayOfYear,
          dayOfWeek
        }

        weeksMap[week][dayOfWeek] = dayObj
      })

      let weeks = map(weeksMap, (value, index) => {
        return {
          week: index,
          days: value
        }
      })

      const monthMap = {
        weeks,
        month: monthAbrv
      }

      yearMap.months.push(monthMap)
    })

    data[year].push(yearMap)
  })

  return data
}

export const buildDay = () => {
  let hours = 0
  let startHour = 12

  let data = []

  while (hours < 24) {
    if (hours === 1 || hours === 13) {
      startHour = 1
    }

    let meridiem = hours < 13 ? 'AM' : 'PM'
    let hour = hours === 12 ? 'Noon' : `${startHour} ${meridiem}`

    data.push(hour)
    startHour++
    hours++
  }
  return data
}
