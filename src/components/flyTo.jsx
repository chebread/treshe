const flyTo = ({ ref, lng, lat }) => {
  ref.current.flyTo({
    center: [lng, lat],
    zoom: 15,
    duration: 1000,
  });
};

export default flyTo;
