import React, { useCallback, useEffect, useState } from "react";
import L from "leaflet";
import "./ShowCrimes.css";
import useSupercluster from "use-supercluster";
import { Marker, useMap } from "react-leaflet";

const icons = {};
const fetchIcon = (count, size) => {
  if (!icons[count]) {
    icons[count] = L.divIcon({
      html: `<div class="cluster-marker" style="width: ${size}px; height: ${size}px;">
        ${count}
      </div>`,
    });
  }
  return icons[count];
};

function ShowCrimes({ data }) {

  // const parkData = data;
  const maxZoom = 22;
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(12);
  const map = useMap();

  // get map bounds
  function updateMap() {
    console.log("updating");
    const b = map.getBounds();
    setBounds([
      b.getSouthWest().lng,
      b.getSouthWest().lat,
      b.getNorthEast().lng,
      b.getNorthEast().lat,
    ]);
    setZoom(map.getZoom());
  }

  const onMove = useCallback(() => {
    updateMap();
  }, [map]);

  React.useEffect(() => {
    updateMap();
  }, [map]);

  useEffect(() => {
    map.on("move", onMove);
    return () => {
      map.off("move", onMove);
    };
  }, [map, onMove]);



  const points =  data.map((crime) => ({
    type: "Feature",
    properties: { cluster: false, crimeId: crime.properties.PARK_ID, category: crime.properties.NAME },
    geometry: {
      type: "Point",
      coordinates: [
        parseFloat(crime.geometry.coordinates[0]),
        parseFloat(crime.geometry.coordinates[1]),
      ],
    },
  }));

  const { clusters, supercluster } = useSupercluster({
    points: points,
    bounds: bounds,
    zoom: zoom,
    options: { radius: 500, maxZoom: 10 },
  });

  // console.log('cluster length');
  // console.log(clusters.length);

  return (
    <>
      {clusters.map((cluster) => {
        // every cluster point has coordinates
        const [longitude, latitude] = cluster.geometry.coordinates;
        // the point may be either a cluster or a crime point
        const { cluster: isCluster, point_count: pointCount } =
          cluster.properties;

        // we have a cluster to render
        if (isCluster) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              position={[latitude, longitude]}
              icon={fetchIcon(
                pointCount,
                10 + (pointCount / points.length) * 40
              )}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster.id),
                    maxZoom
                  );
                  map.setView([latitude, longitude], expansionZoom, {
                    animate: true,
                  });
                },
              }}
            />
          );
        }

        // we have a single point (crime) to render
        return (
          <Marker
            key={`crime-${cluster.properties.crimeId}`}
            position={[latitude, longitude]}
          />
        );
      })}
    </>
  );
}

export default ShowCrimes;
