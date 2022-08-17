const express = require("express");
const port = process.env.PORT || 8000;
const env = require("./config/environment");
const app = express();
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(env.asset_path));
app.use(expressLayouts);
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
	return res.render("home", {
		title: "Traverse Pages - NASA Images",
	});
});
//Proxy Server for NASA API
app.get("/images", async (req, res) => {
	const solValue = req.query.solValue;
	const pageValue = req.query.pageValue;
	let pagesArray = [];

	//FUNCTION: Fetches the Data by calling AJAX in Loop//
	const fetchImages = (solValue, pageValue) => {
		try {
			//If the page is the last page, then the pageValue will be the last page, & result will be "END", & end will be true, then the loop will end.
			let result = "";
			let end = false;
			let page = pageValue;
			while (result === "") {
				result = XHR_AJAX_Call(solValue, page, end);
				page++;
			}
			return res.status(200).json({
				message: "Images Fetched Successfully",
				data: pagesArray,
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({
				message: "Internal Server Error",
				data: [[]],
			});
		}
	};

	//FUNCTION: XHR AJAX Calls the Data to fetch//
	const XHR_AJAX_Call = (solValue, page, end) => {
		/*Page is the page number. It starts from 1. end is a boolean value to check if the page is the last page, as the last page will have 0 photos. If end is true, then the page is the last page. If end is false, then the page is not the last page. The last page will have 0 photos.*/
		const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${solValue}&page=${page}&api_key=${env.api_key}`;

		const xhr = new XMLHttpRequest();
		xhr.open("GET", url, false); //Synchronous request
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				const data = JSON.parse(this.responseText);
				const photos = data.photos;
				if (photos.length === 0) {
					end = true;
					return;
				} else {
					end = false;
					pagesArray.push(photos);
				}
			} else {
				console.log("Something went wrong");
				alert("Something went wrong");
				return;
			}
		};
		xhr.onerror = function () {
			console.log("Something went wrong");
			alert("Something went wrong");
			return;
		};
		xhr.send();

		if (end) {
			return "END";
		} else {
			return "";
		}
	};

	fetchImages(solValue, pageValue);
});

app.listen(port, (err) => {
	if (err) {
		console.log(err);
		return;
	}
	console.log(`Server is running successfully on port: ${port}`);
});
