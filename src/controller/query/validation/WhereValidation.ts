import {
	InsightDataset,
	InsightDatasetKind,
	InsightError
} from "../../IInsightFacade";

import {
	FILTERS,
	SKEYS,
	MKEYS,
	isDatasetAdded
} from "./QueryValidation";

export function isWhereTypeValid(where: any) {
	if (typeof where === "undefined" || Object.keys(where).length === 0){
		return true;
	}
	if (typeof where !== "object" || where === null || typeof where === "undefined") {
		return false;
	}
	return true;
}

export function isFilterValid(filter: any, datasets: InsightDataset[]) {
	if (Object.keys(filter).length !== 1) {
		return false;
	} else if (!FILTERS.includes(Object.keys(filter)[0])) {
		return false;
	} else if (!checkFilterType(filter, datasets)) {
		return false;
	} else {
		return true;
	}
}

function checkFilterType(filter: any, datasets: InsightDataset[]) {
	let newfilter = Object.values(filter)[0];
	switch (Object.keys(filter)[0]) {
		case "AND":
			return isLogicFilterValid(newfilter, datasets);
		case "OR":
			return isLogicFilterValid(newfilter, datasets);
		case "GT":
			return isMFilterValid(newfilter, datasets);
		case "LT":
			return isMFilterValid(newfilter, datasets);
		case "EQ":
			return isMFilterValid(newfilter, datasets);
		case "IS":
			return isISFilterValid(newfilter, datasets);
		case "NOT":
			return isFilterValid(newfilter, datasets);
		default:
			return false;
	}
}

function isLogicFilterValid(filter: any, datasets: InsightDataset[]) {
	if (!(filter instanceof Array) || filter === null || filter.length === 0) {
		return false;
	}

	for (let f of filter) {
		if (!checkFilterType(f, datasets)) {
			return false;
		}
	}
	return true;

}

function isMFilterValid(filter: any, datasets: InsightDataset[]) {
	if (typeof filter !== "object" || filter === null || typeof filter === "undefined" ||
		Object.keys(filter).length !== 1) {
		return false;
	}

	if (!filterStringTesting(Object.keys(filter)[0], datasets, MKEYS)) {
		return false;
	}

	let filterValue = Object.values(filter)[0];
	if (typeof filterValue !== "number" || filterValue === null) {
		return false;
	}

	return true;
}

function isISFilterValid(filter: any, datasets: InsightDataset[]) {
	if (typeof filter !== "object"
		|| filter === null
		|| typeof filter === "undefined"
		|| Object.keys(filter).length !== 1) {
		return false;
	}

	if (!filterStringTesting(Object.keys(filter)[0], datasets, SKEYS)) {
		return false;
	}

	let filterValue = Object.values(filter)[0];
	if (typeof filterValue !== "string" || filterValue === null) {
		return false;
	} else {
		for (let i = 1; i < filterValue.length - 1; i++) {
			if (filterValue[i] === "*") {
				return false;
			}
		}
	}
	return true;
}

function filterStringTesting(filterString: string, datasets: InsightDataset[], keyArray: string[]) {
	if (typeof filterString !== "string"
		|| filterString === null
		|| filterString.length === 0) {
		return false;
	}

	let arr: string[] = filterString.split("_");
	if (!isDatasetAdded(arr[0], datasets) || !keyArray.includes(arr[1])) {
		return false;
	}
	return true;
}
