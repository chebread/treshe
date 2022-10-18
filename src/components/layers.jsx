const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'earthquakes',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100,
      '#f1f075',
      750,
      '#f28cb1',
    ],
    'circle-radius': ['step', ['get', 'point_count'], 15, 100, 30, 750, 40],
    'circle-opacity': 0.7,
  },
};

const unclusteredLayer = {
  id: 'data',
  type: 'circle',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-radius': 10,
    'circle-opacity': 0.7,
    'circle-color': '#007cbf',
  },
};

export { clusterLayer, unclusteredLayer };
