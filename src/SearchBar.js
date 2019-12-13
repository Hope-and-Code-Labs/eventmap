import React, { useState } from 'react';
import {isMobile} from 'react-device-detect';
import EventList from './EventList';
import History from './History';
import locateImage from './img/icon_512x512.png';


export function SearchBar(props){
  const [input, setInput] = useState(props.currZip || '');
  const[rangeInput, setRangeInput] = useState(props.currRange);

  // frm: filters what events are displayed according to the kind of event
  const [eventKindInput, setEventKindInput] = useState(props.currEventKind || 'ALLEVENTS');      
   
  // frm: filters what events are displayed according to the date ranges for the events
  // frm: NYI - I will implement this once folks are happy with filtering on kind of event
  const [dateRange, setDateRange] = useState({start: "now", end: "now+14"});

  function onlySetNumbers(event){
    let baseValue = event.target.value;
    let replacedVal = baseValue.replace(/\D*/g, '')
    setInput(replacedVal)
  }

  function geolocate(event) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // limit accuracy to 3 decimial points (~100m), for user privacy
        fetch("https://nominatim.openstreetmap.org/reverse?"+
          "lat="+position.coords.latitude.toFixed(3)+
          "&lon="+position.coords.longitude.toFixed(3)+
          '&format=jsonv2')
      .then((res)=>res.json())
      .then((data)=>{
          if(data.address && data.address.postcode) {
            setZip(data.address.postcode);
          }
        });
      }, (error) => {
        console.error(error);

      });
    }
  }

  function onSubmit(event){
    event.preventDefault();
    props.updateRange(rangeInput);  // frm: calls setCurrRange() in App.js triggering a Mobilize API call and  a re-render
    setZip(input);
    // ??? frm: Should I add a call to setEventKind() here?
  }

  function setRange(input){
    setRangeInput(input);       // frm: updates local global state
    props.updateRange(input);   // frm: calls setCurrRange() in App.js triggering a Mobilize API call and a re-render
  }

  function setEventKind(input) {
    setEventKindInput(input);       // frm: update local global
    props.updateEventKind(input);   // frm: update App.js global - triggering re-render of list of events
  }

  function setZip(input) {
    setInput(input);            // frm: updates local state
    props.updateZip(input);     // frm: calls setCurrZip() in App.js - triggering a Mobilize API call and a re-render
    History.push(window.location.pathname+'?zip='+input);
  }

  /* ??? frm: TODO:
   *
   * Someone should help me think about what the right options are below for 
   * the kinds of events a user can filter on.  I have already removed some
   * of the kinds of events.  
   *
   * Note that the events are not always categorized properly - for instance,
   * I found a couple of user generated events that were categorized as TRAINING
   * when they were actually for CANVASS, but I suppose there is nothing to be
   * done about that.
   *
   */

  return(
    <div className={(props.events != null ? "searchBar activeList" : "searchBar") + (isMobile ? " mobileSearch" : "")}>
      <div className="userInput">
        <form onSubmit={onSubmit} id="zipForm" data-has-input={!!input.length}>
          <label for="zipInput">ZIP</label>
          <input type="text" id="zipInput" value={input} onInput={onlySetNumbers} required minLength="5" maxLength="5"></input>
          <button id="submitZip" onClick={onSubmit}>GO</button>
        </form>
        <button id="locateMe" onClick={geolocate}><img src={locateImage} alt="Use my location"></img></button>
      </div>
      
         <div className="kindOfEvent">
           <p> Kind of Event:
             <select value={eventKindInput} onChange={(e) => setEventKind(e.target.value)}>
               <option value='ALLEVENTS'>All Events</option>
               <option value='CANVASS'>Canvass</option>
               <option value='PHONE_BANK'>Phone Bank</option>
               <option value='TEXT_BANK'>Text Bank</option>
               <option value='FUNDRAISER'>Fundraiser</option>
               <option value='MEET_GREET'>Meet and Greet</option>
               <option value='HOUSE_PARTY'>House Party</option>
               <option value='TRAINING'>Training</option>
               <option value='FRIEND_TO_FRIEND_OUTREACH'>Friend to Friend</option>
               <option value='DEBATE_WATCH_PARTY'>Watch Party</option>
               <option value='RALLY'>Rally</option>
               <option value='TOWN_HALL'>Town Hall</option>
               <option value='COMMUNITY_CANVASS'>Community Canvass</option>
               <option value='CARPOOL'>Car Pool</option>
             </select>
           </p>
         </div>

      { props.events !== null &&
            <div className="searchRange">
            <p>Showing events within
              <select value={rangeInput} onChange={(event) => setRange(event.target.value)}>
                <option value='5'>5 mi</option>
                <option value='10'>10 mi</option>
                <option value='20'>20 mi</option>
                <option value='50'>50 mi</option>
                <option value='75'>75 mi</option>
                <option value='120'>120 mi</option>
              </select>
            </p>
        </div>


      }
           `

     
      {props.events !== null && !isMobile &&
        <EventList events={props.events} locFilt={props.locFilt} eventKind={eventKindInput} updatedHover={(item) => props.updatedHover(item)}/>
      }
    </div>
  );
}

export default SearchBar;
