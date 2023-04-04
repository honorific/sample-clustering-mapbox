import useSWR from 'swr'
import ReactMapGL, {Marker} from 'react-map-gl'
import supercluster from 'supercluster'
import 'mapbox-gl/dist/mapbox-gl.css'

import './App.css'
import {useState} from 'react'
import {useRef} from 'react'
import {useEffect} from 'react'

function App() {
  const mapRef = useRef()
  const [bounds, setBounds] = useState([1, 1, 1, 1])
  const [zoom, setZoom] = useState(0)
  const [points, setPoints] = useState([])
  const [clusters, setClusters] = useState([])
  const [crimes, setCrimes] = useState([])
  const superCluster = new supercluster({
    radius: 70,
    maxZoom: 20,
  })

  const mouseDownHandler = () => {
    console.log('mouse down occurd good boy!')
  }

  const handleZoom = (e) => {
    setZoom(Math.round(e.viewState.zoom))
    //superCluster.getLeaves(id)
    console.log('zoom is: ', zoom)
  }

  const fetcher = (...args) =>
    fetch(...args).then((response) => response.json())

  const url =
    'https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&data=2019-10'

  const {data, error} = useSWR(url, fetcher)
  useEffect(() => {
    setCrimes(data && !error ? data.slice(0, 200) : [])
    console.log('crime is: ', crimes)
  }, [data])

  useEffect(() => {
    setPoints(
      crimes.map((crime) => ({
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
      })),
    )
  }, [crimes])

  useEffect(() => {
    if (mapRef.current) {
      setBounds(mapRef?.current.getMap().getBounds().toArray().flat())
    }
  }, [mapRef?.current])

  console.log('bounds are: ', bounds)

  useEffect(() => {
    superCluster.load(points)
    console.log('points are: ', points)
    setClusters(superCluster.getClusters(bounds, zoom))
    console.log('clusters are: ', clusters)
  }, [points, zoom, bounds])

  useEffect(() => {
    if (mapRef.current) {
      setBounds(mapRef.current.getMap().getBounds().toArray().flat())
      console.log('bounds are: ', bounds)
    }
  }, [mapRef?.current])

  return (
    <div
      style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
    >
      <ReactMapGL
        initialViewState={{
          latitude: 52.6376,
          longitude: -1.135171,
          zoom,
        }}
        maxZoom={20}
        style={{width: '90vw', height: '90vh'}}
        mapStyle='mapbox://styles/mapbox/streets-v11'
        mapboxAccessToken={process.env.REACT_APP_MAP_TOKEN}
        onMouseDown={mouseDownHandler}
        onZoomEnd={(e) => handleZoom(e)}
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
                  onClick={() => {
                    const zoom = Math.min(
                      superCluster.getClusterExpansionZoom(cluster.id),
                      20,
                    )
                    mapRef.current.flyTo({
                      center: [longitude, latitude],
                      zoom,
                      speed: 1,
                    })
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
