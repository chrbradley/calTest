'use strict'

import React from 'react'
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  Dimensions
} from 'react-native'

import { map, clamp } from 'lodash'
import shortid from 'shortid'

const { width, height } = Dimensions.get('window')
import { generateYears, generateCalendar } from '../../_utilities/calendar'

const HEIGHT_UNIT = height / 16
const WIDTH_UNIT = width / 9
const ROW_HEIGHT = HEIGHT_UNIT * 13.5

const listContainerheight = HEIGHT_UNIT * 13.5
const sectionHeaderHeight = listContainerheight / 13
const cellHeight = listContainerheight - sectionHeaderHeight

const containerPaddingHorizontal = WIDTH_UNIT / 4
const ROW_WIDTH = width - (2 * containerPaddingHorizontal)
const monthHeight = cellHeight / 4
const monthWidth = (ROW_WIDTH - (2 * containerPaddingHorizontal)) / 3

const BUFFER_ITEMS = 5
const DISPLAY_ITEMS = 5
const CURRENT_BATCH_ITEMS = (BUFFER_ITEMS * 2) + DISPLAY_ITEMS

// console.time('generateYears()')
let YEARS = generateCalendar()
// console.timeEnd('generateYears()')

// console.time('map years')
let count = 0
YEARS = map(YEARS, (year, index) => {
  year[0].position = ROW_HEIGHT * count
  count++
  return year[0]
})
// console.timeEnd('map years')

class Day extends React.Component {
  // shouldComponentUpdate(nextProps) {
  //
  // }

  componentDidUpdate () {
    console.log('Day updated')
  }

  render () {
    let { date, dayOfWeek } = this.props.day

    let offsetDates = 0
    if (date === 1) {
      offsetDates = dayOfWeek * (monthWidth / 7)
    }

    return (
      <View style={[styles.day, {marginLeft: offsetDates}]}>
        <Text style={styles.date}>{date}</Text>
      </View>
    )
  }
}

class Month extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !this.props.month.month === nextProps.month.month
  }

  componentDidUpdate () {
    console.log('month updated')
  }
  _renderDays (days) {
    return days.map((day) => {
      let { dayOfYear, month, year } = day
      let key = `${year}:${month}:${dayOfYear}`
      return (
        <Day key={key} day={day} />
      )
    })
  }

  render () {
    const { month, days } = this.props.month
    const { year } = this.props.year
    return (
      <View style={styles.month}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthName}>{month}</Text>
        </View>
        <View style={styles.dayContainer}>
          {this._renderDays(days)}
        </View>
      </View>
    )
  }
}

class Months extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !this.props.year.year === nextProps.year.year
  }
  componentDidUpdate () {
    console.log('Months Updated')
  }

  _renderMonths (row) {
    const { year, months } = row

    return months.map((month) => {
      const key = `${year}:${month.month}`
      return (
        <Month key={key} year={year} month={month} />
      )
    })
  }

  render () {
    const { year } = this.props
    return (
      <View style={styles.monthsContainer}>
        {this._renderMonths(year)}
      </View>
    )
  }
}

class Year extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !this.props.year.year === nextProps.year.year
  }

  componentDidUpdate () {
    console.log('year updated')
  }

  render () {
    const { year } = this.props
    return (
      <View style={[styles.rowContainer, {top: year.position}]}>
        <View style={styles.yearContainer}>
          <Text style={styles.yearLabel}>{year.year}</Text>
        </View>
        <Months year={year} />
      </View>
    )
  }
}

export default class FixedHeightList extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      dataModel: YEARS,
      renderModel: YEARS.slice(0, CURRENT_BATCH_ITEMS),
      bodyHeight: CURRENT_BATCH_ITEMS * ROW_HEIGHT
    }
  }

  _renderRows () {
    return this.state.renderModel.map(row => {
      return (
        <Year key={`${row.year}`} year={row} />
      )
    })
  }

  render () {
    return (
      <View style={{flex: 1}}>
        <View style={styles.container}>
          <ScrollView
            scrollEventThrottle={16}
            onScroll={this.onScroll.bind(this)} >
            <View
              style={[styles.scrollContainer, {height: this.state.bodyHeight}]} >
              {this._renderRows()}
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }

  onScroll (e) {
    this.updateRenderModel(e.nativeEvent.contentOffset)
  }

  updateRenderModel (contentOffset) {
    // calculate first visible dataItem as y-position / height of item
    let firstItem = Math.max(0, Math.floor(contentOffset.y / ROW_HEIGHT))
    // console.log('firstItem: ', firstItem)

    let lowestItem = firstItem - BUFFER_ITEMS
    // console.log('lowestItem: ', lowestItem)
    let highestPossible = this.state.dataModel.length - CURRENT_BATCH_ITEMS
    // console.log('highestPossible: ', highestPossible)
    lowestItem = clamp(lowestItem, 0, highestPossible)
    // console.log('lowestItem clamped: ', lowestItem)

    // how many should we get
    let renderModelSize = CURRENT_BATCH_ITEMS

    let maxSlice = Math.min(this.state.dataModel.length, lowestItem + renderModelSize)

    // console.log('maxSlice: ', maxSlice)

    // get subset of dataModel to be rendered.
    let dataItems = this.state.dataModel.slice(lowestItem, maxSlice)

    // console.log('dataItems: ', dataItems.length)

    // calculate lowest y-position
    let lowestPosition = lowestItem * ROW_HEIGHT

    let renderModel = dataItems.map((dataItem, index) => {
      return {
        ...dataItem,
        position: lowestPosition + (index * ROW_HEIGHT)
      }
    })

    // console.log('renderModel.length: ', renderModel.length)
    let bodyHeight = this.state.dataModel.length * ROW_HEIGHT

    this.setState({
      renderModel,
      bodyHeight
    })
  }
}

let styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: listContainerheight,
    top: HEIGHT_UNIT * 1.5,
    paddingHorizontal: containerPaddingHorizontal,
    backgroundColor: 'palegreen'
    // backgroundColor: '#fff'
  },
  scrollContainer: {
    // backgroundColor: 'pink',
    overflow: 'hidden'
  },
  rowContainer: {
    position: 'absolute',
    height: ROW_HEIGHT,
    width,
    backgroundColor: 'pink'
  },
  yearContainer: {
    height: sectionHeaderHeight,
    width: ROW_WIDTH,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: 'darkgray',
    backgroundColor: 'mediumpurple'
  },
  yearLabel: {
    fontSize: 32,
    fontWeight: '200'
  },
  monthsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: cellHeight,
    width: ROW_WIDTH,
    justifyContent: 'space-between'
  },
  month: {
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    height: monthHeight,
    width: monthWidth,
    backgroundColor: 'dodgerblue'
  },
  monthHeader: {
    height: monthHeight / 4,
    width: monthWidth,
    justifyContent: 'center',
    // backgroundColor: '#fff'
  },
  monthName: {
    fontSize: 20,
    fontWeight: '200',
    color: 'red'
  },
  dayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: (monthHeight / 8) * 6,
    width: monthWidth,
    backgroundColor: 'purple'
  },
  day: {
    height: monthHeight / 8,
    width: monthWidth / 7.00001, // need decimal here to place 7 days per row
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'orange',
    borderWidth: 1,
    borderColor: 'black'
  },
  date: {
    fontSize: 8
  }
})
