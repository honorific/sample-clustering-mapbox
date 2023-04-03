import useSWR from 'swr'
import ReactMapGL, {Marker, FlyToInterpolator} from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import './App.css'
import {useState} from 'react'
import {useRef} from 'react'
import useSupercluster from 'use-supercluster'
import {useEffect} from 'react'

function App() {
  const mapRef = useRef()
  const [bounds, setBounds] = useState([1, 1, 1, 1])

  const mouseDownHandler = () => {
    console.log('mouse down occurd good boy!')
  }
  const fetcher = (...args) =>
    fetch(...args).then((response) => response.json())

  const url =
    'https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&data=2019-10'

  const {data, error} = useSWR(url, fetcher)
  const crimes = data && !error ? data.slice(0, 2000) : []
  const points = crimes.map((crime) => ({
    type: 'Feature',
    properties: {
      cluster: false,
      crimeId: crime.id,
      category: crime.category,
    },
    geometry: {
      type: 'Point',
      coordinates: [crime.location.longitude, crime.location.latitude],
    },
  }))

  useEffect(() => {
    if (mapRef.current) {
      setBounds(mapRef?.current.getMap().getBounds().toArray().flat())
    } else {
      setBounds([-180, -85, 180, 85])
    }
  }, [mapRef?.current])

  if (mapRef.current) {
    console.log(
      'mapRef is: ',
      mapRef.current.getMap().getBounds().toArray().flat(),
    )
  }

  console.log('bounds are: ', bounds)

  const {clusters} = useSupercluster({
    points,
    zoom: 12,
    bounds,
    options: {radius: 75, maxZoom: 20},
  })

  console.log('first 200 crimes are: ', crimes)
  console.log('clusters are: , ', clusters)
  console.log('points are: ', points)
  return (
    <div
      style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
    >
      <ReactMapGL
        initialViewState={{
          latitude: 52.6376,
          longitude: -1.135171,
          zoom: 12,
        }}
        on
        maxZoom={20}
        style={{width: '90vw', height: '90vh'}}
        mapStyle='mapbox://styles/mapbox/streets-v11'
        mapboxAccessToken={process.env.REACT_APP_MAP_TOKEN}
        onMouseDown={mouseDownHandler}
        ref={mapRef}
      >
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates
          const {cluster: isCluster, point_count: pointCount} =
            cluster.properties
          if (isCluster) {
            return (
              <Marker
                key={cluster.id}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  style={{
                    backgroundColor: 'blue',
                    width: `${10 + (pointCount / points.length) * 50}px`,
                    height: `${10 + (pointCount / points.length) * 50}px`,
                    lineHeight: `${10 + (pointCount / points.length) * 50}px`,
                    padding: '10px',
                    verticalAlign: 'center',
                    color: 'white',
                    borderRadius: '100%',
                    textAlign: 'center',
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            )
          }
          return (
            <Marker
              key={cluster.properties.crimeId}
              latitude={latitude}
              longitude={longitude}
            >
              <button style={{border: '0', background: 'none'}}>
                <img
                  src='criminal.png'
                  alt='criminal'
                  style={{
                    backgroundColor: 'transparent',
                    border: '0',
                    borderRadius: '50%',
                  }}
                />
              </button>
            </Marker>
          )
        })}
      </ReactMapGL>
    </div>
  )
}

export default App
