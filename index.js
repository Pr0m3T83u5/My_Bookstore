//IMPORTS
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

//APP CONFIG
const app = express();
const PORT = 3000;

//MIDDLEWARE
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); 

//Global Variables
var cityLikeNames = [];

//Functions===================================================================
/**
 * Takes in the String of date-time in the format provided by the API and 
 * returns the only the hour part from it
 * 
 * @param {string} time - Date-time value in the format given by the API(eg: 2025-09-09T23:45)
 * @returns {string} The hour substring
 */
function timeFormatToHourConversion(time){
    //converts the API given time format to HH:MM, H-hour M-minute
    let longHour = time.split("T")[1];
    //converts the HH:MM to an integer HH 
    let hour = longHour.split(":")[0];
    return hour;
}

/**
 * Takes in the String-Array of date-time in the format provided by the API and 
 * returns the only the hour part from each of the Strings 
 * 
 * @param {Array<string>} timeArray - Array of date-time Strings
 * @returns {Array<string>} Array of hour substring from each entry 
 */
function array_timeFormatToHourConversion(timeArray){
    //to store the hours from the timeArray
    let timeArrayFormatted = [];
    //Iterates through the array and adds the hour substring to the above empty list
    for(let i=0; i<timeArray.length; i++){
        timeArrayFormatted.push(timeArray[i].split("T")[1]);
    }
    return timeArrayFormatted;
}

/**
 * Returns the indices of the next N hours in the time array after the current time.
 * 
 * @param {Array<string>} timeArray - Array of date-time strings in API format
 * @param {string} currentTime - Current date-time string in API format
 * @param {number} N - Number of next hours to get indices for
 * @returns {Array<number>} Array of indices for the next N hours
 */
function next_N_HoursIndices(timeArray, currentTime, N){
    var hourIndices =[]; //for storing the index values
    var startIndex = 0; //Stores the index of the current time 

    let thisCurrentTime = timeFormatToHourConversion(currentTime);
    
    //Loops through each entry of the array
    for(let i=0; i<timeArray.length; i++){
        let newTime = timeFormatToHourConversion(timeArray[i]);
        //finds the index of the current time and breaks out of the loop
        if(newTime > thisCurrentTime){
            startIndex = i;
            break;
        }
    }
    //Starts at the current time and adds the next N entries to the array
    for(let i=0; i<N; i++){
        hourIndices.push(startIndex+i);
    }
    return hourIndices;
}

/**
 * Returns the values at the specified indices from the given array.
 * 
 * @param {Array<any>} array - The source array to extract values from.
 * @param {Array<number>} indexArray - Array of indices to extract values.
 * @returns {Array<any>} Array of values at the specified indices.
 */
function valuesAtIndex(array, indexArray){
    let values = [];
    for(let i=0; i<indexArray.length; i++){
        values.push(array[indexArray[i]]);
    }
    return values;
}

/**
 * Combines two arrays into an array of pairs, 
 * where each pair contains corresponding elements from both arrays.
 * 
 * @param {Array<any>} arr1 - The first array.
 * @param {Array<any>} arr2 - The second array.
 * @returns {Array<Array<any>>} A 2 dimensional array with paired index values 
 */
function toArray(arr1, arr2){
    let mainArr = [];
    for(let i=0; i<arr1.length; i++){
        mainArr.push([arr1[i],arr2[i]]);
    }
    return mainArr;
}

/**
 * Creates an object by mapping each key from the keysArray to the corresponding value in the valueArray.
 * 
 * @param {Array<string>} keysArray - Array of keys to use for the object.
 * @param {Array<any>} valueArray - Array of values to assign to each key.
 * @returns {Object} An object mapping keys to their corresponding values.
 */
function toObject(keysArray, valueArray){
    var dict = {};
    keysArray.forEach((key,index) => {
        dict[key] = valueArray[index];
    })
    return dict;
}
//============================================================================

//ROUTES======================================================================
//root route
app.get('/', (req, res) => {
    res.redirect('/home');
});

//home route
app.get('/home', async (req, res) => {
    const number_of_next_hours = 8;
    try{
        let lat = req.query.lat || 52.52; // Default to Berlin's latitude
        let lon = req.query.lon || 13.405; // Default to Berlin's longitude
        let cityStateCountry = req.query.city || "Berlin_Germany_Berlin"; // Default to Berlin

        // Fetch current weather and hourly forecast data from Open-Meteo API
        let weatherCurrent = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation`);
        let weatherHourly = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation`);
        
        // Get the next N indices
        var next_N_HourIndices=next_N_HoursIndices(
                                weatherHourly.data["hourly"]["time"],
                                weatherCurrent.data["current"]["time"],
                                number_of_next_hours);

        // Create an Object containing the Temperature and Precipitation of the next N hours
        //key array
        let hourlyTime = array_timeFormatToHourConversion(valuesAtIndex(weatherHourly.data["hourly"]["time"],next_N_HourIndices));
        //value arrays
        let hourlyTemperature = valuesAtIndex(weatherHourly.data["hourly"]["temperature_2m"],next_N_HourIndices);
        let hourlyPrecipitation = valuesAtIndex(weatherHourly.data["hourly"]["precipitation"],next_N_HourIndices);
        //Object 
        let hour_TempPrecip_Obj = toArray(hourlyTime, toArray(hourlyTemperature,hourlyPrecipitation));

        // Render the home.ejs template and pass the weather
        res.render('home.ejs', {
            N: number_of_next_hours,
            cityCountryState: cityStateCountry,
            currentWeather: weatherCurrent.data.current,
            hour_temp_precip: hour_TempPrecip_Obj,
        });
    } catch (error) {
        console.error('Error rendering home Page:', error);
        res.status(500).send('Internal Server Error');
        return;
    }
    
});

// POST to get city coordinates from the API
app.post('/getCity', async (req, res) => {
    let cityName = req.body.cityName; //city name from the form on the home page
    try{
        const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName.toUpperCase()}&count=10&language=en&format=json`);
        
        //stores the first 10 Objects in the global variable
        cityLikeNames = response.data["results"];

        //redirects to the home page with the information as query params
        res.redirect('/home?city='+cityLikeNames[0]["name"]+"_"+cityLikeNames[0]["admin1"]+"_"+cityLikeNames[0]["country"]+'&lat='+cityLikeNames[0]["latitude"]+'&lon='+cityLikeNames[0]["longitude"]);
    } catch (error) {
        console.error('Error fetching data from Open-Meteo API:', error);
        res.status(500).send('Internal Server Error');
        return;
    }
});
//============================================================================


//Listening Route
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});