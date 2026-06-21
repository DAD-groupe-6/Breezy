jest.mock("../src/services/auth.service", () => ({
  register: jest.fn(),
  login: jest.fn(),
  assertUserNotBanned: jest.fn(),
}));

const AuthService = require("../src/services/auth.service");
const AuthController = require("../src/controllers/auth.controller");

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("AuthController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("returns 201 when registration succeeds", async () => {
      const req = {
        body: {
          email: "john@example.com",
          password: "pwd",
          pseudo_uniq: "john_1",
          pseudo: "John",
          roleId: 2,
        },
      };
      const res = createRes();
      AuthService.register.mockResolvedValue({ id: 1, email: "john@example.com" });

      await AuthController.register(req, res);

      expect(AuthService.register).toHaveBeenCalledWith(
        "john@example.com",
        "pwd",
        "john_1",
        "John",
        2
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, email: "john@example.com" });
    });

    it("returns 400 when registration fails", async () => {
      const req = { body: { email: "bad@example.com", password: "pwd" } };
      const res = createRes();
      AuthService.register.mockRejectedValue(new Error("Email already exists"));

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email already exists" });
    });
  });

  describe("login", () => {
    it("returns 200 when login succeeds", async () => {
      const req = { body: { email: "john@example.com", password: "pwd" } };
      const res = createRes();
      AuthService.login.mockResolvedValue({ token: "jwt" });

      await AuthController.login(req, res);

      expect(AuthService.login).toHaveBeenCalledWith("john@example.com", "pwd");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: "jwt" });
    });

    it("returns 403 when account is banned", async () => {
      const req = { body: { email: "john@example.com", password: "pwd" } };
      const res = createRes();
      AuthService.login.mockRejectedValue(new Error("Account is banned"));

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Account is banned" });
    });

    it("returns 401 for other login errors", async () => {
      const req = { body: { email: "john@example.com", password: "pwd" } };
      const res = createRes();
      AuthService.login.mockRejectedValue(new Error("Invalid credentials"));

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });
  });

  describe("logout", () => {
    it("returns 200", () => {
      const req = {};
      const res = createRes();

      AuthController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logged out" });
    });
  });

  describe("validate", () => {
    it("returns 401 when req.user is missing", async () => {
      const req = {};
      const res = createRes();

      await AuthController.validate(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

    it("returns 403 when account is banned", async () => {
      const req = { user: { id: 5 } };
      const res = createRes();
      AuthService.assertUserNotBanned.mockRejectedValue(new Error("Account is banned"));

      await AuthController.validate(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Account is banned" });
    });

    it("returns 401 for generic validation errors", async () => {
      const req = { user: { id: 5 } };
      const res = createRes();
      AuthService.assertUserNotBanned.mockRejectedValue(
        new Error("Unable to validate account status")
      );

      await AuthController.validate(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unable to validate account status",
      });
    });

    it("returns 200 when token is valid and user not banned", async () => {
      const req = { user: { id: 5 } };
      const res = createRes();
      AuthService.assertUserNotBanned.mockResolvedValue(undefined);

      await AuthController.validate(req, res);

      expect(AuthService.assertUserNotBanned).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Token is valid" });
    });
  });
});
