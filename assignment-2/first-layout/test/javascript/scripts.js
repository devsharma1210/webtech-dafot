/**
 * Set cinema coordinates to storage
 **/
window.onload = function (e) {
    var cinemas = {
        'collection': [{
            'cinema_name': 'IMAX',
            'lat': 50.777477,
            'lon': 6.078240
        }, {
            'cinema_name': 'Cinema City',
            'lat': 50.759564,
            'lon': 6.072994
        }, {
            'cinema_name': 'National Cinema',
            'lat': 50.779663,
            'lon': 6.102961
        }]
    };
    localStorage.setItem('cinemas', JSON.stringify(cinemas));
};

function initReservationCanvas() {
    //create canvas element and context to draw in
    canvasReservation = document.getElementById("can-reservation");
    contextReservation = canvasReservation.getContext("2d");

    //images for seats
    imgSeatFree = new Image();
    imgSeatBooked = new Image();
    imgSeatReserved = new Image();

    imgSeatFree.src = "img/seat-free.png";
    imgSeatBooked.src = "img/seat-booked.png";
    imgSeatReserved.src = "img/seat-reserved.png";

    //init some global variables
    rows = 10;
    cols = 16;

    //add on click event
    canvasReservation.addEventListener("click", clickOnReservationCanvas, false);

    //init reservation data (read from local storage or create)
    var seatsString = localStorage.getItem('reservation');
    if (seatsString) {
        seats = JSON.parse(seatsString);
    }
    else {
        generateRandomReservation();
    }

    //draw reservations when the seat-picture is loaded
    imgSeatReserved.onload = function () {
        seatOffsetX = canvasReservation.width / 2 - imgSeatFree.width * (cols / 2);
        seatOffsetY = 80;
        drawReservationCanvas();
    };
}

function reserveSeats() {
    var count = 0;
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            var seat = seats[i][j];
            if (seat.inReservation) {
                count++;
                seat.free = false;
                seat.inReservation = false;
            }
        }
    }
    if (count == 0) {
        alert("Choose places to reserve")
    } else {
        alert("You have successfully reserved " + count + "places!");
        saveReservation();
        drawReservationCanvas();
        expandSection("contacts");
    }
}

function generateRandomReservation() {
    seats = new Array(cols);
    for (var i = 0; i < cols; i++) {
        seats[i] = new Array(rows);
        for (var j = 0; j < rows; j++) {
            //randomized initial reservation
            var free = true;
            if (Math.random() > 0.9) {
                free = false;
            }
            seats[i][j] = new Seat(i, j, free);
        }
    }
    saveReservation();
}

function saveReservation() {
    localStorage.setItem('reservation', JSON.stringify(seats));
}


/**
 * Draws background for reservation canvas
 */
function drawCanvasBackground(ctx) {
    ctx.fillStyle = "#f3e4c8";
    ctx.fillRect(0, 0, canvasReservation.width, canvasReservation.height);
}

/**
 * Draws the screen on canvas
 */
function drawScreen(ctx) {
    var leftBoundary = canvasReservation.width / 3.5 - 10;
    var rightBoundary = canvasReservation.width * 5 / 7 + 10;
    var borderRadius = 10;
    var upperBoundary = 10;
    var lowestBoundary = 40;

    ctx.fillStyle = "#A83E2A";
    ctx.beginPath();
    ctx.strokeStyle = "#A83E2A";
    ctx.moveTo(leftBoundary + borderRadius, upperBoundary);
    ctx.lineTo(rightBoundary - borderRadius, upperBoundary);
    ctx.quadraticCurveTo(rightBoundary, upperBoundary, rightBoundary, upperBoundary + borderRadius);
    ctx.lineTo(rightBoundary, upperBoundary + 20);
    ctx.quadraticCurveTo(rightBoundary, lowestBoundary, rightBoundary - borderRadius, lowestBoundary);
    ctx.lineTo(leftBoundary + borderRadius, lowestBoundary);
    ctx.quadraticCurveTo(leftBoundary, lowestBoundary, leftBoundary, lowestBoundary - borderRadius);
    ctx.lineTo(leftBoundary, lowestBoundary - 20);
    ctx.quadraticCurveTo(leftBoundary, upperBoundary, leftBoundary + borderRadius, upperBoundary);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.font = "24px mensch";
    ctx.fillText("Screen", canvasReservation.width / 2, 35);
}

/**
 * Draws reservations seats on canvas
 */
function drawSeats(ctx) {
    for (var i = 0; i < seats.length; i++) {
        for (var j = 0; j < seats[i].length; j++) {
            var posX = seatOffsetX + i * imgSeatFree.width;
            var posY = seatOffsetY + j * imgSeatFree.height;
            var imgSeat;
            if (seats[i][j].free && !seats[i][j].inReservation) {
                imgSeat = imgSeatFree;
            } else if (seats[i][j].inReservation) {
                imgSeat = imgSeatReserved;
            }
            else {
                imgSeat = imgSeatBooked;
            }
            ctx.drawImage(imgSeat, posX, posY);
        }
    }
}
/**
 * Draw or update the Reservation canvas
 */
function drawReservationCanvas() {
    var ctx = contextReservation;
    drawCanvasBackground(ctx);
    drawScreen(ctx);
    drawSeats(ctx);
}

/**
 * What happens when a user clicks on the reservation canvas?
 *
 * Currently we just turn green seats into red ones
 */
function clickOnReservationCanvas(e) {
    //get seat number
    var seat = getSeatFromClick(e);
    if (!seat) {
        console.log("Click was not on seat.");
        return;
    }

    //check if seat is free
    if (!seat.free) {
        alert("This seat is already booked!");
        return;
    } else {
        seat.inReservation = !seat.inReservation;
    }

    //reserve seat
    //seat.free = false;
    saveReservation();
    drawReservationCanvas();
}

/**
 * Calculate on which seat the user clicked
 * @param {Object} e
 */
function getSeatFromClick(e) {
    var x = e.layerX - seatOffsetX;
    var y = e.layerY - seatOffsetY;

    //find seat number
    x = Math.floor(x / imgSeatFree.width);
    y = Math.floor(y / imgSeatFree.height);

    if (x < 0 || y < 0 || y >= rows || x >= cols) {
        return false;
    }

    return seats[x][y];
}

/**
 * "Class" definition of Seats
 * @param {Object} column
 * @param {Object} row
 * @param {Object} free
 */
function Seat(column, row, free, inReservation) {
    this.row = row;
    this.column = column;
    this.free = free;
    this.inReservation = inReservation;
}

// Geolocation
/**
 * Select nearest cinema according to user coords
 **/
function chooseNearestCinema() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(findNearestCinema);
    } else {
        alert("Geolocation is not supported");
    }
}

/**
 * Find nearest cinema according to user coordinates and save to storage
 **/
function findNearestCinema(position) {
    var storage = localStorage.getItem('cinemas');
    var cinemas = JSON.parse(storage);
    var smallestDistance = null;
    var nearestCinema = null;

    for (var i = 0; i < cinemas.collection.length; i++) {
        var distance = countDistance(position.coords.latitude, position.coords.longitude, cinemas.collection[i].lat, cinemas.collection[i].lon);
        if (smallestDistance == null) {
            smallestDistance = distance;
            nearestCinema = cinemas.collection[i].cinema_name;
        } else {
            if (distance < smallestDistance) {
                smallestDistance = distance;
                nearestCinema = cinemas.collection[i].cinema_name;
            }
        }
    }
    var cinema = document.getElementById(nearestCinema);
    localStorage.setItem('chosen_cinema', nearestCinema);
    resetCinemas();
    resetMovies();
    setSelected(cinema)
    expandSection("movies");
    hideSection("reservation");
    hideSection("contacts");
}

/**
 * Count distance between two points
 **/
function countDistance(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var a = 0.5 - Math.cos((lat2 - lat1) * Math.PI / 180) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos((lon2 - lon1) * Math.PI / 180)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Save chosen ciname to the localStorage
 **/
function chooseCinemaOnButtonSelect(e) {
    var data = e.dataset;
    if (data) {
        localStorage.setItem('chosen_cinema', data['name']);
    }
    resetCinemas();
    resetMovies();
    setSelected(e);
    expandSection("movies");
    hideSection("reservation");
    hideSection("contacts");
}

/**
* Save chosen cinema to the localStorage
**/
function chooseMovie(e) {
    var data = e.dataset;
    if (data) {
        localStorage.setItem('chosen_movie', data['name']);
    }
    resetMovies();
    setSelected(e);
    expandSection("reservation");
    hideSection("contacts");
}

/**
 * Show section by class name
 **/
function expandSection(name) {
    var section = document.getElementsByClassName(name);
    if (section) {
        section[0].style.display = 'block';
    }
}

/**
* Hide section by the class name
**/
function hideSection (name) {
    var section = document.getElementsByClassName(name);
    if (section) {
        section[0].style.display = 'none';
    }
}

/**
* Reset cinemas cover colors
**/
function resetCinemas() {
    var dates = document.querySelectorAll(".date");
    for (var i = 0; i < dates.length; i++) {
        dates[i].style.background = "#F3E4C8";
    }
    var cinemas = document.querySelectorAll(".cinema");
    for (var i = 0; i < cinemas.length; i++) {
        cinemas[i].style.background = "#F3E4C8";
    }
}

/**
* Reset movies cover colors
**/
function resetMovies() {
    var movies = document.querySelectorAll(".cover");
    for (var i = 0; i < movies.length; i++) {
        movies[i].style.background = "#F3E4C8";
    }
}

/**
* Set color on selected object
**/
function setSelected(e) {
    e.parentNode.style.background = "#E1C693";
    if (e.children.length > 1) {
        e.children[1].style.background = "#E1C693"
    }
}