
//Displaying the current time
var displayCurrentTime = function () {
        var date = moment();
        $("#clock").html(date.format("dddd, MMMM Do YYYY, HH:mm:ss a"));
    };

$(document).ready(function() {

    //Disply current time
    displayCurrentTime();

    //Display cuurent time every 1000 ms
    setInterval(displayCurrentTime, 1000);

    //Initializing Firebase
    var config = {
        apiKey: "AIzaSyBHgt1zQI_I01LKJPbjplk1I01P_hpyRRI",
        authDomain: "bryantrainscheduler1.firebaseapp.com",
        databaseURL: "https://bryantrainscheduler1.firebaseio.com",
        storageBucket: "bryantrainscheduler1.appspot.com",
        messagingSenderId: "122035912642"
    };
    firebase.initializeApp(config);
	 
    var database = firebase.database();

    //Handling the click event for adding train Button (Submit)
    $("#addTrainBtn").on("click", function(event) {
        
        //Preventing Submit button from submitting a form
        event.preventDefault();

        // Getting the user inputs
        var trainName = $("#trainName").val().trim();
        var trainDestination = $("#trainDestination").val().trim();        
        var firstTrainStartTimeInputValue = moment($("#firstTrainTime").val().trim(), "HH:mm", true);                       
        var trainFrequencyMin = $("#trainFrequency").val().trim();

        //Check if inputs are valid
        var inputsAreValid = checkInputValidity(trainName, trainDestination, firstTrainStartTimeInputValue, trainFrequencyMin);

        if (inputsAreValid) {

            // convert the value to Unix timestamp
            var firstTrainStartTime = firstTrainStartTimeInputValue.format("X");

            // Local object for holding train data
            var addedTrain = {
                name: trainName,
                destination: trainDestination,
                firstStart: firstTrainStartTime,
                frequency: trainFrequencyMin
            };

            // Uploading the train info to the database
            database.ref().push(addedTrain);

            // Clearing all of the input boxes
            $("#trainName").val("");
            $("#trainDestination").val("");
            $("#firstTrainTime").val("");
            $("#trainFrequency").val("");
        }

        // Prevents moving to new page
        return false;
    });

    // Createing Firebase event on adding train to the database (and initial load) and displaying its corresponding row 
    database.ref().on("child_added", function(childSnapshot, prevChildKey) {

        // Storing train property values in local variables.
        var newTrainName = childSnapshot.val().name;
        var newTrainDestination = childSnapshot.val().destination;
        var newFirstTrainStartTime = childSnapshot.val().firstStart;
        var newTrainFrequencyMin = childSnapshot.val().frequency;

        console.log("Train Name: " + newTrainName);
        console.log("Train Destination: " + newTrainDestination);
        //create a moment from newFirstTrainStartTime Unix timestamp and format it to MM/DD/YYYY, HH:mm
        console.log("Departure: " + moment.unix(newFirstTrainStartTime).format("MM/DD/YYYY, HH:mm") + "(military time)");
        console.log("freq: " + newTrainFrequencyMin + " minutes");

        // Calculating the amount of time since the train's first departure today until NOW in minutes
        var timeSinceFirstStartInMinutes = moment().diff(moment.unix(newFirstTrainStartTime, "X"), "minutes");

        var remainder = timeSinceFirstStartInMinutes % newTrainFrequencyMin;

        // if the first train has not left yet, the first parameter of the above operation is negative
        // so remainder should be decreased accordingly
        if(timeSinceFirstStartInMinutes < 0) {
            
            remainder--;
        }
        
        // how many more minutes from now to the arrival
        var remainingTime = newTrainFrequencyMin - remainder;

        console.log("Remaining Time: " + remainingTime + " minutes");

        // Adding remaining minutes to arrival to now
        var nextTrain = moment().add(remainingTime, "minutes");

        console.log("Arrival Time: " + moment(nextTrain).format("MM/DD/YYYY, HH:mm") + "(military time)");
        console.log("----------------------------------------------------")

        // Formatting next Train Arrival Time to HH:mm (changing from Unix Timestamp)
        var nextTrainArrivalTime = moment(nextTrain).format("HH:mm");

        $(".trainInformation").append("<tr><td>"+ newTrainName +"</td><td>"+ newTrainDestination +
                                    "</td><td>"+ newTrainFrequencyMin +"</td><td>"+ nextTrainArrivalTime +
                                    "</td><td>"+ remainingTime +"</td></tr>");
    }); 

    // Restoring the default labels if input(s) were invalid and the user is trying to enter a new entry
    $("#trainName").on("click", function() {

        $("label[for='trainName']").html("<label for='trainName' class='validEntry'>Train Name</label>");

        $("#trainName").val("");
    });

    $("#trainDestination").on("click", function() {

        $("label[for='trainDestination']").html("<label for='trainDestination' class='validEntry'>Destination</label>");

        $("#trainDestination").val("");
    });

    $("#firstTrainTime").on("click", function() {

        $("label[for='firstTrainTime']").html("<label for='firstTrainTime' class='validEntry'>First Departure Time (HH:MM - military time)</label>");

        $("#firstTrainTime").val("");
    });

    $("#trainFrequency").on("click", function() {

        $("label[for='trainFrequency']").html("<label for='trainFrequency' class='validEntry'>Frequency (min)</label>");

        $("#trainFrequency").val("");
    });

    
    // Function for checking the validity of inputs and displaying "Invalid Entry" if needed
    function checkInputValidity(trainName, trainDestination, firstTrainStartTimeInputValue, trainFrequencyMin) {
        
        var inputsAreOk = true;

        if (trainName !== "") {
            inputsAreOk &= true;
        }
        else {
            // Change the label
            $("label[for='trainName']").html("<label for='trainName' class='invalidEntry'>invalid Entry </label>");
            inputsAreOk &= false;
        }

        if (trainDestination !== "") {
            inputsAreOk &= true;
        }
        else {
            $("label[for='trainDestination']").html("<label for='trainDestination' class='invalidEntry'>invalid Entry </label>");
            inputsAreOk &= false;
        }

        if(firstTrainStartTimeInputValue.isValid()) {
            inputsAreOk &= true;
        }
        else {
            $("label[for='firstTrainTime']").html("<label for='firstTrainTime' class='invalidEntry'>invalid Entry </label>");
            inputsAreOk &= false;
        }

        remainderCheck = trainFrequencyMin % 1 ;

        //If the entry for the Frequency is a numbr and positive and integer
        if(($.isNumeric(trainFrequencyMin)) && (trainFrequencyMin > 0) && (remainderCheck === 0)) {
            inputsAreOk &= true; 
        }
        else {
            $("label[for='trainFrequency']").html("<label for='trainFrequency' class='invalidEntry'>invalid Entry </label>");
            inputsAreOk &= false;
        }
        // Returns true if all the inputs were valid
        return inputsAreOk;
    }

});