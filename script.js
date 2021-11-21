'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    constructor(coords, distance, duration) {
        this.date = new Date();
        this.id = (Date.now() + '').slice(-10);
        this.coords = coords;
        this.distance = distance; // in km
        this.duration = duration; // in min
    }
}

class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.type = 'running';
        this.calcPace();
    }

    calcPace() {
        // min/km
        return this.pace = this.duration / this.distance;
    }
}

class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.type = 'cycling'
        this.calcSpeed();
    }

    calcSpeed() {
        // km/h
        return this.speed = this.distance / (this.duration / 60);
    }
}


class App {
    constructor() {
        this.map;
        this.mapEvent;
        this.workouts = [];
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert('Could not get your position')
            })
        };
    }

    _loadMap(position) {
        const {
            latitude
        } = position.coords;
        const {
            longitude
        } = position.coords;

        const cords = [latitude, longitude];

        this.map = L.map('map').setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        this.map.on('click', this._showForm.bind(this));
    }
    _showForm(mapE) {
        this.mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }
    _newWorkout(e) {
        const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);
        const {
            lat,
            lng
        } = this.mapEvent.latlng;
        let workout;

        e.preventDefault();

        //Get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        //If workout running, create running object
        if (type === 'running') {
            const cadence = +inputCadence.value;
            if (!validInput(distance, duration, cadence) || !allPositive(distance, duration, cadence)) {
                return alert('Input have to be positive number!');
            }

            workout = new Running([lat, lng], distance, duration, cadence);

        }

        //If workout cycling, create cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;
            if (!validInput(distance, duration) || !allPositive(distance, duration)) {
                return alert('Input have to be positive number!');
            }
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        this.workouts.push(workout);

        //Clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        this.renderWorkoutMarker(workout);
    }

    renderWorkoutMarker(workout) {
        L.marker(workout.coords).addTo(this.map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            }))
            .setPopupContent(workout.type)
            .openPopup();
    }
};

const app = new App();