/* Mock demonstration content. No access information or route has been verified. */
window.ACCESS_DEMO = {
  layers: {
    toilet:{label:'Toilets',singular:'Toilet',icon:'toilet',colour:'#304e6a'},
    rest:{label:'Rest stops',singular:'Rest stop',icon:'bench',colour:'#704816'},
    quiet:{label:'Quiet places',singular:'Quiet place',icon:'leaf',colour:'#4d4e79'},
    crossing:{label:'Crossings',singular:'Crossing',icon:'crossing',colour:'#185347'},
    water:{label:'Drinking water',singular:'Drinking water',icon:'water',colour:'#205564'},
    entry:{label:'Entries',singular:'Entry',icon:'train',colour:'#6e3d31'},
    transport:{label:'Public transport',singular:'Transport stop',icon:'bus',colour:'#304e6a'},
    shop:{label:'Shops',singular:'Shop',icon:'shop',colour:'#6e3d31'},
    food:{label:'Food & drink',singular:'Food & drink',icon:'food',colour:'#704816'},
    activity:{label:'Things to do',singular:'Activity',icon:'activity',colour:'#4d4e79'}
  },
  places:[
    {id:'station',type:'entry',name:'Railway Station entrance',area:'North Terrace',coordinates:[138.59688,-34.9215],teaser:'Sample step-free entry',details:'Example only: a level entrance with a wide approach and automatic doors.',facilities:'Mock details: level approach; wide entrance; tactile entrance cue.',unknown:'Door width, opening hours, lift reliability and actual entrance access have not been checked.'},
    {id:'terrace-rest',type:'rest',name:'A pause on North Terrace',area:'North Terrace · near King William Road',coordinates:[138.59916,-34.92148],teaser:'Sample seating with armrests',details:'Example only: a shaded place to pause, with space beside the seat for a mobility aid.',facilities:'Mock details: backrest; armrests; shade; space beside seating.',unknown:'Seat height, path width, shade and current condition have not been checked.'},
    {id:'precinct-toilet',type:'toilet',name:'Cultural precinct toilet',area:'State Library precinct',coordinates:[138.60302,-34.92048],teaser:'Sample accessible toilet',details:'Example only: an accessible unisex toilet near the cultural precinct.',facilities:'Mock details: step-free entry; grab rails; left-side transfer space.',unknown:'Opening hours, transfer direction, dimensions and availability have not been checked. No Changing Places facility is confirmed.'},
    {id:'courtyard',type:'quiet',name:'A quieter courtyard',area:'Cultural precinct',coordinates:[138.60379,-34.92008],teaser:'Sample low-stimulation stop',details:'Example only: a small courtyard away from the street, with seating and a slower pace.',facilities:'Mock details: seating; lower traffic noise; space to pause.',unknown:'Noise, crowding, access and opening hours have not been checked. A quiet environment is not guaranteed.'},
    {id:'crossing',type:'crossing',name:'North Terrace crossing',area:'Near Kintore Avenue',coordinates:[138.60172,-34.92178],teaser:'Sample tactile crossing cues',details:'Example only: a signalised crossing with kerb ramps, tactile paving and an audible signal.',facilities:'Mock details: kerb ramps; tactile paving; audible crossing signal.',unknown:'Ramp slope, signal timing, traffic conditions and tactile cues have not been checked. Follow real crossing signals.'},
    {id:'water',type:'water',name:'City drinking fountain',area:'Near Rundle Mall',coordinates:[138.60055,-34.92275],teaser:'Sample seated-reach fountain',details:'Example only: a drinking fountain with clear approach space and a lower bottle-filling point.',facilities:'Mock details: lower outlet; clear approach; bottle refill.',unknown:'Reach height, working condition and access have not been checked.'},
    {id:'mall-toilet',type:'toilet',name:'Mall precinct toilet',area:'Rundle Mall precinct',coordinates:[138.60193,-34.92314],teaser:'Sample step-free facility',details:'Example only: a public toilet with a step-free approach.',facilities:'Mock details: wide doorway; grab rails; accessible washbasin.',unknown:'Opening hours, door operation, dimensions and availability have not been checked.'},
    {id:'gallery-rest',type:'rest',name:'A seat near the gallery',area:'North Terrace · Art Gallery precinct',coordinates:[138.60504,-34.92147],teaser:'Sample shaded rest stop',details:'Example only: a seat on a wide path near the gallery precinct.',facilities:'Mock details: backrest; companion space; shade.',unknown:'Surface, shade, seating and nearby access have not been checked.'}
  ],
  destinations:{
    library:{name:'State Library precinct',coords:[138.60295,-34.92058],base:640},
    gallery:{name:'Art Gallery precinct',coords:[138.60482,-34.9211],base:790},
    mall:{name:'Rundle Mall',coords:[138.60148,-34.92278],base:670}
  },
  streets:{type:'FeatureCollection',features:[
    {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[[138.593,-34.9220],[138.6075,-34.92186]]}},
    {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[[138.593,-34.9251],[138.608,-34.9250]]}},
    {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[[138.59835,-34.9185],[138.59904,-34.9219],[138.59905,-34.926]]}},
    {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[[138.60165,-34.918],[138.60173,-34.92187],[138.60175,-34.926]]}},
    {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[[138.60562,-34.918],[138.60572,-34.926]]}},
    {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[[138.59905,-34.92305],[138.607,-34.92305]]}},
    {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[[138.59718,-34.9219],[138.59718,-34.926]]}}
  ]},
  parks:{type:'FeatureCollection',features:[
    {type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[138.5964,-34.9186],[138.6065,-34.9186],[138.6065,-34.9200],[138.5964,-34.9200],[138.5964,-34.9186]]]}},
    {type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[138.6006,-34.9201],[138.60155,-34.9201],[138.60155,-34.92165],[138.6006,-34.92165],[138.6006,-34.9201]]]}}
  ]}
};

// Additional invented examples for open-ended category browsing.
window.ACCESS_DEMO.places.push(
 {id:'bus-example',type:'transport',name:'Example bus stop',area:'City centre',coordinates:[138.6003,-34.9254],teaser:'Sample boarding information',details:'An invented bus stop for trying the interface.',facilities:'Mock details: seating; boarding area; timetable display.',unknown:'Services, boarding access, tactile cues and stop location are not verified.'},
 {id:'tram-example',type:'transport',name:'Example tram stop',area:'City centre',coordinates:[138.5984,-34.9220],teaser:'Sample platform information',details:'An invented tram stop for trying the interface.',facilities:'Mock details: level approach; seating; platform space.',unknown:'Stop access, platform gap, service availability and current conditions are not verified.'},
 {id:'shop-example',type:'shop',name:'Example shop',area:'City centre',coordinates:[138.6012,-34.9232],teaser:'Sample entrance information',details:'An invented shop for trying the interface.',facilities:'Mock details: level entrance; wide door; space to turn.',unknown:'This is not a real business listing. Entrance dimensions, hours and facilities are not verified.'},
 {id:'cafe-example',type:'food',name:'Example café',area:'City centre',coordinates:[138.6024,-34.9230],teaser:'Sample seating information',details:'An invented café for trying the interface.',facilities:'Mock details: step-free entrance; different seating choices.',unknown:'This is not a real business listing. Menu, seating, noise and access are not verified.'},
 {id:'restaurant-example',type:'food',name:'Example restaurant',area:'City centre',coordinates:[138.6042,-34.9242],teaser:'Sample dining information',details:'An invented restaurant for trying the interface.',facilities:'Mock details: space beside tables; a quieter seating option.',unknown:'This is not a real business listing. Bookings, toilets, layout and access are not verified.'},
 {id:'activity-example',type:'activity',name:'Example visitor activity',area:'Cultural precinct',coordinates:[138.6030,-34.9210],teaser:'Sample visitor information',details:'An invented visitor activity for trying the interface.',facilities:'Mock details: step-free entry; seating; written information.',unknown:'No real event, opening hours, tickets, sensory conditions or accessibility arrangements are verified.'}
);
