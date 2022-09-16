const BASE_URL = "http://localhost:4321";

/* Add dataset handler. */
document.getElementById("add-dataset-button")
	.addEventListener("click", async () => {
	let datasetId = document.getElementById("input-add-dataset-id").value;
	let datasetKind = document.getElementById("input-add-dataset-kind").value;
	let datasetZip = document.getElementById("input-add-dataset-upload-zip").files[0];

	let url = `${BASE_URL}/dataset/${datasetId}/${datasetKind}`;
	let response = await fetch(url, {
		method: "PUT",
		body: datasetZip
	});
	response = await response.json();
	console.log("response, ", response)

	document.getElementById("list-datasets-button").click();
	if ("result" in response) {
		alert(`Dataset successfully added.\n${response.result}`);
	} else {
		alert(`Dataset could not be added.\n${response.error}`);
	}
});

/* List datasets handler. */
document.getElementById("list-datasets-button")
				.addEventListener("click", async () => {
	let datasetsTbody = document.getElementById("list-datasets-table")
															.getElementsByTagName("tbody")[0];

	const response = await fetch(`${BASE_URL}/datasets`);
	let res = await response.json();
	res = res.result;

	let responseTbody = document.createElement("tbody");
	res.forEach((dataset) => {
		let newRow = responseTbody.insertRow();
		Object.keys(dataset).forEach((key) => {
			let newCell = newRow.insertCell();
			var newText = document.createTextNode(dataset[key]);
			newCell.appendChild(newText);
		});
	});

	datasetsTbody.parentNode.replaceChild(responseTbody, datasetsTbody)
});

/* Remove dataset handler. */
document.getElementById("remove-dataset-button")
				.addEventListener("click", async () => {
	let datasetId = document.getElementById("input-remove-dataset-id").value;

	console.log("DATASET ID:", datasetId)

	let url = `${BASE_URL}/dataset/${datasetId}`;
	let response = await fetch(url, {method: "DELETE"});
	response = await response.json();

	document.getElementById("list-datasets-button").click();
	if ("result" in response) {
		alert(`Dataset ${datasetId} successfully removed.\n ${response.result}`);
	} else {
		alert(`Dataset ${response.result} could not be removed.\n ${response.error}`);
	}
});
