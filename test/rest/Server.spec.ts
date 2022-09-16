import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import chai from "chai";
import {expect, use} from "chai";
import chaiHttp from "chai-http";
import express, {Application, Request, Response} from "express";

describe("Facade C3", function () {

	let facade: InsightFacade;
	let server: Server;

	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(54321);
		// TODO: start server here once and handle errors properly
		return server.start().catch((err: Error) => {
			console.error(`TestServer::start() - ERROR: ${err.message}`);
		});
	});

	after(function () {
		// TODO: stop server here once!
		return server.stop().catch((err: Error) => {
			console.error(`TestServer::stop() - ERROR: ${err.message}`);
		});
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what's going on
		facade = new InsightFacade();
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what's going on
	});

	// Sample on how to format PUT requests

	it("PUT test for courses dataset", function () {
		try {
			return chai.request("http://localhost:4321")
				.put("/dataset/courses/courses")
				.send("courses.zip")
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: any) => {
					console.log("passing");
					expect(res.status).to.be.equal(200);
				})
				.catch((err: any) => {
					console.log("failing");
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			// and some more logging here!
		}
	});

	it("PUT test for rooms dataset", function () {
		try {
			return chai.request("http://localhost:4321")
				.put("/dataset/rooms/rooms")
				.send("rooms.zip")
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: any) => {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch((err: any) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			// and some more logging here!
		}
	});


	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
