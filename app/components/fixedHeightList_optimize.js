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
import { generateYears } from '../../_utilities/calendar'

const HEIGHT_UNIT = height / 16
const WIDTH_UNIT = width / 9
const ROW_HEIGHT = HEIGHT_UNIT * 13.5

const BUFFER_ITEMS = 5
const DISPLAY_ITEMS = 5
const CURRENT_BATCH_ITEMS = (BUFFER_ITEMS * 2) + DISPLAY_ITEMS

// console.time('generateYears()')
let YEARS = generateYears()
// console.timeEnd('generateYears()')

// console.time('map years')
let count = 0
YEARS = map(YEARS, (year, index) => {
  year[0].position = ROW_HEIGHT * count
  count++
  return year[0]
})
// console.timeEnd('map years')

class Month extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !this.props.month.month === nextProps.month.month
  }

  componentDidUpdate () {
    console.log('month updated')
  }
  _renderDay (day, week, month, year) {
    let dayOfYear = day.dayOfYear ? day.dayOfYear : shortid.generate()
    let { date } = day
    let key = `${year}:${month}:${week}:${dayOfYear}`

    return (
      <View key={key} style={styles.day}>
        <Text style={styles.date}>{date}</Text>
      </View>
    )
  }

  _renderWeek (week, month, year) {
    let { days } = week
    let weekIndex = week.week
    let key = `${year}:${month}:${weekIndex}`
    return (
      <View key={key} style={styles.week}>
        {days.map((day) => this._renderDay(day, weekIndex, month, year))}
      </View>
    )
  }
  render () {
    const monthName = this.props.month.month
    const { month, weeks } = this.props.month
    const { year } = this.props.year
    return (
      <View style={styles.month}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthName}>{month}</Text>
        </View>
        {weeks.map((week) => this._renderWeek(week, month, year))}
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
      <View style={styles.monthContainer}>
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
            scrollEventThrottle={500}
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

const listContainerheight = HEIGHT_UNIT * 13.5
const sectionHeaderHeight = listContainerheight / 13
const cellHeight = listContainerheight - sectionHeaderHeight

const containerPaddingHorizontal = WIDTH_UNIT / 4
const cellWidth = width - (2 * containerPaddingHorizontal)
const monthHeight = cellHeight / 4
const monthWidth = (cellWidth - (2 * containerPaddingHorizontal)) / 3

let styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: listContainerheight,
    top: HEIGHT_UNIT * 1.5,
    paddingHorizontal: containerPaddingHorizontal
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
    // backgroundColor: 'lime'
  },
  yearContainer: {
    overflow: 'hidden',
    height: sectionHeaderHeight,
    width: cellWidth,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: 'darkgray'
  },
  yearLabel: {
    overflow: 'hidden',
    fontSize: 32,
    fontWeight: '200'
  },
  monthContainer: {
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: cellHeight,
    width: cellWidth,
    justifyContent: 'space-between',
    // backgroundColor: '#fff'
  },
  month: {
    overflow: 'hidden',
    height: monthHeight,
    width: monthWidth,
    // backgroundColor: 'lime'
  },
  monthHeader: {
    overflow: 'hidden',
    height: monthHeight / 4,
    width: monthWidth,
    justifyContent: 'center',
    // backgroundColor: '#fff'
  },
  monthName: {
    overflow: 'hidden',
    fontSize: 20,
    fontWeight: '200',
    color: 'red'
  },
  week: {
    overflow: 'hidden',
    flexDirection: 'row',
    height: monthHeight / 8,
    width: monthWidth,
    // backgroundColor: 'purple'
  },
  day: {
    overflow: 'hidden',
    height: monthHeight / 8,
    width: monthWidth / 7,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'orange'
  },
  date: {
    overflow: 'hidden',
    fontSize: 8
  }
})
