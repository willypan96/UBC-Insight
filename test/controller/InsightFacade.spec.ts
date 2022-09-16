import { testFolder } from "@ubccpsc310/folder-test";
import { expect } from "chai";
import { beforeEach } from "mocha";

import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import { clearDisk, getContentFromArchives } from "../resources/TestUtil";

describe("InsightFacade", function () {
	let courses: string;
	let noCourseFolder: string;
	let noJsonFile: string;
	let txtDataset: string;
	let cpsc310: string;
	let emptyJson: string;
	let facade: InsightFacade;
	let rooms: string;
	let noRoomFolder: string;
	let noHTMLFile: string;
	let DMP: string;
	let passInvalidGeolocation: string;
	let missingCodeString: string;
	let ICCS: string;
	let failInvalidGeolocation: string;
	let noIndexHTM: string;

	interface Input {
		query: any
	}
	type Output = Promise<any[]>;
	type Error = "InsightError" | "ResultTooLargeError";

	before(function () {
		courses = getContentFromArchives("courses.zip");
		noCourseFolder = getContentFromArchives("noCourseFolder.zip");
		noJsonFile = getContentFromArchives("noJsonFile.zip");
		txtDataset = getContentFromArchives("txtDataset.txt");
		cpsc310 = getContentFromArchives("cpsc310.zip");
		emptyJson = getContentFromArchives("emptyJson.zip");
		rooms = getContentFromArchives("rooms.zip");
		noRoomFolder = getContentFromArchives("noRoomFolder.zip");
		noHTMLFile = getContentFromArchives("noHTMLFile.zip");
		DMP = getContentFromArchives("DMP.zip");
		passInvalidGeolocation = getContentFromArchives("passInvalidGeolocation.zip");
		missingCodeString = getContentFromArchives("missingCodeString.zip");
		ICCS = getContentFromArchives("ICCS.zip");
		failInvalidGeolocation = getContentFromArchives("failInvalidGeolocation.zip");
		noIndexHTM = getContentFromArchives("noIndexHTM.zip");
	});

	describe("addDataset testSuite", function () {
		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("adding single courses dataset", function () {
			return facade.addDataset("cpsc310", cpsc310, InsightDatasetKind.Courses)
				.then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal(["cpsc310"]);
				})
				.catch(() => {
					expect.fail("Not suppose to fail");
				});
		});

		it("adding single room dataset", function() {
			return facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms)
				.then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal(["rooms"]);
				})
				.catch(() => {
					expect.fail("Not suppose to fail");
				});
		});

		it("adding empty code string in room dataset", function() {
			return facade.addDataset("missingCodeString", missingCodeString, InsightDatasetKind.Rooms)
				.then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal(["missingCodeString"]);
				})
				.catch(() => {
					expect.fail("Not suppose to fail");
				});
		});

		it("pass invalid geolocation room dataset", function() {
			return facade.addDataset("passInvalidGeolocation", passInvalidGeolocation, InsightDatasetKind.Rooms)
				.then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal(["passInvalidGeolocation"]);
				})
				.catch(() => {
					expect.fail("Not suppose to fail");
				});
		});

		it("fail invalid geolocation room dataset", function () {
			return facade.addDataset("failInvalidGeolocation", failInvalidGeolocation, InsightDatasetKind.Rooms)
				.then(() => {
					expect.fail("Invalid id, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding a course dataset to a data structure that already contains a course dataset",
			function () {
				return facade
					.addDataset("courses", courses, InsightDatasetKind.Courses)
					.then(() => {
						return facade
							.addDataset("cpsc310", cpsc310, InsightDatasetKind.Courses)
							.then((insightDatasets) => {
								expect(insightDatasets).to.deep.equal([
									"courses", "cpsc310"
								]);
							})
							.catch(() => {
								expect.fail("should not have rejected");
							});
					});
			});

		it("adding a room dataset to a data structure that already contains a room dataset",
			function () {
				return facade
					.addDataset("rooms", rooms, InsightDatasetKind.Rooms)
					.then(() => {
						return facade
							.addDataset("DMP", DMP, InsightDatasetKind.Rooms)
							.then((insightDatasets) => {
								expect(insightDatasets).to.deep.equal([
									"rooms", "DMP"
								]);
							})
							.catch(() => {
								expect.fail("should not have rejected");
							});
					});
			});

		it("adding underscore id courses", function () {
			return facade.addDataset("_courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Invalid id, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding underscore id rooms", function () {
			return facade.addDataset("_rooms", rooms, InsightDatasetKind.Rooms)
				.then(() => {
					expect.fail("Invalid id, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding whitespace id courses", function () {
			return facade.addDataset(" ", courses, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Invalid id, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding whitespace id rooms", function () {
			return facade.addDataset(" ", rooms, InsightDatasetKind.Rooms)
				.then(() => {
					expect.fail("Invalid id, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding no id courses", function () {
			return facade.addDataset("", courses, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Invalid id, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding no id rooms", function () {
			return facade.addDataset("", rooms, InsightDatasetKind.Rooms)
				.then(() => {
					expect.fail("Invalid id, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding duplicate dataset courses", function () {
			const id = "courses";
			return facade.addDataset(id, courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset(id, courses, InsightDatasetKind.Courses)
						.then(() => {
							expect.fail("Duplicate dataSets added, should have rejected");
						})
						.catch((error: Error) => {
							expect(error).to.be.an.instanceof(InsightError);
						});
				});
		});

		it("adding duplicate dataset rooms", function () {
			const id = "rooms";
			return facade.addDataset(id, rooms, InsightDatasetKind.Rooms)
				.then(() => {
					return facade.addDataset(id, rooms, InsightDatasetKind.Rooms)
						.then(() => {
							expect.fail("Duplicate dataSets added, should have rejected");
						})
						.catch((error: Error) => {
							expect(error).to.be.an.instanceof(InsightError);
						});
				});
		});

		it("adding a file that does not contain a json file for course dataset",
			function () {
				return facade
					.addDataset("noJsonFile", noJsonFile, InsightDatasetKind.Courses)
					.then(() => {
						expect.fail(
							"Added zip file with no json file, should have rejected");
					})
					.catch((error: Error) => {
						expect(error).to.be.an.instanceof(InsightError);
					});
			});

		it("adding a file that does not contain a html file for room dataset",
			function () {
				return facade
					.addDataset("noHTMLFile", noHTMLFile, InsightDatasetKind.Rooms)
					.then(() => {
						expect.fail(
							"Added zip file with no html file, should have rejected");
					})
					.catch((error: Error) => {
						expect(error).to.be.an.instanceof(InsightError);
					});
			});

		it("adding no course folder for rooms dataSet", function () {
			return facade
				.addDataset("noCourseFolder", noCourseFolder,
					InsightDatasetKind.Courses)
				.then(() => {
					expect.fail(
						"Added zip file with no courses/ folder, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding no rooms folder for rooms dataSet", function () {
			return facade
				.addDataset("noRoomFolder", noRoomFolder,
					InsightDatasetKind.Rooms)
				.then(() => {
					expect.fail(
						"Added zip file with no rooms/ folder, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding a empty json in course folder for dataset", function () {
			return facade
				.addDataset("emptyJson", emptyJson, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail(
						"Added empty Json file that does not contain a course section, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding non zip file for dataset", function () {
			return facade
				.addDataset("txtDataset", txtDataset, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Added not zip file, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding no Rooms dataset", function () {
			return facade
				.addDataset("ICCS", ICCS, InsightDatasetKind.Rooms)
				.then(() => {
					expect.fail("Added not zip file, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("adding no index.htm dataset", function () {
			return facade
				.addDataset("noIndexHTM", noIndexHTM, InsightDatasetKind.Rooms)
				.then(() => {
					expect.fail("Added not zip file, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});
	});

	describe("removeDataset testSuite", function () {
		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("Successfully removing a course dataSet", function () {
			const id = "cpsc310";
			return facade.addDataset("cpsc310", cpsc310, InsightDatasetKind.Courses)
				.then(() => {
					return facade.removeDataset(id)
						.then(
							(insightString) => {
								expect(insightString).to.equal(id);
							})
						.catch(
							() => {
								expect.fail("Valid removal, should not reject");
							});
				});
		});

		it("Successfully removing a room dataSet", function () {
			const id = "DMP";
			return facade.addDataset("DMP", DMP, InsightDatasetKind.Rooms)
				.then(() => {
					return facade.removeDataset(id)
						.then(
							(insightString) => {
								expect(insightString).to.equal(id);
							})
						.catch(
							() => {
								expect.fail("Valid removal, should not reject");
							});
				});
		});

		it("Removing non-existent dataSet", function () {
			// Use NotFoundError
			return facade.removeDataset("CPSC320")
				.then(() => {
					expect.fail("Non-existent id, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(NotFoundError);
				});
		});

		it("Removing id containing underscore", function () {
			// Use InsightError
			return facade.removeDataset("_courses")
				.then(() => {
					expect.fail("id contains underscore, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("Removing id containing whitespace", function () {
			// Use InsightError
			return facade.removeDataset(" ")
				.then(() => {
					expect.fail("whitespace id, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});

		it("Removing no id", function () {
			// Use InsightError
			return facade.removeDataset("")
				.then(() => {
					expect.fail("no id, should have rejected");
				})
				.catch((error: Error) => {
					expect(error).to.be.an.instanceof(InsightError);
				});
		});
	});

	describe("List Datasets testSuite", function () {
		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("should list no datasets", function () {
			return facade.listDatasets().then((insightDatasets) => {
				expect(insightDatasets).to.deep.equal([]);
				expect(insightDatasets).to.be.an.instanceof(Array);
				expect(insightDatasets).to.have.length(0);
			});
		});

		it("should list one course dataset", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(1);
					expect(insightDatasets).to.deep.equal([{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					}]);
				});
		});

		it("should list one room dataset", function () {
			return facade.addDataset("DMP", DMP, InsightDatasetKind.Rooms)
				.then(() => {
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(1);
					expect(insightDatasets).to.deep.equal([{
						id: "DMP",
						kind: InsightDatasetKind.Rooms,
						numRows: 5, // 5 rooms in DMP total
					}]);
				});
		});

		it("should list multiple course datasets", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset("courses-2", courses,
						InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					const insightDatasetCourses =
						insightDatasets.find((dataset) => dataset.id === "courses");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.deep.equal({
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
				});
		});

		it("should list multiple room datasets", function () {
			return facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms)
				.then(() => {
					return facade.addDataset("DMP", DMP,
						InsightDatasetKind.Rooms);
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					const insightDatasetCourses =
						insightDatasets.find((dataset) => dataset.id === "DMP");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.deep.equal({
						id: "DMP",
						kind: InsightDatasetKind.Rooms,
						numRows: 5,
					});
				});
		});
	});

	describe("performQuery testSuite", function () {
		before(async function () {
			clearDisk();
			facade = new InsightFacade();
			await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
			await facade.addDataset("cpsc310", cpsc310, InsightDatasetKind.Courses);
			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);

		});

		// Assert value equals expected
		function assertResult(expected: Output, actual: any): void {
			expect(actual).to.deep.equal(expected);
		}

		// Assert actual error is of expected type
		function assertError(expected: Error, actual: any): void {
			if (expected === "InsightError") {
				expect(actual).to.be.an.instanceOf(InsightError);
			} else {
				expect(actual).to.be.an.instanceOf(ResultTooLargeError);
			}
		}

		testFolder<Input, Output, Error>("performQuery testSuite", // suiteName
			async (input: Input):
				Promise<Output> => {
				return await facade.performQuery(input);
			},                      // target
			"./test/resources/queries", // path
			{
				assertOnResult: assertResult,
				assertOnError: assertError, // options
			});
	});
});
