let store = {
    user: { name: "Student" },
    apod: 'curiosity',
    rover: {},
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    photos: []
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState);
    render(root, store);
    initEvents(root, store);
}

const render = async(root, state) => {
    root.innerHTML = App(state);
}

// Create a custom function to loop over a specific number of iterations
const times = x => f => {
    if (x > 0) {
        f()
        times(x - 1)(f);
    }
}

// Use skeleton loading for better UX while using a lightweight external library
const renderLoading = (root, state) => {
    let imagesHtml = '';
    let tabsHtml = '';

    let twelveTimesLoop = times(12)
    twelveTimesLoop(() => {
        imagesHtml += `<div class="col-12 col-sm-4">
            <div class="ph-item">
                <div class="ph-col-12">
                    <div class="ph-picture"></div>
                    <div class="ph-row">
                        <div class="ph-col-12"></div>
                    </div>
                </div>
            </div>
        </div>`;
    });

    let threeTimesLoop = times(3);
    threeTimesLoop(() => {
        tabsHtml += `<div class="col-12 col-sm-4">
            <div class="ph-item">
                <div class="ph-col-12">
                    <div class="ph-row big">
                        <div class="ph-col-12"></div>
                    </div>
                </div>
            </div>
        </div>`;
    });

    root.innerHTML = `
        <div class="container">
            <div class="row">
                ${tabsHtml}
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="ph-item">
                        <div class="ph-col-12">
                            <div class="ph-row big">
                                <div class="ph-col-12"></div>
                            </div>
                        </div>
                    </div>
                </div>           
            </div>
            <div class="row">
                ${imagesHtml}
            </div>
        </div>
    `;
};

// Init rover tabs events
const initEvents = (state) => {
    const navItems = document.getElementsByClassName('nav-item');
    // Convert HTMLCollection to array in order to loop with forEach
    [].slice.call(navItems).forEach(navItem => {
        // Attach event to each nav item
        navItem.addEventListener('click', (event) => {
            // Fetch selected rover photos
            getRoverPhotos(state, navItem.getAttribute('name'));
        });
    });;
};

// create content
const App = (state) => {
    let {
        rovers,
        photos
    } = state

    return `
        <div class="container mt-3">
            <div class="row">
                <div class="col-sm">
                    <ul class="nav nav-pills nav-fill">
                        ${rovers.map((rover) => Tab(rover, state)).join('')}
                    </ul>
                    <div class="container">
                        ${RoverInfo(state)}
                        <div id="roverImages" class="row mt-2">
                            ${photos.sort(function(a,b){
                                return new Date(b.earth_date) - new Date(a.earth_date);
                            }).slice(0, 12).map(RoverImage).join('')}
                        </div>                
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Rover Info Component
const RoverInfo = (state) => {
    let { photos } = state;

    const rover = photos[0] && photos[0].rover;

    if (!rover) return '';

    return `
        <div class="card card-block d-flex row">
            <div class="card-body align-items-center d-flex justify-content-center">
                <div class="col-md-4" style="text-align: center;">
                    <span class="font-weight-bold">Landing Date: </span>
                    <span>${rover.landing_date}</span>
                </div>
                <div class="col-md-4" style="text-align: center;">
                    <span class="font-weight-bold">Launch Date: </span>
                    <span>${rover.launch_date}</span>
                </div>
                <div class="col-md-4" style="text-align: center;">
                    <span class="font-weight-bold">Status: </span>
                    <span>${rover.status}</span>
                </div>
            </div>
        </div>
    `;
}

// Tab Component
const Tab = (rover, state) => {
    if (state.apod.toLowerCase() === rover.toLowerCase()) {
        return `
            <li class="nav-item" name="${rover}">
                <a class="nav-link active">${rover}</a>
            </li>
        `;
    }

    return `
        <li class="nav-item" name="${rover}">
            <a class="nav-link">${rover}</a>
        </li>
    `;
};

// Rover Image Component
const RoverImage = (rover) => {
    return `
        <div class="card card-block d-flex col-md-4 p-2">
            <img class="card-img-top" src="${rover.img_src}" alt="${rover.earth_date}">
            <div class="card-body align-items-center d-flex justify-content-center">
                <h5 class="card-title">${rover.earth_date}</h5>
            </div>
        </div>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    getRoverPhotos(store);
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate()) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
}

const getRoverPhotos = (state, rover) => {
    const apod = rover || state.apod;

    // Add loading screen before while fetching data
    renderLoading(root);

    return fetch(`http://localhost:3000/getRoverPhotos`, {
            headers: {
                'roverName': apod.toLowerCase()
            }
        })
        .then(res => res.json())
        .then(res => updateStore(store, {
            photos: res.photos || [],
            apod
        }))
}