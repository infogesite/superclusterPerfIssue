import React from "react";
// import { useQuery } from "react-query";
import { MapContainer, TileLayer } from "react-leaflet";
import "./Map.css";
import ShowCrimes from "./ShowCrimes";

import * as parkData from "./testData100k.json"
// import * as parkData from "./skateboard-parks.json"

function Map() {



  return (
    <MapContainer center={[45.4215, -75.6972]} zoom={4}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <ShowCrimes data={parkData.features} />
    </MapContainer>
  );
}

export default Map;
