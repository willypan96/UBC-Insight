import {
	FILTERS,
	SKEYS,
	MKEYS,
	QUERYKEYS,
	APPLYTOKENS,
	isDatasetAdded
} from "./QueryValidation";

import {
	InsightDataset,
} from "../../IInsightFacade";

export let APPLYKEYS: string[] = [];
export let GROUPKEYS: string[] = [];

export function isTransformationsValid(transformations: any, datasets: InsightDataset[]): boolean {
	APPLYKEYS = [];
	GROUPKEYS = [];
	if (typeof transformations ===  "undefined") {
		return true;
	} else if (!transformationsTypeIsValid(transformations)) {
		return false;
	} else {
		return isGroupValid(transformations.GROUP, datasets)
			&& isApplyValid(transformations.APPLY, datasets);
	}
}

function transformationsTypeIsValid(transformations: any): boolean {
	if (typeof transformations !== "object"
		|| typeof transformations === "undefined"
		|| Object.keys(transformations).length !== 2) {
		return false;
	} else if (!("GROUP" in transformations && "APPLY" in transformations)) {
		return false;
	} else {
		return true;
	}
}

function isGroupValid(group: string[], datasets: InsightDataset[]): boolean {
	if (!(Array.isArray(group)) || group === null || group.length < 1){
		return false;
	}

	let keyArray: string[] = [];
	let courseNames: string[] = [];

	group.forEach((element) => {
		GROUPKEYS.push(element);
		let arr: string[] = element.split("_");
		courseNames.push(arr[0]);
		keyArray.push(arr[1]);
	});

	if (!checkDistinctValue(courseNames)){
		return false;
	} else if (!isDatasetAdded(courseNames[0], datasets)) {
		return false;
	}

	let getIntersection = QUERYKEYS.filter((value: any) => keyArray.includes(value));
	if (!keyArray.every((value: any) => getIntersection.includes(value))) {
		return false;
	}

	return true;
}

function isApplyValid(apply: any[], datasets: InsightDataset[]): boolean {
	if (!(Array.isArray(apply)) || apply === null || apply.length < 1){
		return false;
	}

	for (let applyRule of apply){
		if (!isApplyRuleValid(applyRule, datasets)){
			return false;
		}
	}

	return true;
}

function isApplyRuleValid(element: any, datasets: InsightDataset[]): boolean {
	if (typeof element !== "object" || element === null || typeof element === "undefined"){
		return false;
	}

	if (typeof Object.keys(element)[0] !== "string" || Object.keys(element).length !== 1){
		return false;
	}

	let elementString: string = Object.keys(element)[0];
	for (let i = 1; i < elementString.length - 1; i++) {
		if (elementString[i] === "_") {
			return false;
		}
	}
	if (APPLYKEYS.includes(elementString)){
		return false;
	} else {
		APPLYKEYS.push(elementString);
	}

	let elementValue: any = Object.values(element)[0];
	if (!isApplyTokenValid(elementValue, datasets)){
		return false;
	}

	return true;
}

function isApplyTokenValid(applyToken: any, datasets: InsightDataset[]): boolean {
	if (typeof applyToken !== "object" || applyToken === null || typeof applyToken === "undefined"){
		return false;
	}

	let applyTokenString = Object.keys(applyToken)[0];
	if (typeof applyTokenString !== "string"
		|| applyTokenString.length < 1
		|| !APPLYTOKENS.includes(Object.keys(applyToken)[0])){
		return false;
	}

	let applyTokenValue = Object.values(applyToken)[0];
	if (typeof applyTokenValue !== "string" || applyTokenValue.length < 1){
		return false;
	}

	let arr: string[] = applyTokenValue.split("_");
	if (applyTokenString === "COUNT"){
		if (!isDatasetAdded(arr[0], datasets) || !QUERYKEYS.includes(arr[1])) {
			return false;
		}
	} else {
		if (!isDatasetAdded(arr[0], datasets) || !MKEYS.includes(arr[1])) {
			return false;
		}
	}

	return true;
}

function checkDistinctValue(arr: string[]) {
	return new Set(arr).size === 1;
}
