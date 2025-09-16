<a id="readme-top"></a>




<!-- Heading -->
# 📝 My BookStore Website

Welcome to my second Website. This Website is bootstraped and is used to practice API calls and connections using AXIOS
### Built With
*  [Jquery](https://jquery.com/)
*  [ExpressJS](https://expressjs.com/)
*  [EJS](https://ejs.co/)
##### To be added
*  [PostgreSQL](https://www.postgresql.org/)
*  [Axios HTTP](https://axios-http.com/docs/intro)

## Key Features
- ⚙️ Runs on an Express.js server with EJS-based dynamic webpages
##### To be added
- 💻 Uses AXIOS HHTP for API connection 
- 🕹️ Connected with PostgreSQL <!--(read further on how to create the database and join it with the server)-->
  
  <p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- Setting up the project -->
<!--
## Getting Started

### Prerequisites
*  Have pgAdmin 4 (PostgreSQL) installed

### Instructions to Start the Website
1. **Create a Database**  
   In pgAdmin, create a new database named **B1ogger** (note the number `1` instead of letter `l`) under the user `postgres`.

2. **Create Tables**  
   Run the following SQL queries:
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     user_name VARCHAR(100) NOT NULL UNIQUE,
     password VARCHAR(100) NOT NULL
   );
   CREATE TABLE blogs (
     id SERIAL PRIMARY KEY,
     blog_title VARCHAR(100) NOT NULL,
     blog_content TEXT NOT NULL,
     user_name VARCHAR(100) REFERENCES users(user_name)
   );
   ```
   -->
1. Clone the repo
   ```sh
   git clone https://github.com/Pr0m3T83u5/My_Blogger1_Website
   ```
<!--
4. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin Pr0m3T83u5/My_Blogger1_Website
   git remote -v # confirm the changes
   ```

5. **Configure Database Connection**  
   Open `index.js` and change the client details for your SQL server.
-->

2. **Install Dependencies**
   ```bash
   npm i
   ```

3. **Run the App**
   ```bash
   node index.js
   # or
   nodemon index.js
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

   <p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Note -->
## Roadmap
- [ ] Database functionality
- [ ] Add API functionality
- [ ] Security Features

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Acknowledgements -->
## Acknowledgments

* [Best-README-template](https://github.com/othneildrew/Best-README-Template?tab=readme-ov-file)
* [App Brewary Complete-Web-Dev Course](https://www.appbrewery.com/p/the-complete-web-development-course)
* [Penguin Random House API](https://www.penguinrandomhouse.biz/webservices/rest/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
