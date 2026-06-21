const express = require("express");
const request = require("supertest");
const cookieParser = require("cookie-parser");

jest.mock("../src/services/auth.service", () => ({
  register: jest.fn(),
  login: jest.fn(),
  assertUserNotBanned: jest.fn(),
}));

jest.mock("../src/utils/jwt.util", () => ({
  verifyToken: jest.fn(),
}));

const AuthService = require("../src/services/auth.service");
const { verifyToken } = require("../src/utils/jwt.util");
const authRoutes = require("../src/routes/auth.route");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/v1/auth", authRoutes);
  return app;
}

describe("auth.route HTTP integration", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  it("POST /register returns 201", async () => {
    AuthService.register.mockResolvedValue({ id: 1, email: "john@example.com" });

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "john@example.com",
      password: "pwd",
      pseudo_uniq: "john_1",
      pseudo: "John",
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, email: "john@example.com" });
  });

  it("POST /login returns 200 with token", async () => {
    AuthService.login.mockResolvedValue({ token: "jwt-token" });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "john@example.com",
      password: "pwd",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: "jwt-token" });
  });

  it("POST /logout returns 200", async () => {
    const res = await request(app).post("/api/v1/auth/logout");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Logged out" });
  });

  it("GET /validate returns 401 when token is missing", async () => {
    const res = await request(app).get("/api/v1/auth/validate");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "No token provided" });
  });

  it("GET /validate returns 401 when token is invalid", async () => {
    verifyToken.mockReturnValue(null);

    const res = await request(app)
      .get("/api/v1/auth/validate")
      .set("Authorization", "Bearer bad-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Invalid or expired token" });
  });

  it("GET /validate returns 403 when account is banned", async () => {
    verifyToken.mockReturnValue({ id: 9, roleId: 2 });
    AuthService.assertUserNotBanned.mockRejectedValue(new Error("Account is banned"));

    const res = await request(app)
      .get("/api/v1/auth/validate")
      .set("Authorization", "Bearer good-token");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Account is banned" });
  });

  it("GET /validate returns 200 for valid token and account", async () => {
    verifyToken.mockReturnValue({ id: 9, roleId: 2 });
    AuthService.assertUserNotBanned.mockResolvedValue(undefined);

    const res = await request(app)
      .get("/api/v1/auth/validate")
      .set("Authorization", "Bearer good-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Token is valid" });
  });
});
