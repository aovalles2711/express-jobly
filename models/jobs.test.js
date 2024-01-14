"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Jobs = require("./jobs.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobsIds,
} = require("./_testCommon");

/* findAll */
describe("findAll", function() {
    test("works: no filter", async function() {
        let jobs = await Jobs.findAll();
        expect(jobs).toEqual([
            {
                id: testJobsIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyName: "C1",
            },

            {
                id: testJobsIds[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyName: "C1",
            },
            
            {
                id: testJobIds[2],
                title: "Job3",
                salary: 300,
                equity: "0.3",
                companyName: "C1",
            },
        ]);
    });

    test("works: by min salary", async function() {
        let jobs = await Jobs.findAll({ minSalary: 250});
        expect(jobs).toEqual([
            {
                id: testJobsIds[2],
                title: "Job3",
                salary: 300,
                equiry: "0.3",
                companyName: "C1",
            }
        ]);
    });

    test("works: by min salary & equity", async function() {
        let jobs = await Jobs.findAll({ minSalary: 150, hasEquity: true});
        expect(jobs).toEqual([
            {
                id: testJobsIds[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyName: "C1",
            },
        ]);
    });

    test("works: by name", async function() {
        let jobs = await Jobs.findAll({ title: "ob1" });
        expect(jobs).toEqual([
            {
                id: testJobsIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyName: "C1",
            },
        ]);
    });
});