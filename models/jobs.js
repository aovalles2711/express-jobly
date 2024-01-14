"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Similar to companies model  **/

class Job {
    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_name AS "companyName"`,
            [data.title,
            data.salary,
            data.equity,
            data.company_Name
            ]);
        let job = result.rows[0];

        return job;
    }

    /** Find all jobs */
    /** Should filter for { title, salary, equity } */

    static async findAll({ title, minSalary, hasEquity } = {}) {
        let query = `SELECT j.id,
                    j.title,
                    j.salary,
                    j.equity,
                    j.company_name AS "companyName"
                    FROM jobs j
                    LEFT JOIN companies AS c ON c.name = j.company_name`;
        let whereExpressions = [];
        let queryValues = [];
    
    // Utilize WHERE to filter records of each job
    if (minSalary !== undefined) {
        queryValues.push(minSalary);
        whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
        whereExpressions.push(`equity > 0`);
    }

    if (title !== undefined) {
        queryValues.push(`%${title}`);
        whereExpressions.push(`title $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
        query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Return results
    query += " ORDER BY title ";
    const jobsRes = await db.query(query, queryValues);

    return jobsRes.rows;

    }

    // Return data about a job, given a job id. Throw error if not found.

    static async get(id) {
        const jobRes = await db.query(
            `SELECT id, title, salary, equity, company_name AS "companyName
            FROM jobs
            WHERE id = $1`, [id]);
        
        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job found: ${id}`);

        const companiesRes = await db.query(
            `SELECT name, description, num_employees AS "numEmployees", logo_url AS "logoURL
            FROM companies WHERE name = $1`, [job.companyName]);
        
        delete job.companyName;
        job.company = companiesRes.rows[0];

        return job;
    }

    /** Update job */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data, {});
        const idVarIdx = "$" + (values.length + 1);
        
        const querySql = `UPDATE jobs SET ${setCols}
                        WHERE id = ${idVarIdx}
                        RETURNING id, title, salary, equity, company_name AS "companyName"`;
        const result = await db.query(querySql, [...values, id]);
        const job = results.row[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
        return job;
    }

    /** Delete job from db, return undefined. */
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM jobs
            WHERE id = $1
            RETURNING id`, [id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job found: {id}`);
    }
}

module.exports = Job;