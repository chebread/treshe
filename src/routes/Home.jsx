import Map from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const Home = () => {
  return (
    <div>
      <Map
        initialViewState={{
          longitude: -100,
          latitude: 40,
          zoom: 3.5,
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_API_KEY}
      />
    </div>
  );
};

export default Home;
