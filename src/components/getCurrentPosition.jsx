const getCurrentLocation = async () => {
  const data = await new Promise((res, rej) => {
    navigator.geolocation.getCurrentPosition(res, rej);
  });
  const crd = data.coords;
  const lat = crd.latitude;
  const long = crd.longitude;
  return { lat: lat, long: long };
};

export default getCurrentLocation;
