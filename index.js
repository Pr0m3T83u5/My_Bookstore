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

//
function timeFormatToHourConversion(time){
    //converts the API given time format to HH:MM, H-hour M-minute
    let longHour = time.split("T")[1];
    //converts the HH:MM to an integer HH 
    let hour = longHour.split(":")[0];
    return hour;
}

function array_timeFormatToHourConversion(timeArray){
    let timeArrayFormatted = [];
    for(let i=0; i<timeArray.length; i++){
        timeArrayFormatted.push(timeArray[i].split("T")[1]);
    }
    return timeArrayFormatted;
}

function next_N_HoursIndices(timeArray, currentTime, N){
    var hourIndices =[]; //for storing the index values

    let thisCurrentTime = timeFormatToHourConversion(currentTime);
    let startIndex = 0; //Stores the index of the current time 

    //Optimize by halving the interavals...Is it but really an optimisation?
    
    //Loops through each entry of the array
    for(let i=0; i<timeArray.length; i++){
        let newTime = timeFormatToHourConversion(timeArray[i]);
        //finds the index of the current time
        if(newTime > thisCurrentTime){
            startIndex = i;
            break
        }
    }
    //Starts at the current time and add the next N entries to the array
    for(let i=0; i<N; i++){
        hourIndices.push(startIndex+i);
    }
    return hourIndices;
}

function valuesAtIndex(array, indexArray){
    let values = [];
    for(let i=0; i<indexArray.length; i++){
        values.push(array[indexArray[i]]);
    }
    return values;
}

function toArray(arr1, arr2){
    let mainArr = [];
    for(let i=0; i<arr1.length; i++){
        mainArr.push([arr1[i],arr2[i]]);
    }
    return mainArr;
}

function toObject(keysArray, valueArray){
    var dict = {};
    keysArray.forEach((key,index) => {
        dict[key] = valueArray[index];
    })
    return dict;
}
//ROUTES==========================================================
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
        console.error('Error fetching data from Open-Meteo API:', error);
        res.status(500).send('Internal Server Error');
        return;
    }
    
});
//================================================================

//API ROUTES======================================================
app.post('/getCity', async (req, res) => {
    let cityName = req.body.cityName;
    try{
        const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName.toUpperCase()}&count=10&language=en&format=json`);
        cityLikeNames = response.data["results"];
        // console.log(cityLikeNames[0]); // Log the first city object for verification
        // console.log(cityLikeNames); // Log the entire array of city objects for verification 
        res.redirect('/home?city='+cityLikeNames[0]["name"]+"_"+cityLikeNames[0]["admin1"]+"_"+cityLikeNames[0]["country"]+'&lat='+cityLikeNames[0]["latitude"]+'&lon='+cityLikeNames[0]["longitude"]);
    } catch (error) {
        console.error('Error fetching data from Open-Meteo API:', error);
        res.status(500).send('Internal Server Error');
        return;
    }
});
//================================================================

//Listening Route
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});