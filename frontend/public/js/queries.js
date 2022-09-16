const BASE_URL = "http://localhost:4321";

const MKEYS = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
const SKEYS = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname",
	"number", "name", "address", "type", "furniture", "href"];

let datasetId = "";
let filters = [];
let columns = [];
let orders = [];
let groupKeys = [];
let applyRules = [];
let sortDirection = "UP";

document.getElementById("query-select-id-button").addEventListener("mouseover", async () => {
	const response = await fetch(`${BASE_URL}/datasets`);
	let res = await response.json();
	let dropdown = document.getElementById("query-select-id-dropdown-content");
	while (dropdown.firstChild) {
		dropdown.removeChild(dropdown.firstChild);
	}
	res.result.forEach((dataset) => {
		let dropdownEntry = document.createElement("A");
		let dropdownEntryId = `query-select-id-dropdown-${dataset.id}`;
		dropdownEntry.setAttribute("id", dropdownEntryId);
		let dropdownEntryText = document.createTextNode(dataset.id);
		dropdownEntry.appendChild(dropdownEntryText);
		dropdown.appendChild(dropdownEntry);
		document.getElementById(dropdownEntryId).addEventListener("click", () => {
			datasetId = dataset.id;
			document.getElementById("query-select-id-button").innerHTML = `${dataset.id} ▼`;
		});
	});
});

function queryFilterMComparisonHelper(mkey) {
	let key = prompt(`Enter field to compare (one of ${MKEYS.join(", ")}):`);
	if (!key) {
		return;
	}
	let val = +prompt("Enter value to compare with:");
	if (!val) {
		return;
	}
	let filter = {};
	filter[mkey] = {};
	filter[mkey][datasetId + "_" + key] = val;
	filters.push(filter);
	updateFiltersTable();
}

function queryFilterSComparisonHelper(skey) {
	let key = prompt(`Enter field to compare (one of ${SKEYS.join(", ")}):`);
	if (!key) {
		return
	}
	let val = prompt("Enter value to compare with:").toString();
	if (!val) {
		return;
	}
	let filter = {};
	filter[skey] = {};
	filter[skey][datasetId + "_" + key] = val;
	filters.push(filter);
	updateFiltersTable();
}

function updateTable(tbody, rowData) {
	let newTbody = document.createElement("tbody");
	rowData.forEach((data) => {
		let newRow = newTbody.insertRow();
		Object.keys(data).forEach((key) => {
			let newCell = newRow.insertCell();
			var newText = document.createTextNode(data[key]);
			newCell.appendChild(newText);
		});
	});

	tbody.parentNode.replaceChild(newTbody, tbody)
}

function updateFiltersTable() {
	let rowData = filters.map((filter) => {
		let row = {};
		const mskey = Object.keys(filter)[0];
		const queryKey = Object.keys(filter[mskey])[0];
		row.filterType = mskey;
		row.key = queryKey.split("_")[1];
		row.comparisonVal = filter[mskey][queryKey];
		return row;
	});
	let filterTbody = document.getElementById("list-filters-table").getElementsByTagName("tbody")[0];
	return updateTable(filterTbody, rowData);
}

document.getElementById("query-clear-filters-button").addEventListener("click", () => {
	filters = [];
	updateFiltersTable();
});

document.getElementById("query-clear-columns-button").addEventListener("click", () => {
	columns = [];
	updateColumnsTable();
});

document.getElementById("query-clear-orders-button").addEventListener("click", () => {
	orders = [];
	updateOrderTable();
});

document.getElementById("query-clear-groups-button").addEventListener("click", () => {
	groupKeys = [];
	updateGroupKeyTable();
});

document.getElementById("query-clear-apply-rules-button").addEventListener("click", () => {
	applyRules = [];
	updateApplyRuleTable();
});


function updateColumnsTable() {
	let rowData = columns.map((column) => {
		let res = {};
		res.columnField = column;
		return res;
	});
	let columnTbody = document.getElementById("list-columns-table")
		.getElementsByTagName("tbody")[0];
	updateTable(columnTbody, rowData);
}

function updateOrderTable() {
	let rowData = orders.map((order) => {
		let res = {};
		res.orderKey = order;
		return res;
	});
	let ordersTbody = document.getElementById("list-orders-table").getElementsByTagName("tbody")[0];
	updateTable(ordersTbody, rowData);
}

function updateGroupKeyTable() {
	let rowData = groupKeys.map((gkey) => {
		let res = {};
		res.groupKey = gkey;
		return res;
	});
	let groupKeyTbody = document.getElementById("list-group-keys-table").getElementsByTagName("tbody")[0];
	updateTable(groupKeyTbody, rowData);
}

function updateApplyRuleTable() {
	let rowData = applyRules.map((ar) => {
		let row = {};
		let anyKey = Object.keys(ar)[0];
		let applyToken = Object.keys(ar[anyKey])[0];
		row.anyKey = anyKey;
		row.applyToken = applyToken;
		row.queryKey = ar[row.anyKey][applyToken].split("_")[1];
		return row;
	});
	let applyRulesTbody = document.getElementById("list-apply-rules-table").getElementsByTagName("tbody")[0];
	return updateTable(applyRulesTbody, rowData);
}


document.getElementById("query-filter-gt")
	.addEventListener("click", () => queryFilterMComparisonHelper("GT"));
document.getElementById("query-filter-eq")
	.addEventListener("click", () => queryFilterMComparisonHelper("EQ"));
document.getElementById("query-filter-lt")
	.addEventListener("click", () => queryFilterMComparisonHelper("LT"));
document.getElementById("query-filter-is")
	.addEventListener("click", () => queryFilterSComparisonHelper("IS"));
document.getElementById("toggle-sort-direction").addEventListener("click", () => {
	if (sortDirection === "UP") {
		sortDirection = "DOWN";
	} else {
		sortDirection = "UP";
	}
	document.getElementById("sort-direction-div").innerHTML = (sortDirection === "UP") ? "⬆️" : "⬇️";
});

document.getElementById("input-add-column-key").addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
		let column = document.getElementById("input-add-column-key").value;
		columns.push(column);
		updateColumnsTable();
  }
}); 

document.getElementById("input-add-order-key").addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
		let order = document.getElementById("input-add-order-key").value;
		orders.push(order);
		updateOrderTable();
  }
}); 

document.getElementById("input-add-group-key").addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
		let gkey = document.getElementById("input-add-group-key").value;
		groupKeys.push(gkey);
		updateGroupKeyTable();
  }
}); 

function queryApplyRuleHelper(applyToken, keys) {
	let key = prompt(`Enter field to aggregate (one of ${keys.join(", ")}):`);
	if (!key) {
		return;
	}
	let anyKey = prompt("Enter new key name:");
	if (!anyKey) {
		return;
	}
	let applyRule = {};
	applyRule[anyKey] = {};
	applyRule[anyKey][applyToken] = datasetId + "_" + key;
	applyRules.push(applyRule);
	console.log("applyRule:", applyRule)
	updateApplyRuleTable();
}


document.getElementById("query-apply-max")
	.addEventListener("click", () => queryApplyRuleHelper("MAX", MKEYS));
document.getElementById("query-apply-min")
	.addEventListener("click", () => queryApplyRuleHelper("MIN", MKEYS));
document.getElementById("query-apply-avg")
	.addEventListener("click", () => queryApplyRuleHelper("AVG", MKEYS));
document.getElementById("query-apply-count")
	.addEventListener("click", () => queryApplyRuleHelper("COUNT", MKEYS.concat(SKEYS)));
document.getElementById("query-apply-sum")
	.addEventListener("click", () => queryApplyRuleHelper("SUM", MKEYS));

function constructQueryWhere() {
	let where = {};
	where.AND = filters;
	return where;
}

function constructQueryOptions() {
	let options = {};
	if (orders.length > 0) {
		options.ORDER = constructQueryOrder();
	}
	options.COLUMNS = constructQueryColumns();
	return options;
}

function constructQueryOrder() {
	let order = {
		"dir": sortDirection,
		"keys": orders
	};	
	return order;
}

function constructQueryColumns() {
	return columns;
}

function constructQueryTransformations() {
	let transformations = {};
	// we have to check if all the transformation input is null
	transformations.GROUP = constructQueryGroup();
	transformations.APPLY = constructQueryApply();
	return transformations;
}

function constructQueryGroup() {
	return groupKeys.map((gkey) => datasetId + "_" + gkey);
}

function constructQueryApply() {
	return applyRules;
}

function constructQuery() {
	let query = {};
	query.WHERE = constructQueryWhere();
	query.OPTIONS = constructQueryOptions();
	if (groupKeys.length > 0 && applyRules.length > 0) {
		query.TRANSFORMATIONS = constructQueryTransformations();
	}
	return query;
}

function updateQueryResponseTable(result) {
	let newThead = document.createElement("thead");
	if (result.length > 0) {
		let newRow = newThead.insertRow();
		Object.keys(result[0]).forEach((key) => 
			newRow.insertCell().outerHTML = `<th>${key}</th>`);
	}

	let oldThead = document.getElementById("perform-query-table")
		.getElementsByTagName("thead")[0];
	oldThead.parentNode.replaceChild(newThead, oldThead)

	let newTbody = document.createElement("tbody");
	result.forEach((rowObj) => {
		let newRow = newTbody.insertRow();
		Object.keys(rowObj).forEach((key) => {
			let newCell = newRow.insertCell();
			var newText = document.createTextNode(rowObj[key]);
			newCell.appendChild(newText);
		});
	});

	let oldTbody = document.getElementById("perform-query-table")
		.getElementsByTagName("tbody")[0];
	oldTbody.parentNode.replaceChild(newTbody, oldTbody)
}

document.getElementById("perform-query-button")
	.addEventListener("click", async () => {
	let query = constructQuery();
	console.log("QUERY: ", query)
	let url = `${BASE_URL}/query`;
	const response = await fetch(url, {
		method: "POST",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
    },
		body: JSON.stringify(query)
	});
	const resJson = await response.json();
	if ("result" in resJson) {
		updateQueryResponseTable(resJson.result);
	} else {
		alert(JSON.stringify(resJson));
		updateQueryResponseTable([resJson]);
	}
});
