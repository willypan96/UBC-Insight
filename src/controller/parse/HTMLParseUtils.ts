/* Utilities related to parsing HTML in JSON. */

/* Returns all elements of input that have given tag. */
export function getElementsByTag(element: any, tag: string,
	attrs: any[] = []): any[] {
	const addElementsByTag = (curEl: any, res: any[]) => {
		if (typeof curEl.childNodes !== "undefined") {
			curEl.childNodes.forEach((child: any) => {
				if ((child.nodeName === tag || child.tagName === tag)
					&& elementHasAttributes(child, attrs)) {
					res.push(child);
				}
				addElementsByTag(child, res);
			});
		}
	};

	let matchingElements: any[] = [];
	addElementsByTag(element, matchingElements);
	return matchingElements;
}

/* Returns all elements and children elements that match the tag sequence,
 * starting from  */
export function getElementsByTagPath(element: any, tagPath: string[]): any[] {
	let curMatches: any[] = [element], nextMatches: any[] = [];
	tagPath.forEach((tag: string) => {
		curMatches.forEach((el: any) => {
			nextMatches = nextMatches.concat(getElementsByTag(el, tag));
		});
		curMatches = nextMatches;
		nextMatches = [];
	});
	return curMatches;
}

/* Returns whether an html element has specified attribute */
export function elementHasAttribute(element: any, attr: any): boolean {

	/* Returns whether attr has all fields of targetAttr. */
	const attributesMatch = (elementAttr: any, targetAttr: any) =>
		Object.keys(targetAttr).every((key) => elementAttr[key] === targetAttr[key]);

	return element.attrs.some((elementAttr: any) =>
		attributesMatch(elementAttr, attr));
}

/* Returns whether an html element has specified attributes */
export function elementHasAttributes(element: any, attrs: any[]): boolean {
	return attrs.every((attr: any) => elementHasAttribute(element, attr));
}

/* Returns the href string from an "a" element. */
export function getHrefFromElement(a: any): string {
	try {
		return a.attrs.find((attr: any) => attr.name === "href").value;
	} catch (error) {
		return "";
	}
}
