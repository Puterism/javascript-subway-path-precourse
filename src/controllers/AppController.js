import ResultView from '../views/ResultView.js';
import Dijkstra from '../utils/Dijkstra.js';
import { MINIMUM_INPUT_LENGTH } from '../constants.js';
import {
  INVALID_NAME_LENGTH_MESSAGE,
  NO_STATION_DATA_MESSAGE,
  SAME_STATION_MESSAGE,
  INVALID_SEARCH_TYPE,
  NO_PATH_MESSAGE,
} from '../messages.js';

export default class AppController {
  constructor(stations, lines, paths) {
    this.stations = stations;
    this.lines = lines;
    this.paths = paths;
    this.resultView = new ResultView();
    this.graphs = {
      shortestDistance: new Dijkstra(),
      minimumTime: new Dijkstra(),
    };
    this.elements = {
      subwayPathFinderForm: document.querySelector('#subway-path-finder-form'),
    };

    this.initializePath(paths);
    this.setEventListener();
  }

  initializePath(initialPaths) {
    initialPaths.forEach((path) => {
      const { from, to, distance, time } = path;

      this.graphs.shortestDistance.addEdge(from, to, distance);
      this.graphs.minimumTime.addEdge(from, to, time);
    });
  }

  getFormData() {
    const formElements = {
      departureStationNameInput: document.querySelector('#departure-station-name-input'),
      arrivalStationNameInput: document.querySelector('#arrival-station-name-input'),
      searchTypeInput: document.querySelector('input[name="search-type"]:checked'),
    };

    const formData = {
      departureStationName: formElements.departureStationNameInput.value.trim(),
      arrivalStationName: formElements.arrivalStationNameInput.value.trim(),
      searchType: formElements.searchTypeInput.value,
    };

    return formData;
  }

  isExistStation(name) {
    return this.stations.includes(name);
  }

  validateSearchType(type) {
    if (!(type === 'shortest-distance' || type === 'minimum-time')) {
      throw new Error(INVALID_SEARCH_TYPE);
    }
  }

  validateStations(departureStationName, arrivalStationName) {
    if (departureStationName.length < MINIMUM_INPUT_LENGTH || arrivalStationName.length < MINIMUM_INPUT_LENGTH) {
      throw new Error(INVALID_NAME_LENGTH_MESSAGE);
    }

    if (!this.isExistStation(departureStationName) || !this.isExistStation(arrivalStationName)) {
      throw new Error(NO_STATION_DATA_MESSAGE);
    }

    if (departureStationName === arrivalStationName) {
      throw new Error(SAME_STATION_MESSAGE);
    }
  }

  validateFormData(formData) {
    const { departureStationName, arrivalStationName, searchType } = formData;

    try {
      this.validateSearchType(searchType);
      this.validateStations(departureStationName, arrivalStationName);
    } catch (err) {
      alert(err.message);
      return false;
    }

    return true;
  }

  getTotalDistanceTime(path) {
    const total = {
      distance: 0,
      time: 0,
    };

    for (let i = 1; i < path.length; i++) {
      const result = this.paths.find(
        ({ from, to }) => (path[i - 1] === from && path[i] === to) || (path[i - 1] === to && path[i] === from),
      );
      total.distance += result.distance;
      total.time += result.time;
    }

    return total;
  }

  findPath(formData) {
    const { departureStationName, arrivalStationName, searchType } = formData;
    let path = null;

    if (searchType === 'shortest-distance') {
      path = this.graphs.shortestDistance.findShortestPath(departureStationName, arrivalStationName);
    } else if (searchType === 'minimum-time') {
      path = this.graphs.minimumTime.findShortestPath(departureStationName, arrivalStationName);
    }

    if (!path) {
      alert(NO_PATH_MESSAGE);
      return;
    }

    const { distance, time } = this.getTotalDistanceTime(path);
    this.resultView.render(path, distance, time, searchType);
  }

  handleSubmit(event) {
    event.preventDefault();

    const formData = this.getFormData();

    if (!this.validateFormData(formData)) {
      return;
    }

    this.findPath(formData);
  }

  setEventListener() {
    this.elements.subwayPathFinderForm.addEventListener('submit', this.handleSubmit.bind(this));
  }
}
