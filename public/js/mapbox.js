/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidmliaGkiLCJhIjoiY2txejNhc3IxMWU1NDJ3bzYzN2cwZmtvZCJ9.3FISYWQMKtDqrEVj4iOoVQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/vibhi/ckqz6eusa5hc118qv1lhmof6i',
    scrollZoom: false,
    // center: [-118.113491, 32.111745],
    // zoom: 4,
    // interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //  Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> Day ${loc.day}: ${loc.description}<p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
