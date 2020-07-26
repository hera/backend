const request = require("supertest");

const db = require("../../data/dbConfig");
const server = require("../../server");
const { cleanDb } = require("../../data/helpers");


let authToken;

describe("Stories", () => {
    beforeAll(async () => {
        await cleanDb();

        // Create a user
        await request(server)
            .post("/api/auth/register")
            .send({
                username: "Mark",
                password: "1234"
            });

        // Login
        const loginResponse = await request(server)
            .post("/api/auth/login")
            .send({
                username: "Mark",
                password: "1234"
            });
        
        // Save the token
        authToken = loginResponse.body.token;
        
    });

    afterAll(async () => {
        await cleanDb();
    });


    test("Can't read stories when not authorized", async () => {
        const response = await request(server).get("/api/stories");

        expect(response.status).toBe(401);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
    });


    test("Can't read stories when auth header is invalid", async () => {
        const response = await request(server).get("/api/stories").set("Authorization", "wrong token");

        expect(response.status).toBe(403); // forbidden
        expect(response.headers["content-type"]).toMatch(/application\/json/);
    });
    

    test("No stories yet", async () => {
        const response = await request(server).get("/api/stories").set("Authorization", authToken);

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.body).toMatchObject([]);
    });


    test("Can't add a story without title", async () => {
        const storyData = {
            description: "Sample description"
        };

        const response = await request(server)
            .post("/api/stories")
            .send(storyData)
            .set("Authorization", authToken);
        
        expect(response.status).toBe(400);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
    });


    test("Add a story", async () => {
        const storyData = {
            title: "Sample post",
            description: "Sample description"
        };

        const response = await request(server)
            .post("/api/stories")
            .send(storyData)
            .set("Authorization", authToken);

        const expected = [
            {
                id: 1,
                userId: 1,
                title: "Sample post",
                description: "Sample description"
            }
        ];
        
        expect(response.status).toBe(201);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.body).toMatchObject(expected);
    });


    test("Edit a story", async () => {
        modifiedStoryData = {
            title: "Changed title",
            description: "Changed description",
        }

        const expected = [
            {
                id: 1,
                title: "Changed title",
                description: "Changed description",
                coverImage: null,
                userId: 1
            }
        ];

        const response = await request(server)
            .put("/api/stories/1")
            .set("Authorization", authToken)
            .send(modifiedStoryData);

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.body).toEqual(expected);
    });


    test("Get all stories", async () => {
        const response = await request(server)
            .get("/api/stories")
            .set("Authorization", authToken);

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.body).toHaveLength(1);
    });

    
    test("Can't delete a story that doesn't exist", async () => {
        const response = await request(server)
            .del("/api/stories/92341234")
            .set("Authorization", authToken);

        expect(response.status).toBe(404);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.body.error).toBeTruthy();
    });


    test("Delete a story", async () => {


        const response = await request(server)
            .del("/api/stories/1")
            .set("Authorization", authToken);

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.body).toHaveLength(1);
    });


    test("No stories left", async () => {
        const response = await request(server)
            .get("/api/stories")
            .set("Authorization", authToken);

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.body).toMatchObject([]);
    });

});