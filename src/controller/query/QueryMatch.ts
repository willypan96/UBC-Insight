/* Returns true if given row matches filter. */
export function rowMatchesFilter(id: string, row: any,
	filter: any): boolean {
	let key: string = Object.keys(filter)[0];
	switch (key) {
		case "OR":
			return rowMatchesOR(id, row, filter[key]);
		case "AND":
			return rowMatchesAND(id, row, filter[key]);
		case "LT":
			return rowMatchesLT(id, row, filter[key]);
		case "EQ":
			return rowMatchesEQ(id, row, filter[key]);
		case "GT":
			return rowMatchesGT(id, row, filter[key]);
		case "IS":
			return rowMatchesIS(id, row, filter[key]);
		case "NOT":
			return rowMatchesNOT(id, row, filter[key]);
		default:
			console.error("INVALID QUERY KEY:", key, ", FILTER:", filter);
			return false;
	}
}

/* Returns true for OR filter */
function rowMatchesOR(id: string, row: any, filterOR: any): boolean {
	for (let f of filterOR) {
		if (rowMatchesFilter(id, row, f)) {
			return true;
		}
	}
	return false;
}

/* Returns true for AND filter */
function rowMatchesAND(id: string, row: any, filterAND: any): boolean {
	for (let f of filterAND) {
		if (!rowMatchesFilter(id, row, f)) {
			return false;
		}
	}
	return true;
}

/* Returns whether specified row value is less than query value. */
function rowMatchesLT(id: string, row: any, filterLT: any): boolean {
	let key = Object.keys(filterLT)[0];
	return row[key] < filterLT[key];
}

/* Returns whether specified row value is equal to query value. */
function rowMatchesEQ(id: string, row: any, filterEQ: any): boolean {
	let key = Object.keys(filterEQ)[0];
	return row[key] === filterEQ[key];
}

/* Returns whether specified row value is greater than query value. */
function rowMatchesGT(id: string, row: any, filterGT: any): boolean {
	let key = Object.keys(filterGT)[0];
	return row[key] > filterGT[key];
}

/* Returns true if value at specified key matches string condition. */
function rowMatchesIS(id: string, row: any, filterIS: any): boolean {
	let key: string = Object.keys(filterIS)[0];
	let queryVal: string = filterIS[key];
	let rowVal: string = row[key];

	if (queryVal.indexOf("*") === -1) {
		return rowVal === queryVal;
	} else if (queryVal.length === 1) {
		return true;
	} else if (queryVal[0] !== "*") {
		return rowVal.startsWith(queryVal.substring(0, queryVal.length - 1));
	} else if (queryVal.slice(-1) !== "*") {
		return rowVal.endsWith(queryVal.substring(1));
	} else {
		return rowVal.indexOf(queryVal.substring(1, queryVal.length - 1)) > -1;
	}
}

/* Returns true if row does not match given filter. */
function rowMatchesNOT(id: string, row: any, filterNOT: any): boolean {
	return !rowMatchesFilter(id, row, filterNOT);
}
