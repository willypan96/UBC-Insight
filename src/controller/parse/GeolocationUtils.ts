import http = require("http");

const GEOLOCATION_ADDRESS_BASE = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team124/";

/* Returns the geolocation response from address. */
export async function getGeolocation(address: string): Promise<any> {
	address = encodeURIComponent(address);
	const url: string = GEOLOCATION_ADDRESS_BASE + address;
	return new Promise((fulfill, reject) => {
		const options = {
			hostname: "cs310.students.cs.ubc.ca",
			port: 11316,
			path: "/api/v1/project_team124/" + address,
			method: "GET",
			agent: false,
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
			}
		};

		http.get(url, (res: any) => {
			// console.log('http get');
			let data = "";
			res.on("data", (segment: any) => {
				data += segment.toString();
			});
			res.on("end", () => {
				fulfill(JSON.parse(data));
			});
			res.on("error", (err: any) => {
				console.log(err);
				reject(err);
			});
		}).end();
	});
}
