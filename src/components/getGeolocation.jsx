const getGeolocation = (options = {}) => {
  const promise = new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  );
  return promise;
};

export default getGeolocation;
