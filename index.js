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


//ROUTES==========================================================
//root route
app.get('/', (req, res) => {
    res.redirect('/home');
});

//home route
app.get('/home', async (req, res) => {
    try{
        let lat = req.query.lat || 52.52; // Default to Berlin's latitude
        let lon = req.query.lon || 13.405; // Default to Berlin's longitude

        // Fetch current weather and hourly forecast data from Open-Meteo API
        let weatherCurrent = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation`);
        let weatherHourly = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation`);
        
        //Log the fetched data for debugging
        console.log(weatherCurrent.data);
        console.log(weatherHourly.data);

        // Render the home.ejs template and pass the weather
        res.render('home.ejs', {
            // Pass the fetched data to the template
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
        res.redirect('/home?lat='+cityLikeNames[0]["latitude"]+'&lon='+cityLikeNames[0]["longitude"]);
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