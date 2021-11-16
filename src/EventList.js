import React from 'react';
import moment from 'moment';
import groupBy from 'lodash.groupby';
import sortBy from 'lodash.sortby';
import { eventHasValidLocation } from './Util';
require('twix');


const MAX_DAYS_IN_LIST = 4;

function EventTimes(props) {
  const { rawTimes } = props;
  let sortedTimesByDate = groupBy(sortBy(rawTimes,
    // Sort all of the ranges by when they start;
    // Unix returns the millisecond time, so all
    // events will be different
    (item) => { return item.start.unix() }),
    // Group the ranges by the day they happen on;
    // fully including the year, month, and day
    // in that order guarantees that normal sorting
    // will respect 9/31 v 10/1, and 2020/01 vs 2019/12
    (item) => { return item.start.format('YYYY-MM-DD') }
  )

  let sortedDates = Object.keys(sortedTimesByDate).sort();

  const dateRowFactory = (date) => {
    let times = sortedTimesByDate[date];
    let dayStr = times[0].start.format('ddd M/D')
    let timeStrs = times.map((time) => time.range.format({ hideDate : true })).join(', ')
    return (
      <p key={`time-${date}`}>
        { dayStr }{' | '}{ timeStrs }
      </p>
    )
  }

  if (sortedDates.length <= MAX_DAYS_IN_LIST) {
    return sortedDates.map(dateRowFactory)
  } else {
    let nextDay = sortedDates[MAX_DAYS_IN_LIST - 1];
    let lastDay = sortedDates[sortedDates.length - 1];
    let nextStart = sortedTimesByDate[nextDay][0].start;
    let lastStart = sortedTimesByDate[lastDay][0].start;
    return sortedDates.slice(0,MAX_DAYS_IN_LIST - 1).map(dateRowFactory).concat(
      <p key="More">
        More Times from {nextStart.twix(lastStart, { allDay : true }).format()}
      </p>
    )
  }
}

export function EventList(props) {
  let listEvents;
  if(props.events.length > 0){
  listEvents = props.events.map((event) => {

    // Normalize Mobilize's time formatting into
    // easy-to-use moments
    let rawTimes = event['timeslots'].map((timeslot) => {
      let start = moment(timeslot.start_date * 1000);
      let end = moment(timeslot.end_date * 1000);
      return {
        start, end,
        range: start.twix(end)
      }
    })

    //Location filter: if user has clicked on a marker, then only show events at that location
    if(props.locFilt != null){
      if(eventHasValidLocation(event)) {
        if(event['location']['location']['latitude'] !== props.locFilt['lat'] || event['location']['location']['longitude'] !== props.locFilt['lng']){
          return(null); // event is not at the location filter's coordinates
        }
      } else {
        return(null);   // event is private - no location, hence no marker
      }
    }

    return (
      <a href={event['browser_url']}
        className="eventCard"
        target="_blank"
        rel="noopener"
        key={event['id']}
        coord={
          eventHasValidLocation(event) ?
          "" + event['location']['location']['latitude'] + "&" + event['location']['location']['longitude'] :
          ""}
        onMouseEnter={(event) => { props.updatedHover(event['currentTarget'].getAttribute('coord')) }}
        onMouseLeave={(event) => { props.updatedHover(null) }}>
        <li key={event['id'].toString()}>
          <div>
            <h3>{event['title']}</h3>
            <p><strong>{event['location']['venue']}</strong> {event['location']['locality'] ? "in" : ""} <strong>{event['location']['locality']}</strong></p>
            <EventTimes rawTimes={rawTimes} />
            <p className="eventRSVP">Click to RSVP</p>
          </div>
        </li>
      </a>

    )
  });
} else {
  listEvents = null;
}

  // At this point listEvents is either null or the HTML for a list of each of the events

  return (
    <ul className="eventList">{listEvents}
    <div className="kicker">
        <h4>Sorry! No events near you.</h4>
    </div>
    </ul>
  );

}

export default EventList;
